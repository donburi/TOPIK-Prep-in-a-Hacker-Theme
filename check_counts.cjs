const fs = require('fs');
let text = fs.readFileSync('src/data/questions.json', 'utf8');
let questions = JSON.parse(text);
console.log("Total questions:", questions.length);

let counts = {};
questions.forEach(q => {
  let key = `Level ${q.level} - ${q.type}`;
  counts[key] = (counts[key] || 0) + 1;
});
console.log("Counts:", counts);
