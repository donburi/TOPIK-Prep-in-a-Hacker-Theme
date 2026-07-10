const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /setRevealedCards\(new Set\(\)\);/,
    `setRevealedCards(new Set());
    setActiveModifier(null);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched fetchEncounter");
