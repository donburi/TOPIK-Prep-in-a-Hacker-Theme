const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /setHistory\(prev => \[\.\.\.prev\.slice\(-9\), \{ success: false, difficulty: stats\.currentLevel \}\]\);/;

content = content.replace(regex, `setHistory(prev => [...prev.slice(-9), { success: false, difficulty: stats.currentLevel }]);
        
        if (encounter) {
            setRecentQuestionIds(prev => {
                const newRecent = [...prev.filter(id => id !== encounter.id.toString()), encounter.id.toString()];
                return newRecent.slice(-10);
            });
        }`);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for recentQuestionIds in failure branch");
