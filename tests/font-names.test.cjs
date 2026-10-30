const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const scope = vm.createContext({ Blob, TextDecoder, setTimeout });
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "font-names.js"), "utf8"), scope);
const { readFont, buildIndex } = scope.FontNames;

// 只构造名称表与字重轴，测试数据不含真实字体文件。
function fontBlob(records, weights) {
  const strings = records.map(record => {
    if (record.platform === 1) return Buffer.from(record.name, "latin1");
    const bytes = Buffer.from(record.name, "utf16le");
    return bytes.swap16();
  });
  const names = Buffer.alloc(6 + records.length * 12 + strings.reduce((sum, bytes) => sum + bytes.length, 0));
  names.writeUInt16BE(records.length, 2);
  names.writeUInt16BE(6 + records.length * 12, 4);
  let offset = 0;
  records.forEach((record, i) => {
    const at = 6 + i * 12;
    names.writeUInt16BE(record.platform ?? 3, at);
    names.writeUInt16BE(record.platform === 1 ? 0 : 1, at + 2);
    names.writeUInt16BE(record.language ?? 0x409, at + 4);
    names.writeUInt16BE(record.id, at + 6);
    names.writeUInt16BE(strings[i].length, at + 8);
    names.writeUInt16BE(offset, at + 10);
    strings[i].copy(names, 6 + records.length * 12 + offset);
    offset += strings[i].length;
  });
  const tables = [["name", names]];
  if (weights) {
    const axes = Buffer.alloc(36);
    axes.writeUInt16BE(16, 4);
    axes.writeUInt16BE(1, 8);
    axes.writeUInt16BE(20, 10);
    axes.write("wght", 16);
    axes.writeInt32BE(weights[0] * 65536, 20);
    axes.writeInt32BE(400 * 65536, 24);
    axes.writeInt32BE(weights[1] * 65536, 28);
    tables.push(["fvar", axes]);
  }
  const font = Buffer.alloc(12 + tables.length * 16 + tables.reduce((sum, [, bytes]) => sum + bytes.length, 0));
  font.writeUInt32BE(0x10000);
  font.writeUInt16BE(tables.length, 4);
  offset = 12 + tables.length * 16;
  tables.forEach(([tag, bytes], i) => {
    const at = 12 + i * 16;
    font.write(tag, at);
    font.writeUInt32BE(offset, at + 8);
    font.writeUInt32BE(bytes.length, at + 12);
    bytes.copy(font, offset);
    offset += bytes.length;
  });
  return new Blob([font]);
}

function localFont(family, fullName, postscriptName, style, records, weights) {
  return { family, fullName, postscriptName, style, blob: async () => fontBlob(records, weights) };
}

test("独立字面完整名称与 PostScript 名保留精确选择，排印家族仍按家族调用", async () => {
  const fonts = ["W04", "W05"].map(style => localFont("TsangerJinKai01", `仓耳今楷01 ${style}`, `TsangerJinKai01-${style}`, style, [
    { id: 1, name: `TsangerJinKai01 ${style}` },
    { id: 1, language: 0x804, name: `仓耳今楷01 ${style}` },
    { id: 4, language: 0x804, name: `仓耳今楷01 ${style}` },
    { id: 4, platform: 1, language: 0x21, name: `01 ${style}` },
    { id: 6, name: `TsangerJinKai01-${style}` },
    { id: 16, name: "TsangerJinKai01" },
    { id: 16, language: 0x804, name: "仓耳今楷01" },
    { id: 17, name: style }
  ]));
  const [face] = await readFont(await fonts[0].blob());
  assert.equal(face.fullName, "仓耳今楷01 W04");
  const index = await buildIndex(fonts);
  for (const style of ["W04", "W05"]) for (const name of [`仓耳今楷01 ${style}`, `TsangerJinKai01 ${style}`, `TsangerJinKai01-${style}`]) {
    assert.equal(index[name.toLowerCase()].exact, true, name);
    assert.equal(index[name.toLowerCase()].postscriptName, `TsangerJinKai01-${style}`);
  }
  for (const name of ["仓耳今楷01", "TsangerJinKai01"]) assert.equal(index[name.toLowerCase()].exact, false, name);
});

test("普通家族保留原生粗体选择，完整粗体名称仍锁定对应字面", async () => {
  const fonts = ["Regular", "Bold"].map(style => {
    const fullName = style === "Regular" ? "Times New Roman" : "Times New Roman Bold";
    return localFont("Times New Roman", fullName, `TimesNewRomanPS-${style}`, style, [
      { id: 1, name: "Times New Roman" }, { id: 2, name: style },
      { id: 4, name: fullName }, { id: 6, name: `TimesNewRomanPS-${style}` }
    ]);
  });
  const index = await buildIndex(fonts.reverse());
  assert.equal(index["times new roman"].exact, false);
  assert.equal(index["times new roman"].fullName, "Times New Roman");
  assert.equal(index["times new roman bold"].exact, true);
  assert.equal(index["timesnewromanps-bold"].exact, true);
});

test("缺少本地化排印家族时保留对应语言的传统家族名称", async () => {
  const fonts = ["Regular", "Bold"].map(style => localFont("Example Family", `Example Family ${style}`, `Example-${style}`, style, [
    { id: 1, name: "Example Family" }, { id: 1, language: 0x804, name: "示例家族" },
    { id: 2, name: style }, { id: 4, name: `Example Family ${style}` },
    { id: 4, language: 0x804, name: style === "Regular" ? "示例家族" : "示例家族 Bold" },
    { id: 6, name: `Example-${style}` }, { id: 16, name: "Example Family" }, { id: 17, name: style }
  ]));
  const index = await buildIndex(fonts);
  assert.equal(index["示例家族"].exact, false);
  assert.equal(index["示例家族"].family, "Example Family");
  assert.equal(index["示例家族 bold"].exact, true);
  assert.equal(index["example-bold"].exact, true);
});

test("可变字体多语言家族别名保留字重范围，完整名称保留字面身份", async () => {
  const font = localFont("Source Han Serif SC VF", "Source Han Serif SC VF Regular", "SourceHanSerifSCVF-Regular", "Regular", [
    { id: 1, name: "Source Han Serif SC VF" }, { id: 2, name: "Regular" },
    { id: 4, name: "Source Han Serif SC VF Regular" }, { id: 6, name: "SourceHanSerifSCVF-Regular" },
    { id: 16, name: "Source Han Serif SC VF" }, { id: 16, language: 0x804, name: "思源宋体 VF" },
    { id: 17, name: "Regular" }
  ], [250, 900]);
  const index = await buildIndex([font]);
  assert.equal(index["思源宋体 vf"].family, "Source Han Serif SC VF");
  assert.equal(index["思源宋体 vf"].exact, false);
  assert.equal(index["思源宋体 vf"].weight, "250 900");
  assert.equal(index["sourcehanserifscvf-regular"].exact, true);
  assert.equal(index["sourcehanserifscvf-regular"].weight, "250 900");
});
