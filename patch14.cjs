const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /const \[masteredIds, setMasteredIds\] = useState<string\[\]>\(\[\]\);/,
    `const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);`
);

content = content.replace(
    /masteredIds,\s*lastSaved:/,
    `masteredIds,
                recentQuestionIds,
                lastSaved:`
);

content = content.replace(
    /\[user, stats, gameState, encounter, logs, history, playMode, masteredIds, isResuming\]/,
    `[user, stats, gameState, encounter, logs, history, playMode, masteredIds, recentQuestionIds, isResuming]`
);

content = content.replace(
    /setMasteredIds\(data\.masteredIds \|\| \[\]\);/,
    `setMasteredIds(data.masteredIds || []);
                setRecentQuestionIds(data.recentQuestionIds || []);`
);

content = content.replace(
    /if \(newCount >= 2 && !masteredIds.includes\(encounter\.id\.toString\(\)\)\) \{/,
    `if (newCount >= 1 && !masteredIds.includes(encounter.id.toString())) {`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for recentQuestionIds state");
