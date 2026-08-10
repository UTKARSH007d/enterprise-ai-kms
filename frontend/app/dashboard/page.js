"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // If user is not logged in, go to login page
    if (!token) {
      window.location.href = "/";
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between px-8 py-5">

          {/* Logo / System Name */}
          <div>
            <h1 className="text-2xl font-bold">
              Enterprise AI
            </h1>

            <p className="text-sm text-slate-400">
              Knowledge Management System
            </p>
          </div>

          {/* ================= PROFILE ================= */}
          <div className="relative">

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-800"
            >

              {/* Name + Role */}
              <div className="text-right">

                <p className="font-medium">
                  {user?.name || "Employee"}
                </p>

                <p className="text-xs text-slate-400 capitalize">
                  {user?.role || "Employee"}
                </p>

              </div>

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
                {(user?.name || "E").charAt(0).toUpperCase()}
              </div>

            </button>

            {/* ================= PROFILE DROPDOWN ================= */}
            {profileOpen && (
              <div className="absolute right-0 z-50 mt-3 w-72 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">

                {/* User Information */}
                <div className="mb-4 border-b border-slate-700 pb-4">

                  <p className="text-lg font-semibold">
                    {user?.name || "User"}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {user?.email || "No email available"}
                  </p>

                </div>

                {/* Role */}
                <div className="mb-4">

                  <p className="text-xs uppercase text-slate-500">
                    Role
                  </p>

                  <p className="mt-1 capitalize text-slate-200">
                    {user?.role || "-"}
                  </p>

                </div>

                {/* Department */}
                <div className="mb-4">

                  <p className="text-xs uppercase text-slate-500">
                    Department
                  </p>

                  <p className="mt-1 text-slate-200">
                    Department ID: {user?.department_id || "-"}
                  </p>

                </div>

                {/* Account Status */}
                <div className="mb-4">

                  <p className="text-xs uppercase text-slate-500">
                    Account Status
                  </p>

                  <p className="mt-1 text-green-400">
                    Active
                  </p>

                </div>

                <div className="my-4 border-t border-slate-700" />

                {/* Logout */}
                <button
                  onClick={logout}
                  className="w-full rounded-lg px-3 py-2 text-left text-red-400 transition hover:bg-slate-800"
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>
        </div>
      </header>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex min-h-[calc(100vh-81px)]">

        {/* ================= SIDEBAR ================= */}
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-950 p-5 md:block">

          <nav className="space-y-2">

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium transition hover:bg-blue-500"
            >
              🏠 Dashboard
            </Link>

            {/* AI Assistant */}
            <Link
              href="/assistant"
              className="block w-full rounded-lg px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800"
            >
              💬 AI Assistant
            </Link>

            {/* Knowledge Base */}
            <Link
              href="/knowledge-base"
              className="block w-full rounded-lg px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800"
            >
              📚 Knowledge Base
            </Link>


            {/* AI Document Analysis */}
            <Link
              href="/analysis"
              className="block w-full rounded-lg px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800"
            >
              🧠 AI Document Analysis
            </Link>

          </nav>

          {/* Department */}
          <div className="mt-10 border-t border-slate-800 pt-5">

            <p className="px-4 text-xs uppercase text-slate-500">
              Your Department
            </p>

            <p className="px-4 pt-2 text-sm text-slate-300">
              Department ID: {user?.department_id || "-"}
            </p>

          </div>

        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <section className="flex-1 p-6 md:p-10">

          {/* Welcome */}
          <div className="mb-8">

            <h2 className="text-3xl font-bold">
              Welcome back
              {user?.name ? `, ${user.name}` : ""}
            </h2>

            <p className="mt-2 text-slate-400">
              Ask questions and find information from your enterprise
              knowledge base.
            </p>

          </div>

          {/* ================= AI SEARCH CARD ================= */}
          <Link href="/assistant">

            <div className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500">

              <div className="mb-5">

                <h3 className="text-xl font-semibold">
                  🤖 Ask Enterprise AI
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Get answers from your company's approved documents.
                </p>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-slate-500">
                  Ask about leave, policies, benefits...
                </div>

                <div className="rounded-xl bg-blue-600 px-7 py-4 text-center font-semibold">
                  Ask AI →
                </div>

              </div>

            </div>

          </Link>

          {/* ================= QUICK ACCESS ================= */}
          <div className="mt-8">

            <h3 className="mb-4 text-xl font-semibold">
              Quick Access
            </h3>

            <div className="grid gap-4 md:grid-cols-3">

              {/* AI Assistant */}
              <Link href="/assistant">

                <div className="h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500 hover:bg-slate-800">

                  <div className="mb-3 text-2xl">
                    💬
                  </div>

                  <h4 className="font-semibold">
                    AI Assistant
                  </h4>

                  <p className="mt-1 text-sm text-slate-400">
                    Ask questions and get AI-powered answers.
                  </p>

                </div>

              </Link>

              {/* Knowledge Base */}
              <Link href="/knowledge-base">

                <div className="h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500 hover:bg-slate-800">

                  <div className="mb-3 text-2xl">
                    📚
                  </div>

                  <h4 className="font-semibold">
                    Knowledge Base
                  </h4>

                  <p className="mt-1 text-sm text-slate-400">
                    Search your organization's knowledge.
                  </p>

                </div>

              </Link>

              
              {/* AI Document Analysis */}
              <Link href="/analysis">

                <div className="h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500 hover:bg-slate-800">

                  <div className="mb-3 text-2xl">
                    🧠
                  </div>

                  <h4 className="font-semibold">
                    AI Document Analysis
                  </h4>

                  <p className="mt-1 text-sm text-slate-400">
                    Summarize and analyze enterprise documents.
                  </p>

                </div>

              </Link>

            </div>

          </div>

          {/* ================= EXAMPLE QUESTIONS ================= */}
          <div className="mt-8">

            <h3 className="mb-4 text-xl font-semibold">
              Example Questions
            </h3>

            <div className="grid gap-3 md:grid-cols-2">

              <Link href="/assistant">

                <div className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-blue-500">

                  <p className="text-sm text-slate-300">
                    What is the annual Casual Leave entitlement?
                  </p>

                </div>

              </Link>

              <Link href="/assistant">

                <div className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-blue-500">

                  <p className="text-sm text-slate-300">
                    What is the Work From Home policy?
                  </p>

                </div>

              </Link>

              <Link href="/assistant">

                <div className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-blue-500">

                  <p className="text-sm text-slate-300">
                    How does overtime compensation work?
                  </p>

                </div>

              </Link>

              <Link href="/assistant">

                <div className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-blue-500">

                  <p className="text-sm text-slate-300">
                    What documents are available for my department?
                  </p>

                </div>

              </Link>

            </div>

          </div>

          {/* ================= FOOTER INFO ================= */}
          <div className="mt-10 border-t border-slate-800 pt-6">

            <p className="text-center text-xs text-slate-500">
              Enterprise AI Knowledge Management System
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}