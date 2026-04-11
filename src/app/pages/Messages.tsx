import { useState, useEffect, useRef } from "react";
import { Search, Send, User, MoreVertical, Paperclip, Plus, MessageSquare, RefreshCcw, Send as SendIcon, XCircle, Mail, MailOpen, Trash2, Send as SentIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { fetchApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from "@/app/hooks/useDebounce";
import { useSite } from "../context/SiteContext";

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isMe: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    lastPage: number;
}

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    status: "online" | "offline";
    avatar?: string;
}

export function Messages() {
    const { user } = useAuth();
    const { selectedSite } = useSite();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messageText, setMessageText] = useState("");
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeFolder, setActiveFolder] = useState<'unread' | 'read' | 'sent' | 'trash'>('unread');
    const [searchTerm, setSearchTerm] = useState("");
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [composeData, setComposeData] = useState({ title: '', subject: '', message: '' });
    const [isSubmittingCompose, setIsSubmittingCompose] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) loadConversations();
    }, [user, selectedSite]);

    useEffect(() => {
        if (selectedChat && user) loadMessages(selectedChat.id, 1);
    }, [selectedChat, user, selectedSite]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (user && selectedChat) loadMessages(selectedChat.id, 1);
        }, 5000);
        return () => clearInterval(interval);
    }, [user, selectedChat, selectedSite]);

    const loadConversations = async () => {
        try {
            const siteParam = selectedSite?.id ? `&siteId=${selectedSite.id}` : '';
            const data = await fetchApi<any[]>(`/messages/conversations?userId=${user?.id}${siteParam}`);
            const formattedChats = (data || []).map(c => ({
                id: c.id,
                name: c.name,
                lastMessage: c.lastMessage,
                time: formatDistanceToNow(new Date(c.time), { addSuffix: true }),
                unread: c.unread,
                status: c.status,
                avatar: c.avatar
            }));
            setChats(formattedChats);
            if (formattedChats.length > 0 && !selectedChat) setSelectedChat(formattedChats[0]);
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    };

    const loadMessages = async (otherUserId: string, pageNum: number = 1) => {
        try {
            const siteParam = selectedSite?.id ? `&siteId=${selectedSite.id}` : '';
            const response = await fetchApi<PaginatedResponse<any>>(`/messages/chat/${otherUserId}?userId=${user?.id}&page=${pageNum}&limit=50${siteParam}`);
            const formattedMessages = (response?.data || []).map(m => ({
                id: m.id,
                senderId: m.senderId,
                receiverId: m.receiverId,
                content: m.content,
                createdAt: m.createdAt,
                isMe: m.senderId === user?.id
            }));
            
            if (pageNum === 1) {
                setMessages(prev => {
                    const hasChanged = prev.length !== formattedMessages.length || 
                                     (prev.length > 0 && prev[prev.length-1].id !== formattedMessages[formattedMessages.length-1].id);
                    
                    if (!hasChanged) return prev;

                    const container = scrollContainerRef.current;
                    if (container) {
                        const isAtBottom = Math.abs(container.scrollHeight - container.clientHeight - container.scrollTop) < 50;
                        if (isAtBottom || prev.length === 0) {
                            setTimeout(scrollToBottom, 50);
                        }
                    }
                    return formattedMessages;
                });
            } else {
                setMessages(prev => [...formattedMessages, ...prev]);
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = messageText.trim();
        if (!content || !selectedChat || !user) return;
        try {
            setMessageText("");
            await fetchApi("/messages", {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: selectedChat.id,
                    content,
                    siteId: selectedSite?.id || null
                })
            });
            loadMessages(selectedChat.id, 1);
            loadConversations();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleComposeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingCompose(true);

        const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase().replace(/\s+/g, '_');
        const isProfessional = ['super_admin', 'admin', 'manager', 'site_manager', 'employee', 'staff'].includes(roleName);

        try {
            if (isProfessional) {
                await fetchApi('/messages', {
                    method: 'POST',
                    body: JSON.stringify({
                        senderId: user?.id,
                        receiverId: 'admin_general',
                        content: `[PRIORITY ${composeData.title}] ${composeData.subject}: ${composeData.message}`,
                        siteId: selectedSite?.id || null,
                        isInternal: true
                    })
                });
                alert("Internal priority chat sent to team.");
            } else {
                await fetchApi('/messages/contact', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: user?.fullName,
                        email: user?.email,
                        subject: `${composeData.title}: ${composeData.subject}`,
                        message: composeData.message,
                        isInternal: true
                    }),
                });
                alert("Message sent to administration enquiry hub.");
            }
            
            setIsComposeModalOpen(false);
            setIsComposing(false);
            setComposeData({ title: '', subject: '', message: '' });
            loadConversations();
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send priority communication. Please try again.");
        } finally {
            setIsSubmittingCompose(false);
        }
    };

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeFolder === 'unread') return matchesSearch && chat.unread > 0;
        if (activeFolder === 'read') return matchesSearch && chat.unread === 0;
        return matchesSearch;
    });

    const folders = [
        { id: 'unread', icon: Mail, label: 'Unread', count: chats.filter(c => c.unread > 0).length, color: 'text-blue-500' },
        { id: 'read', icon: MailOpen, label: 'Read', count: chats.filter(c => c.unread === 0).length, color: 'text-gray-500' },
        { id: 'sent', icon: SentIcon, label: 'Sent', count: 0, color: 'text-green-500' },
        { id: 'trash', icon: Trash2, label: 'Trash', count: 0, color: 'text-red-500' }
    ];

    return (
        <div className="messages-hub h-100 p-0">
            {/* Precise Compact Header Styling */}
            <div className="bg-white p-2 rounded-xl mb-2 shadow-sm border border-gray-100 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary rounded-xl p-2 text-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', background: '#009CFF' }}>
                        <MessageSquare size={18} />
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Internal Team Chats</h2>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Secure collaboration workspace</p>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button
                        onClick={() => { setIsComposing(true); setSelectedChat(null); }}
                        className="btn btn-sm d-flex align-items-center gap-2 text-white px-3 fw-bold"
                        style={{ background: '#000', borderRadius: '8px', fontSize: '10px', height: '32px' }}>
                        <Plus size={12} /> New Message
                    </button>
                    <button
                        onClick={() => { loadConversations(); if(selectedChat) loadMessages(selectedChat.id, 1); }}
                        className="btn d-flex align-items-center gap-2 text-white px-3 py-1.5"
                        style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 700, height: '32px' }}>
                        <RefreshCcw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div className="row g-2 h-[calc(100vh-230px)] overflow-hidden">
                {/* 1. Folders Sidebar (Ultra Compact) */}
                <div className="col-auto h-100" style={{ width: '60px' }}>
                    <div className="bg-white h-100 p-1.5 rounded-xl border border-gray-100 shadow-sm d-flex flex-column gap-1.5 align-items-center overflow-hidden">
                        {folders.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => { setActiveFolder(f.id as any); setSelectedChat(null); setIsComposing(false); }}
                                className={`d-flex flex-column align-items-center justify-content-center gap-0.5 p-1 rounded-lg border-0 transition-all w-100 position-relative ${activeFolder === f.id ? 'bg-primary text-white shadow-md' : 'btn-light-hover text-muted'}`}
                                style={{ height: '52px' }}
                                title={f.label}
                            >
                                <f.icon size={15} className={activeFolder === f.id ? 'text-white' : f.color ?? ''} />
                                <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1px' }}>{f.label}</span>
                                {f.count > 0 && (
                                    <span 
                                        className="position-absolute top-1 end-1 badge rounded-pill bg-danger shadow-sm border border-white"
                                        style={{ fontSize: '7px', padding: '1.5px 3.5px', transform: 'translate(10%, -10%)' }}
                                    >
                                        {f.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-lg-3 h-100">
                    <div className="bg-white h-100 p-0 rounded-2xl border border-gray-100 shadow-sm d-flex flex-column overflow-hidden">
                        <div className="p-3">
                            <div className="position-relative d-flex align-items-center">
                                <Search size={14} className="position-absolute text-muted" style={{ left: '12px' }} />
                                <input
                                    placeholder="Search teammates..."
                                    className="form-control border-gray-100 bg-white shadow-xs w-100"
                                    style={{ borderRadius: '10px', fontSize: '13px', paddingLeft: '38px', height: '42px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="directory-scroll-container overflow-y-auto flex-grow-1 p-2">
                            {filteredChats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => { setSelectedChat(chat); setIsComposing(false); }}
                                    className={`p-3 mb-2 rounded-2xl transition-all cursor-pointer d-flex align-items-center gap-3 ${selectedChat?.id === chat.id ? 'shadow-lg border-0' : 'bg-white hover:bg-gray-50 border-0 shadow-xs'}`}
                                    style={selectedChat?.id === chat.id ? { background: '#009CFF', color: 'white' } : {}}
                                >
                                    <Avatar style={{ width: '42px', height: '42px' }} className={selectedChat?.id === chat.id ? 'shadow-inner' : ''}>
                                        <AvatarImage src={chat.avatar} />
                                        <AvatarFallback className={selectedChat?.id === chat.id ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary'}>{chat.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '12px' }}>{chat.name}</h6>
                                            <span className={`smaller ${selectedChat?.id === chat.id ? 'text-white' : 'text-muted'}`} style={{ fontSize: '9px' }}>{chat.time}</span>
                                        </div>
                                        <p className={`mb-0 text-truncate ${selectedChat?.id === chat.id ? 'text-white/80' : 'text-muted'}`} style={{ fontSize: '10px' }}>{chat.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredChats.length === 0 && (
                                <div className="text-center p-5 opacity-40">
                                    <MessageSquare size={32} className="mb-2 mx-auto" />
                                    <p className="smaller fw-bold">No {activeFolder} found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col h-100">
                    <div className="bg-white h-100 p-0 rounded-2xl border border-gray-100 shadow-sm d-flex flex-column overflow-hidden">
                        {selectedChat ? (
                            <>
                                <div className="p-4 border-bottom border-gray-50 bg-white d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <Avatar style={{ width: '48px', height: '48px' }}><AvatarFallback className="bg-gray-100 text-dark">{selectedChat.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div>
                                            <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>{selectedChat.name}</h4>
                                            <span className="text-muted fw-medium" style={{ fontSize: '11px' }}>Active Now</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 pr-2">
                                        <button className="btn btn-link text-muted p-2 hover:bg-gray-50 rounded-lg"><User size={18} /></button>
                                        <button className="btn btn-link text-muted p-2 hover:bg-gray-50 rounded-lg"><MoreVertical size={18} /></button>
                                    </div>
                                </div>

                                <div className="flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-3" ref={scrollContainerRef}>
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`d-flex ${msg.isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div 
                                                className={`max-w-[70%] p-3 px-4 shadow-sm ${msg.isMe ? 'bg-primary text-white text-end rounded-t-2xl rounded-l-2xl' : 'bg-white text-dark text-start border border-gray-100 rounded-t-2xl rounded-r-2xl'}`} 
                                                style={{ fontSize: '13px', lineHeight: '1.5', background: msg.isMe ? '#009CFF' : '#fff' }}
                                            >
                                                <div className="fw-bold mb-1" style={{ fontSize: '12px' }}>{msg.isMe ? user?.fullName?.split(' ')[0] : selectedChat.name}</div>
                                                {msg.content}
                                                <div className={`text-[9px] mt-2 opacity-70 ${msg.isMe ? 'text-white' : 'text-muted'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 bg-white border-top border-gray-50">
                                    <div className="d-flex align-items-center gap-3 p-2 px-3 border border-gray-100 rounded-full bg-white shadow-sm transition-all focus-within:shadow-md">
                                        <button type="button" className="btn btn-link p-1 text-muted hover:text-dark"><Paperclip size={20} /></button>
                                        <input 
                                            className="form-control border-0 shadow-none bg-transparent flex-grow-1"
                                            placeholder="Write message..."
                                            style={{ fontSize: '13px', height: '44px' }}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleSendMessage}
                                            className="btn btn-primary rounded-full d-flex align-items-center justify-content-center p-0 shadow-md" 
                                            style={{ width: '40px', height: '40px', background: '#009CFF' }}
                                        >
                                            <Send size={18} className="ms-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : isComposing ? (
                            /* Premium Integrated Compose Design */
                            <div className="h-100 d-flex flex-column bg-white/95 backdrop-blur-md">
                                <div className="p-4 border-bottom border-gray-50 bg-dark text-white d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3 text-white">
                                        <div className="bg-primary rounded-xl p-2.5 text-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <Plus size={20} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-0" style={{ fontSize: '15px' }}>Compose Priority Message</h4>
                                            <p className="mb-0 text-white/60 smaller" style={{ fontSize: '10px' }}>To: BSNG Administration Hub</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsComposing(false)} className="btn btn-link text-white p-0 opacity-60 hover:opacity-100 transition-all">
                                        <XCircle size={22} />
                                    </button>
                                </div>
                                
                                <div className="p-3 flex-grow-1 overflow-y-auto">
                                    <form onSubmit={handleComposeSubmit} className="d-flex flex-column gap-3 max-w-[600px] mx-auto pt-2 h-100">
                                        <div className="composition-group overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">
                                            <div className="d-flex border-bottom border-gray-100">
                                                <div className="p-2.5 flex-grow-1 border-end border-gray-100">
                                                    <label className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '8px', opacity: 0.7 }}>Message Title</label>
                                                    <input 
                                                        className="form-control form-control-sm border-0 p-0 shadow-none fw-semibold" 
                                                        placeholder="General Inquiry..." 
                                                        style={{ fontSize: '12px', background: 'transparent' }}
                                                        required
                                                        value={composeData.title}
                                                        onChange={e => setComposeData({...composeData, title: e.target.value})}
                                                    />
                                                </div>
                                                <div className="p-2.5 flex-grow-1">
                                                    <label className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '8px', opacity: 0.7 }}>Subject</label>
                                                    <input 
                                                        className="form-control form-control-sm border-0 p-0 shadow-none fw-semibold" 
                                                        placeholder="What is this about?" 
                                                        style={{ fontSize: '12px', background: 'transparent' }}
                                                        required
                                                        value={composeData.subject}
                                                        onChange={e => setComposeData({...composeData, subject: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="p-3 bg-gray-50/10">
                                                <label className="d-block text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '8px', opacity: 0.7 }}>Message Detail</label>
                                                <textarea 
                                                    className="form-control border-0 p-0 shadow-none" 
                                                    placeholder="Write your detailed message here..." 
                                                    style={{ fontSize: '12px', minHeight: '120px', resize: 'none', background: 'transparent', lineHeight: '1.5' }}
                                                    required
                                                    value={composeData.message}
                                                    onChange={e => setComposeData({...composeData, message: e.target.value})}
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mt-auto py-3 border-top">
                                            <div className="d-flex align-items-center gap-2 px-1">
                                                <div className="bg-emerald-500 rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                                                <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '9px' }}>Priority Channel</span>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button type="button" onClick={() => setIsComposing(false)} className="btn btn-sm btn-outline-secondary border-0 fw-bold px-4" style={{ fontSize: '11px', borderRadius: '8px' }}>Cancel</button>
                                                <button 
                                                    type="submit"
                                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-md transition-all hover:translate-y-[-1px]"
                                                    disabled={isSubmittingCompose}
                                                    style={{ borderRadius: '10px', height: '36px', background: '#009CFF' }}
                                                >
                                                    {isSubmittingCompose ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <span className="fw-bold text-uppercase" style={{ fontSize: '11px' }}>Push to Admin</span>
                                                            <SendIcon size={14} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-40">
                                <MessageSquare size={48} className="mb-3" />
                                <h5 className="fw-bold" style={{ fontSize: '16px' }}>Select Chat</h5>
                                <p className="small">Choose a teammate to start collaborate.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .active-chat { background: #009CFF !important; border-color: #009CFF !important; color: white !important; }
                .directory-scroll-container::-webkit-scrollbar { width: 4px; }
                .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            `}</style>
        </div>
    );
}
