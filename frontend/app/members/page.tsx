"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    addOrganizationMember,
    getOrganization,
    leaveOrganization,
    updateOrganizationMemberRole,
    removeOrganizationMember,
    type OrganizationDetails,
    type OrganizationMember,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import {
    Mail,
    MoreVertical,
    Plus,
    ShieldCheck,
    Trash2,
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

    const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] =
        useState<"ADMIN" | "MEMBER">(
            "MEMBER"
        );
    const [addingMember, setAddingMember] = useState(false);
    const [formError, setFormError] = useState("");

    const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
    const [actionMenuMemberId, setActionMenuMemberId] = useState<string | null>(null);
    const [memberActionLoading, setMemberActionLoading] = useState(false);
    const [memberActionError, setMemberActionError] = useState("");

    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [leavingOrganization, setLeavingOrganization] = useState(false);
    const [leaveError, setLeaveError] = useState("");

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

    const currentMember = organization?.members.find(
        (member) => member.userId === user?.id
    );

    const currentRole = currentMember?.role;

    const canManageMember = (
        member: OrganizationMember
    ) => {
        if (!currentRole) {
            return false;
        }

        if (member.userId === user?.id) {
            return false;
        }

        if (member.role === "OWNER") {
            return false;
        }

        if (currentRole === "OWNER") {
            return true;
        }

        if (
            currentRole === "ADMIN" &&
            member.role === "MEMBER"
        ) {
            return true;
        }

        return false;
    };

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

    async function handleChangeMemberRole(
        member: OrganizationMember,
        role: "ADMIN" | "MEMBER"
    ) {
        if (!organization) {
            return;
        }

        if (member.user.id === user?.id) {
            setMemberActionError(
                "You cannot change your own role."
            );
            return;
        }

        if (member.role === "OWNER") {
            setMemberActionError(
                "The organization owner role cannot be changed."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setMemberActionError(
                "Authentication required."
            );
            return;
        }

        setMemberActionLoading(true);
        setMemberActionError("");

        try {
            const updatedMember =
                await updateOrganizationMemberRole(
                    organization.id,
                    member.id,
                    token,
                    role
                );

            setOrganization((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    members: current.members.map(
                        (currentMember) =>
                            currentMember.id ===
                            updatedMember.id
                                ? updatedMember
                                : currentMember
                    ),
                };
            });

            setActionMenuMemberId(null);
            setSelectedMember(null);
        } catch (error) {
            setMemberActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to update member role."
            );
        } finally {
            setMemberActionLoading(false);
        }
    }

    async function handleRemoveMember(
        member: OrganizationMember
    ) {
        if (!organization) {
            return;
        }

        if (member.user.id === user?.id) {
            setMemberActionError(
                "You cannot remove yourself from the organization."
            );
            return;
        }

        if (member.role === "OWNER") {
            setMemberActionError(
                "The organization owner cannot be removed."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setMemberActionError(
                "Authentication required."
            );
            return;
        }

        setMemberActionLoading(true);
        setMemberActionError("");

        try {
            await removeOrganizationMember(
                organization.id,
                member.id,
                token
            );

            setOrganization((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    members: current.members.filter(
                        (currentMember) =>
                            currentMember.id !==
                            member.id
                    ),
                };
            });

            setActionMenuMemberId(null);
            setSelectedMember(null);
        } catch (error) {
            setMemberActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to remove member."
            );
        } finally {
            setMemberActionLoading(false);
        }
    }

    async function handleLeaveOrganization() {
        if (!activeOrganization) {
            return;
        }

        if (currentRole === "OWNER") {
            setLeaveError(
                "The organization owner cannot leave the organization."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setLeaveError(
                "Authentication required."
            );
            return;
        }

        setLeavingOrganization(true);
        setLeaveError("");

        try {
            await leaveOrganization(
                activeOrganization.id,
                token
            );

            setLeaveDialogOpen(false);
            setOrganization(null);

            window.location.href = "/dashboard";
        } catch (error) {
            setLeaveError(
                error instanceof Error
                    ? error.message
                    : "Failed to leave the organization."
            );
        } finally {
            setLeavingOrganization(false);
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
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
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
                                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20 focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                    />
                                </div>

                                {memberActionError && (
                                    <div
                                        role="alert"
                                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {memberActionError}
                                    </div>
                                )}

                                <div className="relative overflow-visible rounded-xl border border-[var(--border)] bg-[var(--surface)]">
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

                                                        <div className="relative flex items-center gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${getRoleClass(
                                                                    member.role
                                                                )}`}
                                                            >
                                                                <ShieldCheck size={13} />
                                                                {member.role}
                                                            </span>

                                                            {canManageMember(member) && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        aria-label={`Manage ${member.user.name}`}
                                                                        onClick={() =>
                                                                            setActionMenuMemberId(
                                                                                actionMenuMemberId ===
                                                                                    member.id
                                                                                    ? null
                                                                                    : member.id
                                                                            )
                                                                        }
                                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                                                    >
                                                                        <MoreVertical size={17} />
                                                                    </button>

                                                                    {actionMenuMemberId ===
                                                                        member.id && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                aria-label="Close member actions"
                                                                                onClick={() =>
                                                                                    setActionMenuMemberId(
                                                                                        null
                                                                                    )
                                                                                }
                                                                                className="fixed inset-0 z-20 cursor-default"
                                                                            />

                                                                            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
                                                                                {currentRole ===
                                                                                    "OWNER" &&
                                                                                    member.role ===
                                                                                        "MEMBER" && (
                                                                                        <button
                                                                                            type="button"
                                                                                            disabled={
                                                                                                memberActionLoading
                                                                                            }
                                                                                            onClick={() =>
                                                                                                void handleChangeMemberRole(
                                                                                                    member,
                                                                                                    "ADMIN"
                                                                                                )
                                                                                            }
                                                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                                                                                        >
                                                                                            <ShieldCheck
                                                                                                size={16}
                                                                                            />
                                                                                            Make admin
                                                                                        </button>
                                                                                    )}

                                                                                {currentRole ===
                                                                                    "OWNER" &&
                                                                                    member.role ===
                                                                                        "ADMIN" && (
                                                                                        <button
                                                                                            type="button"
                                                                                            disabled={
                                                                                                memberActionLoading
                                                                                            }
                                                                                            onClick={() =>
                                                                                                void handleChangeMemberRole(
                                                                                                    member,
                                                                                                    "MEMBER"
                                                                                                )
                                                                                            }
                                                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                                                                                        >
                                                                                            <ShieldCheck
                                                                                                size={16}
                                                                                            />
                                                                                            Make member
                                                                                        </button>
                                                                                    )}

                                                                                <button
                                                                                    type="button"
                                                                                    disabled={
                                                                                        memberActionLoading
                                                                                    }
                                                                                    onClick={() => {
                                                                                        setSelectedMember(
                                                                                            member
                                                                                        );
                                                                                        setMemberActionError(
                                                                                            ""
                                                                                        );
                                                                                        setActionMenuMemberId(
                                                                                            null
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                    Remove member
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
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
                                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
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

                    {selectedMember && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
                            <button
                                type="button"
                                aria-label="Close remove member dialog"
                                onClick={() => {
                                    if (!memberActionLoading) {
                                        setSelectedMember(null);
                                    }
                                }}
                                className="absolute inset-0 cursor-default"
                            />

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="remove-member-title"
                                className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <Trash2 size={20} />
                                </div>

                                <h2
                                    id="remove-member-title"
                                    className="mt-5 text-xl font-bold tracking-tight"
                                >
                                    Remove member?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                    Are you sure you want to remove{" "}
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {selectedMember.user.name}
                                    </span>{" "}
                                    from this organization? They will
                                    lose access to the workspace.
                                </p>

                                {memberActionError && (
                                    <div
                                        role="alert"
                                        className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {memberActionError}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        disabled={memberActionLoading}
                                        onClick={() =>
                                            setSelectedMember(null)
                                        }
                                        className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        disabled={memberActionLoading}
                                        onClick={() =>
                                            void handleRemoveMember(
                                                selectedMember
                                            )
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Trash2 size={16} />

                                        {memberActionLoading
                                            ? "Removing..."
                                            : "Remove member"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentRole !== "OWNER" && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-red-700">
                                        Leave organization
                                    </h3>

                                    <p className="mt-1 text-sm text-red-600/80">
                                        Leave this organization and lose access
                                        to its projects and members.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLeaveError("");
                                        setLeaveDialogOpen(true);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                    Leave organization
                                </button>
                            </div>
                        </div>
                    )}

                    {leaveDialogOpen && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
                            <button
                                type="button"
                                aria-label="Close leave organization dialog"
                                onClick={() => {
                                    if (!leavingOrganization) {
                                        setLeaveDialogOpen(false);
                                    }
                                }}
                                className="absolute inset-0 cursor-default"
                            />

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="leave-organization-title"
                                className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <Trash2 size={20} />
                                </div>

                                <h2
                                    id="leave-organization-title"
                                    className="mt-5 text-xl font-bold tracking-tight"
                                >
                                    Leave organization?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                    Are you sure you want to leave{" "}
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {organization?.name}
                                    </span>
                                    ? You will lose access to this
                                    organization and its projects.
                                </p>

                                {leaveError && (
                                    <div
                                        role="alert"
                                        className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {leaveError}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        disabled={leavingOrganization}
                                        onClick={() =>
                                            setLeaveDialogOpen(false)
                                        }
                                        className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        disabled={leavingOrganization}
                                        onClick={() =>
                                            void handleLeaveOrganization()
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Trash2 size={16} />

                                        {leavingOrganization
                                            ? "Leaving..."
                                            : "Leave organization"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}