"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import CustomerForm from "@/components/CustomerForm";
import AdminTerminal from "@/components/AdminTerminal";

export default function Dashboard() {
  const [ticketResponse, setTicketResponse] = useLocalStorage<any>("supportEngine_ticketResponse", null);
  const [isLoading, setIsLoading] = useState(false);

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
