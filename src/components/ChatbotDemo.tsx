
"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  ChevronLeft,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

const questions = [
  {
    text: "Hi there! What is your name?",
    type: "text",
    placeholder: "Type your name...",
  },
  {
    text: "What brings you here today?",
    type: "choice",
    options: ["Customer feedback", "Contact request", "Product inquiry"],
  },
  {
    text: "How was your experience with FormFlow?",
    type: "choice",
    options: ["Excellent", "Good", "Could be better"],
  },
  {
    text: "Would you recommend us to a friend?",
    type: "choice",
    options: ["Yes", "No", "Not sure"],
  },
] as const;

export default function ChatbotDemo() {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState("");

  const finished = step >= questions.length;
  const currentQuestion = questions[step];

  function submitAnswer(value: string) {
    const cleanValue = value.trim();

    if (!cleanValue) {
      setError("Please enter an answer to continue.");
      return;
    }

    if (step === 0 && cleanValue.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }

    setAnswers((previous) => {
      const next = [...previous];
      next[step] = cleanValue;
      return next;
    });

    setAnswer("");
    setError("");
    setStep((previous) => previous + 1);
  }

  function goBack() {
    if (step === 0 || finished) return;

    setStep((previous) => previous - 1);
    setAnswer(answers[step - 1] ?? "");
    setError("");
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setAnswer("");
    setError("");
    setIsOpen(true);
  }

  return (
    <section id="demo" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
              <Sparkles size={16} />
              Try it yourself
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Meet your new favorite way to ask questions.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Forget long, overwhelming forms. Ask one question at a time,
              guide visitors through the conversation, and create a friendlier
              experience.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "One question at a time",
                "Built-in answer validation",
                "Simple, conversational interactions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={15} />
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={restart}
              className="mt-8 inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-800"
            >
              <RotateCcw size={17} />
              Restart conversation
            </button>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-indigo-100/70">
              <div className="flex items-center justify-between bg-indigo-600 p-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Bot size={24} />
                  </span>
                  <div>
                    <p className="font-bold">FormFlow Assistant</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-indigo-100">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      Interactive demo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label={isOpen ? "Minimize chat" : "Open chat"}
                  className="rounded-lg p-2 transition hover:bg-white/10"
                >
                  {isOpen ? <X size={19} /> : <MessageCircle size={20} />}
                </button>
              </div>

              {isOpen && (
                <>
                  <div className="chat-scrollbar flex h-[360px] flex-col gap-4 overflow-y-auto bg-slate-50 p-5">
                    <div className="max-w-[90%] self-start rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                      Welcome! 👋 Let's have a quick conversation.
                    </div>

                    {answers.map((item, index) => (
                      <div
                        key={`${index}-${item}`}
                        className="max-w-[90%] self-end rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white"
                      >
                        {item}
                      </div>
                    ))}

                    {!finished && (
                      <div className="max-w-[95%] self-start rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                        {currentQuestion.text}
                      </div>
                    )}

                    {finished && (
                      <div className="self-start rounded-2xl rounded-tl-sm border border-emerald-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                        <span className="mb-2 flex items-center gap-2 font-bold text-emerald-700">
                          <Check size={17} /> Thanks for participating!
                        </span>
                        Your demo conversation is complete. Your answers are
                        shown above.
                        <button
                          type="button"
                          onClick={restart}
                          className="mt-3 flex items-center gap-2 font-bold text-indigo-600"
                        >
                          <RotateCcw size={15} /> Start again
                        </button>
                      </div>
                    )}

                    {error && (
                      <p role="alert" className="text-xs font-medium text-rose-600">
                        {error}
                      </p>
                    )}
                  </div>

                  {!finished && (
                    <form
                      className="border-t border-slate-100 bg-white p-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        submitAnswer(answer);
                      }}
                    >
                      {currentQuestion.type === "choice" ? (
                        <div className="flex flex-col gap-2">
                          {currentQuestion.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => submitAnswer(option)}
                              className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {step > 0 && (
                            <button
                              type="button"
                              onClick={goBack}
                              aria-label="Previous question"
                              className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50"
                            >
                              <ChevronLeft size={19} />
                            </button>
                          )}

                          <input
                            value={answer}
                            onChange={(event) => {
                              setAnswer(event.target.value);
                              setError("");
                            }}
                            placeholder={currentQuestion.placeholder}
                            aria-label="Your answer"
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />

                          <button
                            type="submit"
                            aria-label="Send answer"
                            className="rounded-xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                        <span>Powered by FormFlow demo</span>
                        <span>
                          {step + 1} of {questions.length}
                        </span>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Interactive sample only — responses are not stored.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
