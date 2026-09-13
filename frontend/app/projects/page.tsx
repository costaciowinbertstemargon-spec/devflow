"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrganization } from "@/components/OrganizationProvider";
import { getProjects, type Project } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    FolderKanban,
    Plus,
    Search,
} from "lucide-react";
import Link from "next/link";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

export default function ProjectsPage() {
    const {
        activeOrganization,
        loading: organizationLoading,
    } = useOrganization();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadProjects() {
            if (
                organizationLoading ||
                !activeOrganization
            ) {
                return;
            }

            const token = getToken();

            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const result = await getProjects(
                    activeOrganization.id,
                    token
                );

                setProjects(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load projects."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadProjects();
    }, [
        activeOrganization,
        organizationLoading,
    ]);

    const filteredProjects = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return projects;
        }

        return projects.filter((project) => {
            return (
                project.name
                    .toLowerCase()
                    .includes(query) ||
                (project.description ?? "")
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [projects, search]);

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
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
                                placeholder="Search projects..."
                                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                            />
                        </div>
                    </div>

                    {/* Organization loading */}
                    {organizationLoading && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Loading organization...
                            </p>
                        </div>
                    )}

                    {/* No organization */}
                    {!organizationLoading &&
                        !activeOrganization && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                                <FolderKanban
                                    size={32}
                                    className="mx-auto mb-3 text-[var(--text-muted)]"
                                />

                                <h2 className="text-base font-semibold">
                                    No organization selected
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Select an organization before viewing projects.
                                </p>
                            </div>
                        )}

                    {/* Projects loading */}
                    {activeOrganization &&
                        !organizationLoading &&
                        loading && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="divide-y divide-[var(--border)]">
                                    {[1, 2, 3].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-4 px-5 py-5"
                                            >
                                                <div className="h-10 w-10 animate-pulse rounded-lg bg-[var(--surface-subtle)]" />

                                                <div className="flex-1">
                                                    <div className="h-4 w-48 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                                    <div className="mt-2 h-3 w-72 max-w-full animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                </div>
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

                    {/* Empty state */}
                    {!loading &&
                        !error &&
                        activeOrganization &&
                        filteredProjects.length === 0 && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                                <FolderKanban
                                    size={32}
                                    className="mx-auto mb-3 text-[var(--text-muted)]"
                                />

                                <h2 className="text-base font-semibold">
                                    {search
                                        ? "No projects found"
                                        : "No projects yet"}
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    {search
                                        ? "Try a different search term."
                                        : "Create your first project to get started."}
                                </p>
                            </div>
                        )}

                    {/* Projects table */}
                    {!loading &&
                        !error &&
                        filteredProjects.length > 0 && (
                            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="hidden border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] md:grid md:grid-cols-[minmax(0,2fr)_160px_180px] md:gap-4">
                                    <div>
                                        Project
                                    </div>

                                    <div>
                                        Created
                                    </div>

                                    <div>
                                        Updated
                                    </div>
                                </div>

                                <div className="divide-y divide-[var(--border)]">
                                    {filteredProjects.map(
                                        (project) => (
                                            <Link
                                                key={project.id}
                                                href={`/projects/${project.id}`}
                                                className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,2fr)_160px_180px] md:items-center"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--primary)]">
                                                        <FolderKanban
                                                            size={
                                                                19
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold">
                                                            {
                                                                project.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                                                            {project.description ??
                                                                "No description provided."}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-[var(--text-secondary)]">
                                                    {new Date(
                                                        project.createdAt
                                                    ).toLocaleDateString()}
                                                </div>

                                                <div className="text-sm text-[var(--text-secondary)]">
                                                    {new Date(
                                                        project.updatedAt
                                                    ).toLocaleDateString()}
                                                </div>
                                            </Link>
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