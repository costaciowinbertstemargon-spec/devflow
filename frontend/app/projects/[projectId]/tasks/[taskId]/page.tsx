"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    createComment,
    getTask,
    getTaskActivities,
    getTaskComments,
    updateTask,
    type Task,
    type TaskActivity,
    type TaskComment,
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
import { useEffect, useState } from "react";

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

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState("MEDIUM");
    const [taskStatus, setTaskStatus] = useState("TODO");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [savingTask, setSavingTask] = useState(false);
    const [taskFormError, setTaskFormError] = useState("");

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
            const token =
                localStorage.getItem(
                    "devflow_token"
                );

            if (!token) {
                setError(
                    "Authentication required."
                );
                setLoading(false);
                return;
            }

            if (!taskId) {
                setError(
                    "Task ID is missing."
                );
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const [
                    taskResult,
                    commentsResult,
                    activitiesResult,
                ] = await Promise.all([
                    getTask(taskId, token),
                    getTaskComments(taskId, token),
                    getTaskActivities(
                        taskId,
                        token
                    ),
                ]);

                setTask(taskResult);
                setComments(commentsResult);
                setActivities(activitiesResult);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load task details.";

                setError(message);
                setCommentsError(message);
                setActivitiesError(message);
            } finally {
                setLoading(false);
                setCommentsLoading(false);
                setActivitiesLoading(false);
            }
        }

        void loadTask();
    }, [taskId]);

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
                    }
                );

            setTask(updatedTask);
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

    function openEditTask() {
        if (!task) {
            return;
        }

        setTaskTitle(task.title);
        setTaskDescription(
            task.description ?? ""
        );
        setTaskStatus(task.status);
        setTaskPriority(task.priority);

        setTaskDueDate(
            task.dueDate
                ? new Date(task.dueDate)
                    .toISOString()
                    .slice(0, 10)
                : ""
        );

        setTaskFormError("");
        setEditTaskModalOpen(true);
    }

    async function handleCreateComment(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = localStorage.getItem(
            "devflow_token"
        );

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

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="w-full max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href={`/projects/${projectId}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
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

                                        <button
                                            type="button"
                                            onClick={openEditTask}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </button>
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
                                                {task.assigneeId ||
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

                                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
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
                                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                />

                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={
                                            submittingComment ||
                                            !commentText.trim()
                                        }
                                        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
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
                                                        className="relative flex gap-4"
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
                                onClick={() =>
                                    setEditTaskModalOpen(false)
                                }
                                className="absolute inset-0 cursor-default"
                            />

                            <div
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
                                            onClick={() =>
                                                setEditTaskModalOpen(false)
                                            }
                                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)]"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                savingTask ||
                                                !taskTitle.trim()
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
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