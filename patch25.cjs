const fs = require('fs');
let content = fs.readFileSync('src/components/SyntaxStack.tsx', 'utf-8');

content = content.replace(
    /feedbackState: 'success' \| 'failure' \| null;/,
    `feedbackState: 'success' | 'failure' | null;
  correctId?: number | null;`
);

content = content.replace(
    /export const SyntaxStack: React\.FC<Props> = \(\{ cards, selectedId, onSelect, onExecute, disabled, revealedCards, onRevealCard, difficulty, feedbackState \}\) => \{/,
    `export const SyntaxStack: React.FC<Props> = ({ cards, selectedId, onSelect, onExecute, disabled, revealedCards, onRevealCard, difficulty, feedbackState, correctId }) => {`
);

const isSelectedBlock = `const isSelected = selectedId === card.id;
              const isCorrectHighlighted = correctId === card.id;`;

content = content.replace(
    /const isSelected = selectedId === card\.id;/,
    isSelectedBlock
);

const divClassName = ` className={\`group relative min-h-[4rem] p-4 flex flex-col justify-center border cursor-pointer transition-all rounded-sm \${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : isCorrectHighlighted
                      ? 'border-purple-500 bg-purple-500/10 hover:border-purple-400'
                      : 'border-slate-800 bg-[#141b29] hover:border-slate-600'
                  } \${disabled ? 'opacity-50 cursor-not-allowed hover:border-slate-800' : ''}\`}`;

content = content.replace(
    /className=\{\`group relative min-h-\[4rem\] p-4 flex flex-col justify-center border cursor-pointer transition-all rounded-sm \$\{\s*isSelected\s*\?\s*'border-emerald-500 bg-emerald-500\/5'\s*:\s*'border-slate-800 bg-\[#141b29\] hover:border-slate-600'\s*\}\s*\$\{disabled \? 'opacity-50 cursor-not-allowed hover:border-slate-800' : ''\}\`\}/,
    divClassName
);

const spanClassName = `                      <span className={\`text-xl font-bold tracking-tight \${isSelected ? 'text-white' : isCorrectHighlighted ? 'text-purple-300' : 'text-slate-300 group-hover:text-white'}\`}>`;

content = content.replace(
    /<span className=\{\`text-xl font-bold tracking-tight \$\{isSelected \? 'text-white' : 'text-slate-300 group-hover:text-white'\}\`\}>/,
    spanClassName
);

const correctLabel = `                  </div>
                  
                  {isCorrectHighlighted && !isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center">
                        <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono font-bold animate-pulse">
                            CRITICAL_INSIGHT
                        </span>
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-800 pt-3">`;

content = content.replace(
    /                  <\/div>\s*<div className="mt-4 border-t border-slate-800 pt-3">/,
    correctLabel
);

fs.writeFileSync('src/components/SyntaxStack.tsx', content);
console.log("Patched SyntaxStack.tsx");
