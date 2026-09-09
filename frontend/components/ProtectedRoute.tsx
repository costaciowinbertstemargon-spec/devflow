"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                <p className="text-sm text-[var(--text-secondary)]">
                    Loading DevFlow...
                </p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}