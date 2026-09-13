"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
    getProject,
    getTasks, 
    type Project,
    type Task,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Clock3,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function getStatusIcon(status: string) {
    if (status === "Done") {
        return <CheckCircle2 size={17} />;
    }

    if (status === "In Progress") {
        return <Clock3 size={17} />;
    }

    return <Circle size={17} />;
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState("");

    useEffect(() => {
        async function loadProjectData() {
            const token = getToken();

            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                setTasksLoading(false);
                return;
            }

            if (!projectId) {
                setError("Project ID is missing.");
                setLoading(false);
                setTasksLoading(false);
                return;
            }
            
            setLoading(true);
            setTasksLoading(true);
            setError("");
            setTasksError("");

            try {
                const [projectResult, tasksResult] = await Promise.all([
                    getProject(projectId, token),
                    getTasks(projectId, token),
                ]);

                setProject(projectResult);
                setTasks(tasksResult);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load project data.";
                
                setError(message);
                setTasksError(message);

            } finally {
                setLoading(false);
                setTasksLoading(false);
            }
        }

        void loadProjectData();
    }, [projectId]);

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto max-w-7xl">
                    {/* Back link */}
                    <div className="mb-6">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
                        >
                            <ArrowLeft size={16} />
                            Back to Projects
                        </Link>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="p-6">
                                <div className="h-4 w-20 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-[var(--surface-subtle)]" />

                                <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-subtle)]" />

                                <div className="mt-2 h-4 w-3/4 max-w-xl animate-pulse rounded bg-[var(--surface-subtle)]" />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-6"
                        >
                            <h2 className="text-base font-semibold text-red-800">
                                Unable to load project
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>

                            <Link
                                href="/projects"
                                className="mt-4 inline-flex items-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                            >
                                Back to Projects
                            </Link>
                        </div>
                    )}

                    {/* Project */}
                    {!loading && !error && project && (
                        <>
                            {/* Project header */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="flex flex-col gap-5 border-b border-[var(--border)] p-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                                                <span className="text-sm font-bold">
                                                    {project.name
                                                        .trim()
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                    Project
                                                </p>

                                                <h1 className="text-2xl font-bold tracking-tight">
                                                    {project.name}
                                                </h1>
                                            </div>
                                        </div>

                                        <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                                            {project.description ??
                                                "No description provided."}
                                        </p>

                                        <p className="mt-3 text-xs text-[var(--text-muted)]">
                                            Project ID: {project.id}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                        >
                                            <Users size={16} />
                                            Members
                                        </button>

                                        <button
                                            type="button"
                                            className="rounded-lg p-2.5 text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                            aria-label="Project options"
                                        >
                                            <MoreHorizontal size={19} />
                                        </button>
                                    </div>
                                </div>

                                {/* Project stats */}
                                <div className="grid grid-cols-2 divide-x divide-[var(--border)] sm:grid-cols-4">
                                    <div className="px-5 py-4">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Total Tasks
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            24
                                        </p>
                                    </div>

                                    <div className="px-5 py-4">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            To Do
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            8
                                        </p>
                                    </div>

                                    <div className="px-5 py-4">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            In Progress
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            7
                                        </p>
                                    </div>

                                    <div className="px-5 py-4">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Completed
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            9
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Workspace toolbar */}
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                                    >
                                        Tasks
                                    </button>

                                    <button
                                        type="button"
                                        className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                    >
                                        Board
                                    </button>

                                    <button
                                        type="button"
                                        className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                    >
                                        Activity
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                                >
                                    <Plus size={17} />
                                    Add Task
                                </button>
                            </div>

                            {/* Search and filter */}
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                    />

                                    <input
                                        type="search"
                                        placeholder="Search tasks..."
                                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                >
                                    <Filter size={16} />
                                    Filters
                                </button>
                            </div>

                            {/* Task table */}
                            {tasksLoading && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                    <div className="divide-y divide-[var(--border)]">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px]"
                                            >
                                                <div>
                                                    <div className="h-4 w-48 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                    <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                </div>

                                                <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                <div className="h-6 w-16 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-subtle)]" />
                                                <div />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!tasksLoading && tasksError && (
                                <div
                                    role="alert"
                                    className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                                >
                                    {tasksError}
                                </div>
                            )}

                            {!tasksLoading && !tasksError && tasks.length === 0 && (
                                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                                    <CheckCircle2
                                        size={32}
                                        className="mx-auto mb-3 text-[var(--text-muted)]"
                                    />

                                    <h2 className="text-base font-semibold">
                                        No tasks yet
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Add a task to start organizing work in this project.
                                    </p>
                                </div>
                            )}

                            {!tasksLoading && !tasksError && tasks.length > 0 && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                    <div className="hidden border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] md:grid md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px] md:gap-4">
                                        <div>Task</div>
                                        <div>Status</div>
                                        <div>Priority</div>
                                        <div>Assignee</div>
                                        <div />
                                    </div>

                                    <div className="divide-y divide-[var(--border)]">
                                        {tasks.map((task) => (
                                            <button
                                                key={task.id}
                                                type="button"
                                                className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px] md:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {task.title}
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                                        {task.description ??
                                                            `Part of ${project?.name ?? "this project"}`}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    {getStatusIcon(
                                                        task.status === "TODO"
                                                            ? "To Do"
                                                            : task.status === "IN_PROGRESS"
                                                            ? "In Progress"
                                                            : task.status === "DONE"
                                                            ? "Done"
                                                            : task.status
                                                    )}

                                                    <span>
                                                        {task.status === "TODO"
                                                            ? "To Do"
                                                            : task.status === "IN_PROGRESS"
                                                            ? "In Progress"
                                                            : task.status === "DONE"
                                                            ? "Done"
                                                            : task.status}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span
                                                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                                            task.priority === "HIGH"
                                                                ? "bg-red-50 text-red-600"
                                                                : task.priority === "MEDIUM"
                                                                ? "bg-amber-50 text-amber-600"
                                                                : task.priority === "URGENT"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </div>

                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--primary)]">
                                                    {task.assigneeId
                                                        ? task.assigneeId
                                                            .slice(0, 2)
                                                            .toUpperCase()
                                                        : "—"}
                                                </div>

                                                <div className="hidden text-[var(--text-muted)] md:block">
                                                    <MoreHorizontal size={18} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}