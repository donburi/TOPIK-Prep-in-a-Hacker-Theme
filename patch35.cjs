const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /<Tooltip content="Cost: 300 Credits\. Reveals the correct response\." position="top">/,
    `<Tooltip content="Cost: 300 Credits. Reveals the correct response." position="bottom">`
);

content = content.replace(
    /<Tooltip content="Cost: 150 Credits\. Doubles earned credits for this node\." position="top">/,
    `<Tooltip content="Cost: 150 Credits. Doubles earned credits for this node." position="bottom">`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx Tooltip positions");
