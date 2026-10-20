(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  let settings = SPF.normalize();
  let url = null;
  let busy = false;
  let statusTimer = 0;

  function status(text, type = "") {
    clearTimeout(statusTimer);
    $("status").textContent = text;
    $("status").className = "popup-status" + (type ? " " + type : "");
    if (type === "success") statusTimer = setTimeout(() => { $("status").textContent = ""; }, 2400);
  }

  async function read() {
    const stored = await chrome.storage.local.get("settings");
    return SPF.normalize(stored.settings);
  }

  async function write(change) {
    settings = await SPF.writeSettings(chrome.storage.local, change);
  }

  const matchRule = (value, href) => SPF.matchRule(value, href);

  function currentDomain(matched) {
    if (!url) return null;
    const current = SPF.parseDomain(url.href);
    if (!current) return null;
    const matchedDomain = matched ? SPF.parseDomain(matched.domain) : null;
    // 当前主机已有显式端口规则时继续编辑该条，避免被父域规则覆盖。
    if (matchedDomain && matchedDomain.host === current.host && matchedDomain.port === (current.port || (url.protocol === "https:" ? "443" : "80"))) return matched.domain;
    return current.port ? current.host + ":" + current.port : current.host;
  }

  function setRadios(name, value) {
    for (const input of document.querySelectorAll('input[name="' + name + '"]')) input.checked = input.value === value;
  }

  function render() {
    $("enabled").checked = settings.enabled;
    $("global-state").textContent = settings.enabled ? "已启用" : "已关闭";
    const supported = Boolean(url?.hostname);
    document.body.dataset.unsupported = String(!supported);
    $("site-mode").disabled = !supported;
    $("site-cjk").disabled = !supported;
    if (!supported) {
      $("host").textContent = url ? "本地文件" : "此页面不支持扩展注入";
      $("effective").textContent = "当前页面无法使用站点规则，仍可调整全局开关。";
      return;
    }
    $("host").textContent = url.hostname;
    const rule = matchRule(settings, url.href);
    setRadios("site-mode", rule?.action || "inherit");
    setRadios("site-cjk", rule?.cjkMode || "inherit");
    const effective = SPF.effective(settings, url.href);
    const parts = [effective.enabled ? "已启用" : "已关闭"];
    parts.push(effective.cjkMode === "off" ? "中文保留网站字体" : "中文替换");
    parts.push(rule ? "匹配" + rule.domain : "跟随全局");
    $("effective").textContent = "当前：" + parts.join(" · ");
  }

  function setBusy(value) {
    busy = value;
    $("enabled").disabled = value;
    const supported = Boolean(url?.hostname);
    $("site-mode").disabled = value || !supported;
    $("site-cjk").disabled = value || !supported;
  }

  async function updateSite(kind, value) {
    if (busy || !url?.hostname) return;
    setBusy(true);
    try {
      await write(latest => {
        const domain = currentDomain(matchRule(latest, url.href));
        const index = latest.siteRules.findIndex(rule => rule.domain === domain);
        const rules = latest.siteRules.slice();
        if (index >= 0) rules[index] = { ...rules[index], [kind]: value };
        else rules.push({ domain, action: "inherit", font: "", cjkMode: "inherit", [kind]: value });
        return { ...latest, siteRules: rules };
      });
      render();
      status("已保存", "success");
    } catch {
      status("保存失败，请重试。", "error");
      render();
    } finally {
      setBusy(false);
    }
  }

  $("site-mode").addEventListener("change", event => {
    if (event.target.name === "site-mode") updateSite("action", event.target.value);
  });
  $("site-cjk").addEventListener("change", event => {
    if (event.target.name === "site-cjk") updateSite("cjkMode", event.target.value);
  });

  $("enabled").addEventListener("change", async () => {
    if (busy) return;
    const next = $("enabled").checked;
    setBusy(true);
    try {
      await write(latest => ({ ...latest, enabled: next }));
      render();
      status("已保存", "success");
    } catch {
      $("enabled").checked = settings.enabled;
      status("保存失败，请重试。", "error");
    } finally {
      setBusy(false);
    }
  });

  $("open-options").addEventListener("click", () => chrome.runtime.openOptionsPage());

  (async () => {
    try {
      settings = await read();
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      try {
        const candidate = new URL(tab?.url);
        if (["http:", "https:", "file:"].includes(candidate.protocol)) url = candidate;
      } catch {}
      render();
    } catch {
      status("读取设置失败，请重新打开此页面。", "error");
    }
  })();
})();
