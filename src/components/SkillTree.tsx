import React from 'react';
import { motion } from 'motion/react';
import { UserStats, SkillNode } from '../types';
import { SKILL_TREE } from '../constants/skills';
import { Zap, Shield, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Props {
  stats: UserStats;
  onUnlock: (skillId: string) => void;
}

export const SkillTree: React.FC<Props> = ({ stats, onUnlock }) => {
  const isUnlocked = (id: string) => stats.unlockedSkills.includes(id);
  const canUnlock = (skill: SkillNode) => {
    if (isUnlocked(skill.id)) return false;
    if (stats.credits < skill.cost) return false;
    if (skill.dependsOn && !isUnlocked(skill.dependsOn)) return false;
    return true;
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'COMBAT': return <Shield className="w-5 h-5" />;
      case 'ECONOMY': return <TrendingUp className="w-5 h-5" />;
      case 'UTILITY': return <Zap className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
        <h3 className="text-sm font-bold text-emerald-400 tracking-wider">NEURAL_UPGRADES</h3>
        <div className="text-[10px] text-slate-500 font-mono">ENHANCE CORE SIGNAL</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILL_TREE.map((skill) => {
          const unlocked = isUnlocked(skill.id);
          const available = canUnlock(skill);
          const locked = skill.dependsOn && !isUnlocked(skill.dependsOn);

          const tooltipContent = unlocked 
            ? "UPGRADE_ACTIVE" 
            : locked 
              ? `LOCKED: Requires ${SKILL_TREE.find(s => s.id === skill.dependsOn)?.name}`
              : available 
                ? `AVAILABLE: ${skill.cost} CREDITS` 
                : "INSUFFICIENT_CREDITS";

          return (
            <Tooltip key={skill.id} content={tooltipContent}>
              <motion.div
                whileHover={available ? { scale: 1.02 } : {}}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  unlocked 
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : locked
                      ? 'border-slate-800 bg-slate-950/20 opacity-40'
                      : available
                        ? 'border-emerald-900 bg-emerald-950/50 hover:border-emerald-400 cursor-pointer group'
                        : 'border-slate-800 bg-slate-950/20'
                }`}
                onClick={() => available && onUnlock(skill.id)}
              >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded border ${unlocked ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>
                  {getIcon(skill.category)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${unlocked ? 'text-emerald-100' : 'text-slate-300'}`}>
                        {skill.name}
                    </h4>
                    {unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : locked ? (
                      <Lock className="w-3 h-3 text-slate-600" />
                    ) : (
                      <span className="text-[10px] font-mono text-amber-500">{skill.cost} CC</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {skill.description}
                  </p>
                  
                  {skill.dependsOn && !unlocked && (
                    <div className="mt-2 text-[8px] font-mono text-slate-600 uppercase">
                      Requires: {SKILL_TREE.find(s => s.id === skill.dependsOn)?.name}
                    </div>
                  )}
                </div>
              </div>

              {!unlocked && available && (
                <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              )}
            </motion.div>
          </Tooltip>
        );
      })}
      </div>
    </div>
  );
};
