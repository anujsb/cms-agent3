// app/page.tsx
import Link from "next/link";
import { MessageCircle, HeadsetIcon, ArrowRight, Sparkles } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <main className="flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-slate-50">
      <div className="mx-auto px-4 py-10 md:py-16 w-full max-w-5xl">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="flex justify-center items-center bg-blue-600/90 shadow-blue-500/40 shadow-lg rounded-xl w-9 h-9">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-400 text-xs uppercase tracking-[0.2em]">
                AI SUPPORT STUDIO
              </p>
              <h1 className="font-semibold text-slate-50 text-lg">
                Customer Support Copilot
              </h1>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/agent"
              className="inline-flex items-center gap-1 bg-slate-900/70 hover:bg-slate-900 px-3 py-1.5 border border-slate-700/80 hover:border-blue-500/70 rounded-full font-medium text-slate-200 text-xs transition-colors"
            >
              <HeadsetIcon className="w-3.5 h-3.5 text-blue-400" />
              Agent workspace
            </Link>
          </nav>
        </header>

        <section className="items-start gap-10 xl:gap-14 grid">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 bg-emerald-500/5 mb-4 px-3 py-1 border border-emerald-500/30 rounded-full font-medium text-emerald-200 text-xs">
              <span className="inline-flex bg-emerald-400 rounded-full w-1.5 h-1.5" />
              Live demo
            </p>
            <h2 className="mb-4 font-semibold text-slate-50 text-3xl md:text-4xl tracking-tight">
              One AI for{" "}
              <span className="bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent">
                customers
              </span>{" "}
              and{" "}
              <span className="bg-clip-text bg-gradient-to-r from-violet-400 to-sky-300 text-transparent">
                agents
              </span>
              .
            </h2>
            <p className="mb-6 max-w-xl text-slate-300/90 text-sm md:text-base">
              Use this page as a customer-facing chatbot, or jump into the agent
              workspace to see the same AI with full customer context, order
              history, and top issues.
            </p>

            <div className="gap-3 grid mb-8 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="inline-flex justify-center items-center bg-blue-500/10 rounded-full w-5 h-5 text-[0.7rem] text-blue-300">
                  1
                </span>
                Chat below as if you were a customer on your website or app.
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="inline-flex justify-center items-center bg-blue-500/10 rounded-full w-5 h-5 text-[0.7rem] text-blue-300">
                  2
                </span>
                Open the{" "}
                <Link
                  href="/agent"
                  className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 hover:underline underline-offset-4"
                >
                  agent workspace
                  <ArrowRight className="w-3 h-3" />
                </Link>{" "}
                to see the agent-side experience.
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-900/70 px-4 py-3 border border-slate-700/80 rounded-xl text-slate-300 text-xs">
              <MessageCircle className="w-4 h-4 text-blue-300" />
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

          <div className="flex flex-col bg-slate-900/90 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-xl border border-slate-800/80 rounded-3xl w-full h-[min(82vh,780px)]">
            <div className="flex justify-between items-center px-4 py-3 border-slate-800/80 border-b shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full w-8 h-8">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-50 text-xs">
                    Customer Support Chatbot
                  </span>
                  <span className="text-[0.65rem] text-slate-400">
                    Ask questions about your services, orders, or issues.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-3 md:p-4 min-h-0">
              <ChatWindow userId={"demo-user"} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
