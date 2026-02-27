import { useState, useEffect, useRef } from "react";
import { Search, Send, User, MoreVertical, Paperclip, Smile, Plus } from "lucide-react";
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
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <ScrollReveal className="mb-4">
                <h1 className="h3 fw-bold text-gray-900 dark:text-white mb-1">Messages</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Chat and collaborate with your team</p>
            </ScrollReveal>

            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex overflow-hidden">
                {/* Chat List */}
                <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 relative">
                        <div className="relative">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder="Search users to chat..."
                                className="pl-12 pr-4 py-2 bg-transparent border-0 border-b-2 border-gray-400 dark:border-gray-500 rounded-none w-full focus:ring-0 focus:border-emerald-500 transition-colors"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        {(searchResults.length > 0 || (isSearching && debouncedSearchTerm.length >= 2)) && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto mx-4">
                                {isSearching ? (
                                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((res) => (
                                        <button
                                            key={res.id}
                                            onClick={() => startChat(res)}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">
                                                    {res.fullName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-semibold dark:text-white">{res.fullName}</div>
                                                <div className="text-[10px] text-gray-500">{res.email}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.length > 0 ? chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/50 ${selectedChat?.id === chat.id ? "bg-emerald-50 dark:bg-emerald-900/10" : ""
                                    }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar>
                                        <AvatarImage src={chat.avatar} />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">
                                            {chat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {chat.status === "online" && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm dark:text-white truncate">{chat.name}</span>
                                        <span className="text-[10px] text-gray-400">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {chat.unread}
                                    </div>
                                )}
                            </button>
                        )) : (
                            <div className="p-8 text-center text-gray-400">
                                <p className="text-sm">No conversations yet.</p>
                                <p className="text-xs mt-1">Search for a user to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">
                                            {selectedChat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold dark:text-white">{selectedChat.name}</h3>
                                        <span className="text-xs text-green-500">Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon"><User className="h-5 w-5 text-gray-500" /></Button>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div
                                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-950/50"
                                ref={scrollContainerRef}
                            >
                                {hasMore && (
                                    <div className="flex justify-center py-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={loadMoreMessages}
                                            disabled={isLoadingMore}
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            {isLoadingMore ? "Loading..." : "Load Previous Messages"}
                                        </Button>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] group`}>
                                            <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.isMe
                                                ? "bg-emerald-600 text-white rounded-tr-none"
                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700"
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className={`text-[10px] text-gray-400 mt-1 block ${msg.isMe ? "text-right mr-1" : "ml-1"}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                                    <Button variant="ghost" size="icon" type="button"><Paperclip className="h-5 w-5 text-gray-500" /></Button>
                                    <Input
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 border-none bg-transparent focus-visible:ring-0"
                                    />
                                    <Button variant="ghost" size="icon" type="button"><Smile className="h-5 w-5 text-gray-500" /></Button>
                                    <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10">
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Send className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold dark:text-white mb-2">Your Messages</h3>
                            <p className="text-sm text-center max-w-xs">
                                Choose a conversation from the left or search for a user to start chatting.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                                onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Search users"]')?.focus()}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Message
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
