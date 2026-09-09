"use client";

import { FormEvent, useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

interface RegisterResponse {
    status: string;
    message?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
    };
}

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                    cache: "no-store",
                }
            );

            const data =
                (await response.json()) as RegisterResponse;

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Registration failed. Please try again."
                );
            }

            router.push("/login?registered=true");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Brand panel */}
                <section className="hidden bg-[var(--primary)] lg:flex lg:flex-col lg:justify-between lg:p-12">
                    <div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur-sm">
                                D
                            </div>

                            <span className="text-xl font-bold tracking-tight">
                                DevFlow
                            </span>
                        </div>
                    </div>

                    <div className="max-w-lg text-white">
                        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                            Work. Align. Deliver.
                        </p>

                        <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                            Bring your team's work into one focused workspace.
                        </h1>

                        <p className="mt-5 max-w-md text-base leading-7 text-white/75">
                            Create projects, organize tasks, collaborate with
                            your team, and keep everyone moving forward.
                        </p>
                    </div>

                    <p className="text-sm text-white/60">
                        DevFlow workspace
                    </p>
                </section>

                {/* Registration panel */}
                <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
                                D
                            </div>

                            <span className="text-xl font-bold tracking-tight">
                                DevFlow
                            </span>
                        </div>

                        <div className="mb-8">
                            <p className="mb-2 text-sm font-medium text-[var(--primary)]">
                                Get started
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                Set up your DevFlow account and start organizing
                                your work.
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                >
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Your name"
                                    required
                                    className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                    required
                                    className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Create a password"
                                        required
                                        className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 pr-12 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Confirm your password"
                                        required
                                        className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 pr-12 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    "Creating account..."
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-[var(--primary)] hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}