import { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { FaStop } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Dashboard() {
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showHelp, setshowHelp] = useState(false);
    const [chatList, setChatList] = useState<any[]>([]);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar collapse
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchChats();
        inputRef.current?.focus();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/chat/chats", {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
            setChatList(data.chats);
        } catch (err) {
            console.error("Failed to fetch chats:", err);
        }
    };

    const loadChatMessages = async (chatId: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/chat/${chatId}`, {
                credentials: "include"
            });
            const data = await res.json();
            setMessages(data.messages.map((m: any) => ({ sender: m.sender, text: m.content })));
            setActiveChatId(chatId);
            setshowHelp(false);
        } catch (err) {
            console.error("Failed to load chat messages:", err);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setActiveChatId(null);
        setInput('');
        setshowHelp(true);
    };

    const renameChat = async (chatId: number, newTitle: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/rename/${chatId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title: newTitle }),
            });
            if (res.ok) {
                fetchChats(); // Refresh the chat list
            } else {
                console.error("Failed to rename chat");
            }
        } catch (err) {
            console.error("Error renaming chat:", err);
        }
    };

    const deleteChat = async (chatId: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/delete/${chatId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                fetchChats(); // Refresh the chat list
                if (activeChatId === chatId) {
                    startNewChat(); // Reset the active chat if it was deleted
                }
            } else {
                console.error("Failed to delete chat");
            }
        } catch (err) {
            console.error("Error deleting chat:", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [messages, isLoading]);

    const handleCommand = (command: string) => {
        switch (command) {
            case '/help':
                setshowHelp(true);
                break;
            case '/clear':
                setMessages([]);
                setshowHelp(true);
                break;
            case '/about':
                setMessages([...messages, { sender: 'bot', text: 'This is a chatbot application.' }]);
                setshowHelp(false);
                break;
            case '/logout':
                document.cookie = 'authToken=; Max-Age=0; path=/;';
                setTimeout(() => window.location.reload(), 100);
                break;
            default:
                setMessages([...messages, { sender: 'bot', text: 'Type a valid command.' }]);
                setshowHelp(false);
        }
    };

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        if (input.startsWith('/')) {
            handleCommand(input);
            setInput('');
            return;
        }

        setshowHelp(false);
        const newMessage = { sender: 'user', text: input };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:5000/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: input,
                    conversationId: activeChatId,
                    history: updatedMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
                }),
            });
            const data = await res.json();
            const botMessage = { sender: 'bot', text: data.response };
            setActiveChatId(data.conversationId);
            simulateTypingEffect(botMessage, updatedMessages);
            fetchChats();
        } catch (error) {
            console.error('Error sending message:', error);
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const simulateTypingEffect = (botMessage: { sender: string; text: string }, updatedMessages: { sender: string; text: string }[]) => {
        if (!botMessage.text) {
            console.error('simulateTypingEffect: botMessage.text is undefined');
            setMessages([...updatedMessages, botMessage]);
            setIsLoading(false);
            setIsTyping(false);
            return;
        }
        let index = 0;
        typingIntervalRef.current = setInterval(() => {
            if (index < botMessage.text.length) {
                const partialMessage = { ...botMessage, text: botMessage.text.slice(0, index + 1) };
                setMessages([...updatedMessages, partialMessage]);
                index++;
            } else {
                clearInterval(typingIntervalRef.current!);
                typingIntervalRef.current = null;
                setMessages([...updatedMessages, botMessage]);
                setIsLoading(false);
                setIsTyping(false);
            }
        }, 10);
    };

    const handleStopTyping = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setIsLoading(false);
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 flex bg-gradient-to-br from-gray-900 to-black">
            {/* Sidebar */}
            <div
                className={`transition-all duration-300 ${
                    isSidebarCollapsed ? 'w-16' : 'w-64'
                } bg-black/80 p-4 text-white overflow-y-auto border-r border-gray-800`}
            >
                <div className="flex justify-between items-center mb-4">
                    {!isSidebarCollapsed && <h2 className="text-lg font-bold">Chats</h2>}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="text-white hover:text-gray-400"
                    >
                        {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>
                {!isSidebarCollapsed && (
                    <div>
                        <button
                            onClick={startNewChat}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-2 py-1 rounded w-full mb-4"
                        >
                            + New Chat
                        </button>
                        <ul className="space-y-2">
                            {chatList.map(chat => (
                                <li key={chat.conversationId} className="flex items-center justify-between">
                                    <button
                                        className={`flex-1 text-left p-2 rounded-md hover:bg-gray-700 ${
                                            activeChatId === chat.conversationId ? 'bg-gray-700' : ''
                                        }`}
                                        onClick={() => loadChatMessages(chat.conversationId)}
                                    >
                                        {chat.title || `Chat ${chat.conversationId}`}
                                    </button>
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => {
                                                const newTitle = prompt("Enter new title for the chat:", chat.title || `Chat ${chat.conversationId}`);
                                                if (newTitle) renameChat(chat.conversationId, newTitle);
                                            }}
                                            className="text-yellow-400 hover:text-yellow-500"
                                            title="Rename Chat"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this chat?")) {
                                                    deleteChat(chat.conversationId);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-500"
                                            title="Delete Chat"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 h-screen flex flex-col p-4">
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg mb-4 scrollbar-custom">
                    <AnimatePresence>
                        {showHelp && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-gray-300 text-lg text-center pointer-events-none"
                            >
                                <div className='font-bold'>
                                    <p className="mb-2">Available Commands:</p>
                                    <p>/help - Show this help menu</p>
                                    <p>/clear - Clear chat</p>
                                    <p>/about - Learn about the bot</p>
                                    <p>/logout - Logout from current account</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start gap-2 max-w-md ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="flex-shrink-0 w-8 h-8 mt-1">
                                        {msg.sender === 'user' ? (
                                            <BsPersonCircle className="w-full h-full text-blue-400" />
                                        ) : (
                                            <FaRobot className="w-full h-full text-purple-400 animate-pulse" />
                                        )}
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-lg ${msg.sender === 'user' ? 'bg-blue-600/20 text-white' : 'bg-purple-600/20 text-white'}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: ({ children }) => <table className="table-auto border-collapse border border-gray-400">{children}</table>,
                                                th: ({ children }) => <th className="border border-gray-400 bg-gray-700 px-4 py-2">{children}</th>,
                                                td: ({ children }) => <td className="border border-gray-400 px-4 py-2">{children}</td>,
                                                ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside">{children}</ol>,
                                                blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic">{children}</blockquote>,
                                                code: ({ children }) => <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">{children}</code>
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-transparent">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1 p-3 rounded-xl text-white bg-white/10 focus:outline-none placeholder-gray-400"
                            placeholder={isLoading ? "Please wait..." : "Type your message..."}
                        />
                        {isTyping ? (
                            <motion.button onClick={handleStopTyping} className="p-3 text-white bg-gray-500 hover:bg-red-500 rounded-xl w-12 h-12 flex items-center justify-center">
                                <FaStop />
                            </motion.button>
                        ) : (
                            <motion.button onClick={handleSendMessage} className="p-3 text-white bg-blue-500 hover:bg-blue-700 rounded-xl w-12 h-12 flex items-center justify-center">
                                <IoSend />
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
