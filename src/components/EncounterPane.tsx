import React from 'react';
import { Encounter, Difficulty } from '../types';
import { motion } from 'motion/react';
import { Tooltip } from './Tooltip';

interface Props {
  promptTranslationCost: number;
  credits: number;
  encounter: Encounter | null;
  loading: boolean;
  difficulty: Difficulty;
  translationRevealed: boolean;
  onRevealTranslation: () => void;
}

export const EncounterPane: React.FC<Props> = ({ encounter, loading, difficulty, translationRevealed, onRevealTranslation, promptTranslationCost, credits }) => {
  if (loading) {
    return (
      <div className="flex flex-col h-full border border-slate-800 bg-[#0a0e14] items-center justify-center space-y-4 rounded-sm">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-emerald-400 font-bold tracking-[0.2em] font-mono text-sm"
        >
          [ DECRYPTING_NODE... ]
        </motion.div>
      </div>
    );
  }

  if (!encounter) return null;

  const showQuestionTranslation = translationRevealed;

  return (
    <section className="flex-1 border border-slate-800 bg-[#0f1520] p-6 flex flex-col h-full overflow-hidden rounded-sm relative">
      <div className="flex justify-between items-center mb-8">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">ENCOUNTER_PROTOCOL</div>
        <div className="text-[10px] text-slate-500 font-mono tracking-widest">0x{Math.floor(Math.random() * 1000).toString(16).toUpperCase().padStart(3, '0')}</div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
        <h2 className="text-sm font-bold tracking-widest text-red-500 uppercase font-mono">
          FIREWALL_NODE DETECTED
        </h2>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto terminal-scrollbar pr-2 flex flex-col">
        <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-mono">// PROMPT_DIRECTIVE</p>
        <p className="text-xl md:text-2xl text-white leading-relaxed mb-8 font-medium">
          {encounter.prompt.split(/(?:___|_ _ _|\(\s*㉠\s*\))/).map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block mx-2 px-3 py-0.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-mono font-bold tracking-widest rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.2)] animate-pulse">
                  [ &nbsp; ]
                </span>
              )}
            </React.Fragment>
          ))}
        </p>
        
        <div className="bg-[#141b29] rounded-sm relative overflow-hidden border border-slate-800 p-5 mt-auto">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
          
           {!showQuestionTranslation ? (
             <div className="flex flex-col items-start space-y-4 pl-3">
               <div className="text-red-500/60 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse font-mono">
                 // TRANSLATION_LAYER_OFFLINE
               </div>
                              <Tooltip content={`Reveal translation (Cost: ${promptTranslationCost} Credits)`} position="top">
                 <button
                   onClick={onRevealTranslation}
                   disabled={credits < promptTranslationCost}
                   className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-colors font-mono ${credits >= promptTranslationCost ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' : 'border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
                 >
                   [ FORCE_DECRYPT -${promptTranslationCost}C ]
                 </button>
               </Tooltip>
             </div>
           ) : (
             <div className="flex flex-col pl-3">
               <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-mono">// DECRYPTED_TRANSLATION</p>
               <p className="text-sm md:text-base text-emerald-50/80 tracking-wide font-mono leading-relaxed">
                  {(encounter.translation || "").split(/(?:___|_ _ _|\(\s*㉠\s*\))/).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block mx-2 px-2 py-0.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-mono font-bold tracking-widest rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.2)] animate-pulse text-sm">
                          [ &nbsp; ]
                        </span>
                      )}
                    </React.Fragment>
                  ))}
               </p>
             </div>
           )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-600 font-mono">
        <span className="uppercase tracking-widest">SOURCE: TOPIK_VITE_KERNEL</span>
        <span className="uppercase tracking-widest text-slate-600">
          MODIFIER: {translationRevealed ? 'DECRYPTED' : 'ENCRYPTED'}
        </span>
      </div>
    </section>
  );
};
