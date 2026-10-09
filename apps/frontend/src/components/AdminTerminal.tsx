"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Copy, RefreshCw, Code, TerminalSquare, AlertTriangle, Loader2 } from "lucide-react";

interface AdminTerminalProps {
  streamState: any; // from useTicketStream
}

export default function AdminTerminal({ streamState }: AdminTerminalProps) {
  const { draft, logs, sentiment, evaluation, isStreaming, error, latencyMs } = streamState;
  const [isToastDismissed, setIsToastDismissed] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!isStreaming && !draft && logs.length === 0 && !error) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 border border-solid border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <TerminalSquare className="w-8 h-8 mb-3 opacity-30" strokeWidth={1.5} />
        <p className="text-sm font-mono tracking-tight">System idle. Awaiting payload.</p>
      </div>
    );
  }

  const isEscalated = 
    ["angry", "frustrated"].includes(sentiment) || 
    (evaluation && evaluation.passed === false);

  return (
    <div className="flex flex-col h-full gap-4 font-mono text-sm">
      
      {/* HEADER - Data Dense */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">AI Support Routing Engine</span>
          <span className="text-xs text-zinc-500">Status: {isStreaming ? "PROCESSING" : "COMPLETED"}</span>
        </div>
        
        {latencyMs && (
          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Latency</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{latencyMs}ms</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* METRICS ROW (Replaces the "Serene 3-stage progress cards") */}
      <div className="grid grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
        <div className="bg-white dark:bg-zinc-950 p-3 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Intent / Tone</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {sentiment ? sentiment.toUpperCase() : (isStreaming ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "N/A")}
          </span>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-3 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Evaluation Score</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {evaluation ? evaluation.score.toFixed(2) : (isStreaming ? "PENDING..." : "N/A")}
          </span>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-3 flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Decision</span>
          <span className={`font-medium ${evaluation ? (isEscalated ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-zinc-900 dark:text-zinc-100'}`}>
            {evaluation ? (isEscalated ? "ESCALATE" : "AUTO-RESOLVE") : (isStreaming ? "PENDING..." : "N/A")}
          </span>
        </div>
      </div>

      {/* DRAFT RESPONSE VIEW */}
      <div className="flex-1 flex flex-col border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-h-[150px]">
        <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Draft Output</span>
          {isStreaming && <span className="animate-pulse">Typing...</span>}
        </div>
        <div className="p-3 text-zinc-800 dark:text-zinc-200 text-sm font-sans whitespace-pre-wrap leading-relaxed">
          {draft || <span className="text-zinc-400 italic font-mono">Awaiting response draft...</span>}
        </div>
      </div>

      {/* EVALUATION REASONING (If available) */}
      {evaluation && (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
            Gatekeeper Reasoning
          </div>
          <div className="p-3 text-zinc-700 dark:text-zinc-300">
            {evaluation.reason}
          </div>
        </div>
      )}

      {/* REAL-TIME TRACE TERMINAL (Chain of Thought) */}
      <div className="h-48 flex flex-col border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-green-400 text-[11px] font-mono shadow-inner overflow-hidden">
        <div className="px-3 py-1.5 bg-black border-b border-zinc-800 flex justify-between items-center text-zinc-400">
          <span>system_trace.log</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {logs.map((log: any, i: number) => (
            <div key={i} className="flex gap-2">
              <span className="text-zinc-600">[{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}]</span>
              <span>{log.message}</span>
            </div>
          ))}
          {isStreaming && (
            <div className="flex gap-2 text-zinc-500">
              <span>&gt;</span>
              <span className="animate-pulse">_</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
