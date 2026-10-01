"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import {
    archiveTask, 
    createTask,
    restoreTask,
    getArchivedTasks,
    getProject,
    getTasks,
    getOrganization,
    getTaskActivities,
    updateProject, 
    updateTask,
    type Project,
    type Task,
    type TaskActivity,
    type OrganizationMember,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    ClipboardCheck,
    Clock3,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, } from "react";
import { useRouter } from "next/navigation";

function getStatusIcon(status: string) {
    if (status === "TODO") {
        return <Circle size={17} />;
    }

    if (status === "IN_PROGRESS") {
        return <Clock3 size={17} />;
    }

    if (status === "REVIEW") {
        return <ClipboardCheck size={17} />;
    }

    if (status === "DONE") {
        return <CheckCircle2 size={17} />;
    }

    return <Circle size={17} />;
}

function getStatusLabel(status: string) {
    if (status === "TODO") {
        return "To Do";
    }

    if (status === "IN_PROGRESS") {
        return "In Progress";
    }

    if (status === "REVIEW") {
        return "Review";
    }

    if (status === "DONE") {
        return "Done";
    }

    return status;
}

function getActivityMessage(
    activity: TaskActivity
) {
    switch (activity.action) {
        case "COMMENT_ADDED":
            return "added a comment";

        case "TASK_CREATED":
            return "created this task";

        case "TASK_UPDATED":
            return "updated this task";

        case "TASK_ASSIGNED":
            return "assigned this task";

        case "STATUS_CHANGED":
            return "changed the task status";

        case "PRIORITY_CHANGED":
            return "changed the task priority";

        default:
            return activity.action
                .toLowerCase()
                .replace(/_/g, " ");
    }
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const router = useRouter();

    const { user } = useAuth();
    const [canManageTasks, setCanManageTasks] = useState(false);

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState("");

    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const [archivedLoading, setArchivedLoading] = useState(false);
    
    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState("");

    const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [savingProject, setSavingProject] = useState(false);
    const [projectFormError, setProjectFormError] = useState("");

    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState("MEDIUM");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskAssigneeId, setTaskAssigneeId] = useState("");
    const [savingTask, setSavingTask] = useState(false);
    const [taskFormError, setTaskFormError] = useState("");

    const [activeView, setActiveView] =
        useState<"tasks" | "board" | "activity" | "archived">(
            "tasks"
        );
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
    const [openTaskMenuId, setOpenTaskMenuId] = useState<string | null>(null);
    const [taskMenuPlacement, setTaskMenuPlacement] = useState<"top" | "bottom">("bottom");
    const [taskMenuPosition, setTaskMenuPosition] =
        useState({
            top: 0,
            left: 0,
        });

    const [search, setSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<
            "ALL" |
            "TODO" |
            "IN_PROGRESS" |
            "REVIEW" |
            "DONE"
        >("ALL");
    const [priorityFilter, setPriorityFilter] = useState<
            "ALL" |
            "LOW" |
            "MEDIUM" |
            "HIGH" |
            "URGENT"
        >("ALL");
    const [sortBy, setSortBy] = useState<
        "updated-desc" |
        "created-desc" |
        "due-asc" |
        "name-asc"
    >("updated-desc");

    useEffect(() => {
        async function loadProjectData() {
            const token = getToken();

            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                setTasksLoading(false);
                return;
            }

            if (!projectId) {
                setError("Project ID is missing.");
                setLoading(false);
                setTasksLoading(false);
                return;
            }
            
            setLoading(true);
            setTasksLoading(true);
            setError("");
            setTasksError("");

            try {
                const [projectResult, tasksResult] = await Promise.all([
                    getProject(projectId, token),
                    getTasks(projectId, token),
                ]);

                setProject(projectResult);
                setTasks(tasksResult);

                setActivitiesLoading(true);
                setActivitiesError("");

                const taskActivities =
                    await Promise.all(
                        tasksResult.map((task) =>
                            getTaskActivities(
                                task.id,
                                token
                            )
                        )
                    );

                setActivities(
                    taskActivities.flat()
                );

                const organization = await getOrganization(
                    projectResult.organizationId,
                    token
                );

                setOrganizationMembers(organization.members);

                const membership = organization.members.find(
                    (member) => member.user.id === user?.id
                );
                
                setCanManageTasks(
                    membership?.role === "OWNER" ||
                    membership?.role === "ADMIN"
                );
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load project data.";
                
                setError(message);
                setTasksError(message);
                setActivitiesError(message);

            } finally {
                setLoading(false);
                setTasksLoading(false);
                setActivitiesLoading(false);
            }
        }

        void loadProjectData();
    }, [projectId, user?.id]);

    async function handleCreateTask(
        event: React.FormEvent<HTMLFormElement>    
    ) {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            setTaskFormError("Authentication required.");
            return;
        }

        if (!projectId) {
            setTaskFormError("Project ID is missing.");
            return;
        }

        if (!taskTitle.trim()) {
            setTaskFormError("Task title is required.");
            return;
        }

        setSavingTask(true);
        setTaskFormError("");

        try {
            await createTask(
                projectId,
                token,
                taskTitle.trim(),
                taskDescription,
                taskPriority,
                taskDueDate
                    ? new Date(
                        `${taskDueDate}T00:00:00`
                    ).toISOString()
                    : undefined,
                taskAssigneeId || undefined
            );

            const updatedTasks =
                await getTasks(
                    projectId,
                    token
                );
            
            setTasks(updatedTasks);

            setCreateTaskModalOpen(false);
            setTaskTitle("");
            setTaskDescription("");
            setTaskPriority("MEDIUM");
            setTaskDueDate("");
            setTaskAssigneeId("");
        } catch (error) {
            setTaskFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create task."
            );
        } finally {
            setSavingTask(false);
        }
    }

    async function handleUpdateProject(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            setProjectFormError(
                "Authentication required."
            );
            return;
        }

        if (!project) {
            return;
        }

        if (!projectName.trim()) {
            setProjectFormError(
                "Project name is required."
            );
            return;
        }

        setSavingProject(true);
        setProjectFormError("");

        try {
            const updatedProject =
                await updateProject(
                    project.id,
                    token,
                    projectName,
                    projectDescription
                );

            setProject(updatedProject);
            setEditProjectModalOpen(false);
        } catch (error) {
            setProjectFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to update project."
            );
        } finally {
            setSavingProject(false);
        }
    }

    async function handleTaskStatusChange(
        taskId: string,
        status: string
    ) {
        const token = getToken();

        if (!token) {
            setError("Authentication required.");
            return;
        }

        setUpdatingTaskId(taskId);

        try {
            const updatedTask = await updateTask(
                taskId,
                token,
                {
                    status,
                }
            );

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId
                        ? {
                            ...task,
                            ...updatedTask,
                        }
                        : task
                )
            );
        } catch (error) {
            setTasksError(
                error instanceof Error
                    ? error.message
                    : "Failed to update task status."
            );
        } finally {
            setUpdatingTaskId(null);
        }
    }

    async function handleArchiveTask(taskId: string) {
        const token = getToken();

        if (!token) {
            setError("Authentication required.");
            return;
        }

        if (!canManageTasks) {
            setError(
                "You do not have permission to archive this task."
            );
            return;
        }

        const confirmed = window.confirm(
            "Archive this task? It will be hidden from the active project views and can be restored later by an administrator or owner."
        );

        if (!confirmed) {
            return;
        }

        setUpdatingTaskId(taskId);

        try {
            const archivedTask = await archiveTask(
                taskId,
                token
            );

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => task.id !== taskId
                )
            );

            setArchivedTasks((currentTasks) => [
                archivedTask,
                ...currentTasks.filter(
                    (task) => task.id !== taskId
                ),
            ]);

            setOpenTaskMenuId(null);
        } catch (error) {
            setTasksError(
                error instanceof Error
                    ? error.message
                    : "Failed to archive task."
            );
        } finally {
            setUpdatingTaskId(null);
        }
    }

    async function loadArchivedTasks() {
        const token = getToken();

        if (!token) {
            setError("Authentication required.");
            return;
        }

        if (!canManageTasks) {
            return;
        }

        setArchivedLoading(true);

        try {
            const result = await getArchivedTasks(
                projectId,
                token
            );

            setArchivedTasks(result);
        } catch (error) {
            setTasksError(
                error instanceof Error
                    ? error.message
                    : "Failed to load archived tasks."
            );
        } finally {
            setArchivedLoading(false);
        }
    }

    const handleRestoreTask = async (
        taskId: string
    ) => {
        const token = getToken();
        
        if (!token) {
            return;
        }

        try {
            setUpdatingTaskId(taskId);

            await restoreTask(taskId, token);

            setArchivedTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => task.id !== taskId
                )
            );

            const refreshedTasks = await getTasks(
                projectId,
                token
            );

            setTasks(refreshedTasks);

            setOpenTaskMenuId(null);
        } catch (error) {
            console.error(
                "Failed to restore task:",
                error
            );
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = tasks.filter((task) => {
            const matchesSearch =
                !query ||
                task.title
                    .toLowerCase()
                    .includes(query) ||
                (task.description ?? "")
                    .toLowerCase()
                    .includes(query) ||
                task.status
                    .toLowerCase()
                    .includes(query) ||
                task.priority
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "ALL" ||
                task.priority === priorityFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });

        return [...filtered].sort((first, second) => {
            switch (sortBy) {
                case "name-asc":
                    return first.title.localeCompare(
                        second.title
                    );

                case "created-desc":
                    return (
                        new Date(
                            second.createdAt
                        ).getTime() -
                        new Date(
                            first.createdAt
                        ).getTime()
                    );

                case "due-asc": {
                    if (!first.dueDate) {
                        return 1;
                    }

                    if (!second.dueDate) {
                        return -1;
                    }

                    return (
                        new Date(
                            first.dueDate
                        ).getTime() -
                        new Date(
                            second.dueDate
                        ).getTime()
                    );
                }

                case "updated-desc":
                default:
                    return (
                        new Date(
                            second.updatedAt
                        ).getTime() -
                        new Date(
                            first.updatedAt
                        ).getTime()
                    );
            }
        });
    }, [
        tasks,
        search,
        statusFilter,
        priorityFilter,
        sortBy,
    ]);

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(
        (task) => task.status === "TODO"
    ).length;
    const inProgressTasks = tasks.filter(
        (task) => task.status === "IN_PROGRESS"
    ).length;
    const completedTasks = tasks.filter(
        (task) => task.status === "DONE"
    ).length;

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-5 pt-1 sm:mb-6">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Projects
                        </Link>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="p-6">
                                <div className="h-4 w-20 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-[var(--surface-subtle)]" />

                                <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-subtle)]" />

                                <div className="mt-2 h-4 w-3/4 max-w-xl animate-pulse rounded bg-[var(--surface-subtle)]" />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-2xl border border-red-200/80 bg-red-50/80 p-6 shadow-sm"
                        >
                            <h2 className="text-base font-semibold text-red-800">
                                Unable to load project
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-3 inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                            >
                                Try Again
                            </button>

                            <Link
                                href="/projects"
                                className="mt-4 inline-flex items-center rounded-xl bg-[var(--primary)] px-4 py-2.5 shadow-sm text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"
                            >
                                Back to Projects
                            </Link>
                        </div>
                    )}

                    {/* Project */}
                    {!loading && !error && project && (
                        <>
                            {/* Project header */}
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                <div className="flex flex-col gap-6 border-b border-[var(--border)] p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                                                <span className="text-sm font-bold">
                                                    {project.name
                                                        .trim()
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                    Project
                                                </p>

                                                <h1 className="text-2xl font-bold tracking-tight">
                                                    {project.name}
                                                </h1>
                                            </div>
                                        </div>

                                        <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                                            {project.description ??
                                                "No description provided."}
                                        </p>

                                        <p className="mt-3 text-xs text-[var(--text-muted)]">
                                            Project ID: {project.id}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={"/members"}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                        >
                                            <Users size={16} />
                                            Members
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!project) {
                                                    return;
                                                }

                                                setProjectName(project.name);
                                                setProjectDescription(
                                                    project.description ?? ""
                                                );
                                                setProjectFormError("");
                                                setEditProjectModalOpen(true);
                                            }}
                                            className="rounded-xl p-2.5 text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                            aria-label="Edit project"
                                            title="Edit project"
                                        >
                                            <MoreHorizontal size={19} />
                                        </button>
                                    </div>
                                </div>

                                {/* Project stats */}
                                <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
                                    <div className="px-5 py-4 transition-colors hover:bg-[var(--surface-subtle)]">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Total Tasks
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            {totalTasks}
                                        </p>
                                    </div>

                                    <div className="px-5 py-4 transition-colors hover:bg-[var(--surface-subtle)]">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            To Do
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            {todoTasks}
                                        </p>
                                    </div>

                                    <div className="px-5 py-4 transition-colors hover:bg-[var(--surface-subtle)]">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            In Progress
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            {inProgressTasks}
                                        </p>
                                    </div>

                                    <div className="px-5 py-4 transition-colors hover:bg-[var(--surface-subtle)]">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Completed
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            {completedTasks}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Workspace toolbar */}
                            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-1 sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveView("tasks")
                                        }
                                        className={
                                            activeView === "tasks"
                                                ? "rounded-xl bg-[var(--primary)] px-3.5 py-2.5 shadow-sm text-sm font-semibold text-white"
                                                : "rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)]"
                                        }
                                    >
                                        Tasks
                                    </button>

                                    {canManageTasks && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveView("board")
                                            }
                                            className={
                                                activeView === "board"
                                                    ? "rounded-xl bg-[var(--primary)] px-3.5 py-2.5 shadow-sm text-sm font-semibold text-white"
                                                    : "rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)]"
                                            }
                                        >
                                            Board
                                        </button>                                        
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveView("activity")
                                        }
                                        className={
                                            activeView === "activity"
                                                ? "rounded-xl bg-[var(--primary)] px-3.5 py-2.5 shadow-sm text-sm font-semibold text-white"
                                                : "rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)]"
                                        }
                                    >
                                        Activity
                                    </button>

                                    {canManageTasks && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveView("archived");
                                                void loadArchivedTasks();
                                            }}
                                            className={
                                                activeView === "archived"
                                                    ? "rounded-xl bg-[var(--primary)] px-3.5 py-2.5 shadow-sm text-sm font-semibold text-white"
                                                    : "rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)]"
                                            }
                                        >
                                            Archived
                                        </button>
                                    )}

                                </div>

                                {canManageTasks && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTaskFormError("");
                                            setTaskTitle("");
                                            setTaskDescription("");
                                            setTaskPriority("MEDIUM");
                                            setTaskDueDate("");
                                            setTaskAssigneeId("");
                                            setCreateTaskModalOpen(true);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 shadow-sm text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                    >
                                        <Plus size={17} />
                                        Add Task
                                    </button>
                                )}
                            </div>

                            {activeView === "tasks" && (
                                <>
                                    {/* Search and filter */}
                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                        <div className="relative flex-1">
                                            <Search
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                            />

                                            <input
                                                type="search"
                                                value={search}
                                                onChange={(event) => 
                                                    setSearch(event.target.value)
                                                }
                                                placeholder="Search tasks..."
                                                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20 focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => 
                                                setFiltersOpen(
                                                    (current) => !current
                                                )
                                            }
                                            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition sm:w-auto ${
                                                filtersOpen ||
                                                statusFilter !== "ALL" ||
                                                priorityFilter !== "ALL"
                                                    ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                                                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                                            }focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2`}                             
                                        >
                                            <Filter size={16} />
                                            Filters
                                        </button>
                                    </div>

                                    {filtersOpen && (
                                        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 shadow-sm">
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div>
                                                    <label
                                                        htmlFor="task-status-filter"
                                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                                                    >
                                                        Status
                                                    </label>

                                                    <select
                                                        id="task-status-filter"
                                                        value={statusFilter}
                                                        onChange={(event) =>
                                                            setStatusFilter(
                                                                event.target.value as typeof statusFilter
                                                            )
                                                        }
                                                        className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                                    >
                                                        <option value="ALL">
                                                            All statuses
                                                        </option>

                                                        <option value="TODO">
                                                            To Do
                                                        </option>

                                                        <option value="IN_PROGRESS">
                                                            In Progress
                                                        </option>

                                                        <option value="REVIEW">
                                                            Review
                                                        </option>

                                                        <option value="DONE">
                                                            Done
                                                        </option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="task-priority-filter"
                                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                                                    >
                                                        Priority
                                                    </label>

                                                    <select
                                                        id="task-priority-filter"
                                                        value={priorityFilter}
                                                        onChange={(event) =>
                                                            setPriorityFilter(
                                                                event.target.value as typeof priorityFilter
                                                            )
                                                        }
                                                        className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                                    >
                                                        <option value="ALL">
                                                            All priorities
                                                        </option>

                                                        <option value="LOW">
                                                            Low
                                                        </option>

                                                        <option value="MEDIUM">
                                                            Medium
                                                        </option>

                                                        <option value="HIGH">
                                                            High
                                                        </option>

                                                        <option value="URGENT">
                                                            Urgent
                                                        </option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="task-sort"
                                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                                                    >
                                                        Sort
                                                    </label>

                                                    <select
                                                        id="task-sort"
                                                        value={sortBy}
                                                        onChange={(event) =>
                                                            setSortBy(
                                                                event.target.value as typeof sortBy
                                                            )
                                                        }
                                                        className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                                    >
                                                        <option value="updated-desc">
                                                            Recently updated
                                                        </option>

                                                        <option value="created-desc">
                                                            Newest created
                                                        </option>

                                                        <option value="due-asc">
                                                            Due date
                                                        </option>

                                                        <option value="name-asc">
                                                            Task name A–Z
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>

                                            {(search ||
                                                statusFilter !== "ALL" ||
                                                priorityFilter !== "ALL") && (
                                                <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearch("");
                                                            setStatusFilter("ALL");
                                                            setPriorityFilter("ALL");
                                                        }}
                                                        className="text-sm font-medium text-[var(--primary)] hover:underline"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Task table */}
                                    {tasksLoading && (
                                        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                            <div className="divide-y divide-[var(--border)]">
                                                {[1, 2, 3].map((item) => (
                                                    <div
                                                        key={item}
                                                        className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px]"
                                                    >
                                                        <div>
                                                            <div className="h-4 w-48 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                        </div>

                                                        <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                        <div className="h-6 w-16 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                                        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-subtle)]" />
                                                        <div />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!tasksLoading && tasksError && (
                                        <div
                                            role="alert"
                                            className="mt-4 rounded-2xl border border-red-200/80 bg-red-50/80 p-5 shadow-sm text-sm text-red-700"
                                        >
                                            <p>{tasksError}</p>

                                            <button
                                                type="button"
                                                onClick={() => window.location.reload()}
                                                className="mt-3 inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}

                                    {!tasksLoading && !tasksError && filteredTasks.length === 0 && (
                                        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-10 text-center">
                                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                                                <CheckCircle2 size={24} />
                                            </div>

                                            <h2 className="text-base font-semibold">
                                                {tasks.length === 0
                                                    ? "No tasks yet"
                                                    : "No matching tasks"}
                                            </h2>

                                            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                                                {tasks.length === 0
                                                    ? "Add your first task to start organizing and tracking work in this project."
                                                    : "No tasks match your current search and filters. Try changing your criteria."}
                                            </p>

                                            {tasks.length === 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTaskFormError("");
                                                        setTaskTitle("");
                                                        setTaskDescription("");
                                                        setTaskPriority("MEDIUM");
                                                        setTaskDueDate("");
                                                        setCreateTaskModalOpen(true);
                                                    }}
                                                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 shadow-sm text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"
                                                >
                                                    Add your first task
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearch("");
                                                        setStatusFilter("ALL");
                                                        setPriorityFilter("ALL");
                                                    }}
                                                    className="mt-5 inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                >
                                                    Clear search and filters
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {!tasksLoading && !tasksError && filteredTasks.length > 0 && (
                                        <div className="mt-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                            <div className="hidden border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] md:grid md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px] md:gap-4">
                                                <div>Task</div>
                                                <div>Status</div>
                                                <div>Priority</div>
                                                <div>Assignee</div>
                                                <div />
                                            </div>

                                            <div className="divide-y divide-[var(--border)]">
                                                {filteredTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="relative grid w-full gap-4 px-5 py-4 transition-colors duration-150 hover:bg-[var(--surface-subtle)] md:grid-cols-[minmax(0,2fr)_150px_110px_100px_40px] md:items-center"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/projects/${projectId}/tasks/${task.id}`
                                                                )
                                                            }
                                                            className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
                                                        >
                                                            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                                                {task.title}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                                                {task.description ??
                                                                    `Part of ${project?.name ?? "this project"}`}
                                                            </p>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/projects/${projectId}/tasks/${task.id}`
                                                                )
                                                            }
                                                            className="flex items-center gap-2 text-left text-sm text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:text-left"
                                                        >
                                                            {getStatusIcon(task.status)}

                                                            <span>
                                                                {getStatusLabel(task.status)}
                                                            </span>
                                                        </button>

                                                        <div>
                                                            <span
                                                                className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                                                    task.priority === "URGENT"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : task.priority === "HIGH"
                                                                        ? "bg-red-50 text-red-600"
                                                                        : task.priority === "MEDIUM"
                                                                        ? "bg-amber-50 text-amber-600"
                                                                        : "bg-gray-100 text-gray-600"
                                                                }`}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                        </div>

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--primary)]">
                                                            {task.assignee?.name
                                                                ? task.assignee.name
                                                                    .slice(0, 2)
                                                                    .toUpperCase()
                                                                : "—"}
                                                        </div>

                                                        <div className="relative flex justify-end">
                                                            {canManageTasks && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();

                                                                        if (openTaskMenuId === task.id) {
                                                                            setOpenTaskMenuId(null);
                                                                            return;
                                                                        }

                                                                        const buttonRect =
                                                                            event.currentTarget.getBoundingClientRect();

                                                                        const menuHeight = 220;
                                                                        const menuWidth = 176;
                                                                        const spaceBelow =
                                                                            window.innerHeight -
                                                                            buttonRect.bottom;

                                                                        const placement =
                                                                            spaceBelow < menuHeight
                                                                                ? "top"
                                                                                : "bottom";

                                                                        setTaskMenuPlacement(placement);

                                                                        setTaskMenuPosition({
                                                                            top:
                                                                                placement === "top"
                                                                                    ? buttonRect.top - menuHeight
                                                                                    : buttonRect.bottom + 4,
                                                                            left:
                                                                                buttonRect.right - menuWidth,
                                                                        });

                                                                        setOpenTaskMenuId(task.id);
                                                                    }}
                                                                    className="rounded-xl p-2 text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                                                    aria-label={`Actions for ${task.title}`}
                                                                    aria-expanded={
                                                                        openTaskMenuId === task.id
                                                                    }
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>
                                                            )}

                                                            {openTaskMenuId === task.id && (
                                                                <div
                                                                    className={`absolute right-0 z-30 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl ${
                                                                        taskMenuPlacement === "top"
                                                                            ? "bottom-11"
                                                                            : "top-11"
                                                                    }`}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setOpenTaskMenuId(null);

                                                                            router.push(
                                                                                `/projects/${projectId}/tasks/${task.id}`
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                    >
                                                                        Open
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setOpenTaskMenuId(null);

                                                                            router.push(
                                                                                `/projects/${projectId}/tasks/${task.id}`
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setOpenTaskMenuId(null);

                                                                            router.push(
                                                                                `/projects/${projectId}/tasks/${task.id}`
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                    >
                                                                        Change status
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setOpenTaskMenuId(null);

                                                                            router.push(
                                                                                `/projects/${projectId}/tasks/${task.id}`
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                    >
                                                                        Assign
                                                                    </button>

                                                                    {canManageTasks && (
                                                                        <>
                                                                            <div className="my-1 border-t border-[var(--border)]" />

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    void handleArchiveTask(task.id);
                                                                                }}
                                                                                className="flex w-full items-center px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                            >
                                                                                Archive
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeView === "board" && (
                        <div className="mt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                                        Board
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Track tasks by their current status.
                                    </p>
                                </div>

                                <p className="text-xs text-[var(--text-muted)]">
                                    {filteredTasks.length}{" "}
                                    {filteredTasks.length === 1
                                        ? "task"
                                        : "tasks"}
                                </p>
                            </div>

                            <div className="relative overflow-x-auto overflow-y-visible pb-4">
                                <div className="grid min-w-[1000px] grid-cols-4 gap-4">
                                    {[
                                        {
                                            value: "TODO",
                                            label: "To Do",
                                        },
                                        {
                                            value: "IN_PROGRESS",
                                            label: "In Progress",
                                        },
                                        {
                                            value: "REVIEW",
                                            label: "Review",
                                        },
                                        {
                                            value: "DONE",
                                            label: "Done",
                                        },
                                    ].map((column) => {
                                        const columnTasks =
                                            filteredTasks.filter(
                                                (task) =>
                                                    task.status ===
                                                    column.value
                                            );

                                        return (
                                            <div
                                                key={column.value}
                                                className="min-h-[420px] rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3 shadow-sm"
                                            >
                                                <div className="mb-3 flex items-center justify-between px-1">
                                                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                                        {column.label}
                                                    </h3>

                                                    <span className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
                                                        {columnTasks.length}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {columnTasks.length ===
                                                    0 ? (
                                                        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center">
                                                            <p className="text-xs text-[var(--text-muted)]">
                                                                No tasks
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        columnTasks.map((task) => (
                                                            <div
                                                                key={task.id}
                                                                className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 transition hover:border-[var(--primary)]"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            router.push(
                                                                                `/projects/${projectId}/tasks/${task.id}`
                                                                            )
                                                                        }
                                                                        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                                                    >
                                                                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                                                            {task.title}
                                                                        </p>
                                                                    </button>

                                                                    <div className="relative shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();

                                                                                if (
                                                                                    openTaskMenuId === task.id
                                                                                ) {
                                                                                    setOpenTaskMenuId(null);
                                                                                    return;
                                                                                }

                                                                                const buttonRect =
                                                                                    event.currentTarget.getBoundingClientRect();

                                                                                const menuHeight = 220;
                                                                                const spaceBelow =
                                                                                    window.innerHeight -
                                                                                    buttonRect.bottom;

                                                                                setTaskMenuPlacement(
                                                                                    spaceBelow < menuHeight
                                                                                        ? "top"
                                                                                        : "bottom"
                                                                                );

                                                                                setOpenTaskMenuId(task.id);
                                                                            }}
                                                                            className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                                                            aria-label={`Actions for ${task.title}`}
                                                                            aria-expanded={
                                                                                openTaskMenuId === task.id
                                                                            }
                                                                        >
                                                                            <MoreHorizontal size={17} />
                                                                        </button>

                                                                        {openTaskMenuId === task.id && (
                                                                            <div
                                                                                className="fixed z-[100] w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl"
                                                                                style={{
                                                                                    top: taskMenuPosition.top,
                                                                                    left: taskMenuPosition.left,
                                                                                }}
                                                                            >
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setOpenTaskMenuId(null);

                                                                                        router.push(
                                                                                            `/projects/${projectId}/tasks/${task.id}`
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                                >
                                                                                    Open
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setOpenTaskMenuId(null);

                                                                                        router.push(
                                                                                            `/projects/${projectId}/tasks/${task.id}`
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                                >
                                                                                    Edit
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setOpenTaskMenuId(null);

                                                                                        router.push(
                                                                                            `/projects/${projectId}/tasks/${task.id}`
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                                >
                                                                                    Change status
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setOpenTaskMenuId(null);

                                                                                        router.push(
                                                                                            `/projects/${projectId}/tasks/${task.id}`
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                                                                >
                                                                                    Assign
                                                                                </button>

                                                                                {canManageTasks && (
                                                                                    <>
                                                                                        <div className="my-1 border-t border-[var(--border)]" />

                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                void handleArchiveTask(task.id);
                                                                                            }}
                                                                                            className="flex w-full items-center px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                                        >
                                                                                            Archive
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <span
                                                                    className={`mt-3 inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${
                                                                        task.priority === "URGENT"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : task.priority === "HIGH"
                                                                            ? "bg-red-50 text-red-600"
                                                                            : task.priority === "MEDIUM"
                                                                            ? "bg-amber-50 text-amber-600"
                                                                            : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                                >
                                                                    {task.priority === "URGENT"
                                                                        ? "Urgent"
                                                                        : task.priority === "HIGH"
                                                                        ? "High"
                                                                        : task.priority === "MEDIUM"
                                                                        ? "Medium"
                                                                        : "Low"}
                                                                </span>

                                                                {task.description && (
                                                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                                                                        {task.description}
                                                                    </p>
                                                                )}

                                                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[10px] font-semibold text-[var(--text-secondary)]">
                                                                            {task.assignee?.name
                                                                                ? task.assignee.name
                                                                                    .slice(0, 2)
                                                                                    .toUpperCase()
                                                                                : "—"}
                                                                        </div>

                                                                        <span className="truncate text-xs text-[var(--text-secondary)]">
                                                                            {task.assignee?.name ??
                                                                                "Unassigned"}
                                                                        </span>
                                                                    </div>

                                                                    {task.dueDate && (
                                                                        <span className="shrink-0 text-xs text-[var(--text-muted)]">
                                                                            {new Date(
                                                                                task.dueDate
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="mt-3">
                                                                    <label
                                                                        htmlFor={`task-status-${task.id}`}
                                                                        className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]"
                                                                    >
                                                                        Status
                                                                    </label>

                                                                    <select
                                                                        id={`task-status-${task.id}`}
                                                                        value={task.status}
                                                                        onChange={(event) => {
                                                                            void handleTaskStatusChange(
                                                                                task.id,
                                                                                event.target.value
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            updatingTaskId === task.id
                                                                        }
                                                                        className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        <option value="TODO">
                                                                            To Do
                                                                        </option>

                                                                        <option value="IN_PROGRESS">
                                                                            In Progress
                                                                        </option>

                                                                        <option value="REVIEW">
                                                                            Review
                                                                        </option>

                                                                        <option value="DONE">
                                                                            Done
                                                                        </option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === "activity" && (
                        <div className="mt-6">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                                    Activity
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Recent activity grouped by task.
                                </p>
                            </div>

                            {activitiesLoading && (
                                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6">
                                    <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                    <div className="mt-4 h-3 w-64 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                    <div className="mt-3 h-3 w-48 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                </div>
                            )}

                            {activitiesError && (
                                <div
                                    role="alert"
                                    className="rounded-2xl border border-red-200/80 bg-red-50/80 p-5 shadow-sm"
                                >
                                    <p className="text-sm font-medium text-red-800">
                                        Unable to load activity.
                                    </p>

                                    <p className="mt-1 text-sm text-red-700">
                                        {activitiesError}
                                    </p>
                                </div>
                            )}

                            {!activitiesLoading &&
                                !activitiesError &&
                                tasks.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-sm">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            No tasks yet
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Activity will appear here once tasks are created.
                                        </p>
                                    </div>
                                )}

                            {!activitiesLoading &&
                                !activitiesError &&
                                tasks.length > 0 && (
                                    <div className="space-y-5">
                                        {tasks.map((task) => {
                                            const taskActivities =
                                                activities
                                                    .filter(
                                                        (activity) =>
                                                            activity.taskId ===
                                                            task.id
                                                    )
                                                    .sort(
                                                        (first, second) =>
                                                            new Date(
                                                                second.createdAt
                                                            ).getTime() -
                                                            new Date(
                                                                first.createdAt
                                                            ).getTime()
                                                    );

                                            return (
                                                <div
                                                    key={task.id}
                                                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                                                >
                                                    <div className="border-b border-[var(--border)] px-5 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/projects/${projectId}/tasks/${task.id}`
                                                                )
                                                            }
                                                            className="text-left text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--primary)]"
                                                        >
                                                            {task.title}
                                                        </button>

                                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                            {taskActivities.length}{" "}
                                                            {taskActivities.length ===
                                                            1
                                                                ? "activity"
                                                                : "activities"}
                                                        </p>
                                                    </div>

                                                    {taskActivities.length ===
                                                    0 ? (
                                                        <div className="px-5 py-6">
                                                            <p className="text-sm text-[var(--text-muted)]">
                                                                No activity yet.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-[var(--border)]">
                                                            {taskActivities.map(
                                                                (activity) => (
                                                                    <div
                                                                        key={
                                                                            activity.id
                                                                        }
                                                                        className="flex gap-3 px-5 py-4 transition-colors hover:bg-[var(--surface-subtle)]"
                                                                    >
                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
                                                                            {activity
                                                                                .user
                                                                                .name
                                                                                .slice(
                                                                                    0,
                                                                                    2
                                                                                )
                                                                                .toUpperCase()}
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <p className="text-sm text-[var(--text-primary)]">
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        activity
                                                                                            .user
                                                                                            .name
                                                                                    }
                                                                                </span>{" "}
                                                                                {getActivityMessage(
                                                                                    activity
                                                                                )}
                                                                            </p>

                                                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                                                {new Date(
                                                                                    activity.createdAt
                                                                                ).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                        </div>
                    )}

                    {activeView === "archived" && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="border-b border-[var(--border)] px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-[var(--text-primary)]">
                                            Archived Tasks
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            Tasks that have been archived from this project.
                                        </p>
                                    </div>

                                    <div className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                                        {archivedTasks.length} archived
                                    </div>
                                </div>
                            </div>

                            {archivedLoading ? (
                                <div className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">
                                    Loading archived tasks...
                                </div>
                            ) : archivedTasks.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                                        No archived tasks
                                    </p>

                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Tasks you archive will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border)]">
                                    {archivedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between gap-4 px-5 py-4"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                                    {task.title}
                                                </h3>

                                                {task.description && (
                                                    <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                                    <span className="inline-flex items-center gap-1">
                                                        {getStatusIcon(task.status)}
                                                        {getStatusLabel(task.status)}
                                                    </span>

                                                    <span>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRestoreTask(task.id)
                                                }
                                                disabled={
                                                    updatingTaskId === task.id
                                                }
                                                className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-sm transition-colors duration-150 hover:border-[var(--primary)] hover:bg-[var(--surface-subtle)]"
                                            >
                                                {updatingTaskId === task.id
                                                    ? "Restoring..."
                                                    : "Restore"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}                                        

                    {createTaskModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-md">
                            <button
                                type="button"
                                aria-label="Close create task dialog"
                                onClick={() =>
                                    setCreateTaskModalOpen(false)
                                }
                                className="absolute inset-0 cursor-default"
                            />

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="create-task-title"
                                className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7"
                            >
                                <div className="mb-5">
                                    <h2
                                        id="create-task-title"
                                        className="text-xl font-bold tracking-tight"
                                    >
                                        Create a new task
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Add a task to this project and start
                                        tracking progress.
                                    </p>
                                </div>

                                {taskFormError && (
                                    <div
                                        role="alert"
                                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {taskFormError}
                                    </div>
                                )}

                                <form
                                    onSubmit={handleCreateTask}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="create-task-title"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Task title
                                        </label>

                                        <input
                                            id="create-task-title"
                                            type="text"
                                            value={taskTitle}
                                            onChange={(event) =>
                                                setTaskTitle(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="e.g. Create login screen"
                                            required
                                            autoFocus
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="create-task-description"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="create-task-description"
                                            value={taskDescription}
                                            onChange={(event) =>
                                                setTaskDescription(
                                                    event.target.value
                                                )
                                            }
                                            rows={3}
                                            placeholder="Describe the work to be done..."
                                            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="create-task-priority"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Priority
                                            </label>

                                            <select
                                                id="create-task-priority"
                                                value={taskPriority}
                                                onChange={(event) =>
                                                    setTaskPriority(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                            >
                                                <option value="LOW">
                                                    Low
                                                </option>
                                                <option value="MEDIUM">
                                                    Medium
                                                </option>
                                                <option value="HIGH">
                                                    High
                                                </option>
                                                <option value="URGENT">
                                                    Urgent
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="create-task-due-date"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Due date
                                            </label>

                                            <input
                                                id="create-task-due-date"
                                                type="date"
                                                value={taskDueDate}
                                                onChange={(event) =>
                                                    setTaskDueDate(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="create-task-assignee"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Assignee
                                            </label>

                                            <select
                                                id="create-task-assignee"
                                                value={taskAssigneeId}
                                                onChange={(event) =>
                                                    setTaskAssigneeId(event.target.value)
                                                }
                                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                            >
                                                <option value="">
                                                    Unassigned
                                                </option>

                                                {organizationMembers.map((member) => (
                                                    <option
                                                        key={member.userId}
                                                        value={member.userId}
                                                    >
                                                        {member.user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCreateTaskModalOpen(false)
                                            }
                                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                savingTask ||
                                                !taskTitle.trim()
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {savingTask
                                                ? "Creating..."
                                                : "Create task"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {editProjectModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                            <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-7">
                                <div className="mb-5">
                                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                        Edit Project
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Update the project name and description.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleUpdateProject}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="project-name"
                                            className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
                                        >
                                            Project name
                                        </label>

                                        <input
                                            id="project-name"
                                            type="text"
                                            value={projectName}
                                            onChange={(event) =>
                                                setProjectName(
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="project-description"
                                            className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="project-description"
                                            value={projectDescription}
                                            onChange={(event) =>
                                                setProjectDescription(
                                                    event.target.value
                                                )
                                            }
                                            rows={4}
                                            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                                        />
                                    </div>

                                    {projectFormError && (
                                        <p className="text-sm text-red-600">
                                            {projectFormError}
                                        </p>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditProjectModalOpen(
                                                    false
                                                )
                                            }
                                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-subtle)]"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={savingProject}
                                            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 shadow-sm text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {savingProject
                                                ? "Saving..."
                                                : "Save changes"}
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