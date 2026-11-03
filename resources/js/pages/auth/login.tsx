
import React, { FormEvent, useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
    ArrowDown,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    EyeOff,
    GraduationCap,
    LockKeyhole,
    LogIn,
    Menu,
    ShieldCheck,
    Trophy,
    Users,
    Vote,
    X,
} from "lucide-react";

type Election = {
    id: number | string;
    title: string;
    status?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    organizations?: string[];
};

type AnonymousCandidateResult = {
    label: string;
    votes: number;
    percentage: number;
    rank: number;
    tied: boolean;
};

type PublicPositionResult = {
    organization: string | null;
    position?: string;
    total_votes: number;
    candidates: AnonymousCandidateResult[];
};

type PublicLiveResult = {
    visible: boolean;
    eligible: number;
    participated: number;
    turnout: number;
    updated_at: string;
    positions: PublicPositionResult[];
};

function orderPublicPositions(positions: PublicPositionResult[]) {
    const ordered = [...positions];
    const normalize = (name?: string) => (name || "").toLowerCase().replace(/[^a-z]/g, "");
    const presidentIndex = ordered.findIndex((position) => normalize(position.position) === "president");
    const viceIndex = ordered.findIndex((position) => normalize(position.position).includes("vicepresident"));

    if (presidentIndex < 0 || viceIndex < 0 || presidentIndex === viceIndex) return ordered;

    const president = ordered[presidentIndex];
    const vice = ordered[viceIndex];

    return [president, vice, ...ordered.filter((_, index) => index !== presidentIndex && index !== viceIndex)];
}

type LoginPageProps = {
    loginType?: "admin" | "voter" | string;
    showcaseElections?: Election[];
    canResetPassword?: boolean;
    status?: string | null;
};

const sections = [
    { id: "home", label: "Home" },
    { id: "elections", label: "Elections" },
    { id: "live-voting", label: "Live Results" },
    { id: "login", label: "Login" },
];

