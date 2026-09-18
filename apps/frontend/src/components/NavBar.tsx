"use client";

import Link from "next/link";
import { Cpu, HelpCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function NavBar() {
  return (
    <header className="w-full h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Minimal Brand Icon + Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">SupportEngine</span>
        </div>
        {/* Understated Clean Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-[13px]">
          <Link className="text-zinc-900 dark:text-zinc-100 font-medium px-3 py-1.5 rounded-md bg-zinc-100/70 dark:bg-zinc-800/70" href="/">Playground</Link>
          <Link className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors" href="#">Traces</Link>
          <Link className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors" href="#">Evaluations</Link>
          <Link className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors" href="#">Settings</Link>
        </nav>
      </div>
      {/* Quiet Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs">
        <div className="hidden sm:flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>gpt-4o-pipeline</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="text-zinc-400 dark:text-zinc-500">idle</span>
        </div>
        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Docs">
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
            OP
          </div>
        </div>
      </div>
    </header>
  );
}
