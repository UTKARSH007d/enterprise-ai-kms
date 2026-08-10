"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ==========================================================
      // LOGIN
      // ==========================================================

      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      // ==========================================================
      // SAVE ACCESS TOKEN
      // ==========================================================

      const token = data.access_token;

      localStorage.setItem(
        "access_token",
        token
      );

      // ==========================================================
      // GET CURRENT USER
      // ==========================================================

      const userResponse = await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = await userResponse.json();

      if (!userResponse.ok) {
        alert(
          "Could not get user information."
        );
        return;
      }

      // ==========================================================
      // SAVE USER
      // ==========================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ==========================================================
      // ROLE-BASED REDIRECT
      // ==========================================================

      const role = user.role?.toLowerCase();

      if (
        role === "admin" ||
        role === "super_admin"
      ) {
        // Admin and Super Admin
        // both go to the admin dashboard

        window.location.href = "/admin";
      } else {
        // Normal employees

        window.location.href =
          "/dashboard";
      }

    } catch (error) {
      console.error(error);

      alert(
        "Could not connect to the backend."
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md">

        {/* =====================================================
            LOGO / BRAND
        ====================================================== */}

        <div className="text-center mb-8">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold">
            AI
          </div>

          <h1 className="text-3xl font-bold text-white">
            Enterprise AI
          </h1>

          <p className="mt-2 text-slate-400">
            Knowledge Management System
          </p>

        </div>

        {/* =====================================================
            LOGIN CARD
        ====================================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <h2 className="text-2xl font-semibold text-white">
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your enterprise
            knowledge base.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* =================================================
                EMAIL
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* =================================================
                LOGIN BUTTON
            ================================================== */}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Sign In
            </button>

          </form>

          {/* =================================================
              FOOTER MESSAGE
          ================================================== */}

          <div className="mt-6 border-t border-slate-800 pt-5 text-center">

            <p className="text-xs text-slate-500">
              Secure enterprise knowledge management
            </p>

          </div>

        </div>

        {/* =====================================================
            COPYRIGHT
        ====================================================== */}

        <p className="mt-6 text-center text-xs text-slate-600">
          © 2026 ABC Technologies
        </p>

      </div>

    </main>
  );
}