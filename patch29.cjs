const fs = require('fs');
let content = fs.readFileSync('src/components/SyntaxStack.tsx', 'utf-8');

content = content.replace(
    /interface Props \{/,
    `interface Props {
  cardTranslationCost: number;
  credits: number;`
);

content = content.replace(
    /export const SyntaxStack: React\.FC<Props> = \(\{ cards, selectedId, onSelect, onExecute, disabled, revealedCards, onRevealCard, difficulty, feedbackState, correctId \}\) => \{/,
    `export const SyntaxStack: React.FC<Props> = ({ cards, selectedId, onSelect, onExecute, disabled, revealedCards, onRevealCard, difficulty, feedbackState, correctId, cardTranslationCost, credits }) => {`
);

const tooltipContent = `<Tooltip content={\`Reveal translation (Cost: \${cardTranslationCost} Credits)\`} position="top">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRevealCard(card.id);
                          }}
                          disabled={disabled || credits < cardTranslationCost}
                          className={\`px-2 py-1 border text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center gap-2 \${credits >= cardTranslationCost ? 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300' : 'border-slate-800 text-slate-700 opacity-50 cursor-not-allowed'}\`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                          [ DECRYPT_PAYLOAD -\${cardTranslationCost}C ]
                        </button>
                      </Tooltip>`;

content = content.replace(
    /<Tooltip content="Reveal translation \(-10% points\)" position="top">[\s\S]*?<\/Tooltip>/,
    tooltipContent
);

fs.writeFileSync('src/components/SyntaxStack.tsx', content);
console.log("Patched SyntaxStack.tsx for costs");
