"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrganization } from "@/components/OrganizationProvider";
import { createProject, getProjects, type Project } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    FolderKanban,
    Plus,
    Search,
    X,
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
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);
    const [createError, setCreateError] = useState("");

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

    async function handleCreateProject(
        event: React.FormEvent<HTMLFormElement>    
    ) {
        event.preventDefault();

        if (!activeOrganization) {
            setCreateError(
                "Please select an organization first."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setCreateError(
                "Authentication required."
            );
            return;
        }

        setCreateError("");
        setCreatingProject(true);

        try {
            await createProject(
                activeOrganization.id,
                token,
                projectName,
                projectDescription
            );

            setCreateModalOpen(false);
            setProjectName("");
            setProjectDescription("");

            const updatedProjects = await getProjects(
                activeOrganization.id,
                token
            );

            setProjects(updatedProjects);
        } catch (error) {
            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create project."
            );
        } finally {
            setCreatingProject(false);
        }
    }

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
                            onClick={() =>{
                                setCreateError("");
                                setProjectName("");
                                setProjectDescription("");
                                setCreateModalOpen(true);
                            }}
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

                    {createModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
                            <button
                                type="button"
                                aria-label="Close create project dialog"
                                onClick={() =>
                                    setCreateModalOpen(false)
                                }
                                className="absolute inset-0 cursor-default"
                            />

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="create-project-title"
                                className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl sm:p-7"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <FolderKanban size={19} />
                                        </div>

                                        <h2
                                            id="create-project-title"
                                            className="text-xl font-bold tracking-tight"
                                        >
                                            Create a new project
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Create a workspace for your team's next
                                            initiative.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateModalOpen(false)
                                        }
                                        aria-label="Close dialog"
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                    >
                                        <X size={19} />
                                    </button>
                                </div>

                                {createError && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {createError}
                                    </div>
                                )}

                                <form
                                    onSubmit={handleCreateProject}
                                    className="mt-6 space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="project-name"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Project name
                                        </label>

                                        <input
                                            id="project-name"
                                            name="projectName"
                                            type="text"
                                            value={projectName}
                                            onChange={(event) =>
                                                setProjectName(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={150}
                                            placeholder="e.g. Website Redesign"
                                            required
                                            autoFocus
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />

                                        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                                            {projectName.length}/150 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="project-description"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Description
                                            <span className="ml-1 font-normal text-[var(--text-muted)]">
                                                (optional)
                                            </span>
                                        </label>

                                        <textarea
                                            id="project-description"
                                            name="projectDescription"
                                            value={projectDescription}
                                            onChange={(event) =>
                                                setProjectDescription(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={1000}
                                            rows={4}
                                            placeholder="Describe what this project is about..."
                                            className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />

                                        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                                            {projectDescription.length}/1000
                                            characters
                                        </p>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCreateModalOpen(false)
                                            }
                                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                creatingProject ||
                                                !projectName.trim()
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {creatingProject ? (
                                                <>
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={17} />
                                                    Create project
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}