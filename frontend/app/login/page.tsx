"use client";

import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    ShieldCheck,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";
import {
    FormEvent,
    Suspense,
    useState,
} from "react";

import { useAuth } from "@/components/AuthProvider";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();

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
            const result = await login(
                email,
                password
            );

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
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                {/* Brand panel */}
                <section className="relative hidden overflow-hidden bg-[#4C4DCF] lg:flex">
                    {/* Decorative background */}
                    <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-[-8rem] right-[-5rem] h-96 w-96 rounded-full bg-[#7C83FD]/30 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 text-white">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shadow-sm ring-1 ring-white/15 backdrop-blur">
                                    <span className="text-lg font-bold">
                                        D
                                    </span>
                                </div>

                                <div>
                                    <p className="text-lg font-bold tracking-tight">
                                        DevFlow
                                    </p>

                                    <p className="text-xs text-white/65">
                                        Work. Align. Deliver.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main message */}
                        <div className="max-w-xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                Your team workspace
                            </div>

                            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
                                Turn team work into
                                <span className="text-white/65">
                                    {" "}
                                    visible progress.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-white/75 xl:text-lg">
                                Plan projects, assign work, collaborate
                                with your team, and keep every important
                                update in one focused workspace.
                            </p>

                            {/* Value points */}
                            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <Zap
                                        size={18}
                                        className="mb-3 text-white"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Move faster
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/60">
                                        Keep work organized.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <Users
                                        size={18}
                                        className="mb-3 text-white"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Stay aligned
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/60">
                                        Give everyone context.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <ShieldCheck
                                        size={18}
                                        className="mb-3 text-white"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Work securely
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/60">
                                        Protect your workspace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-white/50">
                            <span>
                                © {new Date().getFullYear()} DevFlow
                            </span>

                            <span>
                                Built for focused teams
                            </span>
                        </div>
                    </div>
                </section>

                {/* Login panel */}
                <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        {/* Mobile brand */}
                        <div className="mb-10 flex items-center justify-between lg:hidden">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-sm">
                                    D
                                </div>

                                <div>
                                    <p className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                                        DevFlow
                                    </p>

                                    <p className="text-xs text-[var(--text-muted)]">
                                        Work. Align. Deliver.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <p className="mb-2 text-sm font-semibold text-[var(--primary)]">
                                Welcome back
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                                Sign in to DevFlow
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                Access your projects, tasks, team activity,
                                and notifications.
                            </p>
                        </div>

                        {/* Registration success */}
                        {registered === "true" && (
                            <div
                                role="status"
                                className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                            >
                                <CheckCircle2
                                    size={19}
                                    className="mt-0.5 shrink-0 text-emerald-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-emerald-800">
                                        Account created successfully
                                    </p>

                                    <p className="mt-1 text-sm text-emerald-700">
                                        Your account is ready. Sign in to
                                        continue to your workspace.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {/* Form card */}
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-7">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
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
                                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-semibold text-[var(--text-primary)]"
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
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign in
                                            <ArrowRight
                                                size={17}
                                                className="transition-transform group-hover:translate-x-0.5"
                                            />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Security note */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                            <ShieldCheck size={14} />
                            <span>
                                Your workspace is protected by secure
                                authentication.
                            </span>
                        </div>

                        {/* Register */}
                        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)] hover:underline"
                            >
                                Create your account
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