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
import { useRouter } from "next/navigation";
import {
    FormEvent,
    useState,
} from "react";

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
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

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
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                {/* Brand panel */}
                <section className="relative hidden overflow-hidden bg-[#4C4DCF] lg:flex">
                    <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute bottom-[-8rem] right-[-5rem] h-96 w-96 rounded-full bg-[#7C83FD]/30 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 text-white">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold shadow-sm ring-1 ring-white/15 backdrop-blur">
                                    D
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
                                Built for focused teams
                            </div>

                            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
                                Build better work,
                                <span className="text-white/65">
                                    {" "}
                                    together.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-white/75 xl:text-lg">
                                Create a workspace where projects stay
                                organized, tasks stay clear, and your team
                                always knows what comes next.
                            </p>

                            {/* Value points */}
                            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <Zap
                                        size={18}
                                        className="mb-3 text-white"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Organize work
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/60">
                                        Keep projects structured.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <Users
                                        size={18}
                                        className="mb-3 text-white"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Collaborate
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/60">
                                        Keep your team aligned.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <ShieldCheck
                                        size={18}
                                        className="mb-3 text-white"
                                    />

                                    <p className="text-sm font-semibold text-white">
                                        Stay secure
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
                                Built for modern teams
                            </span>
                        </div>
                    </div>
                </section>

                {/* Registration panel */}
                <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        {/* Mobile brand */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
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

                        {/* Heading */}
                        <div className="mb-8">
                            <p className="mb-2 text-sm font-semibold text-[var(--primary)]">
                                Get started
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                                Create your account
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                Join your workspace and start managing
                                projects with your team.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-7">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Full name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
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
                                        placeholder="Your full name"
                                        required
                                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
                                    />
                                </div>

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
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
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

                                {/* Confirm password */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
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
                                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--accent)]/10"
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password agreement */}
                                <p className="text-xs leading-5 text-[var(--text-muted)]">
                                    By creating an account, you agree to use
                                    DevFlow responsibly and keep your account
                                    credentials secure.
                                </p>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create account
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
                            <CheckCircle2 size={14} />

                            <span>
                                Your account is protected with secure
                                authentication.
                            </span>
                        </div>

                        {/* Login */}
                        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)] hover:underline"
                            >
                                Sign in to DevFlow
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}