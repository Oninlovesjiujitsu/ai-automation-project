"use client";

import { useState, useEffect } from "react";
import CustomerForm from "@/components/CustomerForm";
import AdminTerminal from "@/components/AdminTerminal";

export default function Dashboard() {
  const [ticketResponse, setTicketResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedResponse = localStorage.getItem('supportEngine_ticketResponse');
    if (savedResponse) {
      try {
        setTicketResponse(JSON.parse(savedResponse));
      } catch (e) {
        console.error("Failed to parse saved response", e);
      }
    }
  }, []);

  // Save to localStorage when it changes
  useEffect(() => {
    if (ticketResponse) {
      localStorage.setItem('supportEngine_ticketResponse', JSON.stringify(ticketResponse));
    } else {
      localStorage.removeItem('supportEngine_ticketResponse');
    }
  }, [ticketResponse]);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Input & Simulation (Clean & Focused) */}
      <section className="lg:col-span-5 flex flex-col gap-6">
        <CustomerForm onSubmitTicket={setTicketResponse} onLoadingChange={setIsLoading} hasResponse={!!ticketResponse} />
      </section>

      {/* RIGHT COLUMN: Agentic Evaluation & Results (Calm & Elegant) */}
      <section className="lg:col-span-7 flex flex-col gap-6">
        <AdminTerminal response={ticketResponse} isLoading={isLoading} />
      </section>

    </main>
  );
}
