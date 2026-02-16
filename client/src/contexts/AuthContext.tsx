import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setToken, clearToken, getStoredUser, setStoredUser, creditsApi } from '../services/api';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    plan: string;
    credits: number;
    status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<any>;
    register: (formData: FormData) => Promise<any>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getStoredUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const stored = getStoredUser();
            if (stored) {
                try {
                    const { user: fresh } = await authApi.getProfile();
                    setUser(fresh);
                    setStoredUser(fresh);
                } catch {
                    clearToken();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const login = async (username: string, password: string) => {
        const data = await authApi.login(username, password);
        setToken(data.token);
        setUser(data.user);
        setStoredUser(data.user);
        return data;
    };

    const register = async (formData: FormData) => {
        const data = await authApi.register(formData);
        return data;
    };

    const logout = () => {
        clearToken();
        setUser(null);
        localStorage.removeItem('fg_user');
    };

    const refreshUser = async () => {
        try {
            const { user: fresh } = await authApi.getProfile();
            setUser(fresh);
            setStoredUser(fresh);
        } catch {
            // Ignore
        }
    };

    const refreshCredits = async () => {
        try {
            const data = await creditsApi.getBalance();
            if (user) {
                const updated = { ...user, credits: data.credits };
                setUser(updated);
                setStoredUser(updated);
            }
        } catch {
            // Ignore
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, refreshCredits }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
