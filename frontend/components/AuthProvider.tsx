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
        } catch (error) {
            const status =
                error instanceof Error
                    ? (error as Error & {
                        status?: number;
                    }).status
                    : undefined;

            console.error(
                "Failed to refresh authenticated user:",
                error
            );

            // Only remove the token when the server
            // confirms that the token is invalid.
            if (status === 401) {
                removeToken();
                setUser(null);
            }
        }
    }

    function logout() {
        removeToken();
        setUser(null);
        window.location.href = "/login";
    }

    useEffect(() => {
        let mounted = true;

        async function loadUser() {
            const token = getToken();

            if (!token) {
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }

                return;
            }

            try {
                const currentUser = await getMe(token);

                if (mounted) {
                    setUser(currentUser);
                }
            } catch (error) {
                const status =
                    error instanceof Error
                        ? (error as Error & { status?: number }).status
                        : undefined;

                console.error(
                    "Authentication check failed:",
                    error
                );

                // Only remove the token when authentication is
                // actually rejected.
                if (status === 401) {
                    removeToken();

                    if (mounted) {
                        setUser(null);
                    }
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void loadUser();

        return () => {
            mounted = false;
        };
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