import React from 'react';
import { Card, Difficulty } from '../types';
import { motion } from 'motion/react';
import { Cpu } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Props {
  cardTranslationCost: number;
  credits: number;
  cards: Card[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onExecute: () => void;
  disabled: boolean;
  revealedCards: Set<number>;
  onRevealCard: (id: number) => void;
  difficulty: Difficulty;
  feedbackState: 'success' | 'failure' | null;
  correctId?: number | null;
}

export const SyntaxStack: React.FC<Props> = ({ cards, selectedId, onSelect, onExecute, disabled, revealedCards, onRevealCard, difficulty, feedbackState, correctId, cardTranslationCost, credits }) => {
  return (
    <section className="flex flex-col h-full gap-4 w-full relative">
      <div className="flex-1 border border-slate-800 p-6 flex flex-col bg-[#0f1520] min-h-0 rounded-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">SYNTAX_STACK</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{cards.length} PACKETS</div>
        </div>
        
        <div className="flex-1 overflow-y-auto terminal-scrollbar pr-2">
          <div className="flex flex-col gap-3">
            {cards.map((card, index) => {
              const isRevealed = revealedCards.has(card.id);
              const isSelected = selectedId === card.id;
              const isCorrectHighlighted = correctId === card.id;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !disabled && onSelect(card.id)}
                   className={`group relative min-h-[4rem] p-4 flex flex-col justify-center border cursor-pointer transition-all rounded-sm ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : isCorrectHighlighted
                      ? 'border-purple-500 bg-purple-500/10 hover:border-purple-400'
                      : 'border-slate-800 bg-[#141b29] hover:border-slate-600'
                  } ${disabled ? 'opacity-50 cursor-not-allowed hover:border-slate-800' : ''}`}
                >
                  <div className="flex justify-between items-center h-full">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-mono mb-2">0x{index}</span>
                                            <span className={`text-xl font-bold tracking-tight ${isSelected ? 'text-white' : isCorrectHighlighted ? 'text-purple-300' : 'text-slate-300 group-hover:text-white'}`}>
                        {card.text}
                      </span>
                    </div>

                                        {isSelected && (
                      <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold animate-pulse">
                        SELECTED
                      </span>
                    )}
                  </div>
                  
                  {isCorrectHighlighted && !isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center">
                        <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono font-bold animate-pulse">
                            CRITICAL_INSIGHT
                        </span>
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    {!isRevealed ? (
                      <Tooltip content={`Reveal translation (Cost: ${cardTranslationCost} Credits)`} position="top">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRevealCard(card.id);
                          }}
                          disabled={disabled || credits < cardTranslationCost}
                          className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center gap-2 ${credits >= cardTranslationCost ? 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300' : 'border-slate-800 text-slate-700 opacity-50 cursor-not-allowed'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                          [ DECRYPT_PAYLOAD -${cardTranslationCost}C ]
                        </button>
                      </Tooltip>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">// DECRYPTED</span>
                        <span className="text-sm text-emerald-500/80 font-mono">{card.translation}</span>
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                  )}
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={onExecute}
            disabled={disabled || selectedId === null}
            className={`w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 border rounded-sm transition-all font-mono ${
              feedbackState === 'success'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                : feedbackState === 'failure'
                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : selectedId === null || disabled
                ? 'bg-[#141b29] text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/40 hover:border-emerald-500/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            {feedbackState === 'success' ? (
              <span>ACCESS GRANTED</span>
            ) : feedbackState === 'failure' ? (
              <span>ACCESS DENIED</span>
            ) : (
              <span>EXECUTE COMMAND</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

