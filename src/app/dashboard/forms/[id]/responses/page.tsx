"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import * as XLSX from "xlsx";

type Question = {
  id: string;
  title?: string;
  label?: string;
  type: string;
  options?: string[];
};

type Submission = {
  id: string;
  answers: Record<string, unknown>;
  submittedAt: string | null;
};

type ResponseData = {
  success: boolean;
  message?: string;
  form?: {
    id: string;
    title: string;
    published: boolean;
    questions: Question[] | null;
  };
  responses?: Submission[];
};

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function safeSpreadsheetValue(value: unknown): string {
  const text = formatAnswer(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function questionLabel(question: Question): string {
  return question.title?.trim() || question.label?.trim() || question.id;
}

function ResponsesContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const formId = params.id;

  const [data, setData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"" | "csv" | "excel">("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7days" | "30days">("all");

  const loadResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/forms/${encodeURIComponent(formId)}/responses`,
        { cache: "no-store" }
      );
      const result = (await response.json()) as ResponseData;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Responses load nahi hue.");
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void loadResponses();
  }, [loadResponses]);

  const responses = data?.responses ?? [];
  const questions = data?.form?.questions ?? [];

  const filteredResponses = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (dateFilter === "today") start.setHours(0, 0, 0, 0);
    if (dateFilter === "7days") start.setDate(start.getDate() - 7);
    if (dateFilter === "30days") start.setDate(start.getDate() - 30);

    const normalizedSearch = search.trim().toLowerCase();

    return responses.filter((submission) => {
      const submittedAt = submission.submittedAt
        ? new Date(submission.submittedAt)
        : null;

      if (dateFilter !== "all") {
        if (!submittedAt || Number.isNaN(submittedAt.getTime())) return false;
        if (submittedAt < start || submittedAt > now) return false;
      }

      if (!normalizedSearch) return true;

      const searchableText = [
        submission.id,
        submission.submittedAt ?? "",
        ...Object.entries(submission.answers ?? {}).flatMap(([questionId, answer]) => {
          const question = questions.find((item) => item.id === questionId);
          return [question ? questionLabel(question) : questionId, formatAnswer(answer)];
        }),
      ].join(" ").toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [responses, questions, search, dateFilter]);

  const exportRows = useMemo(() => {
    const knownQuestionIds = new Set(questions.map((question) => question.id));
    const extraQuestionIds = Array.from(
      new Set(
        filteredResponses.flatMap((submission) =>
          Object.keys(submission.answers ?? {}).filter((id) => !knownQuestionIds.has(id))
        )
      )
    );
    const columns = [
      ...questions.map((question) => ({ id: question.id, label: questionLabel(question) })),
      ...extraQuestionIds.map((id) => ({ id, label: id })),
    ];

    return filteredResponses.map((submission, index) => {
      const row: Record<string, string | number> = {
        "Response Number": filteredResponses.length - index,
        "Response ID": safeSpreadsheetValue(submission.id),
        "Submitted At": submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString()
          : "Date unavailable",
      };

      for (const column of columns) {
        const duplicateLabelCount = columns.filter((candidate) => candidate.label === column.label).length;
        const header = duplicateLabelCount > 1 ? `${column.label} (${column.id})` : column.label;
        row[header] = safeSpreadsheetValue(submission.answers?.[column.id]);
      }
      return row;
    });
  }, [questions, filteredResponses]);

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function makeFilename(extension: "csv" | "xlsx") {
    const safeTitle = (data?.form?.title || "form-responses")
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60);
    return `${safeTitle || "form-responses"}-responses.${extension}`;
  }

  function exportCsv() {
    if (!data?.form || filteredResponses.length === 0 || exporting) return;
    try {
      setExporting("csv");
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      downloadBlob(
        new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
        makeFilename("csv")
      );
    } catch (err) {
      console.error("CSV export error:", err);
      alert("CSV export nahi ho paya. Please try again.");
    } finally {
      setExporting("");
    }
  }

  function exportExcel() {
    if (!data?.form || filteredResponses.length === 0 || exporting) return;
    try {
      setExporting("excel");
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet["!cols"] = Object.keys(exportRows[0] ?? {}).map((key) => ({
        wch: Math.min(
          40,
          Math.max(key.length + 2, ...exportRows.map((row) => String(row[key] ?? "").length + 2))
        ),
      }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
      XLSX.writeFile(workbook, makeFilename("xlsx"));
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Excel export nahi ho paya. Please try again.");
    } finally {
      setExporting("");
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading responses...</main>;
  }

  if (error || !data?.form) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-xl border bg-white p-6">
          <p className="text-red-600">{error || "Form not found."}</p>
          <button type="button" onClick={() => router.push("/dashboard")} className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-white">Back to Dashboard</button>
          <button type="button" onClick={() => void loadResponses()} className="ml-2 mt-4 rounded-lg border px-4 py-2">Try again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => router.push("/dashboard")} className="mb-5 text-sm font-medium text-violet-700 hover:underline">← Back to Dashboard</button>

        <header className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-violet-700">FormFlow · Responses</p>
            <h1 className="mt-2 break-words text-2xl font-bold">{data.form.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Showing {filteredResponses.length} of {responses.length} submissions
            </p>
          </div>
          <button type="button" onClick={() => void loadResponses()} disabled={Boolean(exporting)} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw size={16} /> Refresh responses
          </button>
        </header>

        <section className="mt-5 rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <SlidersHorizontal size={18} className="text-violet-700" />
            Search & filter responses
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <label className="relative block">
              <span className="sr-only">Search responses</span>
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search answers or response ID..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </label>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as typeof dateFilter)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              aria-label="Filter by submission date"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>
          {(search || dateFilter !== "all") && (
            <button type="button" onClick={() => { setSearch(""); setDateFilter("all"); }} className="mt-3 text-sm font-medium text-violet-700 hover:underline">
              Clear filters
            </button>
          )}
        </section>

        <section className="mt-5 flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Export responses</h2>
            <p className="mt-1 text-sm text-slate-500">Export the currently filtered submissions.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={exportCsv} disabled={filteredResponses.length === 0 || Boolean(exporting)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50">
              <FileText size={16} /> {exporting === "csv" ? "Exporting..." : "Export CSV"}
            </button>
            <button type="button" onClick={exportExcel} disabled={filteredResponses.length === 0 || Boolean(exporting)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
              <FileSpreadsheet size={16} /> {exporting === "excel" ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </section>

        {filteredResponses.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-bold">{responses.length === 0 ? "No responses yet" : "No matching responses"}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {responses.length === 0 ? "Share your published form link to start receiving responses." : "Try another search term or date filter."}
            </p>
            {responses.length === 0 && data.form.published && (
              <button type="button" onClick={() => router.push(`/forms/${encodeURIComponent(formId)}`)} className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Open public form</button>
            )}
          </section>
        ) : (
          <section className="mt-6 space-y-5">
            {filteredResponses.map((submission, index) => (
              <article key={submission.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-4">
                  <h2 className="font-semibold">Response #{filteredResponses.length - index}</h2>
                  <time className="text-sm text-slate-500">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "Date unavailable"}
                  </time>
                </div>
                <div className="space-y-4 p-5">
                  {Object.keys(submission.answers ?? {}).length === 0 ? (
                    <p className="text-sm text-slate-500">No answers recorded.</p>
                  ) : (
                    Object.entries(submission.answers ?? {}).map(([questionId, answer]) => {
                      const question = questions.find((item) => item.id === questionId);
                      return (
                        <div key={questionId} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <p className="text-sm font-medium text-slate-500">{question ? questionLabel(question) : questionId}</p>
                          <p className="mt-1 whitespace-pre-wrap break-words">{formatAnswer(answer)}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default function ResponsesPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading responses...</main>}>
      <ResponsesContent />
    </Suspense>
  );
}
