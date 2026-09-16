"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    type Notification,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { socket } from "@/lib/socket";

interface NotificationContextValue {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string;
    refreshNotifications: () => Promise<void>;
    markAsRead: (
        notificationId: string
    ) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext =
    createContext<
        NotificationContextValue | undefined
    >(undefined);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notifications, setNotifications] =
        useState<Notification[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.isRead
        ).length;

    async function refreshNotifications() {
        const token = getToken();

        if (!token) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result =
                await getNotifications(
                    token
                );

            setNotifications(result);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(
        notificationId: string
    ) {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            const updatedNotification =
                await markNotificationRead(
                    notificationId,
                    token
                );

            setNotifications(
                (currentNotifications) =>
                    currentNotifications.map(
                        (notification) =>
                            notification.id ===
                            updatedNotification.id
                                ? updatedNotification
                                : notification
                    )
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );
        }
    }

    async function markAllAsRead() {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            await markAllNotificationsRead(
                token
            );

            setNotifications(
                (currentNotifications) =>
                    currentNotifications.map(
                        (notification) => ({
                            ...notification,
                            isRead: true,
                        })
                    )
            );
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        }
    }

    useEffect(() => {
        void refreshNotifications();

        const token = getToken();

        if (!token) {
            return;
        }

        function handleNewNotification(
            payload: {
                notification: Notification;
            }
        ) {
            setNotifications(
                (currentNotifications) => [
                    payload.notification,
                    ...currentNotifications,
                ]
            );
        }

        socket.auth = {
            token,
        };

        socket.on(
            "notification:new",
            handleNewNotification
        );

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off(
                "notification:new",
                handleNewNotification
            );

            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                error,
                refreshNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context =
        useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
}