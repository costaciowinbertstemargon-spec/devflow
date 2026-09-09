import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                                Welcome back
                            </p>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                What needs your attention?
                            </h1>

                            <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
                                Stay on top of your projects, tasks, and team activity.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="hidden rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] sm:block"
                        >
                            + New Project
                        </button>
                    </div>

                    {/* Quick overview */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Active Projects
                            </p>

                            <p className="mt-2 text-2xl font-bold">8</p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Across your workspace
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <p className="text-sm text-[var(--text-secondary)]">
                                My Tasks
                            </p>

                            <p className="mt-2 text-2xl font-bold">14</p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                4 need attention today
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <p className="text-sm text-[var(--text-secondary)]">
                                In Progress
                            </p>

                            <p className="mt-2 text-2xl font-bold">7</p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Tasks being worked on
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Completed
                            </p>

                            <p className="mt-2 text-2xl font-bold">23</p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                This workspace
                            </p>
                        </div>
                    </div>

                    {/* Main dashboard */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        My Tasks
                                    </h2>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        Tasks assigned to you
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                                >
                                    View all
                                </button>
                            </div>

                            <div className="divide-y divide-[var(--border)]">
                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            Review authentication flow
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            DevFlow Backend
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                                        High
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            Build project dashboard
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            DevFlow Frontend
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600">
                                        Medium
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            Review mobile layout
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            DevFlow Frontend
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                        Low
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="border-b border-[var(--border)] px-5 py-4">
                                <h2 className="text-base font-semibold">
                                    Recent Activity
                                </h2>

                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    Latest workspace updates
                                </p>
                            </div>

                            <div className="divide-y divide-[var(--border)]">
                                <div className="px-5 py-4">
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            Maria
                                        </span>{" "}
                                        commented on a task
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        12 minutes ago
                                    </p>
                                </div>

                                <div className="px-5 py-4">
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            John
                                        </span>{" "}
                                        assigned a task to you
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        35 minutes ago
                                    </p>
                                </div>

                                <div className="px-5 py-4">
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            Alex
                                        </span>{" "}
                                        completed a project task
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        1 hour ago
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}