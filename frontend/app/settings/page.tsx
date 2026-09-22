"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { updateProfile } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Save,
    UserCircle,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [profilePassword, setProfilePassword] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showProfilePassword, setShowProfilePassword] =
        useState(false);

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [profileLoading, setProfileLoading] =
        useState(false);

    const [passwordLoading, setPasswordLoading] =
        useState(false);

    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] =
        useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    async function handleProfileSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = localStorage.getItem(
            "devflow_token"
        );

        if (!token) {
            setProfileError(
                "Authentication required."
            );
            return;
        }

        setProfileError("");
        setProfileSuccess("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail) {
            setProfileError(
                "Name and email are required."
            );
            return;
        }

        if (
            user &&
            trimmedEmail !== user.email &&
            !profilePassword
        ) {
            setProfileError(
                "Current password is required when changing your email."
            );
            return;
        }

        setProfileLoading(true);

        try {
            const updatedUser =
                await updateProfile(
                    {
                        name: trimmedName,
                        email: trimmedEmail,
                        ...(profilePassword && {
                            currentPassword:
                                profilePassword,
                        }),
                    },
                    token
                );

            await refreshUser();

            setName(updatedUser.name);
            setEmail(updatedUser.email);
            setProfilePassword("");
            setProfileSuccess(
                "Profile updated successfully."
            );
        } catch (error) {
            setProfileError(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile."
            );
        } finally {
            setProfileLoading(false);
        }
    }

    async function handlePasswordSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = localStorage.getItem(
            "devflow_token"
        );

        if (!token) {
            setPasswordError(
                "Authentication required."
            );
            return;
        }

        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword) {
            setPasswordError(
                "Current password is required."
            );
            return;
        }

        if (!newPassword) {
            setPasswordError(
                "New password is required."
            );
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(
                "New passwords do not match."
            );
            return;
        }

        setPasswordLoading(true);

        try {
            await updateProfile(
                {
                    currentPassword,
                    newPassword,
                },
                token
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setPasswordSuccess(
                "Password changed successfully."
            );
        } catch (error) {
            setPasswordError(
                error instanceof Error
                    ? error.message
                    : "Failed to change password."
            );
        } finally {
            setPasswordLoading(false);
        }
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="w-full mx-auto max-w-5xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Settings
                        </h1>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Manage your profile and account security.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Profile */}
                        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                                        <UserCircle size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold">
                                            Profile
                                        </h2>

                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Update your personal information.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={handleProfileSubmit}
                                className="space-y-5 p-5 sm:p-6"
                            >
                                {profileError && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {profileError}
                                    </div>
                                )}

                                {profileSuccess && (
                                    <div
                                        role="status"
                                        className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                                    >
                                        <CheckCircle2 size={16} />
                                        {profileSuccess}
                                    </div>
                                )}

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Full name
                                        </label>

                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(event) =>
                                                setName(
                                                    event.target.value
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10 focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Email address
                                        </label>

                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10 focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="profile-password"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Current password
                                        <span className="ml-2 font-normal text-[var(--text-muted)]">
                                            required only when changing email
                                        </span>
                                    </label>

                                    <div className="relative max-w-xl">
                                        <input
                                            id="profile-password"
                                            type={
                                                showProfilePassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={profilePassword}
                                            onChange={(event) =>
                                                setProfilePassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter current password"
                                            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowProfilePassword(
                                                    !showProfilePassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                            aria-label={
                                                showProfilePassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showProfilePassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end border-t border-[var(--border)] pt-5">
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                    >
                                        <Save size={16} />

                                        {profileLoading
                                            ? "Saving..."
                                            : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Security */}
                        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                                        <LockKeyhole size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold">
                                            Password & Security
                                        </h2>

                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Keep your DevFlow account secure.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={handlePasswordSubmit}
                                className="space-y-5 p-6"
                            >
                                {passwordError && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div
                                        role="status"
                                        className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                                    >
                                        <CheckCircle2 size={16} />
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor="current-password"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Current password
                                        </label>

                                        <div className="relative max-w-xl">
                                            <input
                                                id="current-password"
                                                type={
                                                    showCurrentPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={currentPassword}
                                                onChange={(event) =>
                                                    setCurrentPassword(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                                aria-label={
                                                    showCurrentPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="new-password"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            New password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="new-password"
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={newPassword}
                                                onChange={(event) =>
                                                    setNewPassword(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                                aria-label={
                                                    showNewPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirm-password"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Confirm new password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="confirm-password"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={confirmPassword}
                                                onChange={(event) =>
                                                    setConfirmPassword(
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end border-t border-[var(--border)] pt-5">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        <LockKeyhole size={16} />

                                        {passwordLoading
                                            ? "Changing..."
                                            : "Change password"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}