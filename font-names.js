(() => {
  "use strict";
  const NAME_IDS = new Set([1, 2, 4, 6, 16, 17, 21]);
  const clean = value => typeof value === "string" && value.trim() && value.length <= 300 && !/[\0-\x1f]/.test(value) ? value.trim() : "";
  async function view(blob, offset, length) {
    if (!Number.isInteger(offset) || !Number.isInteger(length) || offset < 0 || length < 0 || offset + length > blob.size) throw new Error("字体表范围无效。");
    return new DataView(await blob.slice(offset, offset + length).arrayBuffer());
  }
  const tagAt = (data, offset) => String.fromCharCode(...[0, 1, 2, 3].map(i => data.getUint8(offset + i)));
  function decode(bytes, platform, encoding) {
    const label = platform === 0 || platform === 3 ? "utf-16be" : ({ 0: "macintosh", 1: "shift_jis", 2: "big5", 3: "euc-kr", 25: "gb18030" })[encoding];
    if (!label) return "";
    try { return clean(new TextDecoder(label).decode(bytes)); } catch { return ""; }
  }
  async function readFont(blob) {
    const header = await view(blob, 0, 12);
    let offsets = [0];
    if (tagAt(header, 0) === "ttcf") {
      const count = header.getUint32(8);
      if (count < 1 || count > 256) throw new Error("字体集合数量无效。");
      const entries = await view(blob, 12, count * 4);
      offsets = Array.from({ length: count }, (_, i) => entries.getUint32(i * 4));
    }
    const faces = [];
    for (const offset of offsets) {
      const header = await view(blob, offset, 12);
      const count = header.getUint16(4);
      if (count > 4096) continue;
      const directory = await view(blob, offset + 12, count * 16);
      const tables = new Map();
      for (let i = 0; i < count; i++) tables.set(tagAt(directory, i * 16), { offset: directory.getUint32(i * 16 + 8), length: directory.getUint32(i * 16 + 12) });
      const table = tables.get("name");
      if (!table || table.length > 4 * 1024 * 1024) continue;
      const names = await view(blob, table.offset, table.length);
      const total = names.getUint16(2), strings = names.getUint16(4);
      if (6 + total * 12 > names.byteLength) continue;
      const records = [];
      for (let i = 0; i < total; i++) {
        const at = 6 + i * 12, platform = names.getUint16(at), encoding = names.getUint16(at + 2), language = names.getUint16(at + 4), id = names.getUint16(at + 6);
        const length = names.getUint16(at + 8), start = strings + names.getUint16(at + 10);
        if (!NAME_IDS.has(id) || start + length > names.byteLength) continue;
        const name = decode(new Uint8Array(names.buffer, start, length), platform, encoding);
        if (name) records.push({ id, language, platform, name });
      }
      const preferred = id => records.find(r => r.id === id && r.platform === 3 && r.language === 0x409)?.name
        || records.find(r => r.id === id && r.platform === 1 && r.language === 0)?.name || records.find(r => r.id === id)?.name || "";
      let weight = "normal";
      const variations = tables.get("fvar");
      if (variations && variations.length <= 1024 * 1024) {
        const axes = await view(blob, variations.offset, variations.length);
        if (axes.byteLength >= 16) {
          const start = axes.getUint16(4), count = axes.getUint16(8), size = axes.getUint16(10);
          if (size >= 20 && count <= 64 && start + count * size <= axes.byteLength) for (let i = 0; i < count; i++) {
            const at = start + i * size;
            if (tagAt(axes, at) === "wght") {
              const min = axes.getInt32(at + 4) / 65536, max = axes.getInt32(at + 12) / 65536;
              if (min >= 1 && max <= 1000 && min <= max) weight = min + " " + max;
            }
          }
        }
      }
      const family = preferred(16) || preferred(1), fullName = preferred(4), postscriptName = preferred(6);
      if (family && fullName) faces.push({ family, fullName, postscriptName, weight, aliases: [...new Set(records.filter(r => [1, 4, 16, 21].includes(r.id)).map(r => r.name))], style: preferred(17) || preferred(2) });
    }
    return faces;
  }
  async function buildIndex(fonts, wanted = [], progress = () => {}) {
    const aliases = Object.create(null), scores = new Map();
    const add = (name, entry, score) => {
      const key = clean(name).toLowerCase();
      if (key && (!scores.has(key) || scores.get(key) < score)) { aliases[key] = entry; scores.set(key, score); }
    };
    for (const font of fonts) {
      const entry = { family: font.family, fullName: font.fullName, postscriptName: font.postscriptName, weight: "normal" };
      const score = /^(?:regular|normal|roman|book)$/i.test(font.style) ? 20 : 0;
      add(font.family, entry, score); add(font.fullName, entry, score); add(font.postscriptName, entry, score);
    }
    const wantedNames = wanted.map(name => name.toLowerCase());
    const needed = () => wantedNames.some(name => !aliases[name]);
    const representatives = new Map();
    for (const font of fonts) if (!representatives.has(font.family) || /^(?:regular|normal|roman|book)$/i.test(font.style)) representatives.set(font.family, font);
    const ordered = [...new Set([...representatives.values(), ...fonts])];
    const covered = new Set();
    let read = 0;
    for (const font of ordered) {
      // 一个 TTC 或可变字体的名称表可覆盖多个字面，复用已读取的结果。
      if (covered.has(font.family)) continue;
      try {
        for (const face of await readFont(await font.blob())) {
          if (face.weight !== "normal") covered.add(face.family);
          const entry = { family: face.family, fullName: face.fullName, postscriptName: face.postscriptName, weight: face.weight };
          const score = (face.weight !== "normal" ? 100 : 0) + (/^(?:regular|normal|roman|book)$/i.test(face.style) ? 50 : 10);
          for (const name of [...face.aliases, face.postscriptName]) add(name, entry, score);
        }
      } catch {}
      progress(++read, ordered.length);
      if (wantedNames.length && !needed()) break;
      // 解析在设置页分批进行，保留输入和按钮响应。
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return aliases;
  }
  globalThis.FontNames = Object.freeze({ readFont, buildIndex });
})();
