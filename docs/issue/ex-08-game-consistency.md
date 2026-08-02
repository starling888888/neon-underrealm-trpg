# ex-08-game-consistency

## 目的

Webキャラクターシートで新規作成するキャラクターの抵抗判定について、既定の対応能力値を肉体にする。

## 背景

ゲームルールとの整合のため、抵抗の既定対応能力値を精神から肉体へ変更する。既存の判定行では能力値をユーザーが選択できるため、変更対象は初期値と既定値の定義に限定する。

ゲーム上の数値・用語・制約は `docs/requirements/character-sheet.md` が指定する正本に従う。キャラクターシートの画面・VRT参照情報は `docs/design/character-sheet/notes.md` を参照する。

関連TODOは確認したが、この変更に直接対応する項目はない。既存のキャラクターシートTODOは扱わない。

## 対象範囲

- `src/character-sheet/form-values.ts` の新規フォーム用・抵抗判定行の初期能力値
- `src/character-sheet/logic/checks.ts` の抵抗判定の既定能力値定義
- 上記の既定値を検証する既存または追加のテスト
- `scripts/convert-items/weapons.ts` と関連する型・schemaで、武器種別のスラッシュ区切り複数値を検証・保持する処理
- 武器種別の複数値を確認する変換テスト
- 能力値成長の累計成長点と能力値ごとの上限を、格15ごとの追加獲得ルールへ一致させるキャラクターシートlogic・テスト・説明文
- 戦闘ルールのリアクション説明から攻撃スキルの効果へリンクし、参照先のCallout titleを見出しとして出力する
- 戦闘ルールからキャラクターメイキングの戦闘技能表へ、ASCII idで安定してリンクする
- ページのヒーロー画像を装飾画像として扱い、`alt`を空文字列へ統一する

## 初期スコープ外

- 抵抗以外の判定の既定能力値を変更しない
- 保存済みキャラクターデータの選択済み能力値を変換しない
- ルール本文、マスタデータ、画面layout、CSS、依存関係を変更しない
- キャラクターシートの既存TODOを回収しない
- `docs/out-of-scope.md` に定める機能を追加しない

## 完了条件

- [x] 新規キャラクターシートの抵抗判定の初期能力値が肉体である
- [x] 判定の既定能力値定義で、抵抗が肉体へ対応付けられている
- [x] 既存のユーザー選択済み能力値を上書きしない
- [x] 既定値を確認する自動テストがある
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] `近接/特殊` のように、許可済み武器種別をスラッシュ区切りで複数指定できる
- [x] 空要素、未定義種別、重複種別を含む武器種別を変換時に拒否する
- [x] 格15で累計1点、格30で累計3点、格45で累計6点の成長点を表示・検証する
- [x] 能力値ごとの成長値を、`floor(格 ÷ 15)`以下に制限する
- [x] 成長点の算出と制限を、キャラクターシート要件および成長ルール本文で説明する
- [x] リアクション説明から、`/data`の攻撃スキルの効果へリンクできる
- [x] 攻撃スキルの効果のCallout titleが見出しとして出力される
- [x] リアクション説明から、`/character-making#combat-skills`の戦闘技能表へリンクできる
- [x] ページのヒーロー画像がすべて空の代替テキストを持つ

## チェックポイント

- [x] `/character-sheet/` の既存ルートと判定行の編集操作が壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 既存の単一武器種別と生成済みデータを変更せずに扱える
- [x] `docs/design/character-sheet/notes.md` の能力値選択UIと矛盾していない
- [x] PRレビュー直前に、`@character-sheet` の`default`と`combat-default`をdesktop、tablet、mobileでVisual Reviewする
- [x] Visual Reviewでは既存のlocal-only canonical baselineと比較し、design契約への適合をactual screenshotで確認する。baselineの追加・更新はユーザー承認なしに行わない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/logic/checks.ts`
- `tests/node/character-sheet/checks.test.ts`
- `tests/node/character-sheet/persistence/character-sheet-form.test.ts`
- `scripts/convert-items/weapons.ts`
- `src/lib/types/item.ts`
- `src/lib/schemas/conversion/item.ts`
- `tests/node/items.test.ts`
- `src/character-sheet/logic/build.ts`
- `tests/node/character-sheet/build.test.ts`
- `src/character-sheet/dictionary.ts`
- `docs/requirements/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `src/pages/advancement.mdx`
- `src/pages/data/index.mdx`
- `src/pages/character-making.mdx`
- `src/pages/rules/battle.mdx`
- ヒーロー画像を参照する `src/pages/` 配下のMDX / Astroページ

## レビュー観点

- 抵抗だけが肉体を既定値として初期化され、他の判定行の既定値に影響がないこと。
- 明示的に選択・保存された能力値を既定値の変更によって書き換えないこと。
- `docs/design/character-sheet/notes.md` が定める、攻撃・リアクション判定で5能力値から選べるUIを維持すること。
- あなたが並行して行うゲーム整合性修正と、担当ファイルまたは意図が衝突する場合は、実装前に範囲を確認すること。

## 備考

- milestone外のメンテナンスタスクとして扱う。`docs/issue/milestone-02/plan.md` は更新しない。
- design targetは既存の `docs/design/character-sheet/notes.md` を参照する。画面構造・表示状態の追加やbaseline更新はこのissueの前提にしない。
- 2026-08-02のユーザー明示指示により、武器種別の変換契約をこのissueへ追加した。入力・生成値は`近接/特殊`のように`/`で連結した文字列として保持し、既存の表示Componentはその文字列を表示するだけとする。
- 2026-08-02に`npm run check`が成功し、Astro、Biome、Markdownを確認した。
- 2026-08-02のユーザー明示指示により、能力値成長は格15ごとの追加獲得とする。格15、30、45における累計成長点はそれぞれ1、3、6点であり、各能力値へは各成長機会で1点だけ割り振れるため、現在の格における能力値ごとの成長値は`floor(格 ÷ 15)`を超えない。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/vrt/character-sheet.spec.ts` / `@character-sheet`、`@default`、`@combat-default`
- route / states / viewports: `/character-sheet/`のdefault（full-page）とcombat-default（`判定` section）を、desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）で確認

### レビュー結果

| 対象                             | 結果                                                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default（full-page）             | 3 viewportで通常比較が成功。baseline更新前の差分は抵抗の選択値が精神から肉体へ変わった163 pixel（0.01%）だけであることを確認後、ユーザー承認済みのlocal-only baselineを更新した。 |
| combat-default（`判定` section） | 3 viewportで通常比較が成功。抵抗の使用能力値が肉体であり、判定sectionの行揃え、clip、横overflowに問題がない。                                                                     |

### actual screenshotの確認

| state                            | desktop                                                        | tablet | mobile |
| -------------------------------- | -------------------------------------------------------------- | ------ | ------ |
| default（full-page）             | 抵抗が肉体であり、ページ全体にclipや横overflowがないことを確認 | 同左   | 同左   |
| combat-default（`判定` section） | 抵抗が肉体であり、行揃え、clip、横overflowがないことを確認     | 同左   | 同左   |

### 補足

- `npx vitest run tests/components/character-sheet/ChecksSection.test.tsx`で、判定行の能力値選択を含む5件のcomponent testが成功した。
- `npm run build`と、GitHub Pagesと同じサブパスを使うpreview上のVRTで、公開pathへの影響がないことを確認した。
