const fs = require('fs');
let text = fs.readFileSync('src/data/questions.json', 'utf8');
try {
  JSON.parse(text);
  console.log("JSON is valid.");
} catch (e) {
  console.error(e.message);
  
  // Find the last valid position or just output the end of the file
  console.log("End of file:");
  console.log(text.substring(text.length - 200));
}
