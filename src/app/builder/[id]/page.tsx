
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  title: string;
  type: string;
  required: boolean;
  options?: string[];
};

type FormDataType = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  responses: number;
  questions: Question[];
};

function BuilderContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const formId = params.id;

  const [form, setForm] = useState<FormDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadForm() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/forms", {
          cache: "no-store",
        });

        // API ka response { success: true, forms: [...] } hai,
        // direct array nahi. Isi wajah se forms.find error aa raha tha.
        const data: unknown = await response.json();

        if (!response.ok) {
          throw new Error("Forms load nahi ho sake.");
        }

        const payload = data as {
          success?: boolean;
          message?: string;
          error?: string;
          forms?: FormDataType[];
        };

        if (payload.success === false) {
          throw new Error(payload.message || payload.error || "Forms load nahi ho sake.");
        }

        const forms: FormDataType[] = Array.isArray(data)
          ? (data as FormDataType[])
          : Array.isArray(payload.forms)
            ? payload.forms
            : [];

        const found = forms.find(
          (item) => String(item.id) === String(formId)
        );

        if (!found) {
          throw new Error("Form nahi mila. Dashboard se dobara open karo.");
        }

        if (!cancelled) {
          setForm({
            ...found,
            title: found.title ?? "",
            description: found.description ?? "",
            questions: found.questions ?? [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (formId) {
      loadForm();
    }

    return () => {
      cancelled = true;
    };
  }, [formId]);

  function updateQuestion(
    questionId: string,
    changes: Partial<Question>
  ) {
    setForm((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        questions: previous.questions.map((question) =>
          question.id === questionId
            ? { ...question, ...changes }
            : question
        ),
      };
    });
  }

  function addQuestion() {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: "",
      type: "text",
      required: false,
      options: [],
    };

    setForm((previous) =>
      previous
        ? {
            ...previous,
            questions: [...previous.questions, newQuestion],
          }
        : previous
    );
  }

  function deleteQuestion(questionId: string) {
    setForm((previous) =>
      previous
        ? {
            ...previous,
            questions: previous.questions.filter(
              (question) => question.id !== questionId
            ),
          }
        : previous
    );
  }

  async function saveForm(publish: boolean) {
    if (!form || saving) return;

    if (!form.title.trim()) {
      setError("Please enter a form title.");
      return;
    }

    if (form.questions.some((question) => !question.title.trim())) {
      setError("Please enter a title for every question.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedForm: FormDataType = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        published: publish,
      };

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedForm),
      });

      const result: {
        success?: boolean;
        form?: FormDataType;
        message?: string;
        error?: string;
      } = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true || !result.form) {
        throw new Error(
          result.message || result.error || "Form save nahi ho saka."
        );
      }

      setForm(result.form);

      // Redirect only after PostgreSQL confirms the save.
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Form save nahi ho saka."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading builder...</p>
      </main>
    );
  }

  if (error && !form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!form) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Form Builder
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Edit your form and save your changes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-5 rounded-xl border-t-4 border-blue-600 bg-white p-6 shadow-sm">
          <label
            htmlFor="form-title"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Form Title
          </label>
          <input
            id="form-title"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none focus:border-blue-500"
            placeholder="Enter form title"
          />

          <label
            htmlFor="form-description"
            className="mb-2 mt-5 block text-sm font-semibold text-gray-700"
          >
            Description
          </label>
          <textarea
            id="form-description"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Describe your form"
          />
        </section>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions ({form.questions.length})
          </h2>

          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Add Question
          </button>
        </div>

        {form.questions.length === 0 && (
          <div className="mb-5 rounded-xl border border-dashed bg-white p-8 text-center text-gray-500">
            No questions yet. Click “Add Question” to get started.
          </div>
        )}

        <div className="space-y-4">
          {form.questions.map((question, index) => (
            <section
              key={question.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  Question {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => deleteQuestion(question.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>

              <label
                htmlFor={`question-${question.id}`}
                className="mb-2 block text-sm text-gray-600"
              >
                Question title
              </label>
              <input
                id={`question-${question.id}`}
                value={question.title}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    title: event.target.value,
                  })
                }
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Enter your question"
              />

              <label
                htmlFor={`type-${question.id}`}
                className="mb-2 block text-sm text-gray-600"
              >
                Answer type
              </label>
              <select
                id={`type-${question.id}`}
                value={question.type}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    type: event.target.value,
                    options: ["select", "radio", "checkbox"].includes(
                      event.target.value
                    )
                      ? question.options?.length
                        ? question.options
                        : [""]
                      : [],
                  })
                }
                className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="text">Short answer</option>
                <option value="textarea">Paragraph</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="radio">Multiple choice (one answer)</option>
                <option value="checkbox">Checkboxes (multiple answers)</option>
                <option value="select">Dropdown</option>
              </select>

              {["select", "radio", "checkbox"].includes(question.type) && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-gray-600">
                    Options
                  </label>

                  {(question.options ?? []).map((option, optionIndex) => (
                    <div
                      key={`${question.id}-option-${optionIndex}`}
                      className="mb-2 flex gap-2"
                    >
                      <input
                        value={option}
                        onChange={(event) => {
                          const options = [...(question.options ?? [])];
                          options[optionIndex] = event.target.value;
                          updateQuestion(question.id, { options });
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        placeholder={`Option ${optionIndex + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const options = (question.options ?? []).filter(
                            (_, i) => i !== optionIndex
                          );
                          updateQuestion(question.id, { options });
                        }}
                        className="rounded-lg border px-3 text-red-600 hover:bg-red-50"
                        aria-label="Remove option"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(question.id, {
                        options: [...(question.options ?? []), ""],
                      })
                    }
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    + Add option
                  </button>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      required: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Required question
              </label>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 rounded-xl border bg-white p-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => saveForm(false)}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => saveForm(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish Form"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading builder...</p>
        </main>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
