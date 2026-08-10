"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    total_users: 0,
    total_documents: 0,
    total_chat_sessions: 0,
    total_chat_messages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  // ==========================================================
  // AUTHENTICATION + ROLE CHECK
  // ==========================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    // Not logged in
    if (!token || !storedUser) {
      router.replace("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      const role =
        parsedUser.role?.toLowerCase();

      // ======================================================
      // BOTH ADMIN AND SUPER ADMIN CAN ACCESS /admin
      // ======================================================

      if (
        role !== "admin" &&
        role !== "super_admin"
      ) {
        router.replace("/dashboard");
        return;
      }

      setUser(parsedUser);

      fetchStats(token);
    } catch (error) {
      console.error(
        "Failed to read user:",
        error
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      router.replace("/");
    }
  }, [router]);

  // ==========================================================
  // FETCH ADMIN STATISTICS
  // ==========================================================

  async function fetchStats(token) {
    try {
const response = await fetch(
  `${API_URL}/admin/stats`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        console.error(
          "Unauthorized admin access"
        );

        router.replace("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load admin statistics"
        );
      }

      const data = await response.json();

      setStats({
        total_users:
          data.total_users ?? 0,

        total_documents:
          data.total_documents ?? 0,

        total_chat_sessions:
          data.total_chat_sessions ?? 0,

        total_chat_messages:
          data.total_chat_messages ?? 0,
      });
    } catch (error) {
      console.error(
        "Admin stats error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    router.replace("/");
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <div className="mb-4 text-4xl">
            ⚙️
          </div>

          <p className="text-slate-400">
            Loading administration panel...
          </p>

        </div>
      </main>
    );
  }

  // ==========================================================
  // ROLE
  // ==========================================================

  const isSuperAdmin =
    user.role?.toLowerCase() ===
    "super_admin";

  // ==========================================================
  // ADMIN DASHBOARD
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="flex items-center justify-between px-8 py-5">

          {/* LOGO */}

          <div>

            <h1 className="text-2xl font-bold">
              Enterprise AI
            </h1>

            <p className="text-sm text-slate-400">
              Administration & Control Center
            </p>

          </div>

          {/* PROFILE */}

          <div className="relative">

            <button
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-900"
            >

              <div className="text-right">

                <p className="font-medium">
                  {user?.name || "Admin"}
                </p>

                <p className="text-xs text-slate-400">

                  {isSuperAdmin
                    ? "Super Administrator"
                    : "Administrator"}

                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold">

                {(user?.name || "A")
                  .charAt(0)
                  .toUpperCase()}

              </div>

            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (

              <div className="absolute right-0 top-16 z-50 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

                <h2 className="text-xl font-semibold">
                  {user?.name || "Admin"}
                </h2>

                <p className="mt-1 text-slate-400">
                  {user?.email ||
                    "admin@test.com"}
                </p>

                <div className="my-5 border-t border-slate-700" />

                <div className="space-y-4">

                  {/* ROLE */}

                  <div>

                    <p className="text-xs uppercase text-slate-500">
                      Role
                    </p>

                    <p className="mt-1 text-lg">

                      {isSuperAdmin
                        ? "Super Admin"
                        : "Admin"}

                    </p>

                  </div>

                  {/* DEPARTMENT */}

                  <div>

                    <p className="text-xs uppercase text-slate-500">
                      Department
                    </p>

                    <p className="mt-1 text-lg">

                      Department ID:{" "}
                      {user?.department_id ||
                        "-"}

                    </p>

                  </div>

                  {/* STATUS */}

                  <div>

                    <p className="text-xs uppercase text-slate-500">
                      Account Status
                    </p>

                    <p className="mt-1 text-lg text-green-400">
                      Active
                    </p>

                  </div>

                </div>

                <div className="my-5 border-t border-slate-700" />

                <button
                  onClick={logout}
                  className="w-full rounded-lg px-4 py-3 text-left text-red-400 hover:bg-slate-800"
                >
                  🚪 Logout
                </button>

              </div>

            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN LAYOUT
      ====================================================== */}

      <div className="flex min-h-[calc(100vh-81px)]">

        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <aside className="hidden w-72 border-r border-slate-800 bg-slate-950 p-5 md:block">

          <nav className="space-y-2">

            {/* DASHBOARD */}

            <Link
              href="/admin"
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-medium"
            >
              🏠 Dashboard
            </Link>

            {/* AI ASSISTANT */}

            <Link
              href="/assistant"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              💬 AI Assistant
            </Link>

            {/* KNOWLEDGE BASE */}

            <Link
              href="/knowledge-base"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📚 Knowledge Base
            </Link>

            {/* USER MANAGEMENT */}

            <Link
              href="/admin/users"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              👥 User Management
            </Link>

            {/* DOCUMENTS */}

            <Link
              href="/admin/documents"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📄 Documents
            </Link>

            {/* AI DOCUMENT ANALYSIS */}

            <Link
              href="/analysis"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              🤖 AI Document Analysis
            </Link>

            {/* REPORTS */}

            <Link
              href="/admin/reports"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📊 Reports & Analytics
            </Link>

            {/* AUDIT LOGS */}

            <Link
              href="/admin/audit-logs"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📝 Audit Logs
            </Link>

            {/* SETTINGS */}

            <Link
              href="/admin/settings"
              className="block w-full rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              ⚙️ Settings
            </Link>

          </nav>

          {/* ADMIN INFO */}

          <div className="mt-10 border-t border-slate-800 pt-5">

            <p className="px-4 text-xs uppercase text-slate-500">
              Administration
            </p>

            <p className="px-4 pt-2 text-sm text-slate-400">

              {isSuperAdmin
                ? "Super Admin Access"
                : "Admin Access"}

            </p>

          </div>

        </aside>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <section className="flex-1 p-6 md:p-10">

          {/* TITLE */}

          <div className="mb-8">

            <h2 className="text-3xl font-bold">

              Welcome back
              {user?.name
                ? `, ${user.name}`
                : ""}

            </h2>

            <p className="mt-2 text-slate-400">
              Manage users, documents, system
              activity and configuration.
            </p>

          </div>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* USERS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Total Users
              </p>

              <p className="mt-3 text-4xl font-bold">
                {loading
                  ? "..."
                  : stats.total_users}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Registered organization users
              </p>

            </div>

            {/* DOCUMENTS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Documents
              </p>

              <p className="mt-3 text-4xl font-bold">
                {loading
                  ? "..."
                  : stats.total_documents}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Knowledge base documents
              </p>

            </div>

            {/* CHAT SESSIONS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Chat Sessions
              </p>

              <p className="mt-3 text-4xl font-bold">
                {loading
                  ? "..."
                  : stats.total_chat_sessions}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                AI conversations
              </p>

            </div>

            {/* CHAT MESSAGES */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Chat Messages
              </p>

              <p className="mt-3 text-4xl font-bold">
                {loading
                  ? "..."
                  : stats.total_chat_messages}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Questions and AI responses
              </p>

            </div>

          </div>

          {/* =================================================
              ADMINISTRATION
          ================================================== */}

          <div className="mt-10">

            <h3 className="mb-5 text-2xl font-semibold">
              Administration
            </h3>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {/* USER MANAGEMENT */}

              <Link
                href="/admin/users"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-900/80"
              >

                <div className="mb-5 text-3xl">
                  👥
                </div>

                <h4 className="text-xl font-semibold">
                  User Management
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Create, view and manage
                  organization users, roles
                  and departments.
                </p>

                <p className="mt-6 text-blue-400">
                  Manage Users →
                </p>

              </Link>

              {/* DOCUMENT MANAGEMENT */}

              <Link
                href="/admin/documents"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-900/80"
              >

                <div className="mb-5 text-3xl">
                  📄
                </div>

                <h4 className="text-xl font-semibold">
                  Document Management
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Upload, manage and delete
                  enterprise knowledge documents.
                </p>

                <p className="mt-6 text-blue-400">
                  Manage Documents →
                </p>

              </Link>

              {/* REPORTS */}

              <Link
                href="/admin/reports"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-900/80"
              >

                <div className="mb-5 text-3xl">
                  📊
                </div>

                <h4 className="text-xl font-semibold">
                  Reports & Analytics
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  View system usage, users,
                  documents and AI activity
                  statistics.
                </p>

                <p className="mt-6 text-blue-400">
                  View Reports →
                </p>

              </Link>

              {/* AUDIT LOGS */}

              <Link
                href="/admin/audit-logs"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-900/80"
              >

                <div className="mb-5 text-3xl">
                  📝
                </div>

                <h4 className="text-xl font-semibold">
                  Audit Logs
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Track uploads, downloads,
                  deletions and administrative
                  actions.
                </p>

                <p className="mt-6 text-blue-400">
                  View Audit Logs →
                </p>

              </Link>

              {/* SETTINGS */}

              <Link
                href="/admin/settings"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-900/80"
              >

                <div className="mb-5 text-3xl">
                  ⚙️
                </div>

                <h4 className="text-xl font-semibold">
                  System Settings
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Configure system name, AI
                  model, retrieval settings
                  and document uploads.
                </p>

                <p className="mt-6 text-blue-400">
                  Manage Settings →
                </p>

              </Link>

              {/* AI ANALYSIS */}

              <Link
                href="/analysis"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500 hover:bg-slate-900/80"
              >

                <div className="mb-5 text-3xl">
                  🤖
                </div>

                <h4 className="text-xl font-semibold">
                  AI Document Analysis
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Generate AI-powered summaries
                  and insights from enterprise
                  documents.
                </p>

                <p className="mt-6 text-blue-400">
                  Analyze Documents →
                </p>

              </Link>

            </div>

          </div>

          {/* =================================================
              SYSTEM STATUS
          ================================================== */}

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-7">

            <h3 className="text-xl font-semibold">
              System Status
            </h3>

            <div className="mt-7 grid gap-6 md:grid-cols-3">

              <div className="flex items-center gap-3">

                <div className="h-4 w-4 rounded-full bg-green-500" />

                <div>

                  <p className="font-medium">
                    Backend API
                  </p>

                  <p className="text-sm text-slate-500">
                    Operational
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <div className="h-4 w-4 rounded-full bg-green-500" />

                <div>

                  <p className="font-medium">
                    Knowledge Base
                  </p>

                  <p className="text-sm text-slate-500">
                    Operational
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <div className="h-4 w-4 rounded-full bg-green-500" />

                <div>

                  <p className="font-medium">
                    AI Assistant
                  </p>

                  <p className="text-sm text-slate-500">
                    Operational
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}