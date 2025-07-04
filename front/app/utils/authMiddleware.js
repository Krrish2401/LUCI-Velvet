export const checkAuth = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/check-auth`, {
            credentials: 'include'
        });
        return res.ok;
    } catch (error) {
        console.error('Auth failed', error);
        return false;
    }
};