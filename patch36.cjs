const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /const handleStart = \(targetLevel: number, difficulty: Difficulty\) => \{/,
    `const handleStart = (currentLevel: number, targetLevel: number, difficulty: Difficulty) => {`
);

content = content.replace(
    /targetLevel,\s*difficulty,/,
    `targetLevel,
        currentLevel,
        difficulty,`
);

content = content.replace(
    /currentMission: generateMission\(1, 0\)/,
    `currentMission: generateMission(currentLevel, 0)`
);

content = content.replace(
    /fetchEncounter\(1, playMode\);/,
    `fetchEncounter(currentLevel, playMode);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched handleStart in App.tsx");
