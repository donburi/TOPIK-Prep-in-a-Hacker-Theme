const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileSection.tsx', 'utf-8');

content = content.replace(
    /<div className="border border-emerald-900\/30 bg-slate-900\/30 p-6 flex-1 overflow-y-auto">/,
    `<div className="border border-emerald-900/30 bg-slate-900/30 p-6 h-full">`
);

fs.writeFileSync('src/components/ProfileSection.tsx', content);
console.log("Patched ProfileSection.tsx heights");
