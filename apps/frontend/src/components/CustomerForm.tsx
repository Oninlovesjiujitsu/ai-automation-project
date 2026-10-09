"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RefreshCw, Play, Loader2 } from "lucide-react";

interface CustomerFormProps {
  onSubmitTicket: (ticketText: string, customerName: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  hasResponse?: boolean;
}

export default function CustomerForm({ onSubmitTicket, onClear, isLoading, hasResponse }: CustomerFormProps) {
  const [customerName, setCustomerName] = useLocalStorage<string>("supportEngine_customerName", "");
  const [ticketText, setTicketText] = useLocalStorage<string>("supportEngine_ticketText", "");
  const [error, setError] = useState("");
  const [activeScenario, setActiveScenario] = useLocalStorage<string | null>("supportEngine_activeScenario", "Missed SLA");

  const handleSubmit = async () => {
    if (!ticketText.trim()) return;
    setError("");
    onSubmitTicket(ticketText, customerName || "Valued Customer");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const scenarios = [
    {
      name: "Missed SLA",
      customer: "Alex Mercer",
      text: "We had another failure during checkout on production today (Order #98214), costing us roughly $14k in dropped cart volume. If this is not resolved within 2 hours, we will be escalating directly to our account executive to cancel our contract.",
    },
    {
      name: "Double Charge",
      customer: "Sarah Jenkins",
      text: "My recent order charged my card twice. Please refund the duplicate charge immediately.",
    },
    {
      name: "Password Reset",
      customer: "David Kim",
      text: "How do I reset my password? I forgot it and the email link is expired.",
    }
  ];

  const handleScenarioClick = (name: string, text: string, customer: string) => {
    setActiveScenario(name);
    setTicketText(text);
    setCustomerName(customer);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTicketText(e.target.value);
    // If user edits text manually, clear the active scenario pill
    setActiveScenario(null);
  };

  return (
    <>
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Simulation Harness</h1>
          <button 
            onClick={() => { 
              if (hasResponse) {
                if (!window.confirm("Are you sure you want to clear the session? This will erase the current ticket and the AI's response.")) {
                  return;
                }
              }
              setTicketText(""); 
              setCustomerName(""); 
              onClear(); 
              setError(""); 
              setActiveScenario(null); 
            }}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded transition-colors" 
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Simulate incoming ticket payloads and test deterministic routing decisions.
        </p>
      </div>

      {/* Quick Preset Scenarios */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Scenarios</span>
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => (
            <button 
              key={s.name}
              onClick={() => handleScenarioClick(s.name, s.text, s.customer)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium shadow-xs transition-colors ${
                activeScenario === s.name 
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border border-transparent"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Inline Parameters */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 px-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">Tier:</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">Enterprise VIP</span>
        </div>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">Channel:</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">Zendesk Chat</span>
        </div>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">At Risk</span>
        </div>
      </div>

      {/* Expansive Clean Textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-800 transition-all overflow-hidden">
          <input
            type="text"
            className="w-full px-4 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/60 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
            placeholder="Customer Name (e.g. John Doe)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isLoading}
          />
          <textarea 
            className="w-full p-4 border-0 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:ring-0 focus:outline-none resize-none font-normal leading-relaxed" 
            placeholder="Type or paste incoming customer payload..." 
            rows={7}
            value={ticketText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border-t border-zinc-100 dark:border-zinc-800/50 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            <span>{ticketText.length} chars · ~{Math.ceil(ticketText.length / 4)} tokens</span>
            <button onClick={() => setTicketText("")} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Clear</button>
          </div>
        </div>
        {error && <span className="text-xs text-red-500 mt-1 pl-1">{error}</span>}
      </div>

      {/* Single Understated Primary Action Button */}
      <div className="flex flex-col gap-2 pt-1">
        <button 
          onClick={handleSubmit}
          disabled={!ticketText.trim() || isLoading}
          className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white disabled:opacity-50 text-white dark:text-zinc-900 text-xs font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isLoading ? "Executing Pipeline..." : "Execute Pipeline"}</span>
          {!isLoading && <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 ml-1">⌘↵</span>}
        </button>
        <span className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">Max evaluation budget: 1,500ms</span>
      </div>
    </>
  );
}
