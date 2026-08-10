"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAccessAndLoadLogs();
  }, []);

  // ==========================================================
  // AUTHENTICATION + ROLE CHECK
  // ==========================================================

  async function checkAccessAndLoadLogs() {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    // Not logged in
    if (!token || !storedUser) {
      window.location.href = "/";
      return;
    }

    let currentUser;

    try {
      currentUser = JSON.parse(storedUser);
    } catch (err) {
      console.error("Invalid user data:", err);

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      window.location.href = "/";
      return;
    }

    // ========================================================
    // ADMIN + SUPER ADMIN CAN ACCESS AUDIT LOGS
    // ========================================================

    const role = currentUser.role?.toLowerCase();

    if (role !== "admin" && role !== "super_admin") {
      window.location.href = "/dashboard";
      return;
    }

    // User is authorized
    await fetchLogs(token);
  }

  // ==========================================================
  // FETCH AUDIT LOGS
  // ==========================================================

  async function fetchLogs(token) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/audit-logs/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Token expired / invalid
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "/";
        return;
      }

      // User authenticated but doesn't have permission
      if (response.status === 403) {
        setError(
          "You do not have permission to view audit logs."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load audit logs"
        );
      }

      const data = await response.json();

      setLogs(data);
    } catch (err) {
      console.error("Audit logs error:", err);

      setError(
        "Could not load audit logs."
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
            📝
          </div>

          <p className="text-slate-400">
            Loading audit logs...
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
              Audit Logs
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

        {/* TITLE */}

        <div className="mb-8">

          <h2 className="text-4xl font-bold">
            Audit Logs
          </h2>

          <p className="mt-2 text-slate-400">
            Track important activity across the
            knowledge management system.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!error && logs.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

            <p className="text-slate-400">
              No audit activity found.
            </p>

          </div>
        )}

        {/* LOG TABLE */}

        {!error && logs.length > 0 && (

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b border-slate-800">

                  <tr>

                    <th className="px-6 py-4 text-left text-slate-400">
                      ID
                    </th>

                    <th className="px-6 py-4 text-left text-slate-400">
                      User ID
                    </th>

                    <th className="px-6 py-4 text-left text-slate-400">
                      Action
                    </th>

                    <th className="px-6 py-4 text-left text-slate-400">
                      Date & Time
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {logs.map((log) => (

                    <tr
                      key={log.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                    >

                      <td className="px-6 py-5">
                        {log.id}
                      </td>

                      <td className="px-6 py-5">
                        {log.user_id}
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                          {log.action}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-slate-400">

                        {log.created_at
                          ? new Date(
                              log.created_at
                            ).toLocaleString()
                          : "-"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </section>

    </main>
  );
}