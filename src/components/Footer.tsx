
import Link from "next/link";
import { MessageSquareText, Code2, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <MessageSquareText size={21} />
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                Form<span className="text-indigo-600">Flow</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Build interactive forms, start better conversations, and
              organize responses in one simple workspace.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Explore</h3>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600">
              <Link href="#features" className="hover:text-indigo-600">
                Features
              </Link>
              <Link href="#how-it-works" className="hover:text-indigo-600">
                How it works
              </Link>
              <Link href="#demo" className="hover:text-indigo-600">
                Chatbot demo
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Get started</h3>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 hover:text-indigo-600"
              >
                Dashboard <ArrowUpRight size={14} />
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-indigo-600"
              >
                <Code2 size={15} /> GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 FormFlow. Built with Next.js.</p>
          <p>A form builder and chatbot project.</p>
        </div>
      </div>
    </footer>
  );
}
