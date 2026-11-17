// 本地预览服务器：无需安装任何依赖，直接用 node server.js 启动
// 任意地址都返回 index.html，名称由页面从地址第一段路径中读取，例如 /test
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, 'index.html');

// 所有路径都返回 index.html，与 Netlify 上 _redirects 的 /* 规则保持一致
function isPageRoute(pathname) {
  return pathname.length > 0;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  const url = new URL(req.url, 'http://localhost');

  // 音乐文件需要作为静态资源返回，并支持浏览器的 Range 请求
  if (url.pathname === '/merry_xmas.mp3') {
    const audioFile = path.join(__dirname, 'merry_xmas.mp3');
    fs.stat(audioFile, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not Found');
      }

      const baseHeaders = {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes'
      };
      const range = req.headers.range;

      if (!range) {
        res.writeHead(200, {
          ...baseHeaders,
          'Content-Length': stats.size
        });
        if (req.method === 'HEAD') return res.end();
        return fs.createReadStream(audioFile).pipe(res);
      }

      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416, {
          ...baseHeaders,
          'Content-Range': `bytes */${stats.size}`
        });
        return res.end();
      }

      const start = match[1] ? Number(match[1]) : Math.max(0, stats.size - Number(match[2]));
      const end = match[2] ? Number(match[2]) : stats.size - 1;
      if (start > end || start >= stats.size) {
        res.writeHead(416, {
          ...baseHeaders,
          'Content-Range': `bytes */${stats.size}`
        });
        return res.end();
      }

      const safeEnd = Math.min(end, stats.size - 1);
      res.writeHead(206, {
        ...baseHeaders,
        'Content-Length': safeEnd - start + 1,
        'Content-Range': `bytes ${start}-${safeEnd}/${stats.size}`
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(audioFile, { start, end: safeEnd }).pipe(res);
    });
    return;
  }

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

server.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((item) => item && item.family === 'IPv4' && !item.internal)
    .map((item) => item.address);

  console.log(`本地预览已启动：http://localhost:${PORT}`);
  console.log(`示例：http://localhost:${PORT}/test`);
  addresses.forEach((address) => {
    console.log(`手机访问：http://${address}:${PORT}/test`);
  });
});
