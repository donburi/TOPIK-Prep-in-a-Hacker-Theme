const http = require('http');

function test(level, mode) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ currentLevel: level, mode, masteredIds: [] });
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/encounter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          let parsed = JSON.parse(body);
          if (parsed && parsed.prompt) {
             resolve(true);
          } else {
             resolve(false);
          }
        } catch(e) {
          resolve(false);
        }
      });
    });
    req.on('error', e => resolve(false));
    req.write(data);
    req.end();
  });
}

async function run() {
  let errors = 0;
  for (let i = 0; i < 50; i++) {
     let res = await test(1, 'syntax');
     if (!res) errors++;
  }
  console.log("Errors in 50 tries:", errors);
}
run();
