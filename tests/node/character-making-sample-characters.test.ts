import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseCharacterSheetJsonImport } from "../../src/character-sheet/schemas/character-sheet-persistence";
import { getIkizamaById } from "../../src/lib/data/ikizama";
import { getRyugiById } from "../../src/lib/data/ryugi-list";

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
      const file = `public/sample-character/sample-character_${slug}.json`;
      const parsed = parseCharacterSheetJsonImport(readFileSync(file, "utf8"));

      if (parsed === null)
        throw new Error(`Expected ${file} to be importable.`);

      expect(parsed.values.profile.pcName, file).toBe(pcName);
      expect(parsed.values.build.primaryRyugiId, file).toBe(primaryRyugiId);
      expect(parsed.values.build.ikizamaId, file).toBe(ikizamaId);
    }
  });

  it("lists the sample JSON downloads in an ordered character table", () => {
    const source = readFileSync("src/pages/character-making.mdx", "utf8");

    expect(source).toMatch(
      /キャラクターシート<\/a>にインポートして利用してください。/,
    );
    expect(source).toMatch(
      /href=\{withBase\("\/character-sheet"\)\} target="_blank" rel="noopener noreferrer"/,
    );
    expect(source).toMatch(/\| キャラクター \| 組み合わせ \|/);

    let previousIndex = -1;
    for (const [slug, pcName] of sampleCharacters) {
      const file = `public/sample-character/sample-character_${slug}.json`;
      const parsed = parseCharacterSheetJsonImport(readFileSync(file, "utf8"));

      expectPresent(parsed, `Expected ${file} to be importable.`);

      const { ikizamaId, primaryRyugiId } = parsed.values.build;

      expectPresent(primaryRyugiId, `Expected primary ryugi ID in ${file}.`);
      expectPresent(ikizamaId, `Expected ikizama ID in ${file}.`);

      const ryugi = getRyugiById(primaryRyugiId);
      const ikizama = getIkizamaById(ikizamaId);

      expectPresent(ryugi, `Expected primary ryugi in ${file}.`);
      expectPresent(ikizama, `Expected ikizama in ${file}.`);

      const row = `| <a href={withBase("/sample-character/sample-character_${slug}.json")} download>${pcName}</a> | ${ryugi.name}×${ikizama.name} |`;
      const index = source.indexOf(row);

      expect(
        index > previousIndex,
        `Expected ordered table row: ${row}`,
      ).toBeTruthy();
      previousIndex = index;
    }
  });
});

function expectPresent<T>(
  value: T,
  message: string,
): asserts value is NonNullable<T> {
  expect(value, message).toBeTruthy();
  if (!value) throw new Error(message);
}
