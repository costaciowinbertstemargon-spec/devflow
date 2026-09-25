"use client";

import {
    Activity,
    Bell,
    Building2,
    Check,
    ChevronDown,
    FolderKanban,
    Plus,
    LayoutDashboard,
    ListTodo,
    Menu,
    Settings,
    UserCircle,
    Users,
    X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createOrganization } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { useOrganization } from "./OrganizationProvider";
import { useNotifications } from "./NotificationProvider";

const navigation = [
    {
        label: "Overview",
        icon: LayoutDashboard,
    },
    {
        label: "Organization",
        icon: Building2,
    },
    {
        label: "Projects",
        icon: FolderKanban,
    },
    {
        label: "Members",
        icon: Users,
    },
    {
        label: "My Tasks",
        icon: ListTodo,
    },
    {
        label: "Notifications",
        icon: Bell,
    },
    {
        label: "Activity",
        icon: Activity,
    },
];

export default function AppShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const [ organizationMenuOpen, setOrganizationMenuOpen] = useState(false);
    const [createOrganizationModalOpen, setCreateOrganizationModalOpen] = useState(false);
    const [organizationName, setOrganizationName] = useState("");
    const [organizationDescription, setOrganizationDescription] = useState("");
    const [creatingOrganization, setCreatingOrganization] = useState(false);
    const [createOrganizationError, setCreateOrganizationError] = useState("");
    const {
        organizations,
        activeOrganization,
        setActiveOrganization,
        refreshOrganizations,
        loading: organizationLoading,
    } = useOrganization();

    const { unreadCount } = useNotifications();
    const { user, logout } = useAuth();

    useEffect(() => {
        setSidebarOpen(false);
        setOrganizationMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setSidebarOpen(false);
                setOrganizationMenuOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    async function handleCreateOrganization(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const trimmedName = organizationName.trim();

        if (!trimmedName) {
            setCreateOrganizationError(
                "Organization name is required."
            );
            return;
        }

        const token = localStorage.getItem("devflow_token");

        if (!token) {
            setCreateOrganizationError(
                "Authentication required."
            );
            return;
        }

        setCreatingOrganization(true);
        setCreateOrganizationError("");

        try {
            const organization = await createOrganization(
                token,
                trimmedName,
                organizationDescription
            );

            await refreshOrganizations();

            setActiveOrganization(organization);

            setOrganizationMenuOpen(false);
            setCreateOrganizationModalOpen(false);

            setOrganizationName("");
            setOrganizationDescription("");
        } catch (error) {
            setCreateOrganizationError(
                error instanceof Error
                    ? error.message
                    : "Failed to create organization."
            );
        } finally {
            setCreatingOrganization(false);
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
            />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-xl transition-transform duration-200 lg:w-64 lg:shadow-none lg:translate-x-0 ${
                        sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-[var(--border)] px-5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white">
                            D
                        </div>

                        <span className="text-lg font-bold tracking-tight">
                            DevFlow
                        </span>
                    </div>
                </div>

                {/* Organization selector */}
                <div className="border-b border-[var(--border)] p-3">
                    <div className="relative">
                        <button
                            type="button"
                            disabled={organizationLoading}
                            onClick={() =>
                                setOrganizationMenuOpen(
                                    !organizationMenuOpen
                                )
                            }
                            className="flex w-full items-center justify-between rounded-xl border border-transparent bg-[var(--surface-subtle)] px-3 py-2.5 text-left transition hover:border-[var(--border)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            aria-haspopup="listbox"
                            aria-expanded={organizationMenuOpen}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {organizationLoading
                                        ? "Loading..."
                                        : activeOrganization?.name ??
                                        "No organizations"}
                                </p>

                                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                    Workspace
                                </p>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                                    organizationMenuOpen
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        {organizationMenuOpen &&
                            !organizationLoading && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close organization menu"
                                        onClick={() =>
                                            setOrganizationMenuOpen(false)
                                        }
                                        className="fixed inset-0 z-40 cursor-default lg:absolute"
                                    />

                                    <div
                                        role="listbox"
                                        aria-label="Select organization"
                                        className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-lg"
                                    >
                                        {organizations.length > 0 ? (
                                            <>
                                                {organizations.map((organization) => {
                                                    const selected =
                                                        organization.id ===
                                                        activeOrganization?.id;

                                                    return (
                                                        <button
                                                            key={organization.id}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={selected}
                                                            onClick={() => {
                                                                setActiveOrganization(
                                                                    organization
                                                                );
                                                                setOrganizationMenuOpen(
                                                                    false
                                                                );
                                                            }}
                                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                                                                selected
                                                                    ? "bg-[var(--surface-subtle)]"
                                                                    : "hover:bg-[var(--surface-subtle)]"
                                                            }`}
                                                        >
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                                                                {organization.name
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                                                    {organization.name}
                                                                </p>

                                                                <p className="truncate text-xs text-[var(--text-muted)]">
                                                                    Workspace
                                                                </p>
                                                            </div>

                                                            {selected && (
                                                                <Check
                                                                    size={16}
                                                                    className="shrink-0 text-[var(--primary)]"
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}

                                                <div className="my-1 border-t border-[var(--border)]" />
                                            </>
                                        ) : (
                                            <div className="px-3 py-3">
                                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                                    No organizations yet
                                                </p>

                                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                    Create one to get started.
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrganizationMenuOpen(false);
                                                setCreateOrganizationError("");
                                                setOrganizationName("");
                                                setOrganizationDescription("");
                                                setCreateOrganizationModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--surface-subtle)]"
                                        >
                                            <Plus size={17} />

                                            <span>Create Organization</span>
                                        </button>
                                    </div>
                                </>
                            )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="min-h-0 flex-1 overflow-y-auto p-3">
                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Workspace
                    </p>

                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            const active =
                                (item.label === "Overview" &&
                                    pathname === "/dashboard") ||
                                (item.label === "Projects" &&
                                    pathname.startsWith("/projects")) ||
                                (item.label === "Organization" &&
                                    pathname.startsWith("/organization"));

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    aria-current={active ? "page" : undefined}
                                    onClick={() => {
                                        setSidebarOpen(false);

                                        if (item.label === "Overview") {
                                            router.push("/dashboard");
                                        }

                                        if (item.label === "Organization") {
                                            router.push("/organization");
                                        }

                                        if (item.label === "Projects") {
                                            router.push("/projects");
                                        }

                                        if (item.label === "Members") {
                                            router.push("/members");
                                        }
                                        
                                        if (item.label === "My Tasks") {
                                            router.push("/my-tasks");
                                        }
                                        
                                        if (item.label === "Notifications") {
                                            router.push("/notifications");
                                        }
                                        
                                        if (item.label === "Activity") {
                                            router.push("/activity");
                                        }
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                                        active
                                            ? "bg-[var(--surface-subtle)] text-[var(--primary)]"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    <Icon size={18} />

                                    <span>{item.label}</span>

                                    {item.label === "Notifications" &&
                                        unreadCount > 0 && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-semibold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Sidebar footer */}
                <div className="border-t border-[var(--border)] p-3">
                    <button
                        type="button"
                        aria-current={
                            pathname === "/settings"
                                ? "page"
                                : undefined
                        }
                        onClick={() => {
                            setSidebarOpen(false);
                            router.push("/settings");
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                            pathname === "/settings"
                                ? "bg-[var(--surface-subtle)] font-medium text-[var(--primary)]"
                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                        }`}                    >
                                            <Settings size={18} />
                        <span>Settings</span>
                    </button>

                    <button
                        type="button"
                        onClick={logout}
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[var(--surface-subtle)]"
                    >
                        <UserCircle
                            size={30}
                            className="shrink-0 text-[var(--text-muted)]"
                        />

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {user?.name ?? "Loading..."}
                            </p>

                            <p className="truncate text-xs text-[var(--text-muted)]">
                                {user?.email ?? ""}
                            </p>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation"
                            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden items-center gap-2 text-sm sm:flex">
                            <span className="text-[var(--text-muted)]">
                                Workspace
                            </span>

                            <span className="text-[var(--text-muted)]">
                                /
                            </span>

                            <span className="font-medium">
                                {pathname.startsWith("/projects")
                                    ? "Projects"
                                    : "Overview"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            onClick={() => router.push("/notifications")}
                            className="relative rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                        >
                            <Bell size={20} />

                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
                            )}
                        </button>

                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-[var(--surface-subtle)]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--primary)]">
                                Y
                            </div>

                            <span className="hidden text-sm font-medium sm:block">
                                You
                            </span>

                            <ChevronDown
                                size={15}
                                className="hidden text-[var(--text-muted)] sm:block"
                            />
                        </button>
                    </div>
                </header>

                {createOrganizationModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="create-organization-title"
                            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
                        >
                            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
                                <div>
                                    <h2
                                        id="create-organization-title"
                                        className="text-lg font-semibold text-[var(--text-primary)]"
                                    >
                                        Create Organization
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Create a workspace for your team.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (creatingOrganization) {
                                            return;
                                        }

                                        setCreateOrganizationModalOpen(false);
                                        setCreateOrganizationError("");
                                    }}
                                    aria-label="Close create organization modal"
                                    className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateOrganization}
                                className="space-y-5 p-5 sm:p-6"
                            >
                                {createOrganizationError && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                                    >
                                        {createOrganizationError}
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="app-shell-organization-name"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Organization name
                                    </label>

                                    <input
                                        id="app-shell-organization-name"
                                        type="text"
                                        value={organizationName}
                                        onChange={(event) =>
                                            setOrganizationName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. DevFlow Team"
                                        required
                                        disabled={creatingOrganization}
                                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="app-shell-organization-description"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Description
                                        <span className="ml-1 font-normal text-[var(--text-muted)]">
                                            (optional)
                                        </span>
                                    </label>

                                    <textarea
                                        id="app-shell-organization-description"
                                        value={organizationDescription}
                                        onChange={(event) =>
                                            setOrganizationDescription(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Describe your organization..."
                                        rows={4}
                                        disabled={creatingOrganization}
                                        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (creatingOrganization) {
                                                return;
                                            }

                                            setCreateOrganizationModalOpen(
                                                false
                                            );
                                            setCreateOrganizationError("");
                                        }}
                                        disabled={creatingOrganization}
                                        className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            creatingOrganization ||
                                            !organizationName.trim()
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        <Plus size={17} />

                                        {creatingOrganization
                                            ? "Creating..."
                                            : "Create Organization"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <main className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}