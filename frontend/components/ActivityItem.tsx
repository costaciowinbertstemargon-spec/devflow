"use client";

import {
    CheckCircle2,
    CircleDot,
    ClipboardList,
    MessageSquare,
    UserPlus,
    Activity as ActivityIcon,
} from "lucide-react";
import Link from "next/link";

interface ActivityItemProps {
    userName: string;
    action: string;
    taskId: string;
    projectId: string;
    taskTitle?: string;
    createdAt: string;
}

function getActivityIcon(action: string) {
    switch (action) {
        case "TASK_CREATED":
            return <ClipboardList size={17} />;

        case "TASK_ASSIGNED":
            return <UserPlus size={17} />;

        case "STATUS_CHANGED":
            return <CheckCircle2 size={17} />;

        case "COMMENT_ADDED":
            return <MessageSquare size={17} />;

        case "TASK_UPDATED":
        case "PRIORITY_CHANGED":
            return <CircleDot size={17} />;

        default:
            return <ActivityIcon size={17} />;
    }
}

function formatActivityAction(action: string) {
    switch (action) {
        case "TASK_CREATED":
            return "created a task";

        case "TASK_UPDATED":
            return "updated a task";

        case "TASK_ASSIGNED":
            return "assigned a task";

        case "STATUS_CHANGED":
            return "changed a task status";

        case "PRIORITY_CHANGED":
            return "changed task priority";

        case "COMMENT_ADDED":
            return "commented on a task";

        default:
            return action
                .toLowerCase()
                .replaceAll("_", " ");
    }
}

function formatActivityDate(createdAt: string) {
    const createdDate = new Date(createdAt);
    const now = new Date();

    const difference =
        now.getTime() -
        createdDate.getTime();

    const seconds = Math.floor(
        difference / 1000
    );

    if (seconds < 10) {
        return "Just now";
    }

    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }

    const minutes = Math.floor(
        seconds / 60
    );

    if (minutes < 60) {
        return `${minutes} ${
            minutes === 1
                ? "minute"
                : "minutes"
        } ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours} ${
            hours === 1
                ? "hour"
                : "hours"
        } ago`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days < 7) {
        return `${days} ${
            days === 1
                ? "day"
                : "days"
        } ago`;
    }

    return createdDate.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}

export default function ActivityItem({
    userName,
    action,
    taskId,
    projectId,
    taskTitle,
    createdAt,
}: ActivityItemProps) {
    const initials = userName
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex gap-4 px-5 py-5 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
                {initials}
            </div>

            <div className="min-w-0 flex-1">
                <Link
                    href={`/projects/${projectId}/tasks/${taskId}`}
                    className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm leading-6 text-[var(--text-primary)]">
                                <span className="font-semibold">
                                    {userName}
                                </span>{" "}
                                {formatActivityAction(action)}
                                {taskTitle && (
                                    <>
                                        {" "}
                                        <span className="font-semibold transition group-hover:text-[var(--primary)]">
                                            {taskTitle}
                                        </span>
                                    </>
                                )}
                            </p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]"
                                title={new Date(
                                    createdAt
                                ).toLocaleString()}                            
                            >
                                {formatActivityDate(
                                    createdAt
                                )}
                            </p>
                        </div>

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)] transition group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
                            {getActivityIcon(action)}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}