"use client";

import ActivityItem from "@/components/ActivityItem";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrganization } from "@/components/OrganizationProvider";
import {
    getOrganizationActivities,
    type OrganizationActivity,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    Activity as ActivityIcon,
    ChevronDown,
    Filter,
    Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ActivityPage() {
    const {
        activeOrganization,
        loading: organizationLoading,
    } = useOrganization();

    const [activities, setActivities] = useState<
        OrganizationActivity[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [activityFilter, setActivityFilter] = useState("ALL");
    const [filterOpen, setFilterOpen] = useState(false);

    const activityFilterOptions = [
        {
            value: "ALL",
            label: "All activity",
        },
        {
            value: "TASK_CREATED",
            label: "Task created",
        },
        {
            value: "TASK_UPDATED",
            label: "Task updated",
        },
        {
            value: "TASK_ASSIGNED",
            label: "Task assigned",
        },
        {
            value: "STATUS_CHANGED",
            label: "Status changed",
        },
        {
            value: "PRIORITY_CHANGED",
            label: "Priority changed",
        },
        {
            value: "COMMENT_ADDED",
            label: "Comment added",
        },
    ];

    const selectedFilter =
        activityFilterOptions.find(
            (option) =>
                option.value === activityFilter
        );

    useEffect(() => {
        async function loadActivities() {
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
                    await getOrganizationActivities(
                        activeOrganization.id,
                        token
                    );

                setActivities(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load activity."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadActivities();
    }, [
        activeOrganization,
        organizationLoading,
    ]);

    const filteredActivities = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return activities.filter(
            (activity) => {
                const matchesFilter =
                    activityFilter === "ALL" ||
                    activity.action ===
                        activityFilter;

                const matchesSearch =
                    !query ||
                    activity.user.name
                        .toLowerCase()
                        .includes(query) ||
                    activity.action
                        .toLowerCase()
                        .replaceAll("_", " ")
                        .includes(query) ||
                    activity.task.title
                        .toLowerCase()
                        .includes(query) ||
                    activity.task.project.name
                        .toLowerCase()
                        .includes(query);

                return (
                    matchesFilter &&
                    matchesSearch
                );
            }
        );
    }, [
        activities,
        search,
        activityFilter,
    ]);

    return (
        <ProtectedRoute>
            <AppShell>
                <main className="mx-auto w-full max-w-5xl">
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                            Workspace
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                            Activity
                        </h1>

                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Stay up to date with what is happening across your organization.
                        </p>
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-semibold text-[var(--text-primary)]">
                                        Recent activity
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Updates from your team and projects.
                                    </p>
                                </div>

                                <span className="inline-flex w-fit items-center rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                                    {filteredActivities.length}{" "}
                                    {filteredActivities.length ===
                                    1
                                        ? "activity"
                                        : "activities"}
                                </span>

                                <div className="relative w-full sm:w-auto">
                                    <label
                                        htmlFor="activity-filter"
                                        className="sr-only"
                                    >
                                        Filter activity
                                    </label>

                                    <Filter
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                    />

                                    <div className="relative w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFilterOpen(
                                                    (current) => !current
                                                )
                                            }
                                            aria-haspopup="listbox"
                                            aria-expanded={filterOpen}
                                            className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] outline-none transition hover:bg-[var(--surface-subtle)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 sm:w-auto sm:min-w-48"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Filter
                                                    size={16}
                                                    className="text-[var(--text-muted)]"
                                                />

                                                {selectedFilter?.label ??
                                                    "All activity"}
                                            </span>

                                            <ChevronDown
                                                size={16}
                                                className={`shrink-0 text-[var(--text-muted)] transition-transform ${
                                                    filterOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        {filterOpen && (
                                            <div
                                                role="listbox"
                                                className="absolute right-0 z-50 mt-2 w-full min-w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg sm:w-52"
                                            >
                                                {activityFilterOptions.map(
                                                    (option) => {
                                                        const isSelected =
                                                            activityFilter ===
                                                            option.value;

                                                        return (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={
                                                                    isSelected
                                                                }
                                                                onClick={() => {
                                                                    setActivityFilter(
                                                                        option.value
                                                                    );
                                                                    setFilterOpen(
                                                                        false
                                                                    );
                                                                }}
                                                                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                                    isSelected
                                                                        ? "bg-[var(--primary)]/10 font-semibold text-[var(--primary)]"
                                                                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                                                }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search
                                        size={17}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                    />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search activity..."
                                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                                    />
                                </div>

                                {(search.trim() ||
                                    activityFilter !== "ALL") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setActivityFilter("ALL");
                                        }}
                                        className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="divide-y divide-[var(--border)]">
                                {Array.from(
                                    { length: 5 }
                                ).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 px-5 py-5 sm:px-6"
                                        >
                                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[var(--surface-subtle)]" />

                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                                <div className="h-3 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[300px] items-center justify-center px-6 py-12">
                                <div className="max-w-sm text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                        <ActivityIcon
                                            size={25}
                                        />
                                    </div>

                                    <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
                                        Unable to load activity
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        ) : filteredActivities.length ===
                          0 ? (
                            <div className="flex min-h-[360px] items-center justify-center px-6 py-12">
                                <div className="max-w-sm text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                        <ActivityIcon
                                            size={25}
                                        />
                                    </div>

                                    <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
                                        {activities.length ===
                                        0
                                            ? "No activity yet"
                                            : "No matching activity"}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                        {activities.length ===
                                        0
                                            ? "Activity from your organization will appear here as your team creates, updates, assigns, and comments on tasks."
                                            : "Try a different search term."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {filteredActivities.map(
                                    (activity) => (
                                        <ActivityItem
                                            key={
                                                activity.id
                                            }
                                            userName={
                                                activity.user.name
                                            }
                                            action={
                                                activity.action
                                            }
                                            taskId={
                                                activity.task.id
                                            }
                                            projectId={
                                                activity.task.project.id
                                            }
                                            taskTitle={
                                                activity.task.title
                                            }
                                            createdAt={
                                                activity.createdAt
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </section>
                </main>
            </AppShell>
        </ProtectedRoute>
    );
}