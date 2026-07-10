const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /const \[evaluationResult, setEvaluationResult\] = useState<'success' \| 'failure' \| null>\(null\);/,
    `const [evaluationResult, setEvaluationResult] = useState<'success' | 'failure' | null>(null);
  const [activeModifier, setActiveModifier] = useState<'CRITICAL_INSIGHT' | 'SIGNAL_BOOST' | null>(null);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx state");
