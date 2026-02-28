import { useState, useEffect } from "react";
import { Mail, Search, RefreshCcw, Trash2, CheckCircle, Clock } from "lucide-react";
import { fetchApi } from "../api/client";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
}

export function ContactMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'deleted'>('all');

    const loadMessages = async (pageNum: number = 1, currentStatus: string = statusFilter) => {
        setIsLoading(true);
        try {
            const response = await fetchApi<any>(`/messages/contact?page=${pageNum}&limit=20&status=${currentStatus}`);
            if (pageNum === 1) {
                setMessages(response.data);
            } else {
                setMessages(prev => [...prev, ...response.data]);
            }
            setHasMore(response.page < response.lastPage);
        } catch (error) {
            console.error("Failed to load contact messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        loadMessages(1, statusFilter);
    }, [statusFilter]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await fetchApi(`/messages/contact/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            await fetchApi(`/messages/contact/${id}`, { method: 'DELETE' });
            if (statusFilter === 'all') {
                setMessages(messages.map(m => m.id === id ? { ...m, status: 'deleted' } : m));
            } else {
                setMessages(messages.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 min-h-[60vh] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <ScrollReveal className="relative z-10">
                <div className="d-flex flex-col md:flex-row justify-content-between align-items-md-center gap-4 mb-6">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <Mail size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="h4 fw-bold mb-1 text-gray-900 dark:text-white">Website Enquiries</h2>
                            <p className="text-gray-500 dark:text-gray-400 small mb-0">Manage messages from the public contact form</p>
                        </div>
                    </div>
                    <Button onClick={() => loadMessages(1)} disabled={isLoading} variant="outline" className="d-flex align-items-center gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 transition-colors bg-white dark:bg-gray-900 dark:text-gray-300 shadow-sm">
                        <RefreshCcw size={16} className={isLoading ? "animate-spin text-emerald-600" : ""} />
                        Refresh
                    </Button>
                </div>

                <div className="d-flex flex-col lg:flex-row gap-4 mb-6 align-items-lg-center justify-content-between">
                    <div className="d-flex gap-2 flex-wrap">
                        {[
                            { id: 'all', label: 'All Messages', icon: null },
                            { id: 'new', label: 'Unread', icon: <span className="w-2 h-2 rounded-full bg-emerald-500"></span> },
                            { id: 'read', label: 'Read', icon: <CheckCircle size={14} /> },
                            { id: 'deleted', label: 'Deleted', icon: <Trash2 size={14} /> }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setStatusFilter(filter.id as any)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 d-flex align-items-center gap-2 ${statusFilter === filter.id
                                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
                                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60'
                                    }`}
                            >
                                {filter.icon}
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <Input
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 py-2.5 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all shadow-sm w-full dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {isLoading && messages.length === 0 ? (
                    <div className="text-center py-12">
                        <RefreshCcw size={32} className="animate-spin text-emerald-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full d-flex align-items-center justify-content-center shadow-sm mx-auto mb-4">
                            <Mail size={24} className="text-gray-400" />
                        </div>
                        <h5 className="fw-bold text-gray-900 dark:text-white mb-2">No Messages Found</h5>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            {searchTerm ? "No messages match your search criteria." : "You're all caught up! There are no messages in this category."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map(msg => (
                            <div key={msg.id} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${msg.status === 'new'
                                ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 shadow-sm'
                                : msg.status === 'deleted'
                                    ? 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-75 grayscale-[0.5]'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-100 dark:hover:border-emerald-900/50'
                                }`}>
                                <div className="d-flex flex-col md:flex-row justify-content-between align-items-start gap-4">
                                    <div className="d-flex align-items-start gap-4 flex-grow-1">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 d-flex align-items-center justify-content-center font-bold text-lg shadow-inner flex-shrink-0">
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <h5 className="font-bold text-gray-900 dark:text-white mb-0">{msg.subject}</h5>
                                                {msg.status === 'new' && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">New</span>
                                                )}
                                                {msg.status === 'deleted' && (
                                                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">Deleted</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 d-flex flex-wrap align-items-center gap-2 mb-3">
                                                <span className="fw-semibold text-gray-700 dark:text-gray-300">{msg.name}</span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <a href={`mailto:${msg.email}`} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors">{msg.email}</a>
                                                {msg.phone && (
                                                    <>
                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{msg.phone}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="bg-gray-50/80 dark:bg-gray-900/50 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-100/50 dark:border-gray-700/50 relative">
                                                {msg.status === 'new' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 dark:bg-emerald-500 rounded-l-xl"></div>}
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-col align-items-end gap-3 flex-shrink-0 md:pl-4 md:border-l md:border-gray-100 w-full md:w-auto">
                                        <span className="text-xs text-gray-400 dark:text-gray-500 d-flex align-items-center gap-1.5 font-medium bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-full">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                        </span>
                                        <div className="d-flex gap-2 w-full md:w-auto mt-auto">
                                            {msg.status === 'new' ? (
                                                <Button size="sm" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex-1 md:flex-auto rounded-lg" onClick={() => handleStatusChange(msg.id, 'read')}>
                                                    <CheckCircle size={14} className="mr-1.5" />
                                                    Mark Read
                                                </Button>
                                            ) : msg.status === 'read' ? (
                                                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-sm font-medium d-flex align-items-center gap-1.5 flex-1 md:flex-auto justify-content-center">
                                                    <CheckCircle size={14} /> Read
                                                </div>
                                            ) : null}

                                            {msg.status !== 'deleted' && (
                                                <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100 rounded-lg flex-1 md:flex-none" onClick={() => handleDelete(msg.id)}>
                                                    <Trash2 size={16} />
                                                    <span className="md:hidden ml-1">Delete</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className="text-center mt-8 pt-4 pb-2">
                                <Button onClick={() => loadMessages(page + 1)} disabled={isLoading} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl px-8 py-2.5 font-semibold transition-all shadow-sm hover:shadow">
                                    {isLoading ? (
                                        <><RefreshCcw size={16} className="animate-spin mr-2" /> Loading...</>
                                    ) : (
                                        'Load Older Messages'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </ScrollReveal>
        </div>
    );
}
