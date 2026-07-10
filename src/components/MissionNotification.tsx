import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  show: boolean;
  onComplete: () => void;
  missionNumber: number;
  bonus: number;
}

export const MissionNotification: React.FC<Props> = ({ show, onComplete, missionNumber, bonus }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
        >
          <div className="bg-slate-900/90 border-2 border-emerald-500 p-8 rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-md max-w-md w-full pointer-events-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Trophy className="w-16 h-16 text-amber-400" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"
                >
                  <ShieldCheck className="w-6 h-6 text-slate-950" />
                </motion.div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-emerald-400 tracking-widest uppercase">Mission {missionNumber} Complete</h2>
                <p className="text-slate-400 text-sm font-mono tracking-tighter">SECTOR_FRAGMENT_SYNCHRONIZED_SUCCESSFULLY</p>
              </div>

              <div className="w-full bg-slate-950/50 border border-emerald-900/50 p-4 rounded mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase">Biometric Restoration</span>
                  <span className="text-emerald-400 font-bold">+5 HP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase">Data Mining Bonus</span>
                  <span className="text-amber-400 font-bold">+{bonus} CREDITS</span>
                </div>
              </div>

              <button 
                onClick={onComplete}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 mt-6 transition-colors uppercase tracking-[0.2em] relative group"
              >
                <span className="relative z-10">Return to Grid</span>
                <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
