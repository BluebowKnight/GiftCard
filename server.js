// 本地预览服务器：无需安装任何依赖，直接用 node server.js 启动
// 所有 /index/xxx 形式的地址都返回 index.html，名称由页面从地址中读取
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, 'index.html');

function isPageRoute(pathname) {
  return pathname === '/' ||
    pathname === '/index.html' ||
    pathname === '/index' ||
    pathname.startsWith('/index/');
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  const url = new URL(req.url, 'http://localhost');

  if (!isPageRoute(url.pathname)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }

  fs.readFile(FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Server Error');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(PORT, () => {
  console.log(`本地预览已启动：http://localhost:${PORT}`);
  console.log(`示例：http://localhost:${PORT}/index/maxiaobin`);
});
