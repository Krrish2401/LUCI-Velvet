"use client";
import { motion } from "motion/react";
import { FaRobot } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { checkAuth } from "../../utils/authMiddleware";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        server?: string;
    }>({});
    const router = useRouter();
    useEffect(() => {
        const checkAuthStatus = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                router.push('/');
            }
        };
        checkAuthStatus();
    }, [router]);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("User logged in successfully");
                router.push("/");
            } else {
                const newErrors: {
                    username?: string;
                    password?: string;
                    server?: string;
                } = {};
                if (data.errors) {
                    data.errors.forEach((error: { path: string; msg: string }) => {
                        if (error.path === "username") newErrors.username = error.msg;
                        if (error.path === "password") newErrors.password = error.msg;
                    });
                } else {
                    newErrors.server = data.error || "Error logging in user";
                }
                setErrors(newErrors);
                toast.error("Invalid username or password");
            }
        } catch (error) {
            console.error("Network Error:", error);
            toast.error("Something went wrong");
        }
    };
    return (
        <div className="relative flex items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
            <Link href="/" className="z-50">
                <motion.div initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }} className="absolute top-4 left-4 flex items-center gap-3 px-4 py-2 backdrop-blur bg-white/10 hover:bg-white/20 rounded-full ">
                    <FaRobot className="text-4xl text-purple-400" />
                    <div className="px-2 font-bold">LUCI</div>
                </motion.div>
            </Link>
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full filter blur-3xl animate-blob top-0 -left-4"></div>
                <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 top-1/2 -right-4"></div>
                <div className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }} className="z-10 w-full max-w-lg bg-transparent p-12">
                <h1 className="text-center text-6xl font-bold text-white mb-6">Login</h1>
                <p className="text-center text-gray-400 mb-8 font-[family-name:var(--font-geist-mono)]">Welcome back! Please login to your account.</p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-6 py-3 backdrop-blur-lg bg-white/10 text-white rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-3 backdrop-blur-lg bg-white/10 text-white rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gray-800 text-white rounded-xl text-lg hover:bg-gray-700"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-gray-400">
                        Do not have an account? <Link href="/components/sign-in" className="text-white underline">Register</Link>
                    </p>
                </div>
            </motion.div>
            <ToastContainer />
        </div>
    );
}


