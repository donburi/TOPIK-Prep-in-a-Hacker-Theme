const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /const \{ currentLevel, mode, excludeId, masteredIds \} = req\.body;/,
    `const { currentLevel, mode, excludeId, masteredIds, recentQuestionIds } = req.body;`
);

content = content.replace(
    /const unmastered = allQuestionsForLevel\.filter\(\(q: any\) => \s*q\.id !== excludeId && !normalizedMasteredIds\.includes\(q\.id\.toString\(\)\)\s*\);/,
    `const normalizedRecentIds = (recentQuestionIds || []).map((id: any) => id.toString());
        const unmastered = allQuestionsForLevel.filter((q: any) => 
            q.id !== excludeId && !normalizedMasteredIds.includes(q.id.toString()) && !normalizedRecentIds.includes(q.id.toString())
        );`
);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts with recentQuestionIds logic");
