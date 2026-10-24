
import Link from "next/link";
import { ArrowRight, CheckCircle2, MousePointer2, Send, WandSparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: WandSparkles,
    title: "Build your form",
    description:
      "Add questions, choose answer types, and configure required fields in the form builder.",
  },
  {
    number: "02",
    icon: MousePointer2,
    title: "Publish and share",
    description:
      "Publish your form to get a public URL. Add the chatbot to a website using an embed snippet.",
  },
  {
    number: "03",
    icon: Send,
    title: "Collect responses",
    description:
      "Let visitors answer conversationally, then review their submissions in your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Simple workflow
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
              From idea to insights in three steps.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-slate-600">
              You don't need complicated tools to collect useful feedback.
              Create a form, share it, and manage the answers.
            </p>

            <div className="mt-8 space-y-6">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600">
                          STEP {step.number}
                        </span>
                        <h3 className="font-bold text-slate-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/dashboard"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
            >
              Start building <ArrowRight size={17} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Your workflow
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                  Feedback form
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                Demo
              </span>
            </div>

            <div className="mt-8 space-y-3">
              {[
                { title: "Form created", detail: "Customer feedback", width: "w-full" },
                { title: "Form published", detail: "Public link ready", width: "w-[85%]" },
                { title: "Responses collected", detail: "View submissions", width: "w-[70%]" },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 ${item.width}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={21}
                      className="shrink-0 text-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl bg-indigo-600 p-5 text-white">
              <p className="text-sm font-medium text-indigo-100">
                Everything organized
              </p>
              <p className="mt-1 text-2xl font-black">
                One dashboard. Clear insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
