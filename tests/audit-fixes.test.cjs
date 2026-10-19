const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
let browser;
before(async () => { browser = await chromium.launch({ headless: true, executablePath: chromium.executablePath() }); });
after(async () => { await browser?.close(); });
async function fixture(html, config) {
  const page = await browser.newPage();
  await page.setContent(html);
  await page.addScriptTag({ path: path.join(root, "main-runtime.js") });
  await page.evaluate(config => window.dispatchEvent(new CustomEvent(SPF.CHANNEL + "/config", { detail: JSON.stringify(config) })), config);
  return page;
}
test("同名变量按原作用域和交互状态选择后备，影子根之间互不影响", async () => {
  const page = await fixture('<style>.a{--f:SimSun}.b{--f:NoSuchFont}.a:focus{--f:NoSuchFont}p{font-family:var(--f),sans-serif}</style><div class=a tabindex=0><p id=a>中文</p></div><div class=b><p id=b>中文</p></div>', { font: "Courier New", cjkMode: "replace" });
  await page.waitForFunction(() => getComputedStyle(document.getElementById("b")).fontFamily.includes("PingFang UI SC"));
  assert.ok(!(await page.locator("#a").evaluate(n => getComputedStyle(n).fontFamily)).includes("PingFang UI SC"));
  const css = await page.evaluate(() => [...document.styleSheets[0].cssRules].map(r => r.cssText));
  await page.locator(".a").focus();
  await page.waitForFunction(() => getComputedStyle(document.getElementById("a")).fontFamily.includes("PingFang UI SC"));
  assert.deepEqual(await page.evaluate(() => [...document.styleSheets[0].cssRules].map(r => r.cssText)), css);
  await page.locator(".a").evaluate(n => n.blur());
  await page.waitForFunction(() => !getComputedStyle(document.getElementById("a")).fontFamily.includes("PingFang UI SC"));
  const families = await page.evaluate(async () => {
    const hosts = [document.createElement("div"), document.createElement("div")];
    for (const [i, host] of hosts.entries()) {
      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = "<style>:host{--f:" + (i ? "NoSuchFont" : "SimSun") + "}p{font-family:var(--f)}</style><p>中文</p>";
      document.body.append(host);
    }
    await new Promise(resolve => setTimeout(resolve, 80));
    return hosts.map(host => getComputedStyle(host.shadowRoot.querySelector("p")).fontFamily);
  });
  assert.ok(!families[0].includes("PingFang UI SC")); assert.ok(families[1].includes("PingFang UI SC"));
  await page.close();
});

test("@property 与脚本注册保留默认值、非继承和类型校验，关闭后清理辅助注册", async () => {
  const page = await fixture('<style>@property --f{syntax:"*";inherits:false;initial-value:Arial}@property --typed{syntax:"<custom-ident>";inherits:false;initial-value:Verdana}.parent{--f:SimSun}#a{font-family:var(--f)}#typed{--typed:12px;font-family:var(--typed)}</style><div class=parent><p id=a>ABC“”</p></div><p id=typed>ABC</p>', { font: "Courier New", cjkMode: "off" });
  await page.waitForFunction(() => getComputedStyle(document.getElementById("a")).fontFamily.includes("Arial"));
  assert.ok((await page.locator("#a").evaluate(n => getComputedStyle(n).fontFamily)).includes("Shared Punctuation Font"));
  assert.equal(await page.locator("#typed").evaluate(n => getComputedStyle(n).fontFamily), "Verdana");
  await page.evaluate(() => {
    CSS.registerProperty({ name: "--script-font", syntax: "*", inherits: false, initialValue: "Arial" });
    const p = document.createElement("p"); p.id = "script"; p.textContent = "ABC“”"; p.style.fontFamily = "var(--script-font)"; document.body.append(p);
  });
  await page.waitForFunction(() => getComputedStyle(document.getElementById("script")).fontFamily.includes("Shared Punctuation Font"));
  const conversions = await page.evaluate(() => {
    let conversions = 0;
    CSS.registerProperty(Object.freeze({ name: { toString() { conversions++; return "--frozen-font"; } }, syntax: "*", inherits: false, initialValue: "Arial" }));
    const p = document.createElement("p"); p.id = "frozen"; p.textContent = "ABC“”"; p.style.fontFamily = "var(--frozen-font)"; document.body.append(p);
    return conversions;
  });
  assert.equal(conversions, 1);
  await page.waitForFunction(() => getComputedStyle(document.getElementById("frozen")).fontFamily.includes("Shared Punctuation Font"));
  await page.evaluate(() => {
    document.styleSheets[0].deleteRule(0);
    document.styleSheets[0].insertRule('@property --f{syntax:"*";inherits:false;initial-value:Georgia}', 0);
  });
  await page.waitForFunction(() => getComputedStyle(document.getElementById("a")).fontFamily === "Georgia");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent(SPF.CHANNEL + "/config", { detail: JSON.stringify({ enabled: false }) })));
  assert.equal(await page.locator("#a").evaluate(n => getComputedStyle(n).fontFamily), "Georgia");
  assert.equal(await page.locator("#script").evaluate(n => getComputedStyle(n).fontFamily), "Arial");
  assert.equal(await page.evaluate(() => [...document.styleSheets].flatMap(s => [...s.cssRules]).filter(r => r.constructor.name === "CSSPropertyRule" && r.name.startsWith("--spf-head-")).length), 0);
  const loaded = await page.evaluate(async () => (await new FontFace("Escape Check", SPF.localFontSources(SPF.fontNames(String.raw`Courier\20 New`)[0])).load()).status);
  assert.equal(loaded, "loaded");
  await page.close();
});

test("真实弹窗编辑显式默认端口规则，不新增低优先级同域名规则", async () => {
  const context = await chromium.launchPersistentContext("", { headless: true, executablePath: chromium.executablePath(),
    args: ["--disable-extensions-except=" + root, "--load-extension=" + root] });
  context.setDefaultTimeout(5000);
  try {
    const page = await context.newPage();
    await page.goto("chrome-extension://leodnciablfoggcacioldiippnfdonmg/options.html");
    await page.waitForFunction(() => !document.getElementById("save").disabled);
    await page.evaluate(() => chrome.storage.local.set({ settings: { enabled: true, siteRules: [{ domain: "example.com:443", action: "off" }] } }));
    const popup = await context.newPage();
    await popup.addInitScript(() => { chrome.tabs.query = async () => [{ url: "https://example.com/" }]; });
    await popup.goto("chrome-extension://leodnciablfoggcacioldiippnfdonmg/popup.html");
    await popup.waitForFunction(() => document.getElementById("host").textContent === "example.com");
    await popup.locator('input[name="site-mode"][value="on"]').click();
    await popup.waitForFunction(() => document.getElementById("status").textContent === "已保存");
    const rules = await page.evaluate(async () => (await chrome.storage.local.get("settings")).settings.siteRules);
    assert.equal(rules.length, 1); assert.equal(rules[0].domain, "example.com:443"); assert.equal(rules[0].action, "on");
  } finally { await context.close(); }
});
