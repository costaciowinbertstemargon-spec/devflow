import AppShell from "@/components/AppShell";
import {
    FolderKanban,
    Plus,
    Search,
} from "lucide-react";

const projects = [
    {
        name: "DevFlow Backend",
        description: "Backend API and production infrastructure.",
        tasks: 18,
        members: 4,
        updated: "2 hours ago",
    },
    {
        name: "DevFlow Frontend",
        description: "Next.js SaaS interface and user experience.",
        tasks: 24,
        members: 3,
        updated: "Today",
    },
    {
        name: "Website Redesign",
        description: "Company website redesign and responsive improvements.",
        tasks: 12,
        members: 5,
        updated: "Yesterday",
    },
    {
        name: "Marketing Platform",
        description: "Internal tools for marketing campaigns.",
        tasks: 8,
        members: 4,
        updated: "3 days ago",
    },
];

export default function ProjectsPage() {
    return (
        <AppShell>
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                            Workspace
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Projects
                        </h1>

                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Organize your team's work and keep every project moving.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)]"
                    >
                        <Plus size={17} />
                        New Project
                    </button>
                </div>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />

                        <input
                            type="search"
                            placeholder="Search projects..."
                            className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                    </div>

                    <button
                        type="button"
                        className="h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                    >
                        All Projects
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="hidden border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] md:grid md:grid-cols-[minmax(0,2fr)_100px_100px_120px] md:gap-4">
                        <div>Project</div>
                        <div>Tasks</div>
                        <div>Members</div>
                        <div>Updated</div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        {projects.map((project) => (
                            <button
                                key={project.name}
                                type="button"
                                className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,2fr)_100px_100px_120px] md:items-center"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--primary)]">
                                        <FolderKanban size={19} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {project.name}
                                        </p>

                                        <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        {project.tasks}
                                    </p>

                                    <p className="text-xs text-[var(--text-muted)]">
                                        tasks
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        {project.members}
                                    </p>

                                    <p className="text-xs text-[var(--text-muted)]">
                                        members
                                    </p>
                                </div>

                                <div className="text-sm text-[var(--text-secondary)]">
                                    {project.updated}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}