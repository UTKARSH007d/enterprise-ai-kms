"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminReportsPage() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_documents: 0,
    total_chat_sessions: 0,
    total_chat_messages: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    checkAccessAndLoadReports();
  }, []);

  // ==========================================================
  // AUTH + ROLE CHECK
  // ==========================================================

  async function checkAccessAndLoadReports() {
    const token =
      localStorage.getItem(
        "access_token"
      );

    const storedUser =
      localStorage.getItem("user");

    // Not logged in
    if (!token || !storedUser) {
      window.location.href = "/";
      return;
    }

    let currentUser;

    try {
      currentUser =
        JSON.parse(storedUser);
    } catch (err) {
      console.error(
        "Invalid user data:",
        err
      );

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href = "/";
      return;
    }

    // ========================================================
    // ADMIN + SUPER ADMIN
    // ========================================================

    const role =
      currentUser.role?.toLowerCase();

    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {
      window.location.href =
        "/dashboard";

      return;
    }

    await loadReports(token);
  }

  // ==========================================================
  // LOAD REPORTS
  // ==========================================================

  async function loadReports(token) {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/admin/stats`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // Invalid token
      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "user"
        );

        window.location.href = "/";
        return;
      }

      // Permission denied
      if (response.status === 403) {
        setError(
          "You do not have permission to view reports."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load reports"
        );
      }

      const data =
        await response.json();

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

    } catch (err) {
      console.error(
        "Reports error:",
        err
      );

      setError(
        "Could not load reports."
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="text-center">

          <div className="mb-4 text-4xl">
            📊
          </div>

          <p className="text-slate-400">
            Loading reports...
          </p>

        </div>

      </main>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="flex items-center justify-between px-8 py-5">

          <div>

            <h1 className="text-2xl font-bold">
              Enterprise AI
            </h1>

            <p className="text-sm text-slate-400">
              Reports & Analytics
            </p>

          </div>

          <a
            href="/admin"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Back to Admin
          </a>

        </div>

      </header>

      {/* CONTENT */}

      <section className="p-6 md:p-10">

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            Reports & Analytics
          </h2>

          <p className="mt-2 text-slate-400">
            View system usage, users, documents and AI activity.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* STAT CARDS */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* USERS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Total Users
            </p>

            <p className="mt-3 text-4xl font-bold">
              {stats.total_users}
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
              {stats.total_documents}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Enterprise knowledge documents
            </p>

          </div>

          {/* SESSIONS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Chat Sessions
            </p>

            <p className="mt-3 text-4xl font-bold">
              {stats.total_chat_sessions}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              AI conversations
            </p>

          </div>

          {/* MESSAGES */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Chat Messages
            </p>

            <p className="mt-3 text-4xl font-bold">
              {stats.total_chat_messages}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Questions and AI responses
            </p>

          </div>

        </div>

        {/* SYSTEM OVERVIEW */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            System Overview
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Current usage of the Enterprise AI Knowledge Management System.
          </p>

          <div className="mt-8 space-y-6">

            {/* USERS */}

            <div>

              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-300">
                  Users
                </span>

                <span className="text-sm text-slate-400">
                  {stats.total_users}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      stats.total_users * 10,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* DOCUMENTS */}

            <div>

              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-300">
                  Documents
                </span>

                <span className="text-sm text-slate-400">
                  {stats.total_documents}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      stats.total_documents * 10,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* CHAT SESSIONS */}

            <div>

              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-300">
                  Chat Sessions
                </span>

                <span className="text-sm text-slate-400">
                  {stats.total_chat_sessions}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      stats.total_chat_sessions * 5,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* CHAT MESSAGES */}

            <div>

              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-300">
                  Chat Messages
                </span>

                <span className="text-sm text-slate-400">
                  {stats.total_chat_messages}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      stats.total_chat_messages * 2,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        {/* INSIGHTS */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-3 text-3xl">
              👥
            </div>

            <h3 className="text-lg font-semibold">
              User Activity
            </h3>

            <p className="mt-2 text-sm text-slate-400">

              The system currently has{" "}

              <span className="font-semibold text-white">
                {stats.total_users}
              </span>{" "}

              registered users.

            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-3 text-3xl">
              📚
            </div>

            <h3 className="text-lg font-semibold">
              Knowledge Base
            </h3>

            <p className="mt-2 text-sm text-slate-400">

              There are{" "}

              <span className="font-semibold text-white">
                {stats.total_documents}
              </span>{" "}

              documents available in the knowledge base.

            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-3 text-3xl">
              🤖
            </div>

            <h3 className="text-lg font-semibold">
              AI Usage
            </h3>

            <p className="mt-2 text-sm text-slate-400">

              The AI system has processed{" "}

              <span className="font-semibold text-white">
                {stats.total_chat_messages}
              </span>{" "}

              chat messages across{" "}

              <span className="font-semibold text-white">
                {stats.total_chat_sessions}
              </span>{" "}

              sessions.

            </p>

          </div>

        </div>

      </section>

    </main>
  );
}