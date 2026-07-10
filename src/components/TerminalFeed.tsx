import React, { useEffect, useRef } from 'react';
import { TerminalLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  logs: TerminalLog[];
  history?: { success: boolean; difficulty: number }[];
}

export const TerminalFeed: React.FC<Props> = ({ logs, history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="w-full h-full border border-slate-800 bg-[#0a0e14] p-5 flex flex-col font-mono text-xs overflow-hidden rounded-sm">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
        <div className="text-[12px] text-slate-500 uppercase tracking-widest font-mono">TERMINAL_FEED</div>
        <div className="text-[12px] text-emerald-400 font-bold uppercase tracking-widest font-mono">LIVE</div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto terminal-scrollbar pr-2 flex flex-col gap-4"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            if (log.metadata?.isAttempt) {
              const isSuccess = log.type === 'SUCCESS';
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col border-b border-slate-800/50 pb-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <span className={`font-bold shrink-0 w-8 ${isSuccess ? 'text-emerald-400' : 'text-red-500'}`}>
                        {isSuccess ? 'OK' : 'ERR'}
                      </span>
                      <div>
                        <span className="text-white font-bold">{log.metadata.selected}</span>
                        {isSuccess ? (
                          <span className="text-slate-400 ml-2">CORRECT</span>
                        ) : (
                          <>
                            <span className="text-slate-500 mx-2">→</span>
                            <span className="text-slate-500 mr-2">expected</span>
                            <span className="text-white font-bold">{log.metadata.expected}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-slate-500'}`}>
                        +{log.metadata.earned || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col border-b border-slate-800/50 pb-4"
              >
                <div className="flex gap-4 items-start">
                  <span className={`font-bold shrink-0 w-8 ${
                    log.type === 'ERROR' ? 'text-red-500' :
                    log.type === 'SUCCESS' ? 'text-emerald-400' :
                    log.type === 'SYSTEM' ? 'text-cyan-400' :
                    'text-slate-500'
                  }`}>
                    {log.type === 'SUCCESS' ? 'OK' : log.type === 'ERROR' ? 'ERR' : log.type === 'SYSTEM' ? 'SYS' : 'LOG'}
                  </span>
                  <span className="break-words leading-relaxed text-slate-500">
                    {log.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div className="flex gap-4 text-slate-500 mt-2">
          <span className="w-8 font-bold text-cyan-400 shrink-0">SYS</span>
          <span className="animate-pulse">Standby for input...</span>
        </div>
      </div>
    </section>
  );
};
