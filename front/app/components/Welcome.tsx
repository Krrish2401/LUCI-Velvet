"use client";


import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaRobot, FaGithub } from "react-icons/fa";
import { TypeAnimation } from 'react-type-animation';

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
            {/* Enhanced animated background */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full filter blur-3xl animate-blob top-0 -left-4"></div>
                <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 top-1/2 -right-4"></div>
                <div className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
            </div>

            <main className="relative flex flex-col gap-12 row-start-2 items-center sm:items-start z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-4"
                >
                    <FaRobot className="text-6xl text-blue-400 animate-bounce" />
                    <h1 className="text-7xl font-bold text-center sm:text-left bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                        Welcome to lucidity!
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl"
                >
                    <TypeAnimation
                        sequence={[
                            'Our chatbot is designed to assist you with a variety of tasks...',
                            1000,
                            'Providing quick and accurate responses to your queries...',
                            1000,
                            'Whether you need information, support, or just a friendly conversation...',
                            1000,
                            'Our chatbot is here to help.',
                            1000,
                        ]}
                        wrapper="p"
                        speed={50}
                        className="text-lg text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300"
                        repeat={Infinity}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex gap-6 items-center flex-col sm:flex-row"
                >
                    <Link href="/components/sign-in" className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <button className="relative px-8 py-3 bg-black rounded-full leading-none flex items-center divide-x divide-gray-600">
                            <span className="pr-6 text-gray-100">Sign up</span>
                            <span className="pl-6 text-blue-400 group-hover:text-gray-100 transition duration-200">→</span>
                        </button>
                    </Link>

                    <Link href="/components/login" className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <button className="relative px-8 py-3 bg-black rounded-full leading-none flex items-center divide-x divide-gray-600">
                            <span className="pr-6 text-gray-100">Login</span>
                            <span className="pl-6 text-purple-400 group-hover:text-gray-100 transition duration-200">→</span>
                        </button>
                    </Link>
                </motion.div>
            </main>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative row-start-3 flex gap-7 flex-wrap items-center justify-center z-10"
            >
                <a href="https://github.com/Krrish2401" target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-2">
                    <FaGithub size={20} /> GitHub
                </a>
            </motion.footer>
        </div>
    );
}
