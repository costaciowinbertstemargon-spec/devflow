"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Bell,
    CheckCheck,
    Circle,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/components/NotificationProvider";

function getNotificationLabel(
    type: string
) {
    switch (type) {
        case "TASK_ASSIGNED":
            return "Task assigned";

        case "COMMENT_ADDED":
            return "New comment";

        case "STATUS_CHANGED":
            return "Status changed";

        case "MENTION":
            return "Mention";

        default:
            return "Notification";
    }
}

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                                Workspace
                            </p>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Notifications
                            </h1>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                Stay up to date with activity that needs your attention.
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    void markAllAsRead()
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
                            >
                                <CheckCheck size={16} />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="flex gap-4 border-b border-[var(--border)] p-5 last:border-b-0"
                                >
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--surface-subtle)]" />

                                    <div className="flex-1">
                                        <div className="h-4 w-48 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        notifications.length === 0 && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                                <Bell
                                    size={34}
                                    className="mx-auto mb-4 text-[var(--text-muted)]"
                                />

                                <h2 className="text-base font-semibold">
                                    You're all caught up
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    New notifications will appear here.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        notifications.length > 0 && (
                            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                {notifications.map(
                                    (notification) => (
                                        <div
                                            key={
                                                notification.id
                                            }
                                            className={`border-b border-[var(--border)] p-4 sm:p-5 last:border-b-0 ${
                                                !notification.isRead
                                                    ? "bg-[var(--surface-subtle)]/50"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                                                    <Bell size={17} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                                                            {getNotificationLabel(
                                                                notification.type
                                                            )}
                                                        </span>

                                                        {!notification.isRead && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                                                                <Circle
                                                                    size={7}
                                                                    fill="currentColor"
                                                                />
                                                                Unread
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 break-words text-sm leading-6 text-[var(--text-primary)]">
                                                        {
                                                            notification.message
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                        {new Date(
                                                            notification.createdAt
                                                        ).toLocaleString()}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {notification.taskId && (
                                                            <button
                                                                type="button"
                                                                className="text-xs font-semibold text-[var(--primary)] hover:underline"
                                                            >
                                                                View task
                                                            </button>
                                                        )}

                                                        {!notification.isRead && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void markAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}