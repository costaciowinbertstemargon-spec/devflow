"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getMyTasks, type Task } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    CalendarDays,
    CheckCircle2,
    Circle,
    Clock3,
    ListTodo,
    Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatStatus(status: string) {
    switch (status) {
        case "TODO":
            return "To Do";
        case "IN_PROGRESS":
            return "In Progress";
        case "REVIEW":
            return "Review";
        case "DONE":
            return "Done";
        default:
            return status;
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case "DONE":
            return <CheckCircle2 size={17} />;
        case "IN_PROGRESS":
        case "REVIEW":
            return <Clock3 size={17} />;
        default:
            return <Circle size={17} />;
    }
}

function formatPriority(priority: string) {
    switch (priority) {
        case "LOW":
            return "Low";
        case "MEDIUM":
            return "Medium";
        case "HIGH":
            return "High";
        case "URGENT":
            return "Urgent";
        default:
            return priority;
    }
}

function getPriorityClass(priority: string) {
    switch (priority) {
        case "HIGH":
            return "bg-red-50 text-red-600";
        case "URGENT":
            return "bg-red-100 text-red-700";
        case "MEDIUM":
            return "bg-amber-50 text-amber-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}

function formatDueDate(
    dueDate: string | null
) {
    if (!dueDate) {
        return "No due date";
    }

    return new Date(
        dueDate
    ).toLocaleDateString();
}

export default function MyTasksPage() {
    const router = useRouter();

    const [tasks, setTasks] =
        useState<Task[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        async function loadMyTasks() {
            const token = getToken();

            if (!token) {
                setError(
                    "Authentication required."
                );
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const result =
                    await getMyTasks(token);

                setTasks(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load your tasks."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadMyTasks();
    }, []);

    const filteredTasks = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) {
            return tasks;
        }

        return tasks.filter((task) => {
            return (
                task.title
                    .toLowerCase()
                    .includes(query) ||
                (task.description ?? "")
                    .toLowerCase()
                    .includes(query) ||
                (task.project?.name ?? "")
                    .toLowerCase()
                    .includes(query) ||
                task.status
                    .toLowerCase()
                    .includes(query) ||
                task.priority
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [tasks, search]);

    const totalTasks = tasks.length;

    const completedTasks =
        tasks.filter(
            (task) =>
                task.status === "DONE"
        ).length;

    const inProgressTasks =
        tasks.filter(
            (task) =>
                task.status === "IN_PROGRESS"
        ).length;

    const todoTasks =
        tasks.filter(
            (task) =>
                task.status === "TODO"
        ).length;

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                            Workspace
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            My Tasks
                        </h1>

                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            View and manage the tasks assigned to you.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                    Total
                                </p>

                                <ListTodo
                                    size={18}
                                    className="text-[var(--primary)]"
                                />
                            </div>

                            <p className="mt-2 text-2xl font-bold">
                                {totalTasks}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                    To Do
                                </p>

                                <Circle
                                    size={18}
                                    className="text-[var(--text-muted)]"
                                />
                            </div>

                            <p className="mt-2 text-2xl font-bold">
                                {todoTasks}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                    In Progress
                                </p>

                                <Clock3
                                    size={18}
                                    className="text-[var(--primary)]"
                                />
                            </div>

                            <p className="mt-2 text-2xl font-bold">
                                {inProgressTasks}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                    Completed
                                </p>

                                <CheckCircle2
                                    size={18}
                                    className="text-[var(--success)]"
                                />
                            </div>

                            <p className="mt-2 text-2xl font-bold">
                                {completedTasks}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search your tasks..."
                                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                            />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="divide-y divide-[var(--border)]">
                                {[1, 2, 3, 4].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,2fr)_180px_120px_140px]"
                                        >
                                            <div>
                                                <div className="h-4 w-56 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                                <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                            </div>

                                            <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                            <div className="h-6 w-20 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                            <div className="h-4 w-28 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading &&
                        !error &&
                        filteredTasks.length === 0 && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                                <ListTodo
                                    size={34}
                                    className="mx-auto mb-4 text-[var(--text-muted)]"
                                />

                                <h2 className="text-base font-semibold">
                                    {search
                                        ? "No tasks found"
                                        : "No tasks assigned to you"}
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    {search
                                        ? "Try a different search term."
                                        : "Tasks assigned to your account will appear here."}
                                </p>
                            </div>
                        )}

                    {/* Tasks */}
                    {!loading &&
                        !error &&
                        filteredTasks.length > 0 && (
                            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="hidden border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] md:grid md:grid-cols-[minmax(0,2fr)_180px_120px_140px] md:gap-4">
                                    <div>Task</div>
                                    <div>Project</div>
                                    <div>Status</div>
                                    <div>Due</div>
                                </div>

                                <div className="divide-y divide-[var(--border)]">
                                    {filteredTasks.map(
                                        (task) => (
                                            <button
                                                key={task.id}
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/projects/${task.project?.id ?? task.projectId}/tasks/${task.id}`
                                                    )
                                                }
                                                className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,2fr)_180px_120px_140px] md:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {task.title}
                                                    </p>

                                                    <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                                                        {task.description ??
                                                            "No description provided."}
                                                    </p>

                                                    <div className="mt-2 md:hidden">
                                                        <span className="text-xs text-[var(--text-muted)]">
                                                            {task.project?.name ??
                                                                "Unknown project"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="hidden min-w-0 md:block">
                                                    <p className="truncate text-sm text-[var(--text-secondary)]">
                                                        {task.project?.name ??
                                                            "Unknown project"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    {getStatusIcon(
                                                        task.status
                                                    )}

                                                    <span>
                                                        {formatStatus(
                                                            task.status
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <CalendarDays
                                                        size={16}
                                                        className="shrink-0 text-[var(--text-muted)]"
                                                    />

                                                    <span>
                                                        {formatDueDate(
                                                            task.dueDate
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="md:col-span-4">
                                                    <span
                                                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${getPriorityClass(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {formatPriority(
                                                            task.priority
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}