import AppShell from "@/components/AppShell";
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
import ProtectedRoute from "@/components/ProtectedRoute";

const tasks = [
    {
        title: "Review authentication flow",
        status: "In Progress",
        priority: "High",
        assignee: "YC",
    },
    {
        title: "Build project dashboard",
        status: "To Do",
        priority: "Medium",
        assignee: "MS",
    },
    {
        title: "Review mobile layout",
        status: "Done",
        priority: "Low",
        assignee: "AR",
    },
    {
        title: "Implement project filters",
        status: "In Progress",
        priority: "Medium",
        assignee: "JD",
    },
];

function getStatusIcon(status: string) {
    if (status === "Done") {
        return <CheckCircle2 size={17} />;
    }

    if (status === "In Progress") {
        return <Clock3 size={17} />;
    }

    return <Circle size={17} />;
}

export default async function ProjectDetailsPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;

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

                    {/* Project header */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="flex flex-col gap-5 border-b border-[var(--border)] p-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                                        <span className="text-sm font-bold">
                                            DF
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                            Project
                                        </p>

                                        <h1 className="text-2xl font-bold tracking-tight">
                                            DevFlow Frontend
                                        </h1>
                                    </div>
                                </div>

                                <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                                    Build the DevFlow SaaS frontend with a clean,
                                    responsive, and intuitive team workspace
                                    experience.
                                </p>

                                <p className="mt-3 text-xs text-[var(--text-muted)]">
                                    Project ID: {projectId}
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

                                <p className="mt-1 text-xl font-bold">24</p>
                            </div>

                            <div className="px-5 py-4">
                                <p className="text-xs text-[var(--text-muted)]">
                                    To Do
                                </p>

                                <p className="mt-1 text-xl font-bold">8</p>
                            </div>

                            <div className="px-5 py-4">
                                <p className="text-xs text-[var(--text-muted)]">
                                    In Progress
                                </p>

                                <p className="mt-1 text-xl font-bold">7</p>
                            </div>

                            <div className="px-5 py-4">
                                <p className="text-xs text-[var(--text-muted)]">
                                    Completed
                                </p>

                                <p className="mt-1 text-xl font-bold">9</p>
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
                                    key={task.title}
                                    type="button"
                                    className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px] md:items-center"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {task.title}
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            Part of DevFlow Frontend
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        {getStatusIcon(task.status)}
                                        <span>{task.status}</span>
                                    </div>

                                    <div>
                                        <span
                                            className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                                task.priority === "High"
                                                    ? "bg-red-50 text-red-600"
                                                    : task.priority === "Medium"
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--primary)]">
                                        {task.assignee}
                                    </div>

                                    <div className="hidden text-[var(--text-muted)] md:block">
                                        <MoreHorizontal size={18} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}