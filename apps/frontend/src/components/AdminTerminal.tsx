"use client";

import { Check, CheckCircle2, Copy, RefreshCw, Code, TerminalSquare } from "lucide-react";

interface AdminTerminalProps {
  response: any;
}

export default function AdminTerminal({ response }: AdminTerminalProps) {
  if (!response) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
        <TerminalSquare className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm font-medium tracking-tight">Waiting for payload...</p>
      </div>
    );
  }

  // Determine if it was escalated
  const isEscalated = 
    ["angry", "frustrated"].includes(response.sentiment) || 
    (response.evaluation && response.evaluation.passed === false) ||
    !response.draft;

  return (
    <>
      {/* Calm Execution Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Execution Result</h2>
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">Trace ID #tr-{Math.floor(Math.random() * 100000)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        </div>
      </div>

      {/* Serene 3-Stage Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stage 1 */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span>01 · INTENT</span>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Sentiment Analysis</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Score: {response.sentiment || 'N/A'}</p>
          </div>
        </div>
        {/* Stage 2 */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between gap-2 overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span>02 · DRAFT</span>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Response Generated</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{response.draft ? 'Draft ready' : 'No draft'}</p>
          </div>
        </div>
        {/* Stage 3 */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span>03 · DECISION</span>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Gatekeeper</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{response.evaluation?.passed ? 'Passed' : 'Escalated'}</p>
          </div>
        </div>
      </div>

      {/* Prominent, Elegant Decision Verdict Banner */}
      <div className={`p-5 rounded-xl border shadow-xs flex flex-col gap-4 ${isEscalated ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800/90'}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${isEscalated ? 'border-red-100 dark:border-red-900/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
          <div>
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Verdict Commit</span>
            <h3 className={`text-sm sm:text-base font-semibold mt-0.5 ${isEscalated ? 'text-red-700 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {isEscalated ? "Escalated to Human Support" : "Resolved Autonomously"}
            </h3>
          </div>
          <div className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-medium">
            {response.evaluation?.score || 'N/A'} score
          </div>
        </div>
        {/* Key Decision Takeaways */}
        <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 mt-0.5 ${isEscalated ? 'text-red-400 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
            <span>{response.evaluation?.reason || 'Evaluation completed. Check trace logs for details.'}</span>
          </div>
        </div>
      </div>

      {/* Minimal Collapsible Thought Trace Terminal */}
      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-900 dark:bg-zinc-950 text-zinc-300 font-mono text-[11px] overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-zinc-950/60 dark:bg-black/60 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
            <span className="font-mono text-[11px] text-zinc-300">trace_stream.log</span>
          </div>
          <button className="hover:text-white transition-colors flex items-center gap-1 text-[11px]">
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
        <div className="p-4 space-y-2 leading-relaxed text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
          {JSON.stringify(response, null, 2)}
        </div>
      </div>

      {/* Clean Secondary Actions Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run</span>
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
            className="px-3 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Copy JSON</span>
          </button>
        </div>
        <button className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1">
          <span>Feedback</span>
        </button>
      </div>
    </>
  );
}
