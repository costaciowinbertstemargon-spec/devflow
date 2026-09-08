"use client";

import {
    Activity,
    Bell,
    ChevronDown,
    FolderKanban,
    LayoutDashboard,
    ListTodo,
    Menu,
    Settings,
    UserCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
    {
        label: "Overview",
        icon: LayoutDashboard,
    },
    {
        label: "Projects",
        icon: FolderKanban,
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

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 lg:translate-x-0 ${
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
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-[var(--surface-subtle)]"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                My Organization
                            </p>

                            <p className="text-xs text-[var(--text-muted)]">
                                Workspace
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className="shrink-0 text-[var(--text-muted)]"
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3">
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
                                    pathname.startsWith("/projects"));

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => {
                                        setSidebarOpen(false);

                                        if (item.label === "Overview") {
                                            router.push("/dashboard");
                                        }

                                        if (item.label === "Projects") {
                                            router.push("/projects");
                                        }
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                        active
                                            ? "bg-[var(--surface-subtle)] text-[var(--primary)]"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    <Icon size={18} />

                                    <span>{item.label}</span>

                                    {item.label === "Notifications" && (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-semibold text-white">
                                            3
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
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>

                    <button
                        type="button"
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[var(--surface-subtle)]"
                    >
                        <UserCircle
                            size={30}
                            className="shrink-0 text-[var(--text-muted)]"
                        />

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                Your Account
                            </p>

                            <p className="truncate text-xs text-[var(--text-muted)]">
                                user@devflow.local
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
                            className="relative rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                        >
                            <Bell size={20} />

                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
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

                {/* Page content */}
                <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}