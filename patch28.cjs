const fs = require('fs');
let content = fs.readFileSync('src/components/EncounterPane.tsx', 'utf-8');

content = content.replace(
    /interface Props \{/,
    `interface Props {
  promptTranslationCost: number;
  credits: number;`
);

content = content.replace(
    /export const EncounterPane: React\.FC<Props> = \(\{ encounter, loading, difficulty, translationRevealed, onRevealTranslation \}\) => \{/,
    `export const EncounterPane: React.FC<Props> = ({ encounter, loading, difficulty, translationRevealed, onRevealTranslation, promptTranslationCost, credits }) => {`
);

content = content.replace(
    /const showQuestionTranslation = difficulty !== 'HARD' \|\| translationRevealed;/,
    `const showQuestionTranslation = translationRevealed;`
);

const buttonHtml = `               <Tooltip content={\`Reveal translation (Cost: \${promptTranslationCost} Credits)\`} position="top">
                 <button
                   onClick={onRevealTranslation}
                   disabled={credits < promptTranslationCost}
                   className={\`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-colors font-mono \${credits >= promptTranslationCost ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' : 'border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}\`}
                 >
                   [ FORCE_DECRYPT -\${promptTranslationCost}C ]
                 </button>
               </Tooltip>`;

content = content.replace(
    /<Tooltip content="Reveal translation at a significant credit penalty" position="top">[\s\S]*?<\/Tooltip>/,
    buttonHtml
);

content = content.replace(
    /MODIFIER: \{translationRevealed \? 'PENALTY' : \(difficulty === 'HARD' \? 'OVERLOAD' : 'NONE'\)\}/,
    `MODIFIER: {translationRevealed ? 'DECRYPTED' : 'ENCRYPTED'}`
);

fs.writeFileSync('src/components/EncounterPane.tsx', content);
console.log("Patched EncounterPane.tsx for costs");
