
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Eye,
  Globe,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";

type FormQuestion = {
  id: string;
  label: string;
  type: "text" | "email" | "choice" | "yesno";
  required: boolean;
  options: string[];
};

type FormItem = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  responses: number;
  updatedAt: string;
  questions: FormQuestion[];
};

const STORAGE_KEY = "formflow-forms-v1";

const starterForms: FormItem[] = [
  {
    id: "demo-feedback",
    title: "Customer Feedback",
    description: "Collect feedback from your customers.",
    published: true,
    responses: 0,
    updatedAt: new Date().toISOString(),
    questions: [],
  },
  {
    id: "demo-contact",
    title: "Contact Form",
    description: "Collect contact details and enquiries.",
    published: false,
    responses: 0,
    updatedAt: new Date().toISOString(),
    questions: [],
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [forms, setForms] = useState<FormItem[]>([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load forms from PostgreSQL through the API.
  useEffect(() => {
    let cancelled = false;

    async function loadForms() {
      try {
        const response = await fetch("/api/forms", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load forms");
        }

        let databaseForms: FormItem[] = data.forms;

        // Migrate browser forms only if the database is empty.
        if (databaseForms.length === 0) {
          const stored = localStorage.getItem(STORAGE_KEY);

          let formsToMigrate: FormItem[];

          if (stored) {
            const parsed: unknown = JSON.parse(stored);

            if (!Array.isArray(parsed)) {
              throw new Error("Saved browser forms have an invalid format");
            }

            formsToMigrate = parsed as FormItem[];
          } else {
            formsToMigrate = starterForms;
          }

          for (const form of formsToMigrate) {
            const saveResponse = await fetch("/api/forms", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(form),
            });

            const saveData = await saveResponse.json();

            if (!saveResponse.ok || !saveData.success) {
              throw new Error(
                saveData.message || "Could not migrate existing forms"
              );
            }
          }

          // Read the saved forms back from PostgreSQL.
          const refreshedResponse = await fetch("/api/forms", {
            cache: "no-store",
          });

          const refreshedData = await refreshedResponse.json();

          if (!refreshedResponse.ok || !refreshedData.success) {
            throw new Error("Could not reload forms from PostgreSQL");
          }

          databaseForms = refreshedData.forms;
        }

        if (cancelled) return;

        setForms(databaseForms);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(databaseForms));
      } catch (error) {
        console.error("Dashboard load error:", error);

        if (!cancelled) {
          alert(
            "Forms load nahi ho paye. Please check your database and API."
          );
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    loadForms();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save the latest database form list in UI state and browser cache.
  function updateFormsState(updatedForms: FormItem[]) {
    setForms(updatedForms);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedForms));
  }

  // Create a draft in PostgreSQL, then open its builder page.
  async function createForm() {
    if (busy) return;

    setBusy(true);

    const id = crypto.randomUUID();

    const newForm: FormItem = {
      id,
      title: "Untitled Form",
      description: "Add a description for your form.",
      published: false,
      responses: 0,
      updatedAt: new Date().toISOString(),
      questions: [],
    };

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newForm),
      });

      const raw = await response.text();
      let data: any = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          "API ne valid JSON return nahi kiya. /api/forms route check karo."
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || data.error || `Form creation failed (${response.status})`
        );
      }

      const savedForm: FormItem =
        data.form ??
        data.data?.form ??
        (data.id ? data : newForm);

      updateFormsState([
        savedForm,
        ...forms.filter((item) => item.id !== savedForm.id),
      ]);

      // Navigate only after the API confirms the form was saved.
      router.push(`/builder/${savedForm.id}`);
      router.refresh();
    } catch (error) {
      console.error("Create form error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Form create nahi ho paya. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  // Publish or unpublish a form through the existing POST API.
  async function togglePublished(formId: string) {
    if (busy) return;

    const form = forms.find((item) => item.id === formId);

    if (!form) return;

    setBusy(true);

    const updatedForm: FormItem = {
      ...form,
      published: !form.published,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Publish update failed");
      }

      const updatedForms = forms.map((item) =>
        item.id === formId ? (data.form as FormItem) : item
      );

      updateFormsState(updatedForms);
    } catch (error) {
      console.error("Publish update error:", error);
      alert("Publish status update nahi ho paya.");
    } finally {
      setBusy(false);
    }
  }

  // Delete a form from PostgreSQL.
  async function deleteForm(formId: string) {
    if (busy) return;

    const confirmed = window.confirm(
      "Kya aap is form ko permanently delete karna chahte hain?"
    );

    if (!confirmed) return;

    setBusy(true);

    try {
      const response = await fetch(
        `/api/forms/${encodeURIComponent(formId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      const updatedForms = forms.filter((form) => form.id !== formId);

      updateFormsState(updatedForms);
    } catch (error) {
      console.error("Delete form error:", error);
      alert("Form delete nahi ho paya. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Copy the public form URL.
  async function copyFormLink(formId: string) {
    const url = `${window.location.origin}/forms/${formId}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  const query = search.toLowerCase();

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(query) ||
      form.description.toLowerCase().includes(query)
  );

  const publishedCount = forms.filter(
    (form) => form.published
  ).length;

  const responseCount = forms.reduce(
    (total, form) => total + (form.responses || 0),
    0
  );

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
              <FileText size={20} />
            </span>
            FormFlow
          </button>

          <button
            type="button"
            onClick={createForm}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            {busy ? "Creating..." : "Create Form"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
            <LayoutDashboard size={17} />
            Workspace
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Create forms, manage your questions and track submissions.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Forms
              </p>
              <FileText className="text-violet-600" size={21} />
            </div>
            <p className="mt-3 text-3xl font-bold">{forms.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Published Forms
              </p>
              <Globe className="text-green-600" size={21} />
            </div>
            <p className="mt-3 text-3xl font-bold">{publishedCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Responses
              </p>
              <Eye className="text-blue-600" size={21} />
            </div>
            <p className="mt-3 text-3xl font-bold">{responseCount}</p>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Your Forms</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage all your forms in one place.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search forms..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {filteredForms.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <FileText size={27} />
              </div>

              <h3 className="mt-4 text-lg font-bold">
                {search ? "No matching forms" : "No forms yet"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try another search term."
                  : "Create your first form to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={createForm}
                  disabled={busy}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  <Plus size={18} />
                  {busy ? "Creating..." : "Create your first form"}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredForms.map((form) => (
                <article
                  key={form.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <FileText size={22} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        form.published
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {form.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h3 className="mt-4 break-words text-lg font-bold">
                    {form.title}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                    {form.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{form.questions?.length ?? 0} questions</span>
                    <span>{form.responses || 0} responses</span>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => router.push(`/builder/${form.id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      <Pencil size={16} />
                      Edit Form
                    </button>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => togglePublished(form.id)}
                        disabled={busy}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                      >
                        {form.published ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => copyFormLink(form.id)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        <Copy size={15} />
                        Copy Link
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/dashboard/forms/${form.id}/responses`)
                      }
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                    >
                      <MessageSquare size={16} />
                      View Responses ({form.responses || 0})
                    </button>

                    <button
                      onClick={() => deleteForm(form.id)}
                      disabled={busy}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete Form
                    </button>

                    {form.published && (
                      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-green-700">
                        <ExternalLink size={13} />
                        Publication status is enabled
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          FormFlow · Forms are stored in PostgreSQL.
        </p>
      </div>
    </main>
  );
}
