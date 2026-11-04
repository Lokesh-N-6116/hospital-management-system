import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('hms_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMe() {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await apiRequest('/api/auth/me');
                if (res.success) {
                    setUser(res.user);
                } else {
                    logout();
                }
            } catch (err) {
                console.error('[AuthContext] Session expired or invalid:', err.message);
                logout();
            } finally {
                setLoading(false);
            }
        }
        fetchMe();
    }, [token]);

    const login = async (username, password) => {
        const res = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: { username, password }
        });

        if (res.success && res.token) {
            localStorage.setItem('hms_token', res.token);
            setToken(res.token);
            setUser(res.user);
            return res.user;
        }
        throw new Error(res.message || 'Login failed');
    };

    const logout = () => {
        localStorage.removeItem('hms_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
