"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AnalysisPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoadingDocuments(true);
      setError("");

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
        console.error("Invalid stored user:", err);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "/";
        return;
      }

      console.log("Analysis user:", currentUser);
      console.log("Analysis user role:", currentUser.role);

      const response = await fetch(`${API_URL}/documents/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      console.log(
        "Documents response status:",
        response.status
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "/";
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to access documents."
        );
      }

      if (!response.ok) {
        throw new Error("Failed to load documents.");
      }

      const data = await response.json();

      console.log("Documents received:", data);
      console.log("Number of documents:", data.length);

      setDocuments(data);
    } catch (err) {
      console.error("Document loading error:", err);

      setError(
        err.message || "Could not load documents."
      );
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedDocument) {
      setError("Please select a document.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      console.log(
        "Analyzing document:",
        selectedDocument
      );

      const response = await fetch(
        `${API_URL}/analysis/${selectedDocument}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Analysis response:", data);

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "/";
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to analyze this document."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "Document not found or you do not have access to it."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Document analysis failed."
        );
      }

      setAnalysis(
        data.analysis ||
          data.summary ||
          "No analysis was returned."
      );
    } catch (err) {
      console.error("Document analysis error:", err);

      setError(
        err.message || "Could not analyze the document."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 md:p-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">
          AI Document Analysis
        </h1>

        <p className="mt-3 text-slate-400">
          Analyze enterprise documents using AI.
        </p>
      </div>


      {/* ANALYSIS CARD */}
      <div className="mt-8 rounded-2xl bg-slate-900 p-8">

        <label className="mb-3 block text-slate-300">
          Select Document
        </label>


        {/* LOADING DOCUMENTS */}
        {loadingDocuments ? (
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-slate-400">
            Loading documents...
          </div>
        ) : (

          <select
            value={selectedDocument}
            onChange={(e) => {
              setSelectedDocument(e.target.value);
              setError("");
              setAnalysis("");
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
          >

            <option value="">
              Select a document
            </option>

            {documents.map((doc) => (
              <option
                key={doc.id}
                value={doc.id}
              >
                {doc.title}
              </option>
            ))}

          </select>

        )}


        {/* NO DOCUMENTS */}
        {!loadingDocuments &&
          documents.length === 0 &&
          !error && (
            <div className="mt-4 rounded-lg border border-yellow-700 bg-yellow-950/30 p-4 text-yellow-300">
              No documents are available for analysis.
            </div>
          )}


        {/* ANALYZE BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={
            loading ||
            loadingDocuments ||
            documents.length === 0
          }
          className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Analyzing..."
            : "Analyze Document"}
        </button>


        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-500 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

      </div>


      {/* ANALYSIS RESULT */}
      {analysis && (
        <div className="mt-8 rounded-2xl bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            AI Analysis
          </h2>

          <div className="whitespace-pre-wrap leading-7 text-slate-300">
            {analysis}
          </div>

        </div>
      )}

    </main>
  );
}