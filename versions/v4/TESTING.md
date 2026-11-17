# V4 测试说明

本文档说明如何在本地测试 V4，以及如何临时跳过倒计时检查加载页、进度条和明信片交互。

## 一、本地启动

在项目目录运行：

```bash
cd /Users/wahahahahaha/Documents/Xmas
node server.js
```

然后访问特殊 URL，例如：

```text
http://localhost:3000/test
```

也可以测试其他特殊页面：

```text
http://localhost:3000/ztj
http://localhost:3000/swt
http://localhost:3000/dw
http://localhost:3000/ly
http://localhost:3000/zj
http://localhost:3000/johnny
```

默认地址为：

```text
http://localhost:3000/
```

默认页面隐藏按钮，不支持点击和滑动翻页。

## 二、打开浏览器控制台

### Safari（Mac）

1. 打开 Safari 设置中的“高级”。
2. 勾选“在菜单栏中显示‘开发’菜单”。
3. 打开本地页面。
4. 使用快捷键 `Command + Option + C` 打开 JavaScript 控制台。

也可以通过菜单打开：

```text
开发 → 显示 JavaScript 控制台
```

### Chrome（Mac）

使用快捷键：

```text
Command + Option + J
```

如果 Chrome 阻止粘贴代码，先手动输入：

```text
allow pasting
```

然后再粘贴测试代码。

## 三、通过控制台跳过倒计时

页面中的 `updateLoading()` 位于自执行函数内部，不能直接在控制台调用。推荐临时修改当前时间，让页面自己的倒计时逻辑自动结束。

在控制台执行：

```js
window.__originalDateNow = Date.now;

Date.now = function () {
  return Date.UTC(2026, 11, 25, 0, 0, 0);
};

setTimeout(function () {
  Date.now = window.__originalDateNow;
  delete window.__originalDateNow;
}, 2000);
```

执行后：

1. 倒计时会在下一次更新时结束，通常最多等待约 1 秒。
2. 页面自动进入加载进度条。
3. 加载进度完成后进入明信片。
4. 2 秒后恢复真实的 `Date.now()`。

执行代码后不要刷新页面，否则控制台中的临时修改会消失。

## 四、只隐藏倒计时页面

如果只想查看加载页外观，可以执行：

```js
document.getElementById('countdownScreen').classList.add('is-hidden');
document.getElementById('loadingScreen').classList.remove('waiting');
```

这只会显示加载页面，不会启动进度条，因为 `updateLoading()` 不是全局函数。

## 五、直接查看明信片

如果只想检查明信片页面，可以执行：

```js
document.getElementById('countdownScreen').classList.add('is-hidden');
document.getElementById('loadingScreen').classList.add('is-hidden');
document.body.classList.add('loaded');
```

## 六、手机测试

Mac 和手机连接同一个 Wi-Fi 后，在 Mac 终端查看局域网 IP：

```bash
ipconfig getifaddr en0
```

如果没有结果，可以尝试：

```bash
ipconfig getifaddr en1
```

然后在手机 Safari 访问：

```text
http://你的Mac局域网IP:3000/test
```

例如：

```text
http://192.168.1.23:3000/test
```

如果 Mac 弹出防火墙提示，请允许 Node.js 接受网络连接。

## 七、检查音乐

音乐文件地址：

```text
http://localhost:3000/merry_xmas.mp3
```

在手机上测试时，将 `localhost` 换成 Mac 的局域网 IP：

```text
http://192.168.1.23:3000/merry_xmas.mp3
```

iPhone Safari 需要用户点击“你终于来啦”或完成横向滑动后才允许播放音乐。倒计时结束或页面加载完成不能自动触发音频播放。

## 八、英国圣诞节 0 点对应中国大陆时间

2026 年 12 月，英国使用 GMT（UTC+0），中国大陆使用北京时间（UTC+8）。

因此：

```text
英国 2026 年 12 月 25 日 00:00
= 中国大陆 2026 年 12 月 25 日 08:00
```

当前页面使用 UTC 时间戳计算目标时间：

```js
Date.UTC(2026, 11, 25, 0, 0, 0)
```

所以用户在中国大陆看到的倒计时目标就是北京时间 2026 年 12 月 25 日早上 8 点。
