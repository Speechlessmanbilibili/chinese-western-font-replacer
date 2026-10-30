const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const weights = [100, 200, 201, 300, 301, 399, 400, 401, 900];
const ranges = ["100 200", "201 300", "301 399", "400", "401 900"];
const expected = [1, 1, 2, 2, 3, 3, 4, 5, 5];
const mapping = ranges.map((weight, i) => ({
  family: "映射测试家族",
  font: `仓耳今楷01 W0${i + 1}, TsangerJinKai01-W0${i + 1}`,
  weight
}));
let context, worker, server, origin, hasJinKai;
const routes = new Map();

before(async () => {
  server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(routes.get(req.url) || "");
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  // 空目录参数使用 Playwright 管理的临时配置，关闭浏览器时一并清理。
  context = await chromium.launchPersistentContext("", {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(),
    headless: true,
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`]
  });
  context.setDefaultTimeout(5000);
  worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
  await configure({ enabled: false });
  const probe = await context.newPage();
  try {
    hasJinKai = await probe.evaluate(async () => {
      try {
        await Promise.all([1, 2, 3, 4, 5].map(i => new FontFace("检测字面", `local("TsangerJinKai01-W0${i}")`).load()));
        return true;
      } catch { return false; }
    });
  } finally { await probe.close(); }
});

after(async () => {
  await context?.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function configure(settings) {
  await worker.evaluate(settings => chrome.storage.local.set({ settings }), {
    enabled: true, font: "Arial", groups: [], cjkMode: "off", ...settings
  });
}

async function sample(name, family = "Arial", text = "中文") {
  routes.set("/" + name, weights.map(weight => `<p id="w${weight}" style="font-family:${family};font-weight:${weight};font-size:40px">${text}</p>`).join("")
    + '<p id="kai" style="font-family:KaiTi;font-weight:700;font-size:40px">中文</p>');
  const page = await context.newPage();
  await page.goto(origin + "/" + name);
  return page;
}

async function fonts(page, selector) {
  await page.evaluate(() => document.fonts.ready);
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const { root } = await session.send("DOM.getDocument");
    const { nodeId } = await session.send("DOM.querySelector", { nodeId: root.nodeId, selector });
    return (await session.send("CSS.getPlatformFontsForNode", { nodeId })).fonts.map(font => font.postScriptName).sort();
  } finally { await session.detach(); }
}

async function assertFont(page, selector, name) {
  let actual;
  const deadline = Date.now() + 5000;
  do {
    actual = await fonts(page, selector);
    if (actual.length === 1 && actual[0] === name) return;
    await page.waitForTimeout(25);
  } while (Date.now() < deadline);
  assert.deepEqual(actual, [name], selector);
}

test("真实 MV3 映射按字重选择本机字面，修改与停用恢复网站声明", async () => {
  await configure({
    cjkMode: "replace", cjkFont: "通用测试家族", cjkWesternFont: "", cjkTargets: ["Arial"],
    fontMappings: [
      { family: "通用测试家族", font: "不存在的测试字体, Arial", weight: "100 399" },
      { family: "通用测试家族", font: "Courier New", weight: "400 900" }
    ]
  });
  const page = await sample("generic-mapping", "Arial", "ABC");
  try {
    await assertFont(page, "#w100", "ArialMT");
    await assertFont(page, "#w400", "CourierNewPSMT");
    assert.equal(await page.locator("#w900").evaluate(node => getComputedStyle(node).fontWeight), "900");
    await configure({
      cjkMode: "replace", cjkFont: "通用测试家族", cjkWesternFont: "", cjkTargets: ["Arial"],
      fontMappings: [{ family: "通用测试家族", font: "Arial", weight: "100 900" }]
    });
    await assertFont(page, "#w400", "ArialMT");
    await page.evaluate(() => { window.previousMappingFaces = [...document.fonts]; });
    await configure({ cjkMode: "replace", cjkFont: "通用测试家族", cjkWesternFont: "", cjkTargets: ["Arial"], fontMappings: [] });
    await page.waitForFunction(() => previousMappingFaces.every(face => !document.fonts.has(face)));
    assert.ok(!(await fonts(page, "#w400")).includes("ArialMT"));
    await configure({ enabled: false });
    await page.waitForFunction(() => document.getElementById("w400").style.fontFamily === "Arial");
    assert.equal(await page.locator("#w400").evaluate(node => getComputedStyle(node).fontWeight), "400");
    assert.equal(await page.evaluate(() => [...document.fonts].some(face => face.family.startsWith("Local Replacement Font"))), false);
  } finally { await page.close(); }
});

test("普通正文家族保留原生粗体，同名自定义映射优先使用所选字面", async () => {
  await configure({ enabled: false });
  const reference = await sample("native-family-reference", "Arial", "ABC");
  let nativeHeavy;
  try { [nativeHeavy] = await fonts(reference, "#w900"); }
  finally { await reference.close(); }
  const settings = { cjkMode: "replace", cjkFont: "Arial", cjkWesternFont: "", cjkTargets: ["Courier New"] };
  await configure(settings);
  const page = await sample("native-family-weights", "Courier New", "ABC");
  try {
    await assertFont(page, "#w400", "ArialMT");
    await assertFont(page, "#w900", nativeHeavy);
    await configure({ ...settings, fontMappings: [{ family: "Arial", font: "Courier New", weight: "100 900" }] });
    await assertFont(page, "#w400", "CourierNewPSMT");
    await assertFont(page, "#w900", "CourierNewPSMT");
  } finally { await page.close(); }
});

test("未识别完整字面名称时，正文 local 后备仍准确调用仓耳 W04", async t => {
  if (!hasJinKai) { t.skip("本机未安装仓耳今楷 01 的五个字面。"); return; }
  await configure({ cjkMode: "replace", cjkFont: "仓耳今楷01 W04", cjkWesternFont: "", fontAliases: {} });
  const page = await sample("specific-face");
  try {
    for (const weight of [400, 900]) await assertFont(page, "#w" + weight, "TsangerJinKai01-W04");
  } finally { await page.close(); }
});

test("旧名称索引保留完整字面优先级，W05 不被规范家族名改回其他字面", async t => {
  if (!hasJinKai) { t.skip("本机未安装仓耳今楷 01 的五个字面。"); return; }
  await configure({ cjkMode: "replace", cjkFont: "仓耳今楷01 W05", cjkWesternFont: "", fontAliases: {
    "仓耳今楷01 w05": { family: "TsangerJinKai01", fullName: "01 W05", postscriptName: "TsangerJinKai01-W05", weight: "normal" }
  } });
  const page = await sample("legacy-specific-face");
  try {
    for (const weight of [400, 900]) await assertFont(page, "#w" + weight, "TsangerJinKai01-W05");
  } finally { await page.close(); }
});

test("仓耳字面映射覆盖正文与楷体的区间边界，运行中重映射并恢复", async t => {
  if (!hasJinKai) { t.skip("本机未安装仓耳今楷 01 的五个字面。"); return; }
  const settings = { cjkMode: "replace", cjkFont: "映射测试家族", cjkWesternFont: "", replaceKai: true, kaiFont: "映射测试家族", fontMappings: mapping };
  await configure(settings);
  const page = await sample("jinkai-body-mapping");
  try {
    for (let i = 0; i < weights.length; i++) {
      await assertFont(page, "#w" + weights[i], "TsangerJinKai01-W0" + expected[i]);
      assert.equal(await page.locator("#w" + weights[i]).evaluate(node => getComputedStyle(node).fontWeight), String(weights[i]));
    }
    await assertFont(page, "#kai", "TsangerJinKai01-W05");
    await configure({ ...settings, fontMappings: mapping.map(row => row.weight === "400" ? { ...row, font: "TsangerJinKai01-W03" } : row) });
    await assertFont(page, "#w400", "TsangerJinKai01-W03");
    await configure({ ...settings, enabled: false });
    await page.waitForFunction(() => document.getElementById("w400").style.fontFamily === "Arial" && document.getElementById("kai").style.fontFamily === "KaiTi");
    assert.equal(await page.locator("#kai").evaluate(node => getComputedStyle(node).fontWeight), "700");
    assert.equal(await page.evaluate(() => [...document.fonts].some(face => face.family.startsWith("Local Replacement Font"))), false);
  } finally { await page.close(); }
});

test("同一字重映射在独立标点与衬线中文范围内选择对应字面", async t => {
  if (!hasJinKai) { t.skip("本机未安装仓耳今楷 01 的五个字面。"); return; }
  for (const [name, settings, family, text] of [
    ["punctuation", { font: "映射测试家族", groups: ["quotes"] }, "Arial", "“”"],
    ["serif", { replaceSerif: true, serifChinese: "映射测试家族", serifWestern: "Times New Roman" }, "serif", "中文“”"]
  ]) {
    await configure({ ...settings, fontMappings: mapping });
    const page = await sample("jinkai-" + name + "-mapping", family, text);
    try {
      for (let i = 0; i < weights.length; i++) await assertFont(page, "#w" + weights[i], "TsangerJinKai01-W0" + expected[i]);
    } finally { await page.close(); }
  }
});

test("多种区间分隔符与原始 CSS 在边界、间隙及范围外保持同一字重选择", async t => {
  if (!hasJinKai) { t.skip("本机未安装仓耳今楷 01 的五个字面。"); return; }
  const values = [50, 100, 200, 200.5, 201, 300, 300.5, 301, 399, 399.5, 400, 400.5, 401, 900, 1000, "normal", "bold"];
  const inputRanges = ["100～200", "201—300", "301~399", "400", "401-900"];
  const paragraphs = family => values.map((weight, i) => `<p id="sample${i}" style="font-family:'${family}';font-weight:${weight};font-size:48px">中文“引号”</p>`).join("");
  const referenceCss = ranges.map((weight, i) => `@font-face {
    font-family: "原始 CSS 对照";
    src: local("仓耳今楷01 W0${i + 1}"), local("TsangerJinKai01-W0${i + 1}");
    font-style: normal;
    font-weight: ${weight};
  }`).join("\n");
  routes.set("/weight-range-reference", `<style>${referenceCss}</style>${paragraphs("原始 CSS 对照")}`);
  routes.set("/weight-range-input", paragraphs("Arial"));
  await configure({
    cjkMode: "replace", cjkFont: "映射测试家族", cjkWesternFont: "", cjkTargets: ["Arial"],
    fontMappings: mapping.map((row, i) => ({ ...row, weight: inputRanges[i] }))
  });
  // 原始 CSS 在独立无扩展浏览器中绘制，字体回退不经过扩展映射。
  const referenceBrowser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(), headless: true
  });
  const actual = await context.newPage();
  try {
    const reference = await referenceBrowser.newPage();
    await reference.goto(origin + "/weight-range-reference");
    await actual.goto(origin + "/weight-range-input");
    await assertFont(actual, "#sample1", "TsangerJinKai01-W01");
    for (let i = 0; i < values.length; i++) {
      const selector = "#sample" + i;
      assert.deepEqual(await fonts(actual, selector), await fonts(reference, selector), `字重 ${values[i]}`);
      assert.equal(await actual.locator(selector).evaluate(node => node.style.fontWeight), String(values[i]));
      assert.equal(await actual.locator(selector).evaluate(node => getComputedStyle(node).fontWeight),
        await reference.locator(selector).evaluate(node => getComputedStyle(node).fontWeight), `保留网页字重 ${values[i]}`);
    }
    async function raster(page, selector) {
      return page.locator(selector).evaluate(node => {
        const canvas = document.createElement("canvas"); canvas.width = 480; canvas.height = 100;
        const context = canvas.getContext("2d");
        const style = getComputedStyle(node);
        context.font = `${style.fontWeight} 48px ${style.fontFamily}`;
        context.fillText(node.textContent, 8, 70);
        let hash = 2166136261;
        for (const byte of context.getImageData(0, 0, canvas.width, canvas.height).data) hash = Math.imul(hash ^ byte, 16777619);
        return hash >>> 0;
      });
    }
    for (const value of [400, "bold"]) {
      const selector = "#sample" + values.indexOf(value);
      assert.equal(await raster(actual, selector), await raster(reference, selector), `字重 ${value} 的实际像素`);
    }
  } finally {
    await actual.close();
    await referenceBrowser.close();
  }
});
