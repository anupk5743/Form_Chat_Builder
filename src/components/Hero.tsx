
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Users,
  MessageCircle,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 md:py-28 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
            <Sparkles size={16} />
            Forms that feel like conversations
          </div>

          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Turn every question into a{" "}
            <span className="gradient-text">conversation.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Build beautiful forms, collect meaningful responses, and engage
            visitors with an interactive chatbot. No complicated setup
            required.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Create your first form <ArrowRight size={18} />
            </Link>

            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <MessageCircle size={18} />
              Try live demo
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
            {["Easy to customize", "Mobile friendly", "Response dashboard"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  {item}
                </span>
              ),
            )}
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-slate-200 pt-7">
            <div className="flex -space-x-2">
              {["A", "S", "R", "M"].map((letter, index) => (
                <span
                  key={letter}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${
                    ["bg-indigo-500", "bg-violet-500", "bg-cyan-600", "bg-pink-500"][index]
                  }`}
                >
                  {letter}
                </span>
              ))}
            </div>
            <div>
              <p className="font-bold text-slate-900">Made for modern teams</p>
              <p className="mt-1 text-xs text-slate-500">
                One simple place for forms and feedback
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-4 -top-5 h-28 w-28 rounded-full bg-violet-200/60 blur-3xl" />
          <div className="absolute -bottom-5 -left-4 h-32 w-32 rounded-full bg-cyan-200/60 blur-3xl" />

          <div className="relative rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-indigo-100 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-slate-500">
                  Form preview
                </span>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Published
              </span>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <Sparkles size={23} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Customer feedback
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                Help us improve
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A few quick questions to help us serve you better.
              </p>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    What is your name?
                  </label>
                  <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-400">
                    Enter your name
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    How was your experience?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Excellent", "Good", "Average"].map((answer, i) => (
                      <div
                        key={answer}
                        className={`rounded-xl border p-3 text-center text-xs font-semibold sm:text-sm ${
                          i === 0
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-bold text-white"
                >
                  Continue <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute -left-4 top-24 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex lg:-left-10">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Check size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Response saved</p>
              <p className="mt-1 text-xs text-slate-500">Demo preview</p>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-2 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex lg:-right-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Users size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">All in one place</p>
              <p className="mt-1 text-xs text-slate-500">Manage submissions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
