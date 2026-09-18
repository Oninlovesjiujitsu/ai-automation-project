"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Terminal, ShieldCheck, AlertTriangle, Activity, Bot, Info, CheckCircle2 } from "lucide-react";

interface AdminTerminalProps {
  response: any;
}

export default function AdminTerminal({ response }: AdminTerminalProps) {
  if (!response) {
    return (
      <Card className="terminal-glass w-full border-none h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-500">
        <Terminal className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm uppercase tracking-widest font-mono">Waiting for payload...</p>
      </Card>
    );
  }

  // Determine if it was escalated
  const isEscalated = 
    response.sentiment === "negative" || 
    (response.evaluation && response.evaluation.passed === false) ||
    !response.draft;

  return (
    <Card className="terminal-glass w-full border-none shadow-2xl overflow-hidden relative font-mono text-zinc-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
      
      <CardHeader className="border-b border-zinc-800/50 pb-4 pt-5 bg-zinc-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-100">
              Agentic Pipeline
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isEscalated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center bg-red-950/20 border-b border-red-900/30 min-h-[300px]">
            <div className="p-4 bg-red-500/10 rounded-full mb-4 ring-1 ring-red-500/30">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">ESCALATION TRIGGERED</h3>
            <p className="text-sm text-red-300/80 max-w-md">
              Ticket was identified as {response.sentiment || "negative"} or failed evaluation. 
              The payload has been routed to human agents via Slack.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800/50">
            
            {/* Sentiment & Routing */}
            <div className="p-5 flex items-start gap-4 hover:bg-zinc-900/30 transition-colors">
              <Bot className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div className="space-y-1 w-full">
                <div className="text-xs text-indigo-400/80 font-bold tracking-wider uppercase">Drafter Output</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md ring-1 ring-zinc-700">
                    Sentiment: {response.sentiment}
                  </span>
                </div>
                <div className="text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 leading-relaxed">
                  {response.draft}
                </div>
              </div>
            </div>

            {/* Evaluation */}
            {response.evaluation && (
              <div className="p-5 flex items-start gap-4 hover:bg-zinc-900/30 transition-colors">
                <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="text-xs text-green-400/80 font-bold tracking-wider uppercase">Gatekeeper Evaluation</div>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-md ring-1 ring-green-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Passed
                    </span>
                    <span className="text-xs text-zinc-500">Score: {response.evaluation.score}</span>
                  </div>
                  <div className="text-sm text-zinc-400/90 leading-relaxed">
                    {response.evaluation.reason}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-zinc-950/80 border-t border-zinc-800/50 p-4 flex justify-between items-center text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          System Online
        </div>
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          n8n Webhook Response
        </div>
      </CardFooter>
    </Card>
  );
}
