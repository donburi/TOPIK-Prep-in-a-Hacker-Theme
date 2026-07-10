const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="w-1\/3 h-full flex flex-col min-w-\[300px\]">\s*<ErrorBoundary>/;

const replacement = `<div className="w-1/3 h-full flex flex-col min-w-[300px] gap-2">
                {!loading && encounter && (
                    <div className="flex gap-2 p-2 border border-slate-800 bg-[#0f1520] rounded-sm shrink-0">
                        <Tooltip content="Cost: 300 Credits. Reveals the correct response." position="top">
                            <button 
                                onClick={() => handlePurchaseModifier('CRITICAL_INSIGHT')}
                                disabled={stats.credits < 300 || activeModifier === 'CRITICAL_INSIGHT'}
                                className={\`flex-1 p-2 text-[9px] md:text-[10px] font-bold tracking-widest font-mono border transition-colors rounded-sm \${activeModifier === 'CRITICAL_INSIGHT' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-[#141b29] border-slate-700 text-slate-400 hover:border-purple-500/50 hover:text-purple-400 disabled:opacity-50'}\`}
                            >
                                CRITICAL_INSIGHT
                            </button>
                        </Tooltip>
                        <Tooltip content="Cost: 150 Credits. Doubles earned credits for this node." position="top">
                            <button 
                                onClick={() => handlePurchaseModifier('SIGNAL_BOOST')}
                                disabled={stats.credits < 150 || activeModifier === 'SIGNAL_BOOST'}
                                className={\`flex-1 p-2 text-[9px] md:text-[10px] font-bold tracking-widest font-mono border transition-colors rounded-sm \${activeModifier === 'SIGNAL_BOOST' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-[#141b29] border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-400 disabled:opacity-50'}\`}
                            >
                                SIGNAL_BOOST
                            </button>
                        </Tooltip>
                    </div>
                )}
                <ErrorBoundary>`;

content = content.replace(regex, replacement);

content = content.replace(
    /feedbackState=\{evaluationResult\}/,
    `feedbackState={evaluationResult}
                  correctId={activeModifier === 'CRITICAL_INSIGHT' && encounter ? encounter.cards[encounter.correct_answer_id].id : null}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx Layout");
