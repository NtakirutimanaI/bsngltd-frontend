import { useState, useEffect, useRef } from "react";
import { Search, Send, User, MoreVertical, Paperclip, Smile, Plus, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
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

interface UserSearchResult {
    id: string;
    fullName: string;
    email: string;
}

export function Messages() {
    const { user } = useAuth();
    const { selectedSite } = useSite();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messageText, setMessageText] = useState("");
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
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
            if (user && selectedChat) loadMessages(selectedChat.id, 1, true);
        }, 5000);
        return () => clearInterval(interval);
    }, [user, selectedChat, selectedSite]);

    useEffect(() => {
        if (debouncedSearchTerm.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        const performSearch = async () => {
            setIsSearching(true);
            try {
                const data = await fetchApi<UserSearchResult[]>(`/users/search?q=${debouncedSearchTerm}`);
                setSearchResults((data || []).filter(u => u.id !== user?.id));
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };
        performSearch();
    }, [debouncedSearchTerm, user]);

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

    const loadMessages = async (otherUserId: string, pageNum: number = 1, isPolling: boolean = false) => {
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

                    // If we have new messages, check if we should scroll
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
            setHasMore(response?.page < response?.lastPage);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setIsLoadingMore(false);
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

    const startChat = (targetUser: UserSearchResult) => {
        const existingChat = chats.find(c => c.id === targetUser.id);
        if (existingChat) {
            setSelectedChat(existingChat);
        } else {
            setSelectedChat({
                id: targetUser.id,
                name: targetUser.fullName,
                lastMessage: "Start a conversation",
                time: "Now",
                unread: 0,
                status: "online"
            });
        }
        setSearchTerm("");
        setSearchResults([]);
    };

    return (
        <div className="messages-hub h-100 p-0">
            {/* High Density Header */}
            <div className="glass-card p-2 rounded-xl mb-3 border border-white shadow-sm d-flex align-items-center justify-content-between" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded-lg p-2 text-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                        <MessageSquare size={16} />
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Internal Team Chats</h2>
                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Secure collaboration workspace</p>
                    </div>
                </div>
            </div>

            <div className="row g-3 h-[calc(100vh-160px)] overflow-hidden">
                {/* Conversations List */}
                <div className="col-lg-4 col-xl-3 h-100">
                    <div className="glass-card h-100 p-0 rounded-xl border border-white shadow-sm d-flex flex-column overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                        <div className="p-2 border-bottom border-gray-100">
                            <div className="position-relative">
                                <Search size={12} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
                                <input
                                    placeholder="Search teammates..."
                                    className="form-control form-control-sm border-gray-50 bg-white/60"
                                    style={{ borderRadius: '8px', fontSize: '11px', paddingLeft: '32px', height: '32px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {(searchResults.length > 0 || isSearching) && (
                                    <div className="position-absolute w-100 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden" style={{ top: '100%' }}>
                                        {isSearching ? <div className="p-2 text-center smaller text-muted">Searching...</div> :
                                            searchResults.map(res => (
                                                <div key={res.id} onClick={() => startChat(res)} className="p-2 d-flex align-items-center gap-2 hover:bg-light cursor-pointer border-bottom border-gray-50">
                                                    <Avatar style={{ width: '24px', height: '24px' }}><AvatarFallback style={{ fontSize: '9px' }}>{res.fullName.charAt(0)}</AvatarFallback></Avatar>
                                                    <div className="overflow-hidden">
                                                        <div className="fw-bold truncate" style={{ fontSize: '11px' }}>{res.fullName}</div>
                                                        <div className="text-muted truncate" style={{ fontSize: '9px' }}>{res.email}</div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="directory-scroll-container overflow-y-auto flex-grow-1 p-1">
                            {chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`site-row p-2 mb-1 rounded-xl transition-all border cursor-pointer d-flex align-items-center gap-2 ${selectedChat?.id === chat.id ? 'active-chat shadow-md' : 'bg-white/60 border-transparent hover:bg-white hover:border-gray-50'}`}
                                    style={selectedChat?.id === chat.id ? { background: '#009CFF', color: 'white' } : {}}
                                >
                                    <div className="position-relative flex-shrink-0">
                                        <Avatar style={{ width: '32px', height: '32px' }}>
                                            <AvatarImage src={chat.avatar} />
                                            <AvatarFallback className={selectedChat?.id === chat.id ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary'}>{chat.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden text-start">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{chat.name}</h6>
                                            <span className={`smaller ${selectedChat?.id === chat.id ? 'text-white/70' : 'text-muted'}`} style={{ fontSize: '9px' }}>{chat.time}</span>
                                        </div>
                                        <p className="mb-0 text-truncate opacity-80" style={{ fontSize: '10px' }}>{chat.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-lg-8 col-xl-9 h-100">
                    <div className="glass-card h-100 p-0 rounded-xl border border-white shadow-sm d-flex flex-column overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                        {selectedChat ? (
                            <>
                                <div className="p-2 border-bottom border-gray-100 bg-white/60 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <Avatar style={{ width: '30px', height: '30px' }}><AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div>
                                            <h4 className="fw-bold mb-0" style={{ fontSize: '12px' }}>{selectedChat.name}</h4>
                                            <span className="text-muted" style={{ fontSize: '9px' }}>Active Now</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-1">
                                        <button className="btn btn-icon-sm btn-light-hover rounded-lg"><User size={12} className="text-muted" /></button>
                                        <button className="btn btn-icon-sm btn-light-hover rounded-lg"><MoreVertical size={12} className="text-muted" /></button>
                                    </div>
                                </div>

                                <div className="flex-grow-1 overflow-y-auto p-3 d-flex flex-column gap-2" ref={scrollContainerRef}>
                                    {messages.map((msg, i) => (
                                        <div key={msg.id} className={`d-flex ${msg.isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div className={`max-w-[80%] p-2 px-3 rounded-2xl shadow-xs border ${msg.isMe ? 'bg-primary text-white border-primary rounded-tr-none' : 'bg-white text-dark border-gray-100 rounded-tl-none'}`} style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                                {msg.content}
                                                <div className={`text-[8px] mt-1 text-end ${msg.isMe ? 'text-white/70' : 'text-muted'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-2 bg-white/80 border-top border-gray-100">
                                    <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-2 p-1 border border-gray-200 rounded-2xl bg-white focus-within:border-primary transition-all">
                                        <button type="button" className="btn btn-icon-sm btn-light-hover rounded-circle"><Paperclip size={14} className="text-muted" /></button>
                                        <input 
                                            className="form-control form-control-sm border-0 shadow-none bg-transparent flex-grow-1"
                                            placeholder="Write message..."
                                            style={{ fontSize: '11px', height: '32px' }}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm" style={{ width: '32px', height: '32px' }}>
                                            <Send size={12} className="ms-0.5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-40">
                                <MessageSquare size={48} className="mb-3" />
                                <p className="fw-bold smaller">Select a collaborator to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .active-chat { background: #009CFF !important; border-color: #009CFF !important; color: white !important; }
                .btn-icon-sm { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; padding: 0; }
                .btn-light-hover:hover { background: #f8fafc; }
                .directory-scroll-container::-webkit-scrollbar { width: 4px; }
                .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
