const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix StatusBar
content = content.replace(
    /translationRevealed=\{translationRevealed\}\s*promptTranslationCost=\{getPromptTranslationCost\(\)\}\s*credits=\{stats\.credits\}/,
    `translationRevealed={translationRevealed}`
);

// Fix EncounterPane
content = content.replace(
    /translationRevealed=\{translationRevealed\}\s*onRevealTranslation=\{handleRevealTranslation\}/,
    `translationRevealed={translationRevealed}
                  promptTranslationCost={getPromptTranslationCost()}
                  credits={stats.credits}
                  onRevealTranslation={handleRevealTranslation}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx missing costs for EncounterPane and removed from StatusBar");
