const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const newHistItem = \{ success: false, difficulty: stats\.currentLevel \};\s*setHistory\(prev => \[\.\.\.prev\.slice\(-9\), newHistItem\]\);/;

content = content.replace(regex, `const newHistItem = { success: false, difficulty: stats.currentLevel };
        setHistory(prev => [...prev.slice(-9), newHistItem]);
        if (history.length >= 2) {
            checkProficiency([...history.slice(-9), newHistItem]);
        }`);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for failure checkProficiency");
