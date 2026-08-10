"use client";

import { useEffect, useState } from "react";

const API_URL =
  "http://127.0.0.1:8000";

export default function KnowledgeBasePage() {
  const [documents, setDocuments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // FETCH DOCUMENTS
  // ==========================================================

  const fetchDocuments = async (
    searchTerm = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        setError(
          "Please login again."
        );

        return;
      }

      let url =
        `${API_URL}/documents/`;

      if (searchTerm.trim()) {
        url +=
          `?search=${encodeURIComponent(
            searchTerm
          )}`;
      }

      const response =
        await fetch(url, {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        });

      // Token invalid
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

      // Permission error
      if (response.status === 403) {
        setError(
          "You do not have permission to access the knowledge base."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load documents."
        );
      }

      const data =
        await response.json();

      setDocuments(data);

    } catch (err) {
      console.error(err);

      setError(
        "Could not load the knowledge base."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    fetchDocuments(search);
  };

  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload = async (
    documentId,
    filename
  ) => {
    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        window.location.href = "/";
        return;
      }

      const url =
        `${API_URL}/documents/${documentId}/download`;

      const response =
        await fetch(url, {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        });

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

      if (response.status === 403) {
        alert(
          "You do not have permission to download this document."
        );

        return;
      }

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Download error:",
          errorText
        );

        throw new Error(
          `Download failed: ${response.status}`
        );
      }

      const blob =
        await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href =
        downloadUrl;

      link.download =
        filename ||
        "document.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl
      );

    } catch (err) {
      console.error(
        "DOWNLOAD FAILED:",
        err
      );

      alert(
        "Could not download the document."
      );
    }
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Knowledge Base
          </h1>

          <p className="mt-2 text-slate-400">
            Search and access your organization's approved knowledge.
          </p>

        </div>

        {/* SEARCH */}

        <form
          onSubmit={handleSearch}
          className="mb-8 flex gap-3"
        >

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-7 py-4 font-semibold hover:bg-blue-700"
          >
            Search
          </button>

        </form>

        {/* LOADING */}

        {loading && (
          <div className="text-slate-400">
            Loading knowledge base...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          documents.length === 0 && (

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No documents found.
              </p>

            </div>

          )}

        {/* DOCUMENTS */}

        {!loading &&
          !error &&
          documents.length > 0 && (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

              {documents.map(
                (document) => (

                  <div
                    key={document.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
                  >

                    <div className="mb-5 flex items-start justify-between">

                      <div className="text-3xl">
                        📄
                      </div>

                      <span className="rounded-full bg-blue-900/40 px-3 py-1 text-xs text-blue-300">
                        {document.file_type?.toUpperCase()}
                      </span>

                    </div>

                    <h2 className="mb-2 text-xl font-semibold">
                      {document.title}
                    </h2>

                    <p className="mb-4 text-sm text-slate-400">
                      {document.category}
                    </p>

                    <div className="mb-5 text-xs text-slate-500">

                      Uploaded:{" "}

                      {document.created_at
                        ? new Date(
                            document.created_at
                          ).toLocaleDateString()
                        : "-"}

                    </div>

                    <button
                      onClick={() =>
                        handleDownload(
                          document.id,
                          document.original_filename
                        )
                      }
                      className="w-full rounded-xl bg-slate-800 py-3 font-medium transition hover:bg-blue-600"
                    >
                      Download Document
                    </button>

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </main>
  );
}