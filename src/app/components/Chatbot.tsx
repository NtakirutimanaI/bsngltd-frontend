import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Phone, MapPin, Info, GripHorizontal, Trash2, History } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import Fuse from 'fuse.js';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
}

export function Chatbot() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dragControls = useDragControls();

    // --- Training Data / Knowledge Base ---
    const trainingData = [
        { keys: ['hi', 'hello', 'hey', 'greetings', 'morning', 'evening', 'howdy'], response: 'chatbotGreetingResponse' },
        { keys: ['location', 'where', 'address', 'place', 'office', 'kibagabaga', 'kigali', 'direction', 'visit'], response: 'chatbotLocResponse' },
        { keys: ['service', 'what do you do', 'help', 'capability', 'offer', 'list'], response: 'chatbotServiceResponse' },
        { keys: ['build', 'construction', 'contractor', 'engineer', 'structure', 'architecture', 'building'], response: 'chatbotConstResponse' },
        { keys: ['rent', 'apartment', 'villa', 'house for rent', 'living', 'stay', 'accommodation'], response: 'chatbotRentResponse' },
        { keys: ['sell', 'buy', 'plot', 'house for sale', 'purchase', 'investment', 'land', 'buying'], response: 'chatbotSellResponse' },
        { keys: ['renovation', 'remodel', 'fix', 'update', 'repair', 'modernize', 'painting'], response: 'chatbotRenovResponse' },
        { keys: ['contact', 'phone', 'call', 'email', 'reach', 'talk', 'whatsapp', 'mobile', 'support'], response: 'chatbotContactResponse' },
        { keys: ['price', 'cost', 'quote', 'how much', 'expensive', 'cheap', 'budget', 'payment', 'money', 'fee'], response: 'chatbotPricingResponse' },
        { keys: ['history', 'founded', 'since', 'background', 'start', 'old', 'about', 'story'], response: 'chatbotHistoryResponse' },
        { keys: ['vision', 'mission', 'goal', 'aim', 'believe', 'values', 'why'], response: 'chatbotVisionResponse' },
        { keys: ['project', 'done', 'works', 'experience', 'portfolio', 'example', 'past'], response: 'chatbotProjectsResponse' },
        { keys: ['team', 'staff', 'employee', 'who works', 'architect', 'engineer', 'hiring', 'job', 'careers'], response: 'chatbotTeamResponse' }
    ];

    const fuse = new Fuse(trainingData, {
        keys: ['keys'],
        threshold: 0.3, // Tightened from 0.4 for better accuracy
        minMatchCharLength: 2,
    });

    const getBotResponse = (input: string): string => {
        const text = input.trim().toLowerCase();

        // Handle Very Short Greetings Directly (Real AI feel)
        const commonGreetings = ['hi', 'hello', 'hey', 'yo', 'muraho'];
        if (commonGreetings.includes(text)) {
            return t('chatbotGreetingResponse');
        }

        const result = fuse.search(text);
        if (result.length > 0) {
            return t(result[0].item.response as any);
        }
        return t('chatbotDefaultResponse');
    };
    // --------------------------------------

    // History Persistence
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('bsng_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
        return [
            {
                id: 1,
                text: t('chatbotHello'),
                sender: 'bot',
                timestamp: Date.now(),
            },
        ];
    });

    useEffect(() => {
        localStorage.setItem('bsng_chat_history', JSON.stringify(messages));
    }, [messages]);

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate bot thinking
        setTimeout(() => {
            const botResponse = getBotResponse(text);
            const botMessage: Message = {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const deleteMessage = (id: number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            setMessages([{
                id: Date.now(),
                text: t('chatbotHello'),
                sender: 'bot',
                timestamp: Date.now(),
            }]);
        }
    };

    const quickActions = [
        { label: t('ourLocationChat'), icon: MapPin },
        { label: t('viewProjectsChat'), icon: GripHorizontal },
        { label: t('ourHistoryChat'), icon: Info },
        { label: t('contact'), icon: Phone },
    ];

    return (
        <div className="fixed top-32 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        drag
                        dragControls={dragControls}
                        dragListener={false}
                        dragMomentum={false}
                        dragConstraints={{ left: -window.innerWidth + 400, right: 0, top: 0, bottom: window.innerHeight - 500 }}
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-[300px] md:w-[320px] overflow-hidden mb-4 flex flex-col touch-none"
                    >
                        {/* Header / Drag Handle */}
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="bg-primary/95 backdrop-blur-md p-2.5 flex items-center justify-between text-white border-b border-white/10 cursor-move active:cursor-grabbing"
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1 rounded-lg">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[11px] tracking-tight leading-none mb-1">{t('chatbotAssistant')}</h3>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse shadow-[0_0_3px_#4ade80]"></div>
                                        <span className="text-[8px] opacity-80 font-medium uppercase tracking-wider leading-none">{t('alwaysOnline')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <GripHorizontal size={14} className="opacity-40" />
                                <button
                                    onClick={clearHistory}
                                    className="hover:bg-red-500/20 p-1 rounded-lg transition-all duration-300"
                                    title="Clear History"
                                >
                                    <History size={14} className="text-white/70" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-white/20 p-1 rounded-lg transition-all duration-300"
                                    aria-label="Close Chat"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="h-[250px] overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-gray-950/50 custom-chatbot-scroll"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse text-right' : ''}`}>
                                        <div className={`p-1.5 rounded-lg shrink-0 h-7 w-7 flex items-center justify-center mt-1 ${msg.sender === 'user' ? 'bg-primary/10 text-primary' : 'bg-primary text-white shadow-sm'}`}>
                                            {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className="flex flex-col gap-1 relative">
                                            <div className="flex items-center gap-2 group/msg">
                                                <div className={`p-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                                <button
                                                    onClick={() => deleteMessage(msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <span className="text-[9px] text-gray-400 px-1 font-medium italic">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 items-center">
                                        <div className="p-1.5 rounded-lg bg-primary text-white shrink-0 h-7 w-7 flex items-center justify-center">
                                            <Bot size={14} />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-2.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-[34px]">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="px-3.5 py-2.5 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-gray-900">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => handleSend(action.label)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 whitespace-nowrap hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                                >
                                    <action.icon size={10} strokeWidth={2.5} />
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                                className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 transition-all focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-gray-800"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('typeYourMessage')}
                                    className="flex-1 bg-transparent border-none px-3 py-1.5 text-xs focus:ring-0 dark:text-gray-200 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="bg-primary text-white p-2 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 shadow-lg shadow-primary/20"
                                >
                                    <Send size={14} strokeWidth={2.5} />
                                </button>
                            </form>
                            <div className="text-[8px] text-center text-gray-400 mt-2 font-medium tracking-tight uppercase opacity-50">
                                Powered by MIS Digital Solutions
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex items-center justify-center relative group backdrop-blur-sm mt-1.5"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} strokeWidth={2.5} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-gray-900"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
