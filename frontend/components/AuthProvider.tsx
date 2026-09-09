"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { getMe, type CurrentUser } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

interface AuthContextValue {
    user: CurrentUser | null;
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    async function refreshUser() {
        const token = getToken();

        if (!token) {
            setUser(null);
            return;
        }

        try {
            const currentUser = await getMe(token);
            setUser(currentUser);
        } catch {
            removeToken();
            setUser(null);
        }
    }

    function logout() {
        removeToken();
        setUser(null);
        window.location.href = "/login";
    }

    useEffect(() => {
        async function loadUser() {
            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        }

        void loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}