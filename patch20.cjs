const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /setRecentQuestionIds\(prev => \{\s*const newRecent = \[\.\.\.prev\.filter\(id => id !== encounter\.id\.toString\(\)\), encounter\.id\.toString\(\)\];\s*return newRecent\.slice\(-10\); \/\/ Keep last 10\s*\}\);\s*\}/;

content = content.replace(regex, `setRecentQuestionIds(prev => {
                    const newRecent = [...prev.filter(id => id !== encounter.id.toString()), encounter.id.toString()];
                    return newRecent.slice(-10);
                });`);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx syntax error");
