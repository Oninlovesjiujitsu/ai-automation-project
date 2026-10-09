'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Loader2 } from 'lucide-react';

const SESSION_FLAG = 'supportengine-preloader-seen';
const MIN_DURATION_MS = 2500;

export default function Preloader() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (sessionStorage.getItem(SESSION_FLAG) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('gone');
      return;
    }

    const startTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed > MIN_DURATION_MS) {
        sessionStorage.setItem(SESSION_FLAG, '1');
        setPhase('fading');
        setTimeout(() => setPhase('gone'), 800);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === 'gone') return null;

  return (
    <motion.div
      id="supportengine-preloader"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-zinc-950 overflow-hidden"
      style={{ display: 'var(--preloader-display, flex)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fading' ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.98, y: 5 }}
        animate={{ 
          opacity: phase === 'fading' ? 0 : 1,
          scale: phase === 'fading' ? 0.96 : 1,
          y: phase === 'fading' ? -5 : 0,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-md shrink-0">
            <Cpu className="w-7 h-7" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">SupportEngine</span>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 text-zinc-400 dark:text-zinc-600 animate-spin" />
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Initializing Environment</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
