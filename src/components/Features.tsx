
import {
  Blocks,
  MessageCircleMore,
  BarChart3,
  Palette,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Blocks,
    title: "Visual Form Builder",
    description:
      "Create forms with text, email, multiple-choice, and yes/no questions. Customize each question to fit your needs.",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: MessageCircleMore,
    title: "Conversational Chatbot",
    description:
      "Ask one question at a time in a friendly chat interface that makes responding feel natural.",
    color: "bg-violet-100 text-violet-700",
  },
  {
    icon: BarChart3,
    title: "Response Dashboard",
    description:
      "Keep submissions organized, check response counts, and review individual answers in one place.",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    icon: Palette,
    title: "Your Brand, Your Style",
    description:
      "Personalize the chatbot's accent color and welcome message to match your website.",
    color: "bg-pink-100 text-pink-700",
  },
  {
    icon: ShieldCheck,
    title: "Question Validation",
    description:
      "Mark questions as required and validate answers before visitors continue.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description:
      "Build responsive experiences for desktop, tablet, and mobile screens.",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Everything you need
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            More than a form.
            <br className="hidden sm:block" /> A better way to connect.
          </h2>
          <p className="mt-5 leading-7 text-slate-600">
            From building your first question to reviewing the final response,
            everything works together in one simple platform.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} transition group-hover:scale-105`}
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
