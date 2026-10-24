

"use client";



import { useParams } from "next/navigation";

import { Suspense, useEffect, useState } from "react";



type Question = {

  id: string;

  title: string;

  type: string;

  required?: boolean;

  options?: string[];

};



type PublicForm = {

  id: string;

  title: string;

  description: string | null;

  questions: Question[];

};



type AnswerValue = string | string[];

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `API returned an empty response (HTTP ${response.status}). Check the API route and the terminal error.`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `API returned invalid JSON (HTTP ${response.status}). Check the API route and terminal output.`
    );
  }
}

function PublicFormContent() {

  const params = useParams<{ id: string }>();

  const formId = params.id;



  const [form, setForm] = useState<PublicForm | null>(null);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);



  useEffect(() => {

    let cancelled = false;



    async function loadForm() {

      try {

        const response = await fetch(

          `/api/forms/${encodeURIComponent(formId)}`,

          { cache: "no-store" }

        );



        const data = await readJsonResponse<{ success?: boolean; form?: PublicForm; message?: string }>(response);



        if (!response.ok || !data.success || !data.form) {

          throw new Error(data.message || "Form nahi mila ya publish nahi hai.");

        }



        if (!cancelled) {

          setForm(data.form);

        }

      } catch (error) {

        if (!cancelled) {

          setMessage(

            error instanceof Error ? error.message : "Form load nahi hua."

          );

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    if (formId) loadForm();



    return () => {

      cancelled = true;

    };

  }, [formId]);



  function updateAnswer(questionId: string, value: AnswerValue) {

    setAnswers((previous) => ({

      ...previous,

      [questionId]: value,

    }));

  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    if (!form || submitting || submitted) return;



    setMessage("");



    for (const question of form.questions) {

      const value = answers[question.id];

      const empty =

        value === undefined ||

        value === "" ||

        (Array.isArray(value) && value.length === 0);



      if (question.required && empty) {

        setMessage(`Please answer: ${question.title}`);

        return;

      }



      if (

        !empty &&

        question.type === "email" &&

        (typeof value !== "string" ||

        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))

      ) {

        setMessage(`Please enter a valid email for: ${question.title}`);

        return;

      }

    }



    try {

      setSubmitting(true);



      const response = await fetch(

        `/api/forms/${encodeURIComponent(formId)}/submit`,

        {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ answers }),

        }

      );



      const result = await readJsonResponse<{ success?: boolean; message?: string }>(response);



      if (!response.ok || result.success !== true) {

        throw new Error(result.message || "Submission failed.");

      }



      setSubmitted(true);

      setMessage("Your response has been submitted successfully!");

    } catch (error) {

      setMessage(

        error instanceof Error ? error.message : "Submission failed."

      );

    } finally {

      setSubmitting(false);

    }

  }



  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-gray-50">

        <p className="text-gray-600">Loading form...</p>

      </main>

    );

  }



  if (!form) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">

        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">

          <h1 className="text-xl font-bold text-gray-900">

            Form unavailable

          </h1>

          <p className="mt-2 text-gray-600">

            {message || "This form does not exist or is not published."}

          </p>

        </div>

      </main>

    );

  }



  if (submitted) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">

        <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">

            ✓

          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">

            Thank you!

          </h1>

          <p className="mt-2 text-gray-600">{message}</p>

        </div>

      </main>

    );

  }



  return (

    <main className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-2xl">

        <header className="rounded-xl border-t-4 border-blue-600 bg-white p-6 shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>

          {form.description && (

            <p className="mt-2 whitespace-pre-wrap text-gray-600">

              {form.description}

            </p>

          )}

          <p className="mt-4 text-sm text-gray-500">

            \* Required questions

          </p>

        </header>



        <form onSubmit={handleSubmit} className="mt-5 space-y-4">

          {form.questions.map((question, index) => (

            <section

              key={question.id}

              className="rounded-xl border bg-white p-5 shadow-sm"

            >

              <label

                htmlFor={`answer-${question.id}`}

                className="mb-3 block font-medium text-gray-800"

              >

                {index + 1}. {question.title || "Untitled question"}

                {question.required && (

                  <span className="ml-1 text-red-600">\*</span>

                )}

              </label>



              {question.type === "textarea" ? (

                <textarea

                  id={`answer-${question.id}`}

                  required={question.required}

                  disabled={submitting}

                  value={String(answers[question.id] ?? "")}

                  onChange={(e) => updateAnswer(question.id, e.target.value)}

                  rows={4}

                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"

                  placeholder="Your answer"

                />

              ) : ["radio", "select"].includes(question.type) ? (

                question.type === "select" ? (

                  <select

                    id={`answer-${question.id}`}

                    required={question.required}

                    disabled={submitting}

                    value={String(answers[question.id] ?? "")}

                    onChange={(e) => updateAnswer(question.id, e.target.value)}

                    className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"

                  >

                    <option value="">Choose an option</option>

                    {(question.options ?? [])

                      .filter((option) => option.trim())

                      .map((option, i) => (

                        <option key={`${question.id}-${i}`} value={option}>

                          {option}

                        </option>

                      ))}

                  </select>

                ) : (

                  <div className="space-y-3">

                    {(question.options ?? [])

                      .filter((option) => option.trim())

                      .map((option, i) => (

                        <label

                          key={`${question.id}-${i}`}

                          className="flex items-center gap-3 text-gray-700"

                        >

                          <input

                            type="radio"

                            name={`answer-${question.id}`}

                            required={question.required}

                            disabled={submitting}

                            checked={answers[question.id] === option}

                            onChange={() => updateAnswer(question.id, option)}

                            className="h-4 w-4"

                          />

                          {option}

                        </label>

                      ))}

                  </div>

                )

              ) : question.type === "checkbox" ? (

                <div className="space-y-3">

                  {(question.options ?? [])

                    .filter((option) => option.trim())

                    .map((option, i) => {

                      const selected = Array.isArray(answers[question.id])

                        ? (answers[question.id] as string[])

                        : [];



                      return (

                        <label

                          key={`${question.id}-${i}`}

                          className="flex items-center gap-3 text-gray-700"

                        >

                          <input

                            type="checkbox"

                            disabled={submitting}

                            checked={selected.includes(option)}

                            onChange={(e) => {

                              const next = e.target.checked

                                ? [...selected, option]

                                : selected.filter((item) => item !== option);

                              updateAnswer(question.id, next);

                            }}

                            className="h-4 w-4"

                          />

                          {option}

                        </label>

                      );

                    })}

                </div>

              ) : (

                <input

                  id={`answer-${question.id}`}

                  type={

                    ["text", "email", "number", "date"].includes(question.type)

                      ? question.type

                      : "text"

                  }

                  required={question.required}

                  disabled={submitting}

                  value={String(answers[question.id] ?? "")}

                  onChange={(e) => updateAnswer(question.id, e.target.value)}

                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"

                  placeholder="Your answer"

                />

              )}

            </section>

          ))}



          {message && (

            <div

              role="alert"

              className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"

            >

              {message}

            </div>

          )}



          <button

            type="submit"

            disabled={submitting}

            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"

          >

            {submitting ? "Submitting..." : "Submit response"}

          </button>

        </form>

      </div>

    </main>

  );

}


export default function PublicFormPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading form...</p>
        </main>
      }
    >
      <PublicFormContent />
    </Suspense>
  );
}
