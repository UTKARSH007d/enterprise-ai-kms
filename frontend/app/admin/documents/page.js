"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================
  // AUTH + INITIAL DATA LOAD
  // =========================
  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
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

    // Only administrators can access document management
    if (
      !currentUser.role ||
      !["admin", "super_admin"].includes(
        currentUser.role.toLowerCase()
      )
    ) {
      window.location.href = "/dashboard";
      return;
    }

    // User is admin/super admin -> load admin data
    await Promise.all([
      fetchDocuments(token),
      fetchDepartments(token),
    ]);

    setPageLoading(false);
  }

  // =========================
  // FETCH DOCUMENTS
  // =========================
  const fetchDocuments = async (token = getToken()) => {
    try {
      const response = await fetch(
        `${API_URL}/documents/`,
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
        window.location.href = "/dashboard";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();

      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Could not load documents.");
    }
  };

  // =========================
  // FETCH DEPARTMENTS
  // =========================
  const fetchDepartments = async (
    token = getToken()
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/admin/departments`,
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
        window.location.href = "/dashboard";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load departments");
      }

      const data = await response.json();

      setDepartments(data);
    } catch (err) {
      console.error(err);
      setError("Could not load departments.");
    }
  };

  // =========================
  // UPLOAD DOCUMENT
  // =========================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !category || !departmentId || !file) {
      setError(
        "Please fill all fields and select a file."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      const formData = new FormData();

      formData.append("title", title);
      formData.append("category", category);

      // =====================================================
      // COMPANY-WIDE DOCUMENT
      // =====================================================
      // If Company-wide is selected, do NOT send
      // department_id.
      //
      // FastAPI will therefore receive:
      //
      // department_id = None
      //
      // which is already supported by the backend.
      // =====================================================

      if (departmentId !== "company-wide") {
        formData.append(
          "department_id",
          departmentId
        );
      }

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/documents/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href = "/dashboard";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed"
        );
      }

      setMessage(
        departmentId === "company-wide"
          ? "Company-wide document uploaded successfully."
          : "Document uploaded successfully."
      );

      setTitle("");
      setCategory("");
      setDepartmentId("");
      setFile(null);

      const fileInput =
        document.getElementById("document-file");

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchDocuments(token);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE DOCUMENT
  // =========================
  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href = "/dashboard";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Delete failed"
        );
      }

      setMessage(
        "Document deleted successfully."
      );

      await fetchDocuments(token);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <div className="mb-4 text-4xl">
            📄
          </div>

          <p className="text-slate-400">
            Loading document management...
          </p>

        </div>
      </main>
    );
  }

  // =========================
  // DOCUMENT MANAGEMENT
  // =========================
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl p-6 md:p-10">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Document Management
          </h1>

          <p className="mt-2 text-slate-400">
            Upload and manage your organization's
            knowledge documents.
          </p>

        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-800 bg-green-950/30 p-4 text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* UPLOAD SECTION */}
        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-6 text-2xl font-semibold">
            Upload Document
          </h2>

          <form
            onSubmit={handleUpload}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >

            {/* TITLE */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Document Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Employee Handbook"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* CATEGORY */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="HR"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* DEPARTMENT */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Department
              </label>

              <select
                value={departmentId}
                onChange={(e) =>
                  setDepartmentId(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >

                <option value="">
                  Select Department
                </option>

                {/* COMPANY-WIDE OPTION */}
                <option value="company-wide">
                  Company-wide
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* FILE */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                File
              </label>

              <input
                id="document-file"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300"
              />

            </div>

            {/* UPLOAD BUTTON */}
            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Uploading..."
                  : "Upload Document"}
              </button>

            </div>

          </form>

        </div>

        {/* DOCUMENTS */}
        <div>

          <h2 className="mb-6 text-2xl font-semibold">
            All Documents
          </h2>

          {documents.length === 0 ? (

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              No documents found.
            </div>

          ) : (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

              {documents.map(
                (document) => (

                  <div
                    key={document.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >

                    <div className="mb-5 flex items-start justify-between">

                      <div className="text-3xl">
                        📄
                      </div>

                      <span className="rounded-full bg-blue-900/40 px-3 py-1 text-xs text-blue-300">
                        {document.file_type?.toUpperCase()}
                      </span>

                    </div>

                    <h3 className="mb-2 text-xl font-semibold">
                      {document.title}
                    </h3>

                    <p className="mb-2 text-sm text-slate-400">
                      Category:{" "}
                      {document.category}
                    </p>

                    <p className="mb-5 text-sm text-slate-400">
                      Department:{" "}
                      {document.department_id === null
                        ? "Company-wide"
                        : document.department_id}
                    </p>

                    <button
                      onClick={() =>
                        handleDelete(document.id)
                      }
                      className="w-full rounded-xl bg-red-600 py-3 font-medium hover:bg-red-700"
                    >
                      Delete Document
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}