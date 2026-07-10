const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /const earned = Math\.floor\(baseCredits \* multiplier\);/,
    `if (activeModifier === 'SIGNAL_BOOST') {
            multiplier *= 2;
            penaltyDesc += " SIGNAL_BOOST(x2)";
        }
        
        const earned = Math.floor(baseCredits * multiplier);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched signal boost");
