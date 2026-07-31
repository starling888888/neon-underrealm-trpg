import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { parseCharacterSheetJsonImport } from "../../src/character-sheet/schemas/character-sheet-persistence";

const sampleCharacters = [
  ["01_kenkaya_sumi", "入れ墨の切り込み隊長", "kenkaya", "sumi"],
  ["02_emono_burai", "一撃必殺の乱暴者", "emono", "burai"],
  ["03_stegoro_yaku", "裏路地のチャンピオン", "sutegoro", "yaku"],
  ["04_kabe_kejime", "義体の守護者", "kabe", "kejime"],
  ["05_shabazou_burai", "放浪の狙撃手", "shabazou", "burai"],
  ["06_teppoudama_kejime", "連撃の鉄拳", "teppoudama", "kejime"],
  ["07_yamiuchi_burai", "闇に溶ける暗殺者", "yamiuchi", "burai"],
  ["08_kaeshi_sumi", "変容するガン=カタ", "kaeshi", "sumi"],
  ["09_gotoshi_yaku", "ヤク中のイカサマ師", "gotoshi", "yaku"],
  ["10_kashira_kejime", "鋼の若頭", "kashira", "kejime"],
] as const;

describe("sample characters", () => {
  it("keeps every published JSON importable with its expected identity", () => {
    for (const [slug, pcName, primaryRyugiId, ikizamaId] of sampleCharacters) {
      const file = `public/sample-charcter/sample-character_${slug}.json`;
      const parsed = parseCharacterSheetJsonImport(readFileSync(file, "utf8"));

      if (parsed === null)
        throw new Error(`Expected ${file} to be importable.`);

      assert.equal(parsed.values.profile.pcName, pcName, file);
      assert.equal(parsed.values.build.primaryRyugiId, primaryRyugiId, file);
      assert.equal(parsed.values.build.ikizamaId, ikizamaId, file);
    }
  });

  it("lists the sample JSON downloads in an ordered character table", () => {
    const source = readFileSync("src/pages/character-making.mdx", "utf8");

    assert.match(
      source,
      /キャラクターシート<\/a>にインポートして利用してください。/,
    );
    assert.match(
      source,
      /href=\{withBase\("\/character-sheet"\)\} target="_blank" rel="noopener noreferrer"/,
    );
    assert.match(source, /\| キャラクター \| 組み合わせ \|/);

    let previousIndex = -1;
    for (const [slug, pcName] of sampleCharacters) {
      const link = `<a href={withBase("/sample-charcter/sample-character_${slug}.json")} download>${pcName}</a>`;
      const index = source.indexOf(link);

      assert.ok(index > previousIndex, `Expected ordered link: ${link}`);
      previousIndex = index;
    }
  });
});
