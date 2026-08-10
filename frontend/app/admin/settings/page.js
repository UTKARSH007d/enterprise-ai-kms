"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // ==========================================================
  // AUTH + ROLE CHECK
  // ==========================================================

  async function checkAdminAccess() {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    // Not logged in
    if (!token || !storedUser) {
      window.location.href = "/";
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error(
        "Invalid stored user:",
        err
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      window.location.href = "/";
      return;
    }

    // ========================================================
    // ADMIN + SUPER ADMIN CAN ACCESS SETTINGS
    // ========================================================

    const role = user.role?.toLowerCase();

    if (role !== "admin" && role !== "super_admin") {
      window.location.href = "/dashboard";
      return;
    }

    // Authorized
    await fetchSettings(token);
  }

  // ==========================================================
  // FETCH SETTINGS
  // ==========================================================

  async function fetchSettings(token) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/settings/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Invalid / expired token
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "/";
        return;
      }

      // No permission
      if (response.status === 403) {
        setError(
          "You do not have permission to view settings."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load settings"
        );
      }

      const data = await response.json();

      setSettings(data);

    } catch (err) {
      console.error(
        "Settings error:",
        err
      );

      setError(
        "Could not load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // UPDATE SETTING
  // ==========================================================

  async function updateSetting(key, value) {
    try {
      setSaving(key);
      setError("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        window.location.href = "/";
        return;
      }

      const response = await fetch(
        `${API_URL}/settings/${encodeURIComponent(
          key
        )}?value=${encodeURIComponent(
          value
        )}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Invalid / expired token
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

      // No permission
      if (response.status === 403) {
        setError(
          "You do not have permission to update settings."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to update setting"
        );
      }

      await fetchSettings(token);

    } catch (err) {
      console.error(
        "Update setting error:",
        err
      );

      setError(
        "Could not update setting."
      );

    } finally {
      setSaving("");
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
            ⚙️
          </div>

          <p className="text-slate-400">
            Loading settings...
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
              System Settings
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

          <h2 className="text-4xl font-bold">
            Settings
          </h2>

          <p className="mt-2 text-slate-400">
            Manage system configuration and AI settings.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* SETTINGS */}

        {!error && (
          <div className="space-y-4">

            {settings.map((setting) => (

              <div
                key={setting.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  {/* INFORMATION */}

                  <div>

                    <h3 className="text-lg font-semibold capitalize">
                      {setting.key.replaceAll(
                        "_",
                        " "
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">

                      Last updated:{" "}

                      {setting.updated_at
                        ? new Date(
                            setting.updated_at
                          ).toLocaleString()
                        : "-"}

                    </p>

                  </div>

                  {/* INPUT */}

                  <div className="flex gap-3">

                    <input
                      defaultValue={
                        setting.value
                      }
                      id={`setting-${setting.id}`}
                      className="w-64 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={() => {

                        const input =
                          document.getElementById(
                            `setting-${setting.id}`
                          );

                        updateSetting(
                          setting.key,
                          input.value
                        );

                      }}
                      disabled={
                        saving === setting.key
                      }
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >

                      {saving === setting.key
                        ? "Saving..."
                        : "Save"}

                    </button>

                  </div>

                </div>

              </div>

            ))}

            {/* NO SETTINGS */}

            {settings.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

                <p className="text-slate-400">
                  No settings configured yet.
                </p>

              </div>
            )}

          </div>
        )}

      </section>

    </main>
  );
}