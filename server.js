const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// In-memory store (resets on restart, but works for demo)
// For persistence, you'd use a database
let sharedData = {
  ericka: null,
  courtney: null
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API endpoints for partner sync
  if (url.pathname === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.user === 'ericka' || data.user === 'courtney') {
          sharedData[data.user] = data.stats;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid data' }));
      }
    });
    return;
  }
  
  if (url.pathname === '/api/partner' && req.method === 'GET') {
    const partner = url.searchParams.get('partner');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sharedData[partner] || null));
    return;
  }
  
  // Serve HTML
  fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`75 Hard tracker running on port ${PORT}`);
});
