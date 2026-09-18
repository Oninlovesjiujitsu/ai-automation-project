"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Send, Loader2, UserCircle } from "lucide-react";

interface CustomerFormProps {
  onSubmitTicket: (response: any) => void;
}

export default function CustomerForm({ onSubmitTicket }: CustomerFormProps) {
  const [ticketText, setTicketText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketText.trim()) return;

    setLoading(true);
    setError("");
    onSubmitTicket(null); // Clear previous response

    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_text: ticketText }),
      });

      if (!res.ok) throw new Error("Failed to submit ticket");

      const data = await res.json();
      onSubmitTicket(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass w-full border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 overflow-hidden relative group transition-all duration-300 hover:shadow-blue-500/10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50 z-0"></div>
      <CardHeader className="relative z-10 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400">Customer Support</CardTitle>
            <CardDescription className="text-zinc-500 font-medium mt-1">Submit a new request or complaint</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ticket" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                Describe your issue
              </label>
              <Textarea
                id="ticket"
                placeholder="E.g., I ordered a pair of shoes but they haven't arrived yet..."
                className="min-h-[160px] resize-none bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-base rounded-xl shadow-inner"
                value={ticketText}
                onChange={(e) => setTicketText(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-200/50 dark:border-zinc-800/50 p-6">
          <Button 
            type="submit" 
            disabled={!ticketText.trim() || loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] font-medium text-base group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin opacity-70" />
                Processing request...
              </>
            ) : (
              <>
                Submit Ticket
                <Send className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