function formatDate(date?: string | null) {
    if (!date) return "Date to be announced";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getElectionName(election: Election) {
    return election.title || "Student Election";
}

function getElectionStatus(election: Election) {
    const status = (election.status || "").toLowerCase();

    if (status.includes("live") || status.includes("ongoing")) {
        return "Live";
    }

    if (status.includes("complete") || status.includes("ended")) {
        return "Completed";
    }

    if (status.includes("upcoming") || status.includes("scheduled")) {
        return "Upcoming";
    }

    return election.status || "Election";
}

export default function Login({
    loginType = "voter",
    showcaseElections = [],
    canResetPassword = true,
    status,
}: LoginPageProps) {
    const isAdmin = loginType === "admin";

    const [activeSection, setActiveSection] = useState("home");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [liveResults, setLiveResults] = useState<Record<string, PublicLiveResult>>({});
    const [resultConnection, setResultConnection] = useState<Record<string, boolean>>({});
    const [resultLoading, setResultLoading] = useState<
        Record<string, boolean>
    >({});

    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
        remember: false,
    });

    const scrollToSection = (sectionId: string) => {
        setMenuOpen(false);
        setActiveSection(sectionId);

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    /*
     * Observe public-page sections only.
     * The admin page does not have these sections.
     */
    useEffect(() => {
        if (isAdmin) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio - a.intersectionRatio
                    );

                if (visibleEntries.length > 0) {
                    setActiveSection(visibleEntries[0].target.id);
                }
            },
            {
                root: null,
                rootMargin: "-20% 0px -55% 0px",
                threshold: [0.1, 0.25, 0.5],
            }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isAdmin]);

    /*
     * Load and refresh public election results.
     * Admin login skips this effect.
     */
    useEffect(() => {
        if (isAdmin) return;

        const liveElections = showcaseElections.filter((election) => {
            const electionStatus = getElectionStatus(election).toLowerCase();

            return (
                electionStatus.includes("live") ||
                electionStatus.includes("ongoing")
            );
        });

        if (liveElections.length === 0) return;

        let cancelled = false;
        const pendingRequests = new Set<string>();

        const fetchResults = async (election: Election) => {
            const electionId = String(election.id);
            if (pendingRequests.has(electionId)) return;
            pendingRequests.add(electionId);

            try {
                if (!cancelled) {
                    setResultLoading((previous) => ({
                        ...previous,
                        [electionId]: true,
                    }));
                }

                const response = await fetch(
                    `/live-results/${encodeURIComponent(electionId)}`,
                    {
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load live results.");
                }

                const result = (await response.json()) as PublicLiveResult;

                if (!cancelled) {
                    setLiveResults((previous) => ({
                        ...previous,
                        [electionId]: result,
                    }));
                    setResultConnection((previous) => ({ ...previous, [electionId]: true }));
                }
            } catch (error) {
                console.error(
                    `Failed to load results for election ${electionId}:`,
                    error
                );
                if (!cancelled) {
                    setResultConnection((previous) => ({ ...previous, [electionId]: false }));
                }
            } finally {
                pendingRequests.delete(electionId);
                if (!cancelled) {
                    setResultLoading((previous) => ({
                        ...previous,
                        [electionId]: false,
                    }));
                }
            }
        };

        const refreshAllResults = () => {
            liveElections.forEach((election) => {
                void fetchResults(election);
            });
        };

        refreshAllResults();

        const intervalId = window.setInterval(
            refreshAllResults,
            20000
        );

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [isAdmin, showcaseElections]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(
            isAdmin
                ? route("admin.login.store")
                : route("login.store"),
            {
                onError: (formErrors) => {
                    void Swal.fire({
                        icon: "error",
                        title: isAdmin ? "Admin login failed" : "Login failed",
                        text: formErrors.username || formErrors.password || "Check your login details and try again.",
                        confirmButtonColor: "#176B45",
                    });
                },
                onFinish: () => reset("password"),
            }
        );
    };

    const liveElections = showcaseElections.filter((election) => {
        const electionStatus = getElectionStatus(election).toLowerCase();

        return (
            electionStatus.includes("live") ||
            electionStatus.includes("ongoing")
        );
    });

    /*
     * ADMIN LOGIN
     * Return early so administrators see only this page.

    /*
     * ADMIN LOGIN
     * Separate from the voter login, but uses the same visual design.
     */
    if (isAdmin) {
        return (
            <>
                <Head title="Administrator Login | CPSU Elections" />

                <main
                    className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#103C2B] px-4 py-12 sm:px-6"
                >
                    {/* Same background image as the voter landing page */}
                    <div
                        className="absolute inset-0 -z-20 bg-cover bg-center"
                        style={{
                            backgroundImage: "url('/images/image.png')",
                        }}
                        role="img"
                        aria-label="Central Philippines State University campus"
                    />

                    {/* Same dark green overlay */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#082C20]/95 via-[#0C3D2B]/85 to-[#103C2B]/75" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#082C20]/70 via-transparent to-[#082C20]/30" />

                    <div className="relative z-10 w-full max-w-md">
                        {/* CPSU branding */}
                        <div className="mb-7 text-center text-white">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/30 bg-white p-2 shadow-xl sm:h-24 sm:w-24">
                                <img
                                    src="/images/logo-cpsu.png"
                                    alt="CPSU logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200">
                                Central Philippines State University
                            </p>

                            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                                Voting and Elections
                            </h1>

                            <p className="mt-2 text-sm text-emerald-50/80">
                                Administrator Portal
                            </p>
                        </div>

                        {/* Login card styled like the voter login */}
                        <section className="rounded-3xl border border-white/30 bg-white p-6 shadow-2xl shadow-black/20 sm:p-9">
                            <div className="mb-7 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#176B45]">
                                    <ShieldCheck size={30} />
                                </div>

                                <h2 className="mt-5 text-2xl font-black text-[#103C2B]">
                                    Admin Login
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Sign in with your administrator account.
                                </p>
                            </div>

                            {status && (
                                <div
                                    role="status"
                                    className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                                >
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="admin-username"
                                        className="mb-2 block text-sm font-bold text-slate-700"
                                    >
                                        Email or username
                                    </label>

                                    <input
                                        id="admin-username"
                                        type="text"
                                        name="username"
                                        autoComplete="username"
                                        value={data.username}
                                        onChange={(event) =>
                                            setData("username", event.target.value)
                                        }
                                        required
                                        autoFocus
                                        placeholder="Enter your email or username"
                                        aria-invalid={Boolean(errors.username)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#176B45] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                    />

                                    {errors.username && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="admin-password"
                                        className="mb-2 block text-sm font-bold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="admin-password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(event) =>
                                                setData("password", event.target.value)
                                            }
                                            required
                                            placeholder="Enter your password"
                                            aria-invalid={Boolean(errors.password)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#176B45] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((visible) => !visible)
                                            }
                                            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-[#176B45]"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember me and password reset */}
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(event) =>
                                                setData("remember", event.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-slate-300 accent-[#176B45] focus:ring-emerald-500"
                                        />
                                        Remember me
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-sm font-bold text-[#176B45] transition hover:text-[#103C2B] hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B45] px-5 py-4 text-sm font-extrabold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#104D33] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing
                                        ? "Signing in..."
                                        : "Sign In as Administrator"}

                                    {!processing && (
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    )}
                                </button>
                            </form>

                            {/* Return to voter login */}
                            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                                <Link
                                    href={route("login")}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B45] transition hover:text-[#103C2B] hover:underline"
                                >
                                    <ArrowRight
                                        size={15}
                                        className="rotate-180"
                                    />
                                    Back to Voter Login
                                </Link>
                            </div>
                        </section>

                        <footer className="mt-6 text-center text-xs leading-5 text-emerald-50/70">
                            <p>Central Philippines State University</p>
                            <p className="mt-1">
                                © {new Date().getFullYear()} CPSU Voting System
                            </p>
                        </footer>
                    </div>
                </main>
            </>
        );
    }

    /*
     * VOTER PUBLIC PAGE
     * Your existing landing page starts here.
     */
    return (
        <>
            <Head title="CPSU Voting and Elections" />

            <div className="min-h-screen scroll-smooth bg-[#F4F8F5] text-slate-800">
                {/* ==================== HEADER ==================== */}
                <header className="sticky top-0 z-50 border-b border-white/10 bg-[#103C2B]/95 text-white shadow-lg backdrop-blur-xl">
                    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => scrollToSection("home")}
                            className="group flex min-w-0 items-center gap-3 text-left"
                            aria-label="Go to home"
                        >
                            <img
                                src="/images/logo-cpsu.png"
                                alt="CPSU logo"
                                className="h-12 w-12 shrink-0 rounded-full border border-white/30 bg-white object-contain p-1 transition duration-300 group-hover:scale-105"
                            />

                            <span className="min-w-0">
                                <span className="block truncate text-sm font-extrabold tracking-wide sm:text-base">
                                    CPSU
                                </span>
                                <span className="block max-w-[220px] text-[10px] font-medium leading-4 text-emerald-100 sm:text-xs">
                                    Voting and Elections Management
                                </span>
                            </span>
                        </button>

                        <nav
                            className="hidden items-center gap-1 md:flex"
                            aria-label="Main navigation"
                        >
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => scrollToSection(section.id)}
                                    className={`relative rounded-full px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                                        activeSection === section.id
                                            ? "bg-white/15 text-white"
                                            : "text-emerald-100 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    {section.label}
                                    <span
                                        className={`absolute bottom-1 left-4 right-4 h-0.5 origin-left rounded-full bg-emerald-300 transition-transform duration-300 ${
                                            activeSection === section.id
                                                ? "scale-x-100"
                                                : "scale-x-0"
                                        }`}
                                    />
                                </button>
                            ))}
                        </nav>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 transition hover:bg-white/10 md:hidden"
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>

                    {menuOpen && (
                        <nav
                            className="border-t border-white/10 bg-[#103C2B] px-4 py-3 md:hidden"
                            aria-label="Mobile navigation"
                        >
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => scrollToSection(section.id)}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                                        activeSection === section.id
                                            ? "bg-white/15 text-white"
                                            : "text-emerald-100 hover:bg-white/10"
                                    }`}
                                >
                                    {section.label}
                                    <ChevronRight size={16} />
                                </button>
                            ))}
                        </nav>
                    )}
                </header>

                <main>
                    {/* ==================== HOME ==================== */}
                    <section
                        id="home"
                        className="relative isolate flex min-h-[calc(100svh-76px)] scroll-mt-[76px] items-center overflow-hidden bg-[#103C2B]"
                    >
                        <div
                            className="absolute inset-0 -z-20 scale-100 bg-cover bg-center transition-transform duration-[1200ms] hover:scale-[1.02]"
                            style={{ backgroundImage: "url('/images/image.png')" }}
                            role="img"
                            aria-label="Central Philippines State University campus"
                        />

                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#082C20]/95 via-[#0C3D2B]/80 to-[#103C2B]/35" />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#082C20]/75 via-transparent to-[#082C20]/15" />

                        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
                            <div className="max-w-3xl text-white">
                                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-100/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100 shadow-lg backdrop-blur-md sm:text-sm">
                                    <ShieldCheck size={17} />
                                    Secure • Transparent • Student-Centered
                                </div>

                                <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                    Your Vote.
                                    <span className="mt-2 block text-emerald-300">
                                        Our Future.
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-2xl text-base leading-8 text-emerald-50/90 sm:text-lg">
                                    Make your voice count. Explore school elections,
                                    follow public voting results, and take part in
                                    shaping the future of the CPSU student community.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection("elections")}
                                        className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-emerald-400 px-7 py-4 font-extrabold text-[#103C2B] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-200/40"
                                    >
                                        Explore Elections
                                        <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => scrollToSection("live-voting")}
                                        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-white/35 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20"
                                    >
                                        <Vote size={19} />
                                        View Live Results
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => scrollToSection("login")}
                                    className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition hover:text-white"
                                >
                                    Ready to sign in?
                                    <span className="underline decoration-emerald-300 underline-offset-4">
                                        Go to Login
                                    </span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>

                            <div className="hidden lg:block">
                                <div className="ml-auto max-w-sm rounded-3xl border border-white/20 bg-white/10 p-7 text-white shadow-2xl backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:bg-white/[0.14]">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300 text-[#103C2B] shadow-lg">
                                        <GraduationCap size={30} />
                                    </div>

                                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">
                                        The power is yours
                                    </p>

                                    <h2 className="mt-3 text-2xl font-extrabold leading-snug">
                                        Every vote helps shape our campus.
                                    </h2>

                                    <p className="mt-4 text-sm leading-7 text-emerald-50/85">
                                        Stay informed about elections, candidates,
                                        and publicly available results through one
                                        convenient platform.
                                    </p>

                                    <div className="mt-7 border-t border-white/15 pt-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Responsible participation
                                                </p>
                                                <p className="mt-1 text-xs text-emerald-100/75">
                                                    Informed choices. Stronger community.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => scrollToSection("elections")}
                            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold tracking-wide text-white/75 transition hover:text-white sm:flex"
                        >
                            Scroll to explore
                            <span className="flex h-9 w-9 animate-bounce items-center justify-center rounded-full border border-white/30 bg-white/10">
                                <ArrowDown size={17} />
                            </span>
                        </button>
                    </section>

                    {/* ==================== TRUST STRIP ==================== */}
                    <section className="border-b border-emerald-900/5 bg-white">
                        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-emerald-900/10 px-4 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-center gap-3 py-4 sm:py-2">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#176B45]">
                                    <ShieldCheck size={22} />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-[#103C2B]">Secure Access</p>
                                    <p className="mt-1 text-xs text-slate-500">Authorized account sign-in</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 py-4 sm:py-2">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#176B45]">
                                    <Vote size={22} />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-[#103C2B]">Election Information</p>
                                    <p className="mt-1 text-xs text-slate-500">Important election updates</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 py-4 sm:py-2">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#176B45]">
                                    <Users size={22} />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-[#103C2B]">Student Participation</p>
                                    <p className="mt-1 text-xs text-slate-500">Your voice matters</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ==================== ELECTIONS ==================== */}
                    <section
                        id="elections"
                        className="scroll-mt-[76px] bg-[#F4F8F5] px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="mx-auto max-w-2xl text-center">
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176B45]">
                                    <CalendarDays size={15} />
                                    Election Center
                                </span>

                                <h2 className="mt-5 text-3xl font-black tracking-tight text-[#103C2B] sm:text-4xl md:text-5xl">
                                    Explore Elections
                                </h2>

                                <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                                    Stay updated on school elections and review the available election information.
                                </p>
                            </div>

                            {showcaseElections.length > 0 ? (
                                <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {showcaseElections.map((election) => {
                                        const electionStatus = getElectionStatus(election);
                                        const isLive = electionStatus.toLowerCase() === "live";

                                        return (
                                            <article
                                                key={election.id}
                                                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-emerald-700/30 hover:shadow-xl hover:shadow-emerald-950/10"
                                            >
                                                <div className="h-2 bg-gradient-to-r from-[#176B45] via-emerald-500 to-emerald-300" />

                                                <div className="flex flex-1 flex-col p-6 sm:p-7">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#176B45] transition duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                                                            <Vote size={24} />
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                                                isLive
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : electionStatus.toLowerCase().includes("complete")
                                                                      ? "bg-slate-100 text-slate-600"
                                                                      : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {isLive && <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-600" />}
                                                            {electionStatus}
                                                        </span>
                                                    </div>

                                                    <h3 className="mt-6 text-xl font-extrabold text-[#103C2B] transition-colors group-hover:text-[#176B45]">
                                                        {getElectionName(election)}
                                                    </h3>

                                                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                                                        {election.organizations?.length
                                                            ? `Organized by ${election.organizations.join(", ")}. Follow the schedule and stay informed about the election.`
                                                            : "View the election schedule and stay informed about the student election process."}
                                                    </p>

                                                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                                            <CalendarDays size={17} className="shrink-0 text-[#176B45]" />
                                                            <span>Starts: {formatDate(election.start_at)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                                            <Clock size={17} className="shrink-0 text-[#176B45]" />
                                                            <span>Ends: {formatDate(election.end_at)}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => scrollToSection(isLive ? "live-voting" : "login")}
                                                        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-800/15 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-[#176B45] transition duration-300 hover:border-[#176B45] hover:bg-[#176B45] hover:text-white"
                                                    >
                                                        {isLive ? "View Live Results" : "Go to Login"}
                                                        <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-12 rounded-2xl border border-dashed border-emerald-900/20 bg-white px-6 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#176B45]">
                                        <CalendarDays size={27} />
                                    </div>
                                    <h3 className="mt-5 text-lg font-extrabold text-[#103C2B]">
                                        No elections to display yet
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        Election information will appear here when it is made available by the election administrator.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ==================== LIVE VOTING ==================== */}
                    <section
                        id="live-voting"
                        className="scroll-mt-[76px] bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                                <div className="max-w-2xl">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176B45]">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
                                        Public Results
                                    </span>

                                    <h2 className="mt-5 text-3xl font-black tracking-tight text-[#103C2B] sm:text-4xl md:text-5xl">
                                        Live Voting Results
                                    </h2>

                                    <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                                        Follow publicly available candidate vote totals for ongoing elections.
                                        Results refresh automatically when the server provides updated data.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-[#F4F8F5] px-4 py-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#176B45] shadow-sm">
                                        <Trophy size={21} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-extrabold text-[#103C2B]">Public Information</p>
                                        <p className="mt-1 text-xs text-slate-500">Results only</p>
                                    </div>
                                </div>
                            </div>

                            {liveElections.length > 0 ? (
                                <div className="mt-10 space-y-8">
                                    {liveElections.map((election) => {
                                        const electionId = String(election.id);
                                        const result = liveResults[electionId];
                                        const orderedPositions = orderPublicPositions(result?.positions ?? []);

                                        return (
                                            <article
                                                key={election.id}
                                                className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
                                            >
                                                <div className="flex flex-col gap-4 border-b border-emerald-900/10 bg-[#F4F8F5] p-6 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                                                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
                                                            Voting in progress
                                                        </div>
                                                        <h3 className="mt-2 text-xl font-extrabold text-[#103C2B]">{getElectionName(election)}</h3>
                                                        {election.organizations?.length ? <p className="mt-1 text-sm text-slate-600">{election.organizations.join(", ")}</p> : null}
                                                    </div>
                                                    <div className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3">
                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Voter turnout</p>
                                                        <p className="mt-1 text-2xl font-black tabular-nums text-[#176B45]">{(result?.turnout ?? 0).toFixed(1)}%</p>
                                                        <p className="text-xs text-slate-500">{result?.participated ?? 0} of {result?.eligible ?? 0} voters</p>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    {resultLoading[electionId] && !result ? (
                                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="animate-pulse rounded-xl border border-slate-100 p-4"><div className="mb-4 h-5 w-2/5 rounded bg-slate-200" /><div className="space-y-4">{[1, 2, 3].map((row) => <div key={row}><div className="mb-2 h-4 w-3/5 rounded bg-slate-100" /><div className="h-2.5 rounded-full bg-slate-100" /></div>)}</div></div>)}</div>
                                                    ) : result?.visible && result.positions.length > 0 ? (
                                                        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2" aria-label="Position results in two columns">
                                                            {orderedPositions.map((position, positionIndex) => (
                                                                <section key={`${position.position}-${positionIndex}`} aria-label={`${position.position} results`} className="live-position-card overflow-hidden rounded-2xl border bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1" style={{ animationDelay: `${positionIndex * 180}ms` }}>
                                                                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                                                        <div><h4 className="font-extrabold text-[#103C2B]">{position.position}</h4>{position.organization && <p className="mt-1 text-xs text-slate-500">{position.organization}</p>}</div>
                                                                        <p className="text-xs font-semibold text-slate-500">{position.total_votes.toLocaleString()} votes</p>
                                                                    </div>
                                                                    {position.candidates.length ? <div className="space-y-5">{position.candidates.map((candidate) => (
                                                                        <div key={candidate.label}>
                                                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                                                <div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${candidate.rank === 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{candidate.rank}</span><div><p className="text-sm font-extrabold text-[#103C2B]">{candidate.label}</p>{candidate.tied && <p className="text-xs font-semibold text-amber-700">Tied for rank {candidate.rank}</p>}</div></div>
                                                                                <div className="text-right"><p className="text-sm font-black tabular-nums text-[#176B45]">{candidate.votes.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">{candidate.percentage.toFixed(1)}%</p></div>
                                                                            </div>
                                                                            <div
                                                                                className="relative ml-12 h-3 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-inset ring-emerald-900/5"
                                                                                role="progressbar"
                                                                                aria-label={`${candidate.label} vote share`}
                                                                                aria-valuemin={0}
                                                                                aria-valuemax={100}
                                                                                aria-valuenow={Math.min(100, Math.max(0, candidate.percentage))}
                                                                                aria-valuetext={`${candidate.percentage.toFixed(1)} percent, ${candidate.votes} votes`}
                                                                            >
                                                                                <div
                                                                                    className={`relative h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${candidate.rank === 1 ? "bg-gradient-to-r from-[#176B45] via-emerald-500 to-lime-400 shadow-[0_0_12px_rgba(22,107,69,0.35)]" : "bg-gradient-to-r from-emerald-700 to-emerald-400"}`}
                                                                                    style={{ width: `${Math.min(100, Math.max(0, candidate.percentage))}%` }}
                                                                                >
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}</div> : <p className="text-sm text-slate-500">No votes recorded for this position yet.</p>}
                                                                </section>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-8 text-center">
                                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#176B45]"><Vote size={24} /></div>
                                                            <h4 className="mt-4 font-extrabold text-[#103C2B]">{result && !result.visible ? "Candidate results are not public yet" : "No results available yet"}</h4>
                                                            <p className="mt-2 text-sm leading-6 text-slate-500">{result && !result.visible ? "Turnout remains available while candidate totals are hidden by the election policy." : "Position results will appear here when available."}</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                                                        <span>{result?.updated_at ? `Updated ${new Date(result.updated_at).toLocaleTimeString()}` : "Waiting for first refresh"}</span>
                                                        <span className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${resultConnection[electionId] ? "bg-emerald-500" : "bg-red-500"}`} />{resultConnection[electionId] ? "Connected - polling every 20s" : "Results unavailable - retrying"}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-10 rounded-2xl border border-dashed border-emerald-900/20 bg-[#F4F8F5] px-6 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#176B45] shadow-sm">
                                        <Trophy size={27} />
                                    </div>
                                    <h3 className="mt-5 text-lg font-extrabold text-[#103C2B]">
                                        No live election at the moment
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        When an election is marked as live or ongoing, its available public results can appear in this section.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection("elections")}
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#176B45] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#104D33]"
                                    >
                                        Browse Elections
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            <p className="mt-7 text-xs leading-6 text-slate-500">
                                Candidate totals appear only when permitted by the election's public-results policy. Results refresh from the server every 20 seconds.
                            </p>
                        </div>
                    </section>

                    {/* ==================== VOTER LOGIN ==================== */}
                    <section
                        id="login"
                        className="relative isolate scroll-mt-[76px] overflow-hidden bg-[#103C2B] px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
                    >
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.16),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_35%)]" />

                        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
                            <div className="text-white">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200">
                                    <LockKeyhole size={15} />
                                    Authorized Access
                                </span>

                                <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
                                    Welcome back to
                                    <span className="mt-2 block text-emerald-300">
                                        CPSU Elections.
                                    </span>
                                </h2>

                                <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50/80">
                                    Sign in using your registered account to access
                                    the features assigned to your role. Keep your
                                    login credentials private.
                                </p>

                                <div className="mt-9 space-y-5">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                                            <ShieldCheck size={21} />
                                        </span>
                                        <div>
                                            <p className="font-bold">Protected account access</p>
                                            <p className="mt-1 text-sm leading-6 text-emerald-50/70">
                                                Use your own authorized account and keep your password secure.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                                            <CheckCircle2 size={21} />
                                        </span>
                                        <div>
                                            <p className="font-bold">Stay informed</p>
                                            <p className="mt-1 text-sm leading-6 text-emerald-50/70">
                                                Review election information and participate through the features available to you.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-auto w-full max-w-md">
                                <div className="rounded-3xl border border-white/30 bg-white p-6 shadow-2xl shadow-black/20 sm:p-9">
                                    <div className="mb-7 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#176B45]">
                                            <LogIn size={30} />
                                        </div>

                                        <h3 className="mt-5 text-2xl font-black text-[#103C2B]">
                                            Voter Login
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Enter your account credentials to continue.
                                        </p>
                                    </div>

                                    {status && (
                                        <div
                                            role="status"
                                            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                                        >
                                            {status}
                                        </div>
                                    )}

                                    <form onSubmit={submit} className="space-y-5">
                                        <div>
                                            <label
                                                htmlFor="voter-username"
                                                className="mb-2 block text-sm font-bold text-slate-700"
                                            >
                                                Email or username
                                            </label>

                                            <input
                                                id="voter-username"
                                                type="text"
                                                name="username"
                                                autoComplete="username"
                                                value={data.username}
                                                onChange={(event) =>
                                                    setData("username", event.target.value)
                                                }
                                                required
                                                autoFocus
                                                placeholder="Enter your email or username"
                                                aria-invalid={Boolean(errors.username)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#176B45] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                            />

                                            {errors.username && (
                                                <p className="mt-2 text-sm font-medium text-red-600">
                                                    {errors.username}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="voter-password"
                                                className="mb-2 block text-sm font-bold text-slate-700"
                                            >
                                                Password
                                            </label>

                                            <div className="relative">
                                                <input
                                                    id="voter-password"
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    autoComplete="current-password"
                                                    value={data.password}
                                                    onChange={(event) =>
                                                        setData("password", event.target.value)
                                                    }
                                                    required
                                                    placeholder="Enter your password"
                                                    aria-invalid={Boolean(errors.password)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#176B45] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((visible) => !visible)}
                                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-[#176B45]"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                                </button>
                                            </div>

                                            {errors.password && (
                                                <p className="mt-2 text-sm font-medium text-red-600">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                                <input
                                                    type="checkbox"
                                                    checked={data.remember}
                                                    onChange={(event) =>
                                                        setData("remember", event.target.checked)
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 accent-[#176B45] focus:ring-emerald-500"
                                                />
                                                Remember me
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href={route("password.request")}
                                                    className="text-sm font-bold text-[#176B45] transition hover:text-[#103C2B] hover:underline"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B45] px-5 py-4 text-sm font-extrabold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#104D33] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {processing ? "Signing in..." : "Sign In"}
                                            {!processing && (
                                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                            )}
                                        </button>
                                    </form>

                                    <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                                        <p className="text-xs leading-6 text-slate-500">
                                            Access is limited to accounts authorized by the election administrator.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => scrollToSection("home")}
                                    className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-100/80 transition hover:text-white"
                                >
                                    Back to Home
                                    <ArrowRight size={15} className="-rotate-45" />
                                </button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* ==================== FOOTER ==================== */}
                <footer className="bg-[#082C20] px-4 py-8 text-white sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() => scrollToSection("home")}
                            className="flex items-center gap-3 text-left"
                        >
                            <img
                                src="/images/logo-cpsu.png"
                                alt="CPSU logo"
                                className="h-10 w-10 rounded-full bg-white object-contain p-1"
                            />
                            <span>
                                <span className="block text-sm font-extrabold">
                                    CPSU Voting System
                                </span>
                                <span className="mt-1 block text-xs text-emerald-100/65">
                                    Student voice. Shared future.
                                </span>
                            </span>
                        </button>

                        <nav
                            className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-emerald-100/75"
                            aria-label="Footer navigation"
                        >
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => scrollToSection(section.id)}
                                    className="transition hover:text-white hover:underline hover:underline-offset-4"
                                >
                                    {section.label}
                                </button>
                            ))}
                        </nav>

                        <p className="text-xs leading-5 text-emerald-100/60">
                            © {new Date().getFullYear()}   CPSU Voting System  2026| Developed by: Clarissa Gemida
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
