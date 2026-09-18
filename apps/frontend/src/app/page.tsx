"use client";

import { useState } from "react";
import CustomerForm from "@/components/CustomerForm";
import AdminTerminal from "@/components/AdminTerminal";

export default function Dashboard() {
  const [ticketResponse, setTicketResponse] = useState<any>(null);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans relative overflow-hidden text-zinc-900 dark:text-zinc-50 p-6 md:p-12 lg:p-24 selection:bg-blue-500/30">
      
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-4">
            Autonomous Support Engine
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl font-medium">
            Test the AI-driven escalation pipeline. Submit a ticket on the left and monitor the agentic evaluation in real-time on the right.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Customer Side */}
          <div className="flex flex-col gap-6">
            <CustomerForm onSubmitTicket={setTicketResponse} />
          </div>

          {/* Right Column: Admin / AI Side */}
          <div className="flex flex-col gap-6 h-full">
            <AdminTerminal response={ticketResponse} />
          </div>
          
        </div>
      </div>
    </main>
  );
}
