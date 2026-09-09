"use client";

import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await login(email, password);

            setToken(result.token);

            await refreshUser();

            router.push("/dashboard");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to sign in. Please try again."
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
                            Keep your team focused on what matters.
                        </h1>

                        <p className="mt-5 max-w-md text-base leading-7 text-white/75">
                            Manage projects, organize tasks, collaborate with
                            your team, and stay updated from one workspace.
                        </p>
                    </div>

                    <p className="text-sm text-white/60">
                        DevFlow workspace
                    </p>
                </section>

                {/* Login panel */}
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
                                Welcome back
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                                Sign in to DevFlow
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                Enter your credentials to access your workspace.
                            </p>
                        </div>

                        {registered === "true" && (
                            <div
                                role="status"
                                className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                            >
                                Account created successfully. Please sign in.
                            </div>
                        )}

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
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    required
                                    className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Password
                                    </label>
                                </div>

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-[var(--primary)] hover:underline"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Loading DevFlow...
                    </p>
                </main>
            }
        >
            <LoginForm />
        </Suspense>
    );
}