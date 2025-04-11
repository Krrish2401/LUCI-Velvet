import { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { FaStop } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Dashboard() {
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showHelp, setshowHelp] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

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
                break;
            case '/logout':
                document.cookie = 'authToken=; Max-Age=0; path=/;';
                setTimeout(()=>{
                    window.location.reload();
                },100);
                console.log('Logout command received');
                break;
            default:
                setMessages([...messages, { sender: 'bot', text: 'Type a valid command.' }]);
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
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: input,
                    history: updatedMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
                }),
            });
            const data = await res.json();
            const botMessage = { sender: 'bot', text: data.response };
            simulateTypingEffect(botMessage, updatedMessages);
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
        <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-br from-gray-900 to-black">
            <div className="w-full h-screen max-w-5xl flex flex-col relative z-10 p-4">
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
