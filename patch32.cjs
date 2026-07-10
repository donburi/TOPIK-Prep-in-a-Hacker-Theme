const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /<StatusBar \s*stats=\{stats\} \s*translationRevealed=\{translationRevealed\}\s*revealedCardsCount=\{revealedCards\.size\} \s*\/>/,
    `<StatusBar stats={stats} />`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched StatusBar usage in App.tsx");
