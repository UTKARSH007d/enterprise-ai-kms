"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function AssistantPage() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.log("Could not read stored user");
      }
    }
  }, []);

  const askAI = async () => {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: currentQuestion,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      if (sessionId === null && data.session_id) {
        setSessionId(data.session_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          message: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("AI request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          message:
            "Sorry, I could not connect to the AI assistant. Please make sure the backend is running.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setQuestion("");
  };

  // Determine the correct dashboard based on role
  const dashboardPath =
    user?.role === "admin" || user?.role === "super_admin"
      ? "/admin"
      : "/dashboard";

  // Display the correct role
  const displayRole =
    user?.role === "super_admin"
      ? "Super Admin"
      : user?.role === "admin"
      ? "Admin"
      : "Employee";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between px-6 py-4 md:px-8">
          <div>
            <h1 className="text-2xl font-bold">
              Enterprise AI
            </h1>

            <p className="text-sm text-slate-400">
              Knowledge Management System
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-medium">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-slate-400">
                {displayRole}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
{/* Sidebar */}
<aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-5 md:block">

  <nav className="space-y-2">

    {/* Dashboard */}
    <a
      href={dashboardPath}
      className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
    >
      🏠 Dashboard
    </a>


    {/* AI Assistant */}
    <div className="rounded-lg bg-blue-600 px-4 py-3 font-medium">
      💬 AI Assistant
    </div>


    {/* Knowledge Base */}
    <a
      href="/knowledge-base"
      className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
    >
      📚 Knowledge Base
    </a>


    {/* Admin / Super Admin Features */}
    {(user?.role === "admin" ||
      user?.role === "super_admin") && (
      <>

        {/* User Management */}
        <a
          href="/admin/users"
          className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          👥 User Management
        </a>


        {/* Documents */}
        <a
          href="/admin/documents"
          className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          📄 Documents
        </a>


        {/* AI Document Analysis */}
        <a
          href="/analysis"
          className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          🤖 AI Document Analysis
        </a>


        {/* Reports */}
        <a
          href="/admin/reports"
          className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          📊 Reports & Analytics
        </a>


        {/* Audit Logs */}
        <a
          href="/admin/audit-logs"
          className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          📝 Audit Logs
        </a>


        {/* Settings */}
        <a
          href="/admin/settings"
          className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          ⚙️ Settings
        </a>

      </>
    )}

  </nav>


  {/* Department / Administration */}
  <div className="mt-10 border-t border-slate-800 pt-5">

    <p className="px-4 text-xs uppercase text-slate-500">
      {user?.role === "admin" ||
      user?.role === "super_admin"
        ? "Administration"
        : "Your Department"}
    </p>


    <p className="px-4 pt-2 text-sm text-slate-400">

      {user?.role === "super_admin"
        ? "Super Admin Access"
        : user?.role === "admin"
        ? "Admin Access"
        : `Department ID: ${
            user?.department_id || "-"
          }`}

    </p>

  </div>

</aside>

        {/* Chat Area */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Chat Header */}
          <div className="border-b border-slate-800 px-6 py-5 md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  AI Assistant
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Ask questions about your enterprise knowledge base.
                </p>
              </div>

              <button
                onClick={startNewChat}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                + New Chat
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {messages.length === 0 ? (
              <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-20 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl">
                  🤖
                </div>

                <h3 className="text-2xl font-bold">
                  How can I help you?
                </h3>

                <p className="mt-2 max-w-xl text-slate-400">
                  Ask questions about company policies, leave,
                  attendance, benefits, procedures, and other
                  information available in your knowledge base.
                </p>

                <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                  <button
                    onClick={() =>
                      setQuestion(
                        "What is the annual Casual Leave entitlement?"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left text-sm text-slate-300 hover:border-blue-500"
                  >
                    What is the annual Casual Leave entitlement?
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "What is the Work From Home policy?"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left text-sm text-slate-300 hover:border-blue-500"
                  >
                    What is the Work From Home policy?
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "How does overtime compensation work?"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left text-sm text-slate-300 hover:border-blue-500"
                  >
                    How does overtime compensation work?
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "What are the important attendance rules?"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left text-sm text-slate-300 hover:border-blue-500"
                  >
                    What are the important attendance rules?
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.map((item, index) => (
                  <div
                    key={index}
                    className={
                      item.sender === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        item.sender === "user"
                          ? "max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-5 py-4"
                          : "max-w-[85%] rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-5 py-4"
                      }
                    >
                      <div className="mb-1 text-xs font-medium text-slate-300">
                        {item.sender === "user"
                          ? "You"
                          : "Enterprise AI"}
                      </div>

                      <p className="whitespace-pre-wrap leading-7 text-slate-100">
                        {item.message}
                      </p>

                      {/* Sources */}
                      {item.sender === "assistant" &&
                        item.sources &&
                        item.sources.length > 0 && (
                          <div className="mt-5 border-t border-slate-700 pt-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              📚 Sources
                            </p>

                            <div className="space-y-2">
                              {item.sources.map(
                                (source, sourceIndex) => (
                                  <div
                                    key={sourceIndex}
                                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                                  >
                                    <p className="text-sm font-medium text-slate-200">
                                      📄{" "}
                                      {source.title ||
                                        "Document"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Document ID:{" "}
                                      {source.document_id || "-"}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="animate-pulse">
                          🤖
                        </span>

                        Enterprise AI is thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 bg-slate-950 p-4 md:p-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex gap-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask about leave, policies, benefits..."
                  className="min-h-[54px] flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />

                <button
                  onClick={askAI}
                  disabled={loading || !question.trim()}
                  className="rounded-xl bg-blue-600 px-6 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "..." : "Send →"}
                </button>
              </div>

              <p className="mt-2 text-center text-xs text-slate-600">
                Enterprise AI answers are based on uploaded company
                documents.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}