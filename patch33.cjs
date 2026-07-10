const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /if \(result\.prompt_en && !result\.translation\) \{/,
    `if (!result.translation) {
                result.translation = result.prompt_en || "DECRYPT_ERROR: Translation missing.";
            }
            if (result.prompt_en && !result.translation) {`
);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts fallback");
