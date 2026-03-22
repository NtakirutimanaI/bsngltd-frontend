import { useState, useEffect, useRef } from "react";
import { Search, Send, User, MoreVertical, Paperclip, Smile, Plus, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { fetchApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from "@/app/hooks/useDebounce";

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
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messageText, setMessageText] = useState("");
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [page, setPage] = useState(1);
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
        if (user) {
            loadConversations();
        }
    }, [user]);

    useEffect(() => {
        if (selectedChat && user) {
            setPage(1);
            loadMessages(selectedChat.id, 1);
        }
    }, [selectedChat, user]);

    useEffect(() => {
        if (page === 1) {
            scrollToBottom();
        }
    }, [messages, page]);

    // Polling for new messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (user) {
                loadConversations();
                if (selectedChat && page === 1) {
                    // Only poll if we are on the first page to avoid jumping
                    loadMessages(selectedChat.id, 1, true);
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [user, selectedChat]);

    // Search users effect
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
                setSearchResults(data.filter(u => u.id !== user?.id));
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedSearchTerm, user]);

    const loadConversations = async () => {
        try {
            const data = await fetchApi<any[]>(`/messages/conversations?userId=${user?.id}`);
            const formattedChats = data.map(c => ({
                id: c.id,
                name: c.name,
                lastMessage: c.lastMessage,
                time: formatDistanceToNow(new Date(c.time), { addSuffix: true }),
                unread: c.unread,
                status: c.status,
                avatar: c.avatar
            }));
            setChats(formattedChats);
            if (formattedChats.length > 0 && !selectedChat) {
                setSelectedChat(formattedChats[0]);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    };

    const loadMessages = async (otherUserId: string, pageNum: number = 1, isPolling: boolean = false) => {
        try {
            const response = await fetchApi<PaginatedResponse<any>>(`/messages/chat/${otherUserId}?userId=${user?.id}&page=${pageNum}&limit=50`);

            const formattedMessages = response.data.map(m => ({
                id: m.id,
                senderId: m.senderId,
                receiverId: m.receiverId,
                content: m.content,
                createdAt: m.createdAt,
                isMe: m.senderId === user?.id
            }));

            if (pageNum === 1) {
                setMessages(formattedMessages);
                if (!isPolling) scrollToBottom();
            } else {
                setMessages(prev => [...formattedMessages, ...prev]);
            }

            setHasMore(response.page < response.lastPage);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const loadMoreMessages = () => {
        if (selectedChat && hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            loadMessages(selectedChat.id, nextPage);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedChat || !user) return;

        try {
            await fetchApi("/messages", {
                method: "POST",
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: selectedChat.id,
                    content: messageText
                })
            });
            setMessageText("");
            setPage(1);
            loadMessages(selectedChat.id, 1);
            loadConversations();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleSearch = (val: string) => {
        setSearchTerm(val);
    };

    const startChat = (targetUser: UserSearchResult) => {
        const existingChat = chats.find(c => c.id === targetUser.id);
        if (existingChat) {
            setSelectedChat(existingChat);
        } else {
            const newChat: Chat = {
                id: targetUser.id,
                name: targetUser.fullName,
                lastMessage: "No messages yet",
                time: "Now",
                unread: 0,
                status: "online"
            };
            setSelectedChat(newChat);
        }
        setSearchTerm("");
        setSearchResults([]);
        setIsSearching(false);
    };

    return (
        <div className="min-h-[60vh] h-[calc(100vh-120px)] flex flex-col gap-4 relative">
            <ScrollReveal className="relative z-10 shrink-0 mb-4">
                <div className="bg-light rounded p-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                    <div className="d-flex align-items-center gap-4">
                        <div className="p-3 bg-primary rounded-circle text-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 60, height: 60 }}>
                            <MessageSquare size={28} strokeWidth={2} />
                        </div>
                        <div>
                            <h4 className="fw-bold mb-1">Internal Team Chats</h4>
                            <p className="text-muted small mb-0">Secure collaboration workspace</p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            <div className="flex-grow-1 d-flex flex-column flex-md-row gap-4 overflow-hidden position-relative z-10 pb-4">
                {/* Chat List */}
                <div className="w-100 bg-light rounded shadow-sm d-flex flex-column overflow-hidden shrink-0" style={{ maxWidth: '320px' }}>
                    <div className="p-3 border-bottom position-relative bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder="Find team members..."
                                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm dark:text-white placeholder:text-gray-400 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        {(searchResults.length > 0 || (isSearching && debouncedSearchTerm.length >= 2)) && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto mx-4">
                                {isSearching ? (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((res) => (
                                        <button
                                            key={res.id}
                                            onClick={() => startChat(res)}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                    {res.fullName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-xs font-semibold dark:text-white">{res.fullName}</div>
                                                <div className="text-[9px] text-gray-500">{res.email}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.length > 0 ? chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`w-[calc(100%-16px)] mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-200 rounded-xl ${selectedChat?.id === chat.id ? "bg-indigo-50 dark:bg-indigo-900/20 shadow-sm border border-indigo-100 dark:border-indigo-800" : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                                    }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-10 w-10 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <AvatarImage src={chat.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                                            {chat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {chat.status === "online" && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold text-sm truncate ${selectedChat?.id === chat.id ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}>{chat.name}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                        {chat.unread}
                                    </div>
                                )}
                            </button>
                        )) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <p className="text-sm">No conversations yet.</p>
                                <p className="text-xs mt-1">Search for a user to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-grow-1 bg-light rounded shadow-sm d-flex flex-column overflow-hidden">
                    {selectedChat ? (
                        <>
                            {/* Header */}
                            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white z-20 shadow-sm">
                                <div className="d-flex align-items-center gap-3">
                                    <Avatar className="h-10 w-10 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                                            {selectedChat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-none mb-1.5">{selectedChat.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></span>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                                    <Button variant="ghost" size="sm" className="rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"><User className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" className="rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"><MoreVertical className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div
                                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50"
                                ref={scrollContainerRef}
                            >
                                {hasMore && (
                                    <div className="flex justify-center py-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={loadMoreMessages}
                                            disabled={isLoadingMore}
                                            className="text-xs font-semibold text-gray-500 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
                                        >
                                            {isLoadingMore ? "Loading..." : "Load Previous Messages"}
                                        </Button>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] group flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                                            <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.isMe
                                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm"
                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700"
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className={`text-[10px] font-medium text-gray-400 mt-1.5 block mx-1`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                    <Button variant="ghost" size="icon" type="button" className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><Paperclip className="h-5 w-5 text-gray-400" /></Button>
                                    <Input
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Write a message..."
                                        className="flex-1 h-10 border-none bg-transparent focus-visible:ring-0 dark:text-white placeholder:text-gray-400 text-sm px-2"
                                    />
                                    <Button variant="ghost" size="icon" type="button" className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><Smile className="h-5 w-5 text-gray-400" /></Button>
                                    <Button size="icon" className="shrink-0 btn btn-primary rounded-circle shadow-sm" style={{ width: 40, height: 40 }}>
                                        <Send size={16} className="ms-1" />
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted p-5 bg-white border-top border-transparent position-relative overflow-hidden">
                            <div className="p-4 bg-light rounded-circle mb-4 shadow-sm border">
                                <MessageSquare size={40} className="text-primary" strokeWidth={1.5} />
                            </div>
                            <h4 className="fw-bold mb-2">Your Workspace</h4>
                            <p className="small text-center max-w-sm mb-4">
                                Select a team member from the sidebar to start collaborating securely.
                            </p>
                            <Button
                                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                                onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Find team"]')?.focus()}
                            >
                                <Plus size={18} className="me-2" />
                                Start New Chat
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
