import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createCcfoliaCharacterClipboardData,
  serializeCcfoliaCharacterClipboardData,
} from "../../../src/character-sheet/logic/ccfolia";

const input = {
  actionValue: 8,
  bondLimit: 5,
  bonds: [
    { isResolved: false, relation: "仲間", target: "アキラ" },
    { isResolved: true, relation: "", target: "ミナ" },
    { isResolved: true, relation: "", target: "   " },
    { isResolved: false, relation: "   ", target: "" },
  ],
  health: 30,
  mental: 20,
  pcName: "クロガネ",
};

test("creates the minimal CCFOLIA character payload in its required status order", () => {
  const data = createCcfoliaCharacterClipboardData(input);

  assert.deepEqual(data, {
    kind: "character",
    data: {
      name: "クロガネ",
      initiative: 8,
      status: [
        { label: "体力", max: 30, value: 30 },
        { label: "精神力", max: 20, value: 20 },
        { label: "気合", max: 0, value: 0 },
        { label: "縁", max: 5, value: 2 },
        { label: "覚悟にした縁", max: 5, value: 1 },
        { label: "出血", max: 0, value: 0 },
        { label: "毒", max: 0, value: 0 },
        { label: "BT", max: 0, value: 0 },
      ],
    },
  });
  assert.equal("commands" in data.data, false);
  assert.deepEqual(
    JSON.parse(serializeCcfoliaCharacterClipboardData(input)),
    data,
  );
});

test("does not clamp entered bonds and converts unset or non-finite derived values to zero", () => {
  const data = createCcfoliaCharacterClipboardData({
    actionValue: Number.NaN,
    bondLimit: Number.NEGATIVE_INFINITY,
    bonds: [
      { isResolved: true, relation: "関係だけ", target: "" },
      { isResolved: false, relation: "", target: "対象だけ" },
      { isResolved: true, relation: "空白", target: " " },
    ],
    health: null,
    mental: Number.POSITIVE_INFINITY,
    pcName: "",
  });

  assert.equal(data.data.name, "");
  assert.equal(data.data.initiative, 0);
  assert.deepEqual(data.data.status.slice(0, 5), [
    { label: "体力", max: 0, value: 0 },
    { label: "精神力", max: 0, value: 0 },
    { label: "気合", max: 0, value: 0 },
    { label: "縁", max: 0, value: 3 },
    { label: "覚悟にした縁", max: 0, value: 2 },
  ]);
});
