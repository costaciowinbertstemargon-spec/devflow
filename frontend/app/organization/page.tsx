"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { useOrganization } from "@/components/OrganizationProvider";
import {
    getOrganization,
    updateOrganization,
    type OrganizationDetails,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Shield,
    Users,
    Pencil,
    Save,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );
}

function getRoleClass(role: string) {
    switch (role) {
        case "OWNER":
            return "bg-purple-50 text-purple-700";
        case "ADMIN":
            return "bg-blue-50 text-blue-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

function formatRole(role: string) {
    switch (role) {
        case "OWNER":
            return "Owner";
        case "ADMIN":
            return "Admin";
        default:
            return "Member";
    }
}

export default function OrganizationPage() {
    const { user } = useAuth();

    const {
        activeOrganization,
        setActiveOrganization,
        loading: organizationLoading,
    } = useOrganization();

    const [organization, setOrganization] =
        useState<OrganizationDetails | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    useEffect(() => {
        async function loadOrganization() {
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
                const result = await getOrganization(
                    activeOrganization.id,
                    token
                );

                setOrganization(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load organization."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadOrganization();
    }, [
        activeOrganization,
        organizationLoading,
    ]);


    if (organizationLoading || loading) {
        return (
            <ProtectedRoute>
                <AppShell>
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <div className="text-sm text-[var(--text-secondary)]">
                            Loading organization...
                        </div>
                    </div>
                </AppShell>
            </ProtectedRoute>
        );
    }

    if (!activeOrganization) {
        return (
            <ProtectedRoute>
                <AppShell>
                    <div className="mx-auto w-full max-w-3xl">
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
                            <Building2
                                size={32}
                                className="mx-auto text-[var(--text-muted)]"
                            />

                            <h1 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
                                No organization selected
                            </h1>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                Select an organization or create
                                one to continue.
                            </p>

                            <Link
                                href="/organizations"
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                            >
                                Create Organization
                            </Link>
                        </div>
                    </div>
                </AppShell>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <AppShell>
                    <div className="mx-auto w-full max-w-3xl">
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </AppShell>
            </ProtectedRoute>
        );
    }

    if (!organization) {
        return null;
    }

    const currentMembership =
        organization.members.find(
            (member) => member.userId === user?.id
        );

    const currentRole =
        currentMembership?.role ?? "MEMBER";

    const canEditOrganization =
        currentMembership?.role === "OWNER" ||
        currentMembership?.role === "ADMIN";
    
    async function handleEditOrganization(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!organization) {
            setEditError(
                "Organization data is unavailable."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setEditError(
                "Authentication required."
            );
            return;
        }

        const trimmedName = editName.trim();
        const trimmedDescription =
            editDescription.trim();

        if (!trimmedName) {
            setEditError(
                "Organization name is required."
            );
            return;
        }

        setEditError("");
        setEditSuccess("");
        setEditLoading(true);

        try {
            const updatedOrganization =
                await updateOrganization(
                    organization.id,
                    token,
                    {
                        name: trimmedName,
                        description:
                            trimmedDescription,
                    }
                );

            setOrganization(
                updatedOrganization
            );

            setActiveOrganization(
                updatedOrganization
            );

            setEditModalOpen(false);
            setEditSuccess(
                "Organization updated successfully."
            );
        } catch (error) {
            setEditError(
                error instanceof Error
                    ? error.message
                    : "Failed to update organization."
            );
        } finally {
            setEditLoading(false);
        }
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <main className="mx-auto w-full max-w-5xl">
                    <div className="mb-6">
                        <Link
                            href="/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--primary)]">
                                    Organization
                                </p>

                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                                    {organization.name}
                                </h1>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Manage your organization
                                    workspace and team.
                                </p>
                            </div>

                            {canEditOrganization && organization && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditName(organization.name);
                                        setEditDescription(
                                            organization.description ?? ""
                                        );
                                        setEditError("");
                                        setEditSuccess("");
                                        setEditModalOpen(true);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                >
                                    <Pencil size={16} />
                                    Edit Organization
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                        <Building2 size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[var(--text-primary)]">
                                            Organization details
                                        </h2>

                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Basic information about
                                            this workspace.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5 sm:p-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                                        {organization.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Description
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                        {organization.description ||
                                            "No description provided."}
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CalendarDays
                                        size={18}
                                        className="mt-0.5 shrink-0 text-[var(--text-muted)]"
                                    />

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            {formatDate(
                                                organization.createdAt
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                        <Shield size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[var(--text-primary)]">
                                            Your role
                                        </h2>

                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Your access in this
                                            organization.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getRoleClass(
                                        currentRole
                                    )}`}
                                >
                                    {formatRole(currentRole)}
                                </span>

                                <div className="mt-5 flex items-center gap-3">
                                    <Users
                                        size={18}
                                        className="text-[var(--text-muted)]"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            {organization.members.length}{" "}
                                            {organization.members.length ===
                                            1
                                                ? "member"
                                                : "members"}
                                        </p>

                                        <p className="text-xs text-[var(--text-muted)]">
                                            Total organization members
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/members"
                                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                >
                                    <Users size={17} />
                                    View Members
                                </Link>
                            </div>
                        </section>
                    </div>

                    <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <h2 className="font-semibold text-[var(--text-primary)]">
                                Organization members
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                People who have access to this
                                organization.
                            </p>
                        </div>

                        <div className="divide-y divide-[var(--border)]">
                            {organization.members.map(
                                (member) => (
                                    <div
                                        key={member.id}
                                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-sm font-semibold text-[var(--primary)]">
                                                {member.user.name
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                                    {member.user.name}
                                                </p>

                                                <p className="truncate text-sm text-[var(--text-secondary)]">
                                                    {
                                                        member
                                                            .user
                                                            .email
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                                                member.role
                                            )}`}
                                        >
                                            {formatRole(
                                                member.role
                                            )}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    {editModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
                            <button
                                type="button"
                                aria-label="Close edit organization dialog"
                                className="absolute inset-0 cursor-default"
                                onClick={() =>
                                    !editLoading &&
                                    setEditModalOpen(false)
                                }
                            />

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="edit-organization-title"
                                className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
                            >
                                <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <Pencil size={19} />
                                        </div>

                                        <div>
                                            <h2
                                                id="edit-organization-title"
                                                className="font-semibold text-[var(--text-primary)]"
                                            >
                                                Edit organization
                                            </h2>

                                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                Update your workspace name and description.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            !editLoading &&
                                            setEditModalOpen(false)
                                        }
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                        aria-label="Close"
                                        disabled={editLoading}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form
                                    onSubmit={handleEditOrganization}
                                    className="space-y-5 p-6"
                                >
                                    {editError && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {editError}
                                        </div>
                                    )}

                                    <div>
                                        <label
                                            htmlFor="edit-organization-name"
                                            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                        >
                                            Organization name
                                        </label>

                                        <input
                                            id="edit-organization-name"
                                            type="text"
                                            value={editName}
                                            onChange={(event) =>
                                                setEditName(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={100}
                                            required
                                            disabled={editLoading}
                                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                            placeholder="Enter organization name"
                                        />

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            Maximum 100 characters.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edit-organization-description"
                                            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="edit-organization-description"
                                            value={editDescription}
                                            onChange={(event) =>
                                                setEditDescription(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={500}
                                            rows={4}
                                            disabled={editLoading}
                                            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm leading-6 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                            placeholder="Describe your organization"
                                        />

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            Maximum 500 characters.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditModalOpen(false)
                                            }
                                            disabled={editLoading}
                                            className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={editLoading}
                                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {editLoading ? (
                                                <>
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </main>
            </AppShell>
        </ProtectedRoute>
    );
}