const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /body: JSON\.stringify\(\{ currentLevel: level, mode, excludeId: encounter \? encounter\.id : undefined, masteredIds \}\),/,
    `body: JSON.stringify({ currentLevel: level, mode, excludeId: encounter ? encounter.id : undefined, masteredIds, recentQuestionIds }),`
);

content = content.replace(
    /}, \[addLog, playMode, encounter, masteredIds\]\);/,
    `}, [addLog, playMode, encounter, masteredIds, recentQuestionIds]);`
);

content = content.replace(
    /setMasteredIds\(prev => \[\.\.\.prev, encounter\.id\.toString\(\)\]\);/,
    `setMasteredIds(prev => [...prev, encounter.id.toString()]);
                }
                
                // Track recent questions
                setRecentQuestionIds(prev => {
                    const newRecent = [...prev.filter(id => id !== encounter.id.toString()), encounter.id.toString()];
                    return newRecent.slice(-10); // Keep last 10
                });`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for fetchEncounter");
