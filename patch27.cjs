const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleRevealTranslation = \(\) => \{[\s\S]*?addLog\(`INSPECTING CORE DATA: CARD_ID_\$\{id\}\. PENALTY_APPLIED\.`, 'SYSTEM'\);\s*\};/;

const costsCode = `const getPromptTranslationCost = () => {
      if (stats.difficulty === 'EASY') return 50;
      if (stats.difficulty === 'HARD') return 150;
      return 100;
  };

  const getCardTranslationCost = () => {
      if (stats.difficulty === 'EASY') return 25;
      if (stats.difficulty === 'HARD') return 75;
      return 50;
  };

  const handleRevealTranslation = () => {
      const cost = getPromptTranslationCost();
      if (stats.credits >= cost) {
          setStats(prev => ({ ...prev, credits: prev.credits - cost }));
          setTranslationRevealed(true);
          addLog(\`DECRYPTION PROTOCOL INITIATED. CREDITS -\${cost}\`, 'SYSTEM');
      }
  };

  const handleRevealCard = (id: number) => {
      const cost = getCardTranslationCost();
      if (stats.credits >= cost) {
          setStats(prev => ({ ...prev, credits: prev.credits - cost }));
          setRevealedCards(prev => new Set(prev).add(id));
          addLog(\`INSPECTING CORE DATA: CARD_ID_\${id}. CREDITS -\${cost}\`, 'SYSTEM');
      }
  };`;

content = content.replace(regex, costsCode);

content = content.replace(/multiplier \*= 0\.6;/, '');
content = content.replace(/penaltyDesc \+= " PROMPT_DECRYPT\(-40%\)";/, '');

content = content.replace(/const cardPenalty = Math\.pow\(penaltyFactor, revealedCards\.size\);/, 'const cardPenalty = 1;');
content = content.replace(/multiplier \*= cardPenalty;/, '');
content = content.replace(/penaltyDesc \+= \` CARD_SCAN\[x\$\{revealedCards\.size\}\]\(-\$\{Math\.round\(\(1 - cardPenalty\) \* 100\)\\}%\)\`;/, '');

content = content.replace(
    /translationRevealed=\{translationRevealed\}/,
    `translationRevealed={translationRevealed}
                  promptTranslationCost={getPromptTranslationCost()}
                  credits={stats.credits}`
);

content = content.replace(
    /difficulty=\{stats\.difficulty\}\s*feedbackState=\{evaluationResult\}/,
    `difficulty={stats.difficulty}
                  feedbackState={evaluationResult}
                  cardTranslationCost={getCardTranslationCost()}
                  credits={stats.credits}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for costs");
