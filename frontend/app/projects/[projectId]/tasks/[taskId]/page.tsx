"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import {
    createComment,
    getTask,
    getOrganization,
    getTaskActivities,
    getTaskComments,
    updateTask,
    getTaskMembers,
    addTaskMember,
    removeTaskMember,
    type Task,
    type TaskActivity,
    type TaskComment,
    type TaskMember,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Circle,
    Pencil,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

function formatStatus(status: string) {
    switch (status) {
        case "TODO":
            return "To Do";
        case "IN_PROGRESS":
            return "In Progress";
        case "REVIEW":
            return "Review";
        case "DONE":
            return "Done";
        default:
            return status;
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case "DONE":
            return <CheckCircle2 size={18} />;
        case "IN_PROGRESS":
        case "REVIEW":
            return <Clock3 size={18} />;
        default:
            return <Circle size={18} />;
    }
}

function formatPriority(priority: string) {
    switch (priority) {
        case "LOW":
            return "Low";
        case "MEDIUM":
            return "Medium";
        case "HIGH":
            return "High";
        case "URGENT":
            return "Urgent";
        default:
            return priority;
    }
}

function getPriorityClass(priority: string) {
    switch (priority) {
        case "HIGH":
            return "bg-red-50 text-red-600";
        case "URGENT":
            return "bg-red-100 text-red-700";
        case "MEDIUM":
            return "bg-amber-50 text-amber-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}

export default function TaskDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const taskId = params.taskId as string;

    const { user } = useAuth();
    const [canEditTask, setCanEditTask] = useState(false);
    const [organizationMembers, setOrganizationMembers] =
        useState<
            {
                id: string;
                userId: string;
                role: string;
                user: {
                    id: string;
                    name: string;
                    email: string;
                };
            }[]
        >([]);

    const [taskMembers, setTaskMembers] = useState<TaskMember[]>([]);
    const [addingTaskMember, setAddingTaskMember] = useState(false);
    const [removingTaskMember, setRemovingTaskMember] = useState<string | null>(null);
    const [selectedTaskMember, setSelectedTaskMember] = useState("");
    const [taskMemberError, setTaskMemberError] = useState("");   

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState("MEDIUM");
    const [taskStatus, setTaskStatus] = useState("TODO");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskAssigneeId, setTaskAssigneeId] = useState("");
    const [savingTask, setSavingTask] = useState(false);
    const [taskFormError, setTaskFormError] = useState("");

    const editTaskTitleRef = useRef<HTMLInputElement>(null);
    const editTaskModalRef = useRef<HTMLDivElement>(null);
    const editTaskButtonRef = useRef<HTMLButtonElement>(null);
    const wasEditTaskModalOpenRef = useRef(false);

    const [comments, setComments] = useState<TaskComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState("");

    useEffect(() => {
        async function loadTask() {
            const token = getToken();

            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                setCommentsLoading(false);
                setActivitiesLoading(false);
                return;
            }

            if (!taskId) {
                setError("Task ID is missing.");
                setLoading(false);
                setCommentsLoading(false);
                setActivitiesLoading(false);
                return;
            }

            setLoading(true);
            setCommentsLoading(true);
            setActivitiesLoading(true);

            setError("");
            setCommentsError("");
            setActivitiesError("");
            setTaskMemberError("");

            try {
                const taskResult = await getTask(
                    taskId,
                    token
                );

                setTask(taskResult);

                const organizationId =
                    taskResult.project?.organizationId;

                if (organizationId) {
                    try {
                        const organization =
                            await getOrganization(
                                organizationId,
                                token
                            );

                        setOrganizationMembers(
                            organization.members
                        );
                    } catch (error) {
                        console.error(
                            "Failed to load organization members:",
                            error
                        );

                        setOrganizationMembers([]);
                        setCanEditTask(false);
                    }
                } else {
                    setOrganizationMembers([]);
                    setCanEditTask(false);
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load task details.";

                setError(message);

                setLoading(false);
                setCommentsLoading(false);
                setActivitiesLoading(false);

                return;
            } finally {
                setLoading(false);
            }

            try {
                const commentsResult =
                    await getTaskComments(
                        taskId,
                        token
                    );

                setComments(commentsResult);
                setCommentsError("");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load comments.";

                console.error(
                    "Failed to load task comments:",
                    error
                );

                setCommentsError(message);
            } finally {
                setCommentsLoading(false);
            }

            try {
                const activitiesResult =
                    await getTaskActivities(
                        taskId,
                        token
                    );

                setActivities(activitiesResult);
                setActivitiesError("");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load activities.";

                console.error(
                    "Failed to load task activities:",
                    error
                );

                setActivitiesError(message);
            } finally {
                setActivitiesLoading(false);
            }

            try {
                const taskMembersResult =
                    await getTaskMembers(
                        taskId,
                        token
                    );

                setTaskMembers(taskMembersResult);
                setTaskMemberError("");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load task members.";

                console.error(
                    "Failed to load task members:",
                    error
                );

                setTaskMembers([]);
                setTaskMemberError(message);
            }
        }

        void loadTask();
    }, [taskId, user?.id]);

    useEffect(() => {
        if (!user?.id) {
            setCanEditTask(false);
            return;
        }

        const membership = organizationMembers.find(
            (member) =>
                member.userId === user.id
        );

        setCanEditTask(
            membership?.role === "OWNER" ||
            membership?.role === "ADMIN"
        );
    }, [organizationMembers, user?.id]);

    function openEditTask() {
        if (!task) {
            return;
        }

        setTaskTitle(task.title);
        setTaskDescription(
            task.description ?? ""
        );

        setTaskAssigneeId(
            task.assigneeId ?? ""
        );

        setTaskStatus(task.status);
        setTaskPriority(task.priority);

        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);

            const year = dueDate.getFullYear();
            const month = String(
                dueDate.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                dueDate.getDate()
            ).padStart(2, "0");

            setTaskDueDate(
                `${year}-${month}-${day}`
            );
        } else {
            setTaskDueDate("");
        }

        setTaskFormError("");
        setEditTaskModalOpen(true);
    }

    useEffect(() => {
        if (!editTaskModalOpen) {
            return;
        }

        editTaskTitleRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                if (!savingTask) {
                    setEditTaskModalOpen(false);
                }

                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const modal = editTaskModalRef.current;

            if (!modal) {
                return;
            }

            const focusableElements =
                modal.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
                );

            if (focusableElements.length === 0) {
                return;
            }

            const firstElement =
                focusableElements[0];

            const lastElement =
                focusableElements[
                    focusableElements.length - 1
                ];

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [editTaskModalOpen, savingTask]);

    useEffect(() => {
        if (editTaskModalOpen) {
            wasEditTaskModalOpenRef.current = true;
            return;
        }

        if (!wasEditTaskModalOpenRef.current) {
            return;
        }

        wasEditTaskModalOpenRef.current = false;

        editTaskButtonRef.current?.focus();
    }, [editTaskModalOpen]);

    async function handleUpdateTask(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            setTaskFormError("Authentication required.");
            return;
        }

        if (!task) {
            setTaskFormError("Task data is unavailable.");
            return;
        }

        if (!taskTitle.trim()) {
            setTaskFormError("Task title is required.");
            return;
        }

        setSavingTask(true);
        setTaskFormError("");

        try {
            const updatedTask =
                await updateTask(
                    task.id,
                    token,
                    {
                        title: taskTitle.trim(),
                        description:
                            taskDescription.trim()
                                ? taskDescription.trim()
                                : null,
                        status: taskStatus,
                        priority: taskPriority,
                        dueDate: taskDueDate
                            ? new Date(
                                `${taskDueDate}T00:00:00`
                            ).toISOString()
                            : null,
                        assigneeId: taskAssigneeId
                            ? taskAssigneeId
                            : null,
                    }
                );

            setTask(updatedTask);

            try {
                const updatedActivities =
                    await getTaskActivities(
                        taskId,
                        token
                    );

                setActivities(updatedActivities);
                setActivitiesError("");
            } catch (error) {
                console.error(
                    "Failed to refresh task activities:",
                    error
                );
            }

            setEditTaskModalOpen(false);

            setTaskTitle("");
            setTaskDescription("");
            setTaskStatus("TODO");
            setTaskPriority("MEDIUM");
            setTaskDueDate("");
        } catch (error) {
            setTaskFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to update task."
            );
        } finally {
            setSavingTask(false);
        }
    }

    async function handleCreateComment(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = getToken();

        const content = commentText.trim();

        if (!token) {
            setCommentsError(
                "Authentication required."
            );
            return;
        }

        if (!content) {
            return;
        }

        setSubmittingComment(true);
        setCommentsError("");

        try {
            const newComment =
                await createComment(
                    taskId,
                    token,
                    content
                );

            setComments((currentComments) => [
                ...currentComments,
                newComment,
            ]);

            try {
                const updatedActivities =
                    await getTaskActivities(
                        taskId,
                        token
                    );

                setActivities(updatedActivities);
                setActivitiesError("");
            } catch (error) {
                console.error(
                    "Failed to refresh task activities:",
                    error
                );
            }

            setCommentText("");
        } catch (error) {
            setCommentsError(
                error instanceof Error
                    ? error.message
                    : "Failed to add comment."
            );
        } finally {
            setSubmittingComment(false);
        }
    }

    async function handleAddTaskMember() {
        const token = getToken();

        if (!selectedTaskMember || !token) {
            return;
        }

        setAddingTaskMember(true);
        setTaskMemberError("");

        try {
            const member = await addTaskMember(
                taskId,
                selectedTaskMember,
                token
            );

            setTaskMembers((current) => [
                ...current,
                member,
            ]);

            setSelectedTaskMember("");
        } catch (error) {
            setTaskMemberError(
                error instanceof Error
                    ? error.message
                    : "Failed to add task member"
            );
        } finally {
            setAddingTaskMember(false);
        }
    }

    async function handleRemoveTaskMember(
        userId: string
    ) {
        const token = getToken();

        if (!token) {
            return;
        }

        setRemovingTaskMember(userId);
        setTaskMemberError("");

        try {
            await removeTaskMember(
                taskId,
                userId,
                token
            );

            setTaskMembers((current) =>
                current.filter(
                    (member) =>
                        member.userId !== userId
                )
            );
        } catch (error) {
            setTaskMemberError(
                error instanceof Error
                    ? error.message
                    : "Failed to remove task member"
            );
        } finally {
            setRemovingTaskMember(null);
        }
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

            case "STATUS_CHANGED":
                return "changed the task status";

            default:
                return activity.action
                    .toLowerCase()
                    .replace(/_/g, " ");
        }
    }

    const availableTaskMembers = organizationMembers.filter(
        (member) =>
            member.userId !== task?.assigneeId &&
            !taskMembers.some(
                (taskMember) =>
                    taskMember.userId ===
                    member.userId
            )
    );

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="w-full max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href={`/projects/${projectId}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Project
                        </Link>
                    </div>

                    {loading && (
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                            <div className="h-4 w-20 animate-pulse rounded bg-[var(--surface-subtle)]" />

                            <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-[var(--surface-subtle)]" />

                            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-subtle)]" />
                        </div>
                    )}

                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-2xl border border-red-200 bg-red-50 p-6"
                        >
                            <h2 className="text-base font-semibold text-red-800">
                                Unable to load task
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>

                            <Link
                                href={`/projects/${projectId}`}
                                className="mt-4 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                            >
                                Back to Project
                            </Link>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        task && (
                            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="border-b border-[var(--border)] p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                                Task
                                            </p>

                                            <h1 className="mt-2 text-2xl font-bold tracking-tight">
                                                {task.title}
                                            </h1>
                                        </div>
                                        {canEditTask && (
                                            <button
                                                ref={editTaskButtonRef}
                                                type="button"
                                                onClick={openEditTask}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)]">
                                            {getStatusIcon(
                                                task.status
                                            )}

                                            {formatStatus(
                                                task.status
                                            )}
                                        </span>

                                        <span
                                            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ${getPriorityClass(
                                                task.priority
                                            )}`}
                                        >
                                            {formatPriority(
                                                task.priority
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Description
                                        </h2>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                                            {task.description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                                        <div className="rounded-xl border border-[var(--border)] p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                                <CalendarDays size={15} />
                                                Due Date
                                            </div>

                                            <p className="mt-2 text-sm font-medium">
                                                {task.dueDate
                                                    ? new Date(
                                                          task.dueDate
                                                      ).toLocaleDateString()
                                                    : "No due date"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)] p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                                Assignee
                                            </p>

                                            <p className="mt-2 text-sm font-medium">
                                                {task.assignee?.name ||
                                                    "Unassigned"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 border-t border-[var(--border)] pt-5">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Task ID
                                        </p>

                                        <p className="mt-1 break-all text-sm text-[var(--text-secondary)]">
                                            {task.id}
                                        </p>
                                    </div>

                                </div>
                                <div className="border-t border-slate-200 pt-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Collaborators
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                People working on this task
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {taskMembers.length === 0 ? (
                                            <p className="text-sm text-slate-500">
                                                No additional collaborators.
                                            </p>
                                        ) : (
                                            taskMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                                            {member.user.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-slate-900">
                                                                {member.user.name}
                                                            </p>

                                                            <p className="truncate text-xs text-slate-500">
                                                                {member.user.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {canEditTask && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                removingTaskMember === member.userId
                                                            }
                                                            onClick={() =>
                                                                handleRemoveTaskMember(
                                                                    member.userId
                                                                )
                                                            }
                                                            className="ml-3 shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {removingTaskMember === member.userId
                                                                ? "Removing..."
                                                                : "Remove"}
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {canEditTask && (
                                        <div className="mt-4">
                                            <div className="flex gap-2">
                                                <select
                                                    value={selectedTaskMember}
                                                    onChange={(event) =>
                                                        setSelectedTaskMember(
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={availableTaskMembers.length === 0}
                                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                >
                                                    <option value="">
                                                        {availableTaskMembers.length === 0
                                                            ? "No collaborators available"
                                                            : "Add a collaborator"}
                                                    </option>

                                                    {availableTaskMembers.map((member) => (
                                                        <option
                                                            key={member.userId}
                                                            value={member.userId}
                                                        >
                                                            {member.user.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        !selectedTaskMember ||
                                                        addingTaskMember
                                                    }
                                                    onClick={handleAddTaskMember}
                                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {addingTaskMember
                                                        ? "Adding..."
                                                        : "Add"}
                                                </button>
                                            </div>

                                            {taskMemberError && (
                                                <p className="mt-2 text-xs text-red-600">
                                                    {taskMemberError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <h2 className="text-lg font-semibold">
                                Comments
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Discuss this task with your team.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6">
                            {commentsLoading && (
                                <div className="space-y-4">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="flex gap-3"
                                        >
                                            <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--surface-subtle)]" />

                                            <div className="flex-1">
                                                <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!commentsLoading &&
                                commentsError && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {commentsError}
                                    </div>
                                )}

                            {!commentsLoading &&
                                !commentsError &&
                                comments.length === 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-sm font-medium">
                                            No comments yet
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Start the conversation about this task.
                                        </p>
                                    </div>
                                )}

                            {!commentsLoading &&
                                !commentsError &&
                                comments.length > 0 && (
                                    <div className="space-y-6">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="flex gap-3"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--primary)]">
                                                    {comment.user.name
                                                        .trim()
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-baseline gap-2">
                                                        <p className="text-sm font-semibold">
                                                            {comment.user.name}
                                                        </p>

                                                        <p className="text-xs text-[var(--text-muted)]">
                                                            {new Date(
                                                                comment.createdAt
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)] [overflow-wrap:anywhere]">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            <form
                                onSubmit={handleCreateComment}
                                className="mt-8 border-t border-[var(--border)] pt-6"
                            >
                                <label
                                    htmlFor="task-comment"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Add a comment
                                </label>

                                <textarea
                                    id="task-comment"
                                    value={commentText}
                                    onChange={(event) =>
                                        setCommentText(
                                            event.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Write a comment..."
                                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10 focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                />
                            
                                <div className="mt-1 flex justify-end">
                                    <span
                                        className={`text-xs ${
                                            commentText.length > 500
                                                ? "text-red-600"
                                                : "text-[var(--text-muted)]"
                                        }`}
                                    >
                                        {commentText.length}/500
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={
                                            submittingComment ||
                                            !commentText.trim() ||
                                            commentText.length > 500
                                        }
                                        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submittingComment
                                            ? "Posting..."
                                            : "Post comment"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <h2 className="text-lg font-semibold">
                                Activity
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                A history of changes and actions on this task.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6">
                            {activitiesLoading && (
                                <div className="space-y-6">
                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="flex gap-3"
                                        >
                                            <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--surface-subtle)]" />

                                            <div className="flex-1">
                                                <div className="h-4 w-64 animate-pulse rounded bg-[var(--surface-subtle)]" />

                                                <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[var(--surface-subtle)]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!activitiesLoading &&
                                activitiesError && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {activitiesError}
                                    </div>
                                )}

                            {!activitiesLoading &&
                                !activitiesError &&
                                activities.length === 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-sm font-medium">
                                            No activity yet
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Changes to this task will appear here.
                                        </p>
                                    </div>
                                )}

                            {!activitiesLoading &&
                                !activitiesError &&
                                activities.length > 0 && (
                                    <div className="relative">
                                        <div className="absolute bottom-0 left-4 top-0 w-px bg-[var(--border)]" />

                                        <div className="space-y-7">
                                            {activities.map(
                                                (activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className="relative flex gap-3 sm:gap-4"
                                                    >
                                                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--primary)]">
                                                            {activity.user.name
                                                                .trim()
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0 flex-1 pt-0.5">
                                                            <div className="flex flex-wrap items-baseline gap-1.5">
                                                                <span className="text-sm font-semibold">
                                                                    {
                                                                        activity
                                                                            .user
                                                                            .name
                                                                    }
                                                                </span>

                                                                <span className="text-sm text-[var(--text-secondary)]">
                                                                    {getActivityMessage(
                                                                        activity
                                                                    )}
                                                                </span>
                                                            </div>

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
                                    </div>
                                )}
                        </div>
                    </div>

                    {editTaskModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
                            <button
                                type="button"
                                aria-label="Close edit task dialog"
                                onClick={() =>{
                                    if (!savingTask) {
                                        setEditTaskModalOpen(false);
                                    }
                                }}
                                className="absolute inset-0 cursor-default"
                            />

                            <div
                                ref={editTaskModalRef}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="edit-task-title"
                                className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl sm:p-7"
                            >
                                <div className="mb-5">
                                    <h2
                                        id="edit-task-title"
                                        className="text-xl font-bold tracking-tight"
                                    >
                                        Edit task
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Update the task details and progress.
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
                                    onSubmit={handleUpdateTask}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="edit-task-title"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Task title
                                        </label>

                                        <input
                                            ref={editTaskTitleRef}
                                            id="edit-task-title"
                                            type="text"
                                            value={taskTitle}
                                            onChange={(event) =>
                                                setTaskTitle(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edit-task-description"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="edit-task-description"
                                            value={taskDescription}
                                            onChange={(event) =>
                                                setTaskDescription(
                                                    event.target.value
                                                )
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <label
                                                htmlFor="edit-task-status"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Status
                                            </label>

                                            <select
                                                id="edit-task-status"
                                                value={taskStatus}
                                                onChange={(event) =>
                                                    setTaskStatus(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]"
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

                                        <div>
                                            <label
                                                htmlFor="edit-task-priority"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Priority
                                            </label>

                                            <select
                                                id="edit-task-priority"
                                                value={taskPriority}
                                                onChange={(event) =>
                                                    setTaskPriority(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]"
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
                                                htmlFor="task-assignee"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Assignee
                                            </label>

                                            <select
                                                id="task-assignee"
                                                value={taskAssigneeId}
                                                onChange={(event) =>
                                                    setTaskAssigneeId(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                                            >
                                                <option value="">
                                                    Unassigned
                                                </option>

                                                {organizationMembers.map(
                                                    (member) => (
                                                        <option
                                                            key={member.userId}
                                                            value={member.userId}
                                                        >
                                                            {member.user.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="edit-task-due-date"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Due date
                                            </label>

                                            <input
                                                id="edit-task-due-date"
                                                type="date"
                                                value={taskDueDate}
                                                onChange={(event) =>
                                                    setTaskDueDate(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!savingTask) {
                                                    setEditTaskModalOpen(false);
                                                }
                                            }}
                                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                savingTask ||
                                                !taskTitle.trim()
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                        >
                                            {savingTask
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