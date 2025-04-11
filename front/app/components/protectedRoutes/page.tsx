"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '../../utils/authMiddleware';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) {
                router.push('/components/login');
            } else {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        verifyAuth();
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <>{children}</> : null;
}