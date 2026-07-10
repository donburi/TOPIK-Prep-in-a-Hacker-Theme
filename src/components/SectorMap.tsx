import React from 'react';
import { UserStats } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface Props {
  stats: UserStats;
}

export const SectorMap: React.FC<Props> = ({ stats }) => {
  const levels = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-slate-900/50 border border-emerald-900/50 p-4 rounded-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector_Hierarchy</h3>
        <div className="text-[8px] text-emerald-500/50 font-mono">NODE_SYNC_STATUS: ACTIVE</div>
      </div>
      
      <div className="flex flex-col gap-2">
        {levels.map((level) => {
          const isCurrent = stats.currentLevel === level;
          const isCleared = stats.currentLevel > level;
          const isTarget = stats.targetLevel === level;
          const isLocked = level > stats.currentLevel && !isTarget;

          return (
            <div 
              key={level}
              className={`relative flex items-center gap-3 p-2 border rounded transition-all duration-300 ${
                isCurrent 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]' 
                  : isCleared 
                    ? 'border-emerald-900/30 bg-slate-950/30 grayscale opacity-60'
                    : 'border-slate-800 bg-slate-950/20 opacity-40'
              }`}
            >
              {isCurrent && (
                <motion.div 
                  layoutId="current-marker"
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                />
              )}
              
              <div className="flex flex-col">
                <span className={`text-[8px] font-mono leading-none ${isCurrent ? 'text-emerald-400' : 'text-slate-600'}`}>SECTOR_{level.toString().padStart(2, '0')}</span>
                <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {level === 1 ? 'FOUNDATION' : 
                   level === 2 ? 'SURVIVAL' :
                   level === 3 ? 'PROFESSIONAL' :
                   level === 4 ? 'FLUENCY' :
                   level === 5 ? 'MASTERY' : 'LEGACY'}
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {isCleared ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isCurrent ? (
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                       {Array.from({ length: stats.missionGoal }).map((_, i) => (
                           <div key={i} className={`w-1 h-3 ${i < stats.missionProgress ? 'bg-emerald-400' : 'bg-emerald-900/30'}`} />
                       ))}
                    </div>
                  </div>
                ) : (
                  <Lock className="w-3 h-3 text-slate-700" />
                )}
              </div>

              {isTarget && (
                <div className="absolute -top-1.5 right-2 px-1 bg-amber-500/20 border border-amber-500/50 rounded text-[7px] text-amber-500 font-bold uppercase">Target</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 border-t border-slate-800 pt-2">
        <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase mb-1">
          <span>Overall Clearance</span>
          <span>{Math.round(((stats.currentLevel - 1) / levels.length) * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((stats.currentLevel - 1) / levels.length) * 100}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />
        </div>
      </div>
    </div>
  );
};
