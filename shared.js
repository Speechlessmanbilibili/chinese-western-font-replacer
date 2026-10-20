(() => {
  "use strict";
  const FAMILY = "Shared Punctuation Font";
  const SERIF_CHINESE = "Mixed Serif Chinese";
  const SERIF_WESTERN = "Mixed Serif Western";
  const CHINESE_FONTS = Object.freeze([
    "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑",
    "PingFang SC", "PingFang UI SC", "苹方-简",
    "Hiragino Sans GB",
    "Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC", "思源黑体",
    "WenQuanYi Micro Hei",
    "HarmonyOS Sans SC", "HarmonyOS_Sans_SC"
  ]);
  const SYSTEM_FONTS = Object.freeze([
    "-apple-system", "-apple-system-font", "-webkit-system-font", "BlinkMacSystemFont",
    "system-ui", "ui-sans-serif", "sans-serif",
    "-apple-system-headline", "-apple-system-body", "-apple-system-subheadline",
    "-apple-system-footnote", "-apple-system-caption1", "-apple-system-caption2",
    "-apple-system-short-headline", "-apple-system-short-body", "-apple-system-short-subheadline",
    "-apple-system-short-footnote", "-apple-system-short-caption1", "-apple-system-tall-body",
    "-apple-system-title0", "-apple-system-title1", "-apple-system-title2",
    "-apple-system-title3", "-apple-system-title4"
  ]);
  const DEFAULT_TARGETS = Object.freeze([...CHINESE_FONTS, ...SYSTEM_FONTS]);
  const PUNCTUATION_TARGETS = Object.freeze([...DEFAULT_TARGETS,
    "Arial", "Arial Unicode MS", "Helvetica", "Helvetica Neue", "Verdana", "Tahoma",
    "Segoe UI", "Segoe UI Variable", "Trebuchet MS", "Calibri", "Liberation Sans", "DejaVu Sans",
    "Roboto", "Open Sans", "Noto Sans", "SF Pro Text", "SF Pro Display"]);
  const systemNames = new Set(SYSTEM_FONTS.map(x => x.toLowerCase()));
  // 已保存的旧默认名单按完整集合识别，保留用户编辑过的名单。
  const LEGACY_CHINESE_FONTS = [
    "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", "微软雅黑 UI",
    "Microsoft JhengHei", "Microsoft JhengHei UI", "微軟正黑體", "微軟正黑體 UI",
    "HarmonyOS Sans SC", "HarmonyOS_Sans_SC",
    "MiSans", "MiSans VF", "OPPO Sans", "OPPOSans",
    "PingFang SC", "PingFang TC", "PingFang HK", "PingFang UI SC", "苹方", "苹方-简", "苹方-繁", "苹方-港",
    "Hiragino Sans GB", "冬青黑体简体中文",
    "Noto Sans SC", "Noto Sans TC", "Noto Sans HK", "Noto Sans CJK SC", "Noto Sans CJK TC", "Noto Sans CJK HK",
    "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans HK", "Source Han Sans HC",
    "SourceHanSansSC", "SourceHanSansCN", "SourceHanSansTC", "SourceHanSansTW", "SourceHanSansHK", "SourceHanSansHC",
    "思源黑体", "思源黑体 CN", "思源黑体 SC", "思源黑體", "思源黑體 TC", "思源黑體 HK"
  ];
  const LEGACY_TARGET_SETS = [
    new Set(CHINESE_FONTS.map(x => x.toLowerCase())),
    new Set(LEGACY_CHINESE_FONTS.map(x => x.toLowerCase())),
    new Set([...LEGACY_CHINESE_FONTS, "HarmonyOS Sans", "HarmonyOS Sans TC", "HarmonyOS Sans HK", "HarmonyOS_Sans", "HarmonyOS_Sans_TC"].map(x => x.toLowerCase()))
  ];
  const CHINESE_NON_SANS = new Set([
    "SimSun", "NSimSun", "STSong", "Songti SC", "Songti TC",
    "KaiTi", "KaiTi_GB2312", "STKaiti", "Kaiti SC", "Kaiti TC", "DFKai-SB", "BiauKai",
    "FangSong", "FangSong_GB2312", "STFangsong"
  ].map(x => x.toLowerCase()));
  // 只匹配 Windows 宋体及其英文名称，其他宋体沿用网站声明。
  const SONG_FONTS = new Set(["SimSun", "宋体"].map(x => x.toLowerCase()));
  const KAI_FONTS = new Set([
    "KaiTi", "KaiTi_GB2312", "STKaiti", "Kaiti SC", "楷体", "楷体_GB2312", "华文楷体", "楷体-简"
  ].map(x => x.toLowerCase()));
  const CHANNEL = "shared-punctuation-font/v1";
  const GROUPS = Object.freeze([
    { id: "quotes", label: "弯引号", chars: "‘’‚‛“”„‟", enabled: true },
    { id: "ellipsis", label: "省略号", chars: "…‥", enabled: true },
    { id: "dashes", label: "破折号与连接号", chars: "‐‑‒–—―", enabled: true },
    { id: "dots", label: "间隔号与项目符号", chars: "·•‣⁃", enabled: true },
    { id: "references", label: "参考与章节符号", chars: "※§¶†‡", enabled: true },
    { id: "guillemets", label: "角形引号", chars: "«»‹›", enabled: false },
    { id: "ascii", label: "英文标点", chars: "\"'!#$%&()*+,-./:;<=>?@[\\]^_`{|}~", enabled: false },
    { id: "symbols", label: "常用符号", chars: "©®™°±×÷‰‱", enabled: false }
  ]);
  const WORK = Symbol("字体工作配置");
  const working = value => value?.[WORK] ? value : normalize(value);
  function normalize(value = {}) {
    if (!value || typeof value !== "object" || Array.isArray(value)) value = {};
    const selected = Array.isArray(value.groups) ? value.groups : GROUPS.filter(x => x.enabled).map(x => x.id);
    let targets = Array.isArray(value.cjkTargets) ? [...new Set(value.cjkTargets.filter(x => typeof x === "string" && x.trim()).map(x => x.trim()))] : [...DEFAULT_TARGETS];
    if (LEGACY_TARGET_SETS.some(x => x.size === targets.length)) {
      const names = new Set(targets.map(x => x.toLowerCase()));
      if (LEGACY_TARGET_SETS.some(x => x.size === names.size && [...names].every(name => x.has(name)))) targets = [...DEFAULT_TARGETS];
    }
    const result = {
      enabled: value.enabled !== false,
      font: typeof value.font === "string" && value.font.trim() ? value.font.trim() : "PingFang UI SC",
      groups: GROUPS.filter(x => selected.includes(x.id)).map(x => x.id),
      extra: typeof value.extra === "string" ? value.extra : "",
      punctuationTargets: Array.isArray(value.punctuationTargets) ? [...new Set(value.punctuationTargets.filter(x => typeof x === "string" && x.trim()).map(x => x.trim()))] : [...PUNCTUATION_TARGETS],
      fontAliases: normalizeFontAliases(value.fontAliases),
      cjkMode: value.cjkMode === "off" ? "off" : "replace",
      cjkFont: typeof value.cjkFont === "string" && value.cjkFont.trim() ? value.cjkFont.trim() : "PingFang UI SC",
      cjkWesternFont: typeof value.cjkWesternFont === "string" ? value.cjkWesternFont.trim() : "SF Pro Text",
      cjkTargets: targets,
      replaceSong: value.replaceSong === true && value.replaceSerif !== true,
      songFont: typeof value.songFont === "string" && value.songFont.trim() ? value.songFont.trim() : "Songti SC",
      replaceKai: value.replaceKai === true,
      kaiFont: typeof value.kaiFont === "string" && value.kaiFont.trim() ? value.kaiFont.trim() : "Kaiti SC",
      replaceSerif: value.replaceSerif === true,
      serifChinese: typeof value.serifChinese === "string" && value.serifChinese.trim() ? value.serifChinese.trim() : "Songti SC, SimSun",
      serifWestern: typeof value.serifWestern === "string" && value.serifWestern.trim() ? value.serifWestern.trim() : "Times New Roman",
      serifShared: value.serifShared === "western" ? "western" : "chinese",
      siteRules: Array.isArray(value.siteRules) ? value.siteRules.filter(x => x && typeof x === "object").map(x => ({
        domain: typeof x.domain === "string" ? x.domain.trim() : "",
        action: ["on", "off"].includes(x.action) ? x.action : "inherit",
        font: typeof x.font === "string" ? x.font.trim() : "",
        cjkMode: ["off", "replace"].includes(x.cjkMode) ? x.cjkMode : "inherit"
      })) : []
    };
    // 工作数据不进入存储或消息；同一配置的声明处理直接复用名称集合与字体范围。
    Object.defineProperty(result, WORK, { value: {
      targets: new Set(result.cjkTargets.map(name => name.toLowerCase())),
      punctuationTargets: new Set(result.punctuationTargets.map(name => name.toLowerCase()))
    } });
    return result;
  }
  function parseDomain(value) {
    try {
      const text = value.trim().replace(/^\*\./, "");
      const authority = text.replace(/^https?:\/\//i, "").split(/[/?#]/)[0];
      if (!text || /\s/.test(text) || authority.includes("*") || /:(?:\D|$)/.test(authority.replace(/\[[^\]]+\]/, "ipv6"))) return null;
      const url = new URL(/^[\w-]+:\/\//.test(text) ? text : "https://" + text);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
      const port = authority.match(/:(\d+)$/);
      return { host: url.hostname.replace(/\.$/, ""), port: port ? String(Number(port[1])) : "" };
    } catch { return null; }
  }
  function matchRule(settings, location) {
    let url;
    try { url = new URL(location); } catch { return null; }
    const host = url.hostname.replace(/\.$/, "");
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    let best = null;
    let score = -1;
    for (const rule of settings.siteRules) {
      const domain = parseDomain(rule.domain);
      if (!domain || !(host === domain.host || host.endsWith("." + domain.host)) || (domain.port && domain.port !== port)) continue;
      const rank = domain.host.length * 2 + Number(Boolean(domain.port));
      if (rank > score) { best = rule; score = rank; }
    }
    return best;
  }
  function effective(value, location) {
    const settings = normalize(value), best = matchRule(settings, location);
    return Object.assign(settings, { enabled: best?.action === "off" ? false : best?.action === "on" ? true : settings.enabled, font: best?.font || settings.font, cjkMode: best && best.cjkMode !== "inherit" ? best.cjkMode : settings.cjkMode,
      replaceSong: best?.cjkMode === "off" ? false : settings.replaceSong,
      replaceKai: best?.cjkMode === "off" ? false : settings.replaceKai,
      replaceSerif: best?.cjkMode === "off" ? false : settings.replaceSerif });
  }
  function characters(value) {
    const settings = working(value);
    return settings[WORK].characters ||= [...new Set([...GROUPS.filter(x => settings.groups.includes(x.id)).map(x => x.chars).join(""), ...settings.extra])]
      .filter(x => !/\s/u.test(x) && !(x.codePointAt(0) >= 0xD800 && x.codePointAt(0) <= 0xDFFF))
      .sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
  }
  function unicodeRange(value) {
    const settings = working(value);
    if (settings[WORK].range !== undefined) return settings[WORK].range;
    const numbers = characters(settings).map(x => x.codePointAt(0));
    const ranges = [];
    const code = n => n.toString(16).toUpperCase().padStart(4, "0");
    for (let i = 0; i < numbers.length; i++) {
      const start = numbers[i];
      let end = start;
      while (numbers[i + 1] === end + 1) end = numbers[++i];
      ranges.push("U+" + code(start) + (end !== start ? "-" + code(end) : ""));
    }
    return settings[WORK].range = ranges.join(",");
  }
  function cssString(value) {
    return '"' + value.replace(/["\\\n\r\f\0]/g, x => "\\" + x.codePointAt(0).toString(16) + " ") + '"';
  }
  function normalizeFontAliases(value, limit = 4096) {
    const entries = value && typeof value === "object" && !Array.isArray(value) ? Object.entries(value) : [];
    return Object.fromEntries(entries.slice(0, limit).filter(([name, entry]) => name.length <= 300 && entry && typeof entry.family === "string" && entry.family.length <= 300 && typeof entry.fullName === "string" && entry.fullName.length <= 300).map(([name, entry]) => [name.toLowerCase(), {
      family: entry.family, fullName: entry.fullName,
      postscriptName: typeof entry.postscriptName === "string" ? entry.postscriptName.slice(0, 300) : "",
      weight: typeof entry.weight === "string" && /^\d+(?:\.\d+)? \d+(?:\.\d+)?$/.test(entry.weight) ? entry.weight : "normal"
    }]));
  }
  function fontAlias(font, options) { return options?.fontAliases?.[font.toLowerCase()]; }
  function localFontSources(font, options) {
    const alias = fontAlias(font, options);
    return [...new Set([alias?.fullName, alias?.postscriptName, font, font + " Regular"].filter(Boolean))].map(name => `local(${cssString(name)})`).join(", ");
  }
  const prefix = cssString(FAMILY) + ", ";
  function familyList(value, input = false) {
    const result = [];
    let start = 0;
    let depth = 0;
    let quote = "";
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "\\") { i++; continue; }
      if (quote) { if (value[i] === quote) quote = ""; continue; }
      if (value[i] === '"' || value[i] === "'") { quote = value[i]; continue; }
      if (value.startsWith("/*", i)) { const end = value.indexOf("*/", i + 2); i = end < 0 ? value.length : end + 1; continue; }
      if (value[i] === "(") depth++;
      if (value[i] === ")") depth--;
      if ((value[i] === "," || (input && /[，\r\n]/.test(value[i]))) && !depth) { result.push(value.slice(start, i)); start = i + 1; }
    }
    result.push(value.slice(start));
    return result;
  }
  function hasBodyFonts(settings) { return settings.cjkMode !== "off" || settings.replaceSong === true || settings.replaceKai === true || settings.replaceSerif === true; }
  function hasFonts(value) { const settings = working(value); return Boolean(unicodeRange(settings)) || hasBodyFonts(settings); }
  function decodeCSS(value) {
    return value.replace(/\\(?:([\da-f]{1,6})(?:\r\n|[\t\n\f\r ])?|([^\r\n\f]))/gi, (_, hex, char) => {
      if (!hex) return char;
      const n = parseInt(hex, 16);
      return n === 0 || n > 0x10FFFF || (n >= 0xD800 && n <= 0xDFFF) ? "\uFFFD" : String.fromCodePoint(n);
    }).replace(/\\(?:\r\n|[\r\n\f])/g, "");
  }
  function familyName(value) {
    let name = value.trim();
    if ((name[0] === '"' || name[0] === "'") && name.at(-1) === name[0]) name = name.slice(1, -1);
    else {
      name = name.replace(/\/\*[\s\S]*?\*\//g, " ").trim();
      if (/[()]/.test(name)) return null;
    }
    return decodeCSS(name).replace(/[\t\r\n\f ]+/g, " ").trim().toLowerCase();
  }
  function fontNames(value) {
    const result = [], seen = new Set();
    for (const part of familyList(value, true)) {
      let name = part.trim();
      if ((name[0] === '"' || name[0] === "'") && name.at(-1) === name[0] && name.length > 1) name = decodeCSS(name.slice(1, -1));
      else if (!/['"]/.test(name.replace(/\\[\s\S]/g, ""))) name = decodeCSS(name);
      const key = name.toLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key); result.push(name);
    }
    return result;
  }
  function punctuationFaces(value) {
    const settings = working(value), range = unicodeRange(settings);
    if (settings[WORK].punctuationFaces) return settings[WORK].punctuationFaces;
    const names = fontNames(settings.font);
    if (!range) return [];
    // 独立名称保留每个字体的字重匹配与合成粗体，列表顺序交给浏览器回退。
    return settings[WORK].punctuationFaces = names.map((source, i) => ({ family: FAMILY + (i ? " " + (i + 1) : ""), source, range,
      weight: fontAlias(source, settings)?.weight || (/^PingFang UI (?:SC|TC|HK|MO)$/i.test(source) ? "100 900" : "normal") }));
  }
  const serifRangeCache = new Map();
  function serifRanges(shared = "chinese") {
    const key = shared === "western" ? "western" : "chinese";
    if (serifRangeCache.has(key)) return serifRangeCache.get(key);
    // 汉字、注音、部首、笔画、中文标点与全角形式；补充平面覆盖扩展汉字。
    const chinese = [[0x2E80, 0x303F], [0x3100, 0x312F], [0x31A0, 0x9FFF],
      [0xF900, 0xFAFF], [0xFE10, 0xFE1F], [0xFE30, 0xFE4F], [0xFF00, 0xFF60],
      [0xFFE0, 0xFFE6], [0x16FE0, 0x16FFF], [0x20000, 0x3FFFF]];
    if (key === "chinese") for (const char of GROUPS.filter(group => group.id !== "ascii").map(group => group.chars).join("")) {
      const code = char.codePointAt(0); chinese.push([code, code]);
    }
    chinese.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [start, end] of chinese) {
      const last = merged.at(-1);
      if (last && start <= last[1] + 1) last[1] = Math.max(last[1], end);
      else merged.push([start, end]);
    }
    // 西文使用中文范围的补集，排除代理码位，两个板块没有重叠范围。
    const western = [];
    let cursor = 0;
    for (const [start, end] of [...merged, [0xD800, 0xDFFF]].sort((a, b) => a[0] - b[0])) {
      if (cursor < start) western.push([cursor, start - 1]);
      cursor = end + 1;
    }
    if (cursor <= 0x10FFFF) western.push([cursor, 0x10FFFF]);
    const text = ranges => ranges.map(([start, end]) => "U+" + start.toString(16).toUpperCase() + (end === start ? "" : "-" + end.toString(16).toUpperCase())).join(",");
    const result = Object.freeze({ chinese: text(merged), western: text(western) });
    serifRangeCache.set(key, result);
    return result;
  }
  function serifFaces(value) {
    const settings = working(value);
    if (!settings.replaceSerif) return [];
    if (settings[WORK].serifFaces) return settings[WORK].serifFaces;
    const ranges = serifRanges(settings.serifShared);
    // 每个后备字体单独注册，避免中文变量字重改变西文字体的字重匹配。
    return settings[WORK].serifFaces = [["chinese", SERIF_CHINESE, settings.serifChinese], ["western", SERIF_WESTERN, settings.serifWestern]].flatMap(([side, family, list]) =>
      fontNames(list).map((source, i) => ({ family: family + (i ? " " + (i + 1) : ""), source, side, range: ranges[side],
        weight: fontAlias(source, settings)?.weight || (/^PingFang UI (?:SC|TC|HK|MO)$/i.test(source) ? "100 900" : "normal") })));
  }
  function fontFaces(value) { const settings = working(value); return [...punctuationFaces(settings), ...serifFaces(settings)]; }
  function isGenericSerif(value) {
    const part = value.replace(/\/\*[\s\S]*?\*\//g, " ").trim();
    return part[0] !== '"' && part[0] !== "'" && familyName(part) === "serif";
  }
  function isSerifAlias(value) { return /^mixed serif (?:chinese|western)(?: [2-9]\d*| 1\d+)?$/.test(familyName(value) || ""); }
  function isSerifTarget(value) { return isGenericSerif(value) || SONG_FONTS.has(familyName(value)) || familyName(value) === "times new roman"; }
  function hasSans(value, options) {
    const name = familyName(familyList(value)[0]);
    return name !== null && (/sans|hei|黑[体體]/i.test(name) || working(options)[WORK].punctuationTargets.has(name));
  }
  function leadingVariable(value) {
    const part = familyList(value)[0];
    const opening = part.indexOf("(");
    if (opening < 0 || decodeCSS(part.slice(0, opening).replace(/\/\*[\s\S]*?\*\//g, "").trim()).toLowerCase() !== "var" || !part.trimEnd().endsWith(")")) return null;
    const args = familyList(part.slice(opening + 1, part.lastIndexOf(")")));
    const name = decodeCSS(args[0].replace(/\/\*[\s\S]*?\*\//g, "").trim());
    if (!name.startsWith("--")) return null;
    return { name, fallback: args.length > 1 ? args.slice(1).join(",") : null };
  }
  function firstVariableReferences(value) {
    const result = new Set();
    while (true) {
      const variable = leadingVariable(value);
      if (!variable) break;
      result.add(variable.name);
      if (variable.fallback === null) break;
      value = variable.fallback;
    }
    return result;
  }
  function hasSerif(value) {
    const pending = [value];
    for (let i = 0; i < pending.length; i++) for (const part of familyList(pending[i])) {
      if (isSerifTarget(part) || isSerifAlias(part)) return true;
      const opening = part.indexOf("(");
      if (opening >= 0 && decodeCSS(part.slice(0, opening).trim()).toLowerCase() === "var" && part.trimEnd().endsWith(")")) {
        const fallback = familyList(part.slice(opening + 1, part.lastIndexOf(")"))).slice(1).join(",");
        if (fallback) pending.push(fallback);
      }
    }
    return false;
  }
  function hasChineseNonSans(value) {
    const pending = [value];
    for (let i = 0; i < pending.length; i++) for (const part of familyList(pending[i])) {
      const name = familyName(part);
      if (name !== null) {
        if (CHINESE_NON_SANS.has(name) || /[宋楷]|明[体體]/.test(name) || /^(?:noto serif(?: cjk)?|source han serif) (?:sc|cn|tc|tw|hk|hc)$/.test(name)) return true;
      } else {
        const text = decodeCSS(part).replace(/\/\*[\s\S]*?\*\//g, " ").trim();
        if (/^generic\(\s*(?:kai|fangsong)\s*\)$/i.test(text)) return true;
        const variable = text.match(/^var\(([\s\S]*)\)$/i);
        if (variable) {
          const fallback = familyList(variable[1]).slice(1).join(",");
          if (fallback) pending.push(fallback);
        }
      }
    }
    return false;
  }
  function chineseFontFamilies(font, options) {
    const names = fontNames(font);
    const selected = names.length === 1 && names[0].toLowerCase() === "pingfang ui sc" ? [names[0], "PingFang SC"] : names;
    return selected.map(name => fontAlias(name, options)?.family || name);
  }
  function bodyFontFamilies(value) {
    const settings = working(value);
    return settings[WORK].bodyFamilies ||= [...new Set([
      ...punctuationFaces(settings).map(face => face.family),
      ...fontNames(settings.cjkWesternFont).map(name => fontAlias(name, settings)?.family || name),
      ...chineseFontFamilies(settings.cjkFont, settings)
    ].map(cssString))].join(", ");
  }
  function chineseFamilies(value, options, append = true, preserveSystem = false, transformFallback = null) {
    const settings = working(options);
    if (!hasBodyFonts(settings) && !transformFallback) return value;
    const targets = settings[WORK].targets;
    const selected = fontNames(settings.cjkFont)[0]?.toLowerCase();
    const parts = familyList(value);
    const group = bodyFontFamilies(settings);
    const typedGroup = list => chineseFontFamilies(list, settings).map(cssString).join(", ");
    const nonSans = hasChineseNonSans(value) || settings.replaceSerif && hasSerif(value);
    const alreadySerif = parts.some(isSerifAlias);
    let found = alreadySerif;
    const generated = new Set();
    const emit = group => familyList(group).map(part => part.trim()).filter(part => {
      const name = familyName(part);
      if (generated.has(name)) return false;
      generated.add(name); return true;
    }).join(", ");
    const result = parts.map((part, i) => {
      const name = familyName(part);
      if (settings.replaceSerif && isSerifTarget(part)) {
        found = true;
        return alreadySerif ? part : [emit(serifFaces(settings).map(face => cssString(face.family)).join(", ")), part.trim()].filter(Boolean).join(", ");
      }
      if ((settings.replaceSong && SONG_FONTS.has(name)) || (settings.replaceKai && KAI_FONTS.has(name))) {
        found = true;
        return emit(typedGroup(SONG_FONTS.has(name) ? settings.songFont : settings.kaiFont));
      }
      if (name === null) {
        if (settings.replaceKai && /^generic\(\s*kai\s*\)$/i.test(decodeCSS(part).trim())) { found = true; return emit(typedGroup(settings.kaiFont)); }
        const opening = part.indexOf("(");
        if (opening >= 0 && decodeCSS(part.slice(0, opening).trim()).toLowerCase() === "var" && part.trimEnd().endsWith(")")) {
          const closing = part.lastIndexOf(")");
          const args = familyList(part.slice(opening + 1, closing));
          if (args.length > 1) {
            const fallback = args.slice(1).join(",");
            const replacement = transformFallback ? transformFallback(fallback) : chineseFamilies(fallback, settings, false, preserveSystem);
            if (replacement !== fallback) {
              found = true;
              return part.slice(0, opening + 1) + args[0] + "," + replacement + part.slice(closing);
            }
          }
        }
      }
      if ((nonSans || preserveSystem === true) && systemNames.has(name)) return part;
      if (settings.cjkMode !== "off" && (name === selected || targets.has(name))) {
        found = true;
        return typeof preserveSystem === "function" && systemNames.has(name) ? preserveSystem(part, group) : emit(group);
      }
      if (name !== null) generated.add(name);
      return part;
    }).filter(part => part.trim()).join(",");
    return settings.cjkMode !== "off" && !found && append && !nonSans ? result + ", " + emit(group) : result;
  }
  function variableReferences(value) {
    const result = new Set();
    for (let i = 0; i < value.length;) {
      if (value.startsWith("/*", i)) { const end = value.indexOf("*/", i + 2); i = end < 0 ? value.length : end + 2; continue; }
      if (value[i] === '"' || value[i] === "'") {
        const quote = value[i++];
        while (i < value.length) { if (value[i] === "\\") { i += 2; continue; } if (value[i++] === quote) break; }
        continue;
      }
      if (value[i] === "\\" || /[\w-]/.test(value[i]) || value.charCodeAt(i) >= 128) {
        const start = i;
        while (i < value.length) {
          if (value[i] === "\\") { const match = value.slice(i).match(/^\\(?:[\da-f]{1,6}(?:\r\n|[\t\n\f\r ])?|[^\r\n\f])/i); if (!match) break; i += match[0].length; continue; }
          if (!(/[\w-]/.test(value[i]) || value.charCodeAt(i) >= 128)) break;
          i++;
        }
        const name = decodeCSS(value.slice(start, i));
        if (i === start) { i++; continue; }
        if (value[i] === "(" && name.toLowerCase() === "var") {
          i++;
          while (i < value.length) {
            if (/[\t\r\n\f ]/.test(value[i])) { i++; continue; }
            if (value.startsWith("/*", i)) { const end = value.indexOf("*/", i + 2); i = end < 0 ? value.length : end + 2; continue; }
            break;
          }
          const begin = i;
          while (i < value.length) {
            if (value[i] === "\\") { const match = value.slice(i).match(/^\\(?:[\da-f]{1,6}(?:\r\n|[\t\n\f\r ])?|[^\r\n\f])/i); if (!match) break; i += match[0].length; continue; }
            if (!(/[\w-]/.test(value[i]) || value.charCodeAt(i) >= 128)) break;
            i++;
          }
          const reference = decodeCSS(value.slice(begin, i));
          if (reference.startsWith("--")) result.add(reference);
        }
        continue;
      }
      i++;
    }
    return result;
  }
  // 按字段合并草稿，保留其他窗口的新设置和同域名规则的独立编辑。
  function mergeDraft(base, draft, latest) {
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const merge = (before, edited, current) => Object.fromEntries([...new Set([...Object.keys(current), ...Object.keys(edited)])]
      .map(key => [key, equal(edited[key], before[key]) ? current[key] : edited[key]]));
    const result = merge(base, draft, latest);
    if (equal(base.siteRules, draft.siteRules)) return result;
    const index = rules => {
      const counts = new Map();
      return new Map((rules || []).map(rule => {
        const domain = parseDomain(rule.domain);
        const name = domain ? domain.host + ":" + (domain.port || "") : rule.domain;
        const count = counts.get(name) || 0; counts.set(name, count + 1);
        return [name + "\0" + count, rule];
      }));
    };
    const before = index(base.siteRules), edited = index(draft.siteRules), current = index(latest.siteRules);
    const order = equal([...before.keys()], [...edited.keys()]) ? [...current.keys(), ...edited.keys()] : [...edited.keys(), ...current.keys()];
    result.siteRules = [...new Set(order)].flatMap(key => {
      if (before.has(key) && !edited.has(key)) return [];
      if (!edited.has(key)) return current.has(key) ? [current.get(key)] : [];
      if (!current.has(key)) return before.has(key) && equal(before.get(key), edited.get(key)) ? [] : [edited.get(key)];
      return [merge(before.get(key) || {}, edited.get(key), current.get(key))];
    });
    return result;
  }
  function writeSettings(storage, change) {
    return navigator.locks.request("spf-settings-write", async () => {
      const latest = normalize((await storage.get("settings")).settings);
      const value = change(latest);
      await storage.set({ settings: value });
      return value;
    });
  }
  function prepend(value, options, append = true, preserveSystem = !append, mirror = null) {
    const family = value.trim();
    if (!family || /^(?:inherit|initial|unset|revert|revert-layer)$/i.test(family) || family.startsWith(prefix)) return value;
    const settings = working(options);
    const faces = punctuationFaces(settings);
    const result = chineseFamilies(value, settings, append, preserveSystem);
    if (!faces.length) return result;
    // 只依据原字体首项判断；后备字体与替换后新增的名称不参与。
    if (hasSans(value, settings)) {
      const names = new Set(faces.map(face => face.family.toLowerCase()));
      return faces.map(face => cssString(face.family)).join(", ") + ", " + familyList(result).filter(part => !names.has(familyName(part))).join(",").trimStart();
    }
    const first = leadingVariable(value);
    if (!first) return result;
    const parts = familyList(result);
    const rewritten = leadingVariable(parts[0]);
    if (!rewritten) return result;
    const name = mirror?.(first.name);
    const fallback = first.fallback === null ? "" : "," + prepend(first.fallback, settings, false, preserveSystem, mirror);
    if (!name && first.fallback === null) return result;
    // 专用变量仅用于首项，其他位置继续使用网站原变量。
    parts[0] = "var(" + (name || parts[0].slice(parts[0].indexOf("(") + 1).split(",")[0].trim()) + fallback + ")";
    return parts.join(",");
  }
  globalThis.SPF = Object.freeze({ writeSettings, mergeDraft, matchRule, FAMILY, CHINESE_FONTS, SYSTEM_FONTS, DEFAULT_TARGETS, PUNCTUATION_TARGETS, CHANNEL, GROUPS, normalize, normalizeFontAliases, fontAlias, parseDomain, effective, characters, unicodeRange, cssString, localFontSources, prepend, prefix, familyList, familyName, fontNames, punctuationFaces, serifRanges, serifFaces, fontFaces, hasSans, hasSerif, leadingVariable, firstVariableReferences, hasChineseNonSans, chineseFontFamilies, bodyFontFamilies, chineseFamilies, variableReferences, hasBodyFonts, hasFonts });
})();
