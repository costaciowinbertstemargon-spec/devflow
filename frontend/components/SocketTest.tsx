"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface TaskUpdate {
    task: {
        id: string;
        title: string;
        status: string;
        priority: string;
    };
}

interface NotificationData {
    notification: {
        id: string;
        type: string;
        message: string;
        isRead: boolean;
        userId: string;
        taskId?: string;
    };
}

export default function SocketTest() {
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] =
        useState<TaskUpdate | null>(null);

    useEffect(() => {
        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
            setConnected(true);

            socket.emit(
                "join:organization",
                "2a7ffcc8-6344-42bc-8379-89f297a253aa"
            );
        };

        const handleConnectError = (error: Error) => {
            console.error(
                "Socket authentication error:",
                error.message
            );
            setConnected(false);
        };

        const handleDisconnect = () => {
            console.log("Socket disconnected");
            setConnected(false);
        };

        const handleTaskUpdate = (data: TaskUpdate) => {
            console.log("Task update received:", data);
            setLastUpdate(data);
        };

        const handleNotification = (
            data: NotificationData
        ) => {
            console.log(
                "🔥 NEW NOTIFICATION RECEIVED:",
                data
            );

            alert(data.notification.message);
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);
        socket.on("task:updated", handleTaskUpdate);
        socket.on("notification:new", handleNotification);

        const token = localStorage.getItem("token");

        if (!token) {
            console.error(
                "No JWT found in localStorage."
            );
            return;
        }

        socket.auth = {
            token,
        };

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off(
                "connect_error",
                handleConnectError
            );
            socket.off("disconnect", handleDisconnect);
            socket.off(
                "task:updated",
                handleTaskUpdate
            );
            socket.off(
                "notification:new",
                handleNotification
            );
        };
    }, []);

    return (
        <div className="p-6">
            <p>
                Socket status:{" "}
                {connected
                    ? "Connected"
                    : "Disconnected"}
            </p>

            {lastUpdate && (
                <pre className="mt-4">
                    {JSON.stringify(
                        lastUpdate,
                        null,
                        2
                    )}
                </pre>
            )}
        </div>
    );
}