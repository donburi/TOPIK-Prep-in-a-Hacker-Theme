const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const handler = `
  const handlePurchaseModifier = (mod: 'CRITICAL_INSIGHT' | 'SIGNAL_BOOST') => {
      const cost = mod === 'CRITICAL_INSIGHT' ? 300 : 150;
      if (stats.credits >= cost && activeModifier !== mod) {
          setStats(prev => ({ ...prev, credits: prev.credits - cost }));
          setActiveModifier(mod);
          addLog(\`TACTICAL_MODIFIER_ENGAGED: \${mod}. CREDITS -\${cost}\`, 'SYSTEM');
      }
  };

  const handleRevealTranslation = () => {`;

content = content.replace(
    /const handleRevealTranslation = \(\) => \{/,
    handler
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched purchase modifier");
