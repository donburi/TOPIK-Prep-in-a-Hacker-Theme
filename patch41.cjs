const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /const handleStart = \(currentLevel: number, targetLevel: number, difficulty: Difficulty\) => \{[\s\S]*?fetchEncounter\(currentLevel, playMode\);\n  \};/,
    `const handleStart = (currentLevel: number, targetLevel: number, difficulty: Difficulty) => {
    let hp = 30;
    let goal = 5;
    let credits = 100;
    if (difficulty === 'EASY') {
        hp = 50;
        goal = 3;
        credits = 1000;
    }
    if (difficulty === 'HARD') {
        hp = 20;
        goal = 8;
        credits = 0;
    }

    setStats({ 
        ...INITIAL_STATS, 
        targetLevel,
        currentLevel,
        difficulty, 
        hp, 
        maxHp: hp, 
        credits,
        missionGoal: goal,
        currentMission: generateMission(currentLevel, 0)
    });
    setGameState('PLAYING');
    addLog('PROTOCOL INITIALIZED. WELCOME, OPERATOR.', 'SYSTEM');
    if (difficulty === 'HARD') {
      addLog('CRITICAL: TRANSLATION_LAYER BYPASSED. OVERLOAD DETECTED.', 'ERROR');
    }
    fetchEncounter(currentLevel, playMode);
  };`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx handleStart credits");
