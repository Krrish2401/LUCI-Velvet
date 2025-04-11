"use client";
import ProtectedRoute from './components/protectedRoutes/page';
import WelcomePage from './components/Welcome';
import Dashboard from './components/Dashboard';
import { useEffect, useState } from 'react';
import { checkAuth } from './utils/authMiddleware';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const auth = await checkAuth();
      setIsAuthenticated(auth);
      setLoading(false);
    };
    checkAuthStatus();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ) : (
    <WelcomePage />
  );
}