const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

let invalid = 0;
for (const q of data) {
    if (q.type === 'grammar' || q.type === 'vocabulary') {
        if (q.correct_answer_id === undefined || q.correct_answer_id < 0 || q.correct_answer_id >= q.cards.length) {
            console.log(`Invalid correct_answer_id for: ${q.id} of type ${q.type}`);
            invalid++;
        }
    }
}
console.log(`Total invalid correct_answer_id: ${invalid}`);
