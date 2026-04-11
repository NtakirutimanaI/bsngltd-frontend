import { useState, useEffect } from "react";
import { Mail, Search, RefreshCcw, Trash2, CheckCircle, Eye, Reply, X, Send, MoreVertical, MessageSquare, Globe, ShieldCheck, UserCheck } from "lucide-react";
import { fetchApi } from "../api/client";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useSite } from "@/app/context/SiteContext";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    profileImage?: string;
    createdAt: string;
}

export function ContactMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'deleted'>('all');
    const { selectedSite } = useSite();

    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);

    const handleReplySubmit = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        setIsSendingReply(true);
        try {
            await fetchApi(`/messages/contact/${selectedMessage.id}/reply`, {
                method: 'POST',
                body: JSON.stringify({ reply: replyText })
            });
            handleStatusChange(selectedMessage.id, 'read');
            setIsReplyModalOpen(false);
            setReplyText("");
            alert("Reply sent successfully!");
        } catch (error) {
            console.error("Failed to send reply:", error);
            alert("Failed to send reply. Please try again.");
        } finally {
            setIsSendingReply(false);
        }
    };

    const loadMessages = async (pageNum: number = 1, currentStatus: string = statusFilter) => {
        setIsLoading(true);
        try {
            const siteParam = selectedSite?.id ? `&siteId=${selectedSite.id}` : '';
            const response = await fetchApi<any>(`/messages/contact?page=${pageNum}&limit=20&status=${currentStatus}${siteParam}`);
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
    }, [statusFilter, selectedSite]);

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
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <ScrollReveal className="relative z-10">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <ShieldCheck size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="h5 fw-bold mb-0 text-gray-900 dark:text-white">Admin Communication Hub</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-0" style={{ fontSize: '11px' }}>Manage all internal priority messages and website enquiries</p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadMessages(1)}
                        className="btn btn-sm d-flex align-items-center gap-2 text-white"
                        style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                        <RefreshCcw size={13} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                <div className="d-flex flex-column flex-lg-row gap-3 mb-4 align-items-lg-center justify-content-between border-bottom pb-3">
                    <div className="d-flex gap-2 overflow-x-auto pb-1 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', minWidth: '0' }}>
                        {[
                            { id: 'all', label: 'All Messages', icon: null },
                            { id: 'new', label: 'Unread', icon: <span className="w-1 h-1 rounded-full bg-blue-500"></span> },
                            { id: 'read', label: 'Read', icon: <CheckCircle size={10} /> },
                            { id: 'deleted', label: 'Deleted', icon: <Trash2 size={10} /> }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setStatusFilter(filter.id as any)}
                                className={`px-2 py-1 rounded-pill fw-bold transition-all whitespace-nowrap d-flex align-items-center gap-1.5 ${statusFilter === filter.id
                                    ? 'bg-dark text-white shadow-sm'
                                    : 'bg-light text-muted hover:bg-gray-200 border-0'
                                    }`}
                                style={{ fontSize: '9px', letterSpacing: '0.5px' }}
                            >
                                {filter.icon}
                                <span className="text-uppercase">{filter.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="position-relative" style={{ width: '240px', flexShrink: 0 }}>
                        <style>{`
                            .contact-search-input {
                                padding-left: 38px !important;
                            }
                        `}</style>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                        <Input
                            placeholder="Find messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control form-control-sm rounded-pill bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-sm w-100 contact-search-input"
                            style={{ fontSize: '11px', height: '36px' }}
                        />
                    </div>
                </div>

                {isLoading && messages.length === 0 ? (
                    <div className="text-center py-12">
                        <RefreshCcw size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
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
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm auto-width-table">
                            <table className="table table-hover mb-0 align-middle" style={{ tableLayout: 'fixed' }}>
                                <thead className="bg-light">
                                    <tr style={{ fontSize: '10px' }} className="text-muted text-uppercase fw-bold">
                                        <th className="px-3 py-2 text-center" style={{ width: '40px' }}>#</th>
                                        <th className="px-3 py-2" style={{ width: '200px' }}>Sender</th>
                                        <th className="px-3 py-2">Subject & Message</th>
                                        <th className="px-3 py-2 text-end" style={{ width: '110px' }}>Time</th>
                                        <th className="px-3 py-2 text-center" style={{ width: '70px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMessages.map((msg, index) => (
                                        <tr key={msg.id} className={`${msg.status === 'new' ? 'bg-blue-50/30' : msg.status === 'deleted' ? 'bg-gray-50 opacity-50' : 'bg-white'} transition-all`}>
                                            <td className="px-3 py-2 text-center text-muted fw-bold" style={{ fontSize: '11px' }}>
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    {msg.profileImage || (msg as any).user?.profileImage || (msg as any).avatar ? (
                                                        <img 
                                                            src={msg.profileImage || (msg as any).user?.profileImage || (msg as any).avatar} 
                                                            alt={msg.name} 
                                                            className="rounded-circle object-cover border border-gray-200" 
                                                            style={{ width: '24px', height: '24px' }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('d-none');
                                                                (e.target as HTMLImageElement).nextElementSibling?.classList.add('d-flex');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`rounded-circle bg-primary text-white ${msg.profileImage || (msg as any).user?.profileImage || (msg as any).avatar ? 'd-none' : 'd-flex'} align-items-center justify-content-center fw-bold`} style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                                        {msg.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '12px', maxWidth: '120px' }}>{msg.name}</div>
                                                        <div className="text-muted text-truncate" style={{ fontSize: '10px', maxWidth: '120px' }}>{msg.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-truncate">
                                                <div className="d-flex align-items-center gap-2 w-100">
                                                    {msg.status === 'new' && <span className="p-1 rounded-circle bg-blue-500 flex-shrink-0" style={{ width: '6px', height: '6px' }} />}
                                                    <div className="fw-semibold text-dark text-truncate flex-shrink-0 d-flex align-items-center gap-2" style={{ fontSize: '12px', maxWidth: '180px' }}>
                                                        {(msg as any).isInternal ? <UserCheck size={12} className="text-primary" title="Internal Client Message" /> : <Globe size={11} className="text-muted" title="Website Enquiry" />}
                                                        {msg.subject}
                                                    </div>
                                                    <span className="text-muted mx-1 flex-shrink-0">-</span>
                                                    <div className="text-muted text-truncate flex-grow-1" style={{ fontSize: '11px' }}>{msg.message}</div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-end text-muted whitespace-nowrap" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="dropdown d-flex justify-content-center">
                                                    <button className="btn btn-link text-muted p-0 m-0 border-0 shadow-none dropdown-toggle-hide-arrow d-flex align-items-center justify-content-center hover:text-dark hover:bg-gray-100 rounded-circle transition-colors" style={{ width: '28px', height: '28px', textDecoration: 'none' }} type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow border border-gray-200 py-1 bg-white" style={{ minWidth: '130px', zIndex: 1050 }}>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center gap-2 fw-semibold text-gray-800 hover:bg-gray-50 transition-colors" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => { setSelectedMessage(msg); setIsViewModalOpen(true); if(msg.status === 'new') handleStatusChange(msg.id, 'read'); }}>
                                                                <Eye size={12} className="text-primary" /> View Details
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center gap-2 fw-semibold text-gray-800 hover:bg-gray-50 transition-colors" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => { setSelectedMessage(msg); setIsReplyModalOpen(true); }}>
                                                                <Reply size={12} className="text-success" /> Send Reply
                                                            </button>
                                                        </li>
                                                        {msg.status !== 'deleted' && (
                                                            <li><hr className="dropdown-divider my-1 border-gray-100" /></li>
                                                        )}
                                                        {msg.status !== 'deleted' && (
                                                            <li>
                                                                <button className="dropdown-item d-flex align-items-center gap-2 fw-semibold text-danger hover:bg-rose-50 transition-colors" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => handleDelete(msg.id)}>
                                                                    <Trash2 size={12} /> Delete Message
                                                                </button>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {hasMore && (
                            <div className="text-center mt-8 pt-4 pb-2">
                                <Button onClick={() => loadMessages(page + 1)} disabled={isLoading} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl px-8 py-2.5 font-semibold transition-all shadow-sm hover:shadow">
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

            {/* View Message Modal */}
            {isViewModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-[9999] d-flex align-items-center justify-content-center bg-dark/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-lg w-100 overflow-hidden fade-in-up border border-gray-100 relative max-w-md my-auto">
                        <div className="p-3 px-4 border-bottom border-gray-100 d-flex justify-content-between align-items-center bg-gray-50/50">
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                    {selectedMessage.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{selectedMessage.name}</h4>
                                    <a href={`mailto:${selectedMessage.email}`} className="text-muted hover:text-blue-600 transition-colors" style={{ fontSize: '11px' }}>{selectedMessage.email}</a>
                                </div>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="btn btn-light bg-light rounded-circle p-1.5 border-0 hover:bg-gray-200 transition-colors">
                                <X size={16} className="text-muted" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
                            <div className="mb-3">
                                <span className="badge bg-blue-50 text-blue-700 px-2 py-0.5 rounded-pill mb-2 fw-semibold" style={{ fontSize: '10px' }}>Subject</span>
                                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>{selectedMessage.subject}</h3>
                            </div>
                            
                            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100/60 shadow-inner">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-0" style={{ fontSize: '13px' }}>
                                    {selectedMessage.message}
                                </p>
                            </div>
                            <div className="mt-3 text-end">
                                <p className="text-muted mb-0 fw-bold" style={{ fontSize: '10px' }}>
                                    Received {formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="p-3 px-4 border-top border-gray-100 bg-gray-50/50 d-flex justify-content-end gap-2">
                            <button onClick={() => setIsViewModalOpen(false)} className="btn btn-sm btn-light border-gray-200 text-dark fw-bold px-3" style={{ fontSize: '12px' }}>Close</button>
                            <button onClick={() => { setIsViewModalOpen(false); setIsReplyModalOpen(true); }} className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 fw-bold px-3 shadow-sm" style={{ fontSize: '12px' }}>
                                <Reply size={14} /> Reply directly
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {isReplyModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-[9999] d-flex align-items-center justify-content-center bg-dark/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-100 overflow-hidden fade-in-up border border-gray-100 relative max-w-md my-auto">
                        <div className="p-3 px-4 border-bottom border-gray-100 d-flex justify-content-between align-items-center bg-blue-50/30">
                            <div className="d-flex align-items-center gap-2">
                                <Reply className="text-blue-600" size={16} />
                                <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>Reply to {selectedMessage.name}</h4>
                            </div>
                            <button onClick={() => setIsReplyModalOpen(false)} className="btn btn-light bg-white rounded-circle p-1.5 border border-gray-200 hover:bg-gray-100 transition-colors">
                                <X size={16} className="text-muted" />
                            </button>
                        </div>
                        <div className="p-3 px-4 bg-gray-50/50 border-bottom border-gray-100">
                            <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
                                <span className="fw-bold text-gray-500">To:</span>
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-dark fw-semibold shadow-sm">{selectedMessage.email}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-2 d-flex justify-content-between align-items-end">
                                <label className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Your Message</label>
                            </div>
                            <textarea 
                                className="form-control bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all p-3 shadow-sm"
                                rows={4}
                                placeholder="Type your response here..."
                                style={{ fontSize: '12px', resize: 'none' }}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                        <div className="p-3 px-4 border-top border-gray-100 bg-gray-50/50 d-flex justify-content-end gap-2 align-items-center">
                            <button onClick={() => setIsReplyModalOpen(false)} className="btn btn-sm btn-link text-muted text-decoration-none fw-bold hover:text-dark">Cancel</button>
                            <button 
                                onClick={handleReplySubmit} 
                                disabled={isSendingReply || !replyText.trim()} 
                                className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 fw-bold px-4 py-1.5 rounded-xl shadow-sm"
                            >
                                {isSendingReply ? (
                                    <><RefreshCcw size={14} className="animate-spin" /> Sending...</>
                                ) : (
                                    <><Send size={14} /> Send Reply</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
