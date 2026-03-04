// app/page.tsx
import Link from "next/link";
import { MessageCircle, HeadsetIcon, ArrowRight, Sparkles } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <main className="flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-600/90 shadow-lg shadow-blue-500/40">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                AI SUPPORT STUDIO
              </p>
              <h1 className="text-lg font-semibold text-slate-50">
                Customer Support Copilot
              </h1>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/agent"
              className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-500/70 hover:bg-slate-900 transition-colors"
            >
              <HeadsetIcon className="h-3.5 w-3.5 text-blue-400" />
              Agent workspace
            </Link>
          </nav>
        </header>

        <section className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,6fr)] items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-200 mb-4">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live demo
            </p>
            <h2 className="mb-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
              One AI for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                customers
              </span>{" "}
              and{" "}
              <span className="bg-gradient-to-r from-violet-400 to-sky-300 bg-clip-text text-transparent">
                agents
              </span>
              .
            </h2>
            <p className="mb-6 max-w-xl text-sm md:text-base text-slate-300/90">
              Use this page as a customer-facing chatbot, or jump into the agent
              workspace to see the same AI with full customer context, order
              history, and top issues.
            </p>

            <div className="grid gap-3 text-xs md:text-sm mb-8">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-[0.7rem] text-blue-300">
                  1
                </span>
                Chat below as if you were a customer on your website or app.
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-[0.7rem] text-blue-300">
                  2
                </span>
                Open the{" "}
                <Link
                  href="/agent"
                  className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 underline-offset-4 hover:underline"
                >
                  agent workspace
                  <ArrowRight className="h-3 w-3" />
                </Link>{" "}
                to see the agent-side experience.
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
              <MessageCircle className="h-4 w-4 text-blue-300" />
              <div>
                <p className="font-medium text-slate-100">
                  Customer Chatbot Experience
                </p>
                <p className="text-[0.7rem] text-slate-400">
                  This is the same AI that powers the agent console, but shown as
                  an embedded customer chatbot.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-2xl shadow-slate-900/80 backdrop-blur-xl">
            <div className="border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-50">
                    Customer Support Chatbot
                  </span>
                  <span className="text-[0.65rem] text-slate-400">
                    Ask questions about your services, orders, or issues.
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 md:p-4">
              {/* For the demo we can reuse ChatWindow with a demo user id */}
              <ChatWindow userId={"demo-user"} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
