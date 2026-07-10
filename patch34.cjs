const fs = require('fs');
let content = fs.readFileSync('src/components/EncounterPane.tsx', 'utf-8');

content = content.replace(
    /\{encounter\.translation\.split/g,
    `{(encounter.translation || "").split`
);

fs.writeFileSync('src/components/EncounterPane.tsx', content);
console.log("Patched EncounterPane.tsx fallback");
