const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /if \(!user \|\| gameState === 'INIT' \|\| isResuming\) return;/,
    `if (!user || isResuming) return;`
);

const exitFunction = `  const exitToRoot = () => {
    setGameState('INIT');
    setEncounter(null);
  };

  const restart = async () => {`;

content = content.replace(
    /const restart = async \(\) => \{/,
    exitFunction
);

content = content.replace(
    /onClick=\{\(\) => window\.location\.reload\(\)\}/,
    `onClick={exitToRoot}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for EXIT_TO_ROOT");
