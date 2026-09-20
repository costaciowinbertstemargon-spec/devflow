"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    addOrganizationMember,
    getOrganization,
    type OrganizationDetails,
    type OrganizationMember,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import {
    Mail,
    Plus,
    ShieldCheck,
    UserPlus,
    Users,
} from "lucide-react";
import { useOrganization } from "@/components/OrganizationProvider";
import { useEffect, useMemo, useState } from "react";

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}

function getRoleClass(
    role: OrganizationMember["role"]
) {
    switch (role) {
        case "OWNER":
            return "bg-[var(--primary)]/10 text-[var(--primary)]";
        case "ADMIN":
            return "bg-amber-50 text-amber-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

export default function MembersPage() {
    const { user } = useAuth();
    const {
        activeOrganization,
        loading: organizationLoading,
    } = useOrganization();

    const [organization, setOrganization] =
        useState<OrganizationDetails | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [addMemberOpen, setAddMemberOpen] =
        useState(false);

    const [email, setEmail] =
        useState("");

    const [role, setRole] =
        useState<"ADMIN" | "MEMBER">(
            "MEMBER"
        );

    const [addingMember, setAddingMember] =
        useState(false);

    const [formError, setFormError] =
        useState("");

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
                    await getOrganization(
                        activeOrganization.id,
                        token
                    );

                setOrganization(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load organization members."
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

    const currentMembership = useMemo(() => {
        if (!organization || !user) {
            return null;
        }

        return organization.members.find(
            (member) =>
                member.user.id === user.id
        );
    }, [organization, user]);

    const canAddMember =
        currentMembership?.role === "OWNER" ||
        currentMembership?.role === "ADMIN";

    const filteredMembers = useMemo(() => {
        const members =
            organization?.members ?? [];

        const query =
            search.trim().toLowerCase();

        if (!query) {
            return members;
        }

        return members.filter(
            (member) =>
                member.user.name
                    .toLowerCase()
                    .includes(query) ||
                member.user.email
                    .toLowerCase()
                    .includes(query) ||
                member.role
                    .toLowerCase()
                    .includes(query)
        );
    }, [organization, search]);

    async function handleAddMember(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!activeOrganization) {
            setFormError(
                "No organization selected."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setFormError(
                "Authentication required."
            );
            return;
        }

        if (!email.trim()) {
            setFormError(
                "Email is required."
            );
            return;
        }

        setAddingMember(true);
        setFormError("");

        try {
            const membership =
                await addOrganizationMember(
                    activeOrganization.id,
                    token,
                    email.trim(),
                    role
                );

            setOrganization(
                (currentOrganization) =>
                    currentOrganization
                        ? {
                              ...currentOrganization,
                              members: [
                                  ...currentOrganization.members,
                                  membership,
                              ],
                          }
                        : currentOrganization
            );

            setEmail("");
            setRole("MEMBER");
            setAddMemberOpen(false);
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to add member."
            );
        } finally {
            setAddingMember(false);
        }
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                                Organization
                            </p>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Members
                            </h1>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                Manage the people who have access to this workspace.
                            </p>
                        </div>

                        {canAddMember && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFormError("");
                                    setEmail("");
                                    setRole("MEMBER");
                                    setAddMemberOpen(true);
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] sm:w-auto"
                            >
                                <UserPlus size={17} />
                                Add Member
                            </button>
                        )}
                    </div>

                    {organizationLoading && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Loading organization...
                            </p>
                        </div>
                    )}

                    {!organizationLoading &&
                        !activeOrganization && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                                <Users
                                    size={34}
                                    className="mx-auto mb-4 text-[var(--text-muted)]"
                                />

                                <h2 className="text-base font-semibold">
                                    No organization selected
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Select an organization to view its members.
                                </p>
                            </div>
                        )}

                    {activeOrganization &&
                        loading && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="divide-y divide-[var(--border)]">
                                    {[1, 2, 3].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="flex gap-4 p-5"
                                            >
                                                <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--surface-subtle)]" />

                                                <div className="flex-1">
                                                    <div className="h-4 w-40 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                                    <div className="mt-2 h-3 w-52 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {!loading &&
                        error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        organization && (
                            <>
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                            Total Members
                                        </p>

                                        <p className="mt-2 text-2xl font-bold">
                                            {
                                                organization
                                                    .members
                                                    .length
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                            Admins
                                        </p>

                                        <p className="mt-2 text-2xl font-bold">
                                            {
                                                organization
                                                    .members
                                                    .filter(
                                                        (
                                                            member
                                                        ) =>
                                                            member.role ===
                                                            "ADMIN"
                                                    )
                                                    .length
                                            }
                                        </p>
                                    </div>

                                    <div className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:col-span-1">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                            Workspace
                                        </p>

                                        <p className="mt-2 truncate text-base font-bold">
                                            {
                                                organization.name
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search members..."
                                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                    />
                                </div>

                                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                    {filteredMembers.length ===
                                        0 && (
                                        <div className="p-10 text-center">
                                            <Users
                                                size={32}
                                                className="mx-auto mb-3 text-[var(--text-muted)]"
                                            />

                                            <h2 className="text-base font-semibold">
                                                No members found
                                            </h2>

                                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                Try a different search term.
                                            </p>
                                        </div>
                                    )}

                                    {filteredMembers.length >
                                        0 && (
                                        <div className="divide-y divide-[var(--border)]">
                                            {filteredMembers.map(
                                                (
                                                    member
                                                ) => (
                                                    <div
                                                        key={
                                                            member.id
                                                        }
                                                        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-bold text-[var(--primary)]">
                                                                {getInitials(
                                                                    member
                                                                        .user
                                                                        .name
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold">
                                                                    {
                                                                        member
                                                                            .user
                                                                            .name
                                                                    }

                                                                    {member
                                                                        .user
                                                                        .id ===
                                                                        user?.id && (
                                                                        <span className="ml-2 text-xs font-medium text-[var(--text-muted)]">
                                                                            You
                                                                        </span>
                                                                    )}
                                                                </p>

                                                                <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-[var(--text-secondary)]">
                                                                    <Mail
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    {
                                                                        member
                                                                            .user
                                                                            .email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${getRoleClass(
                                                                    member.role
                                                                )}`}
                                                            >
                                                                <ShieldCheck
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                                {
                                                                    member.role
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    {addMemberOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
                            <button
                                type="button"
                                aria-label="Close add member dialog"
                                onClick={() =>
                                    setAddMemberOpen(false)
                                }
                                className="absolute inset-0 cursor-default"
                            />

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="add-member-title"
                                className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl sm:p-7"
                            >
                                <div className="mb-6">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                        <UserPlus size={19} />
                                    </div>

                                    <h2
                                        id="add-member-title"
                                        className="text-xl font-bold tracking-tight"
                                    >
                                        Add a member
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Add an existing DevFlow account to this organization.
                                    </p>
                                </div>

                                {formError && (
                                    <div
                                        role="alert"
                                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {formError}
                                    </div>
                                )}

                                <form
                                    onSubmit={
                                        handleAddMember
                                    }
                                    className="space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="member-email"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Email address
                                        </label>

                                        <input
                                            id="member-email"
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="member@example.com"
                                            required
                                            autoFocus
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="member-role"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Role
                                        </label>

                                        <select
                                            id="member-role"
                                            value={role}
                                            onChange={(event) =>
                                                setRole(
                                                    event.target
                                                        .value as
                                                        | "ADMIN"
                                                        | "MEMBER"
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        >
                                            <option value="MEMBER">
                                                Member
                                            </option>

                                            <option value="ADMIN">
                                                Admin
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAddMemberOpen(
                                                    false
                                                )
                                            }
                                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                addingMember ||
                                                !email.trim()
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Plus size={17} />

                                            {addingMember
                                                ? "Adding..."
                                                : "Add member"}
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