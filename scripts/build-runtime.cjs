// 常规测试与发布构建共用入口生成，测试无需创建 ZIP 或复制下载文件。
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
fs.writeFileSync(path.join(root, "main-runtime.js"),
  fs.readFileSync(path.join(root, "shared.js"), "utf8") + "\n" + fs.readFileSync(path.join(root, "engine.js"), "utf8"));
