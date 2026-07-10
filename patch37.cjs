const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Change the modifier container to have higher relative z-index
content = content.replace(
    /<div className="flex gap-2 p-2 border border-slate-800 bg-\[#0f1520\] rounded-sm shrink-0">/,
    `<div className="flex gap-2 p-2 border border-slate-800 bg-[#0f1520] rounded-sm shrink-0 relative z-50">`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx z-index for modifiers");
