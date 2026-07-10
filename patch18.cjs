const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /const checkProficiency = async \(\) => \{/g,
    `const checkProficiency = async (currentHistory: { success: boolean; difficulty: number }[]) => {`
);

content = content.replace(
    /body: JSON\.stringify\(\{ history \}\),/,
    `body: JSON.stringify({ history: currentHistory }),`
);

content = content.replace(
    /setHistory\(prev => \[\.\.\.prev\.slice\(-9\), \{ success: true, difficulty: stats\.currentLevel \}\]\);/,
    `const newHistItem = { success: true, difficulty: stats.currentLevel };
        setHistory(prev => [...prev.slice(-9), newHistItem]);`
);

content = content.replace(
    /if \(history\.length >= 2\) \{\s*checkProficiency\(\);\s*\}/,
    `if (history.length >= 2) {
            checkProficiency([...history.slice(-9), newHistItem]);
        }`
);

content = content.replace(
    /setHistory\(prev => \[\.\.\.prev\.slice\(-9\), \{ success: false, difficulty: stats\.currentLevel \}\]\);/,
    `const newHistItem = { success: false, difficulty: stats.currentLevel };
        setHistory(prev => [...prev.slice(-9), newHistItem]);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for checkProficiency args");
