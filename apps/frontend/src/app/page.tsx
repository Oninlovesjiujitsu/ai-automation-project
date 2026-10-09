"use client";

import { useTicketStream } from "@/hooks/useTicketStream";
import CustomerForm from "@/components/CustomerForm";
import AdminTerminal from "@/components/AdminTerminal";

export default function Dashboard() {
  const streamState = useTicketStream();

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Input & Simulation (Clean & Focused) */}
      <section className="lg:col-span-5 flex flex-col gap-6">
        <CustomerForm 
          onSubmitTicket={streamState.startStream} 
          onClear={streamState.clearResponse}
          isLoading={streamState.isStreaming} 
          hasResponse={!!streamState.draft || streamState.logs.length > 0} 
        />
      </section>

      {/* RIGHT COLUMN: Agentic Evaluation & Results (Professional & Functional) */}
      <section className="lg:col-span-7 flex flex-col gap-6">
        <AdminTerminal streamState={streamState} />
      </section>

    </main>
  );
}
