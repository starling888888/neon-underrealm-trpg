# ex-15-skill-level-totals

## 目的

キャラクターシートのプライマリ流儀スキル、生き様スキル、その他流儀スキルの各区分に、経験点で取得したレベル合計と、その流儀または生き様の現在レベルを表示する。プライマリ流儀、生き様、共通スキルのsummaryには、自動習得スキルを除外する説明tooltipを付ける。

## 背景

各区分は取得レベル合計が対応する流儀または生き様のレベルを超えた場合に検証エラーとなるが、現在は共通スキルだけが追加操作領域で合計値と上限値を確認できる。流儀系スキルについても、経験点で取得したレベルの使用量と取得可能量を区分内で確認できるようにする。

- 要件正本: `docs/requirements/character-sheet.md`
  - 選択済み通常プライマリ流儀スキル、生き様スキル、その他流儀スキルの取得レベル合計が、それぞれ対応する流儀または生き様のレベルを超える場合にエラーとする。
  - プライマリ流儀ボーナスのLv1は合計に含めず、生き様ボーナスはLv2以上の超過分だけを生き様スキル合計に含める。空行は合計に含めない。
- 既存の共通スキル表示は `docs/design/character-sheet/notes.md` の G14 で定義されている。今回の明示指示により、3区分の表示位置、文言、狭幅layout、VRT比較点を定義するとともに、共通スキルsummaryにも自動習得の基本の一撃を除外するtooltipを追加する。
- 関連TODO: `docs/TODO.md` の候補行の選択可能性に関する項目は、今回の合計表示とは別課題として扱い、変更しない。

## 対象範囲

- `docs/design/character-sheet/notes.md` に、3区分の合計表示について承認済みdesign intent、desktop / tablet / mobileの配置、表示文言、error表示、VRT比較点を追加する前段作業を実施する。
- 承認済みdesign intentに従い、プライマリ流儀とその他流儀の各スキル区分で、既存の共通スキルと同じ追加操作領域に「取得合計レベル：N／流儀レベル：M」を表示する。生き様では「取得合計レベル：N／生き様レベル：M」を表示する。
- プライマリ流儀summaryには「自動習得のプライマリボーナススキルのレベルは含みません。」、生き様summaryには「自動習得の生き様ボーナススキル1レベル分のレベルは含みません。」、共通スキルsummaryには「自動習得の「基本の一撃」のレベルは含みません。」を示すtooltipを付ける。その他流儀summaryにはtooltipを追加しない。
- 表示値は既存検証と同じ算出値を用いる。
  - プライマリ流儀: 選択済み通常スキルの取得レベル合計／プライマリ流儀レベル。プライマリ流儀ボーナスは含めない。
  - 生き様: 選択済み通常スキルの取得レベル合計と、生き様ボーナスのLv2以上の超過分の合計／生き様レベル。ボーナスのLv1は含めない。
  - その他流儀: 各その他流儀ごとに、選択済み通常スキルの取得レベル合計／対応するその他流儀レベル。空行は含めない。
- 合計が取得可能レベル合計を超える既存エラー状態では、該当区分の合計表示もerror状態にする。
- 未選択のプライマリ流儀、生き様、その他流儀には、既存の未選択メッセージだけを表示し、合計表示を追加しない。
- 表示と既存validationの値を一元化し、レベル入力、選択、解除、追加、削除、並べ替え、流儀または生き様のレベル変更に追従させる。その他流儀は、validation結果から`ryugiRowId`ごとの取得レベル合計を参照できるようにする。
- 対象限定VRTを実行して意図したsnapshot差分とactual screenshotをVisual Reviewで確認する。canonical VRT baselineの更新は、このissueでは行わず、別途ユーザーが明示承認した作業に限る。

## 初期スコープ外

- スキル取得・成長ルール、経験点の費用計算、スキル候補、行操作、保存形式、エラー判定のルール自体を変更しない。
- 基本情報の経験点表示、共通スキルボーナスの解放表示を変更しない。共通スキルのsummaryは値・配置を変更せず、今回の明示指示に基づくtooltipだけを追加する。
- 新しい依存package、サーバー、DB、認証、同期、キャラクター作成ウィザードを追加しない。
- `docs/TODO.md` の候補行デザイン課題を回収しない。
- canonical VRT baselineを更新しない。更新が必要と判明した場合は、対象snapshotと根拠を報告してユーザーの明示指示を待つ。

## 完了条件

- [x] `docs/design/character-sheet/notes.md` に、今回の3区分の合計表示と3つのsummary tooltipを対象とする承認済みdesign intentとVRT参照情報がある。
- [x] プライマリ流儀スキル区分が、選択済み通常スキルの「取得合計レベル：N／流儀レベル：M」と、プライマリ流儀ボーナスを除外するtooltipを表示する。
- [x] 生き様スキル区分が、選択済み通常スキルと生き様ボーナスのLv2以上の超過分の「取得合計レベル：N／生き様レベル：M」と、生き様ボーナスLv1を除外するtooltipを表示する。
- [x] その他流儀スキル区分が、流儀ごとに選択済み通常スキルの「取得合計レベル：N／流儀レベル：M」を表示する。
- [x] 共通スキルsummaryが、既存の値・配置を維持し、基本の一撃を除外するtooltipを表示する。
- [x] 空行を合計へ含めず、既存の区分合計超過時は該当する合計表示をerror状態にする。
- [x] 未選択区分へ合計表示を追加しない。
- [x] 変更した表示と既存validationが、レベル・選択・行操作・流儀または生き様レベルの変更後も同じ値を示す。
- [ ] 各viewportsの対象stateを実画面で確認し、承認済みdesign intentと比較したVisual Review記録を残す。
- [ ] 変更したキャラクターシートtargetの対象限定VRTで意図したsnapshot差分を確認し、canonical VRT baselineを更新しない理由または別作業へ回す判断を記録する。
- [x] 関連TODOを変更せず、このissueで扱わない理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md` の候補行デザイン課題と矛盾していない。
- [x] 承認済みの `docs/design/character-sheet/` と矛盾していない。
- [ ] desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）で横overflowがない。
- [ ] 区分合計超過状態とtooltip状態を含め、issueの表示契約にあるstateごとのactual screenshotを開いて確認する。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/design/character-sheet/notes.md`（design-image-generationを実行し、ユーザーが承認した場合だけ）
- `src/character-sheet/components/sections/PrimarySkillsSection.tsx`
- `src/character-sheet/components/sections/IkizamaSkillsSection.tsx`
- `src/character-sheet/components/sections/OtherRyugiSkillsSection.tsx`
- `src/character-sheet/components/sections/CommonSkillsSection.tsx`
- `src/character-sheet/components/sections/SkillSection.tsx`
- `src/character-sheet/components/sections/SkillSection.module.css`
- `src/character-sheet/form/usePrimarySkillsSectionProps.ts`
- `src/character-sheet/form/useIkizamaSkillsSectionProps.ts`
- `src/character-sheet/form/useOtherRyugiSkillsSectionProps.ts`
- `src/character-sheet/logic/primary-skills.ts`
- `src/character-sheet/logic/ikizama-skills.ts`
- `src/character-sheet/logic/other-ryugi-skills.ts`
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/PrimarySkillsSection.test.tsx`
- `tests/components/character-sheet/IkizamaSkillsSection.test.tsx`
- `tests/components/character-sheet/OtherRyugiSkillsSection.test.tsx`
- `tests/components/character-sheet/CommonSkillsSection.test.tsx`
- `tests/hooks/character-sheet/`
- `tests/node/character-sheet/primary-skills.test.ts`
- `tests/node/character-sheet/ikizama-skills.test.ts`
- `tests/node/character-sheet/other-ryugi-skills.test.ts`
- `tests/vrt/character-sheet.spec.ts`

## レビュー観点

- 「取得合計レベル」が、無料のプライマリ流儀ボーナスLv1と生き様ボーナスLv1を除外し、生き様ボーナスのLv2以上だけを含める定義で正しいか。
- 各区分が既存validationと同じ合計・上限を表示し、区分合計超過時のerror対象を広げていないか。
- 承認前のdesign intentを推測で補わず、表示位置・文言・responsive配置・VRT比較点を先に定義すべきか。
- 共通スキルsummaryの値・配置は維持し、明示指示されたtooltipだけを追加できているか。
- canonical VRT baselineの更新が必要な場合、対象snapshotと更新根拠を別作業へ切り出す方針でよいか。

## 備考

- 通常issueであり、Gate planは作成しない。
- 実装前に `design-image-generation` を実行して `docs/design/character-sheet/notes.md` のdesign intentとVRT参照情報を準備し、ユーザー承認を得る必要がある。
- design intentの承認後にのみ実装を開始する。Git commit / pushはこの準備では実行しない。
- Visual Reviewでbaseline更新が必要と分かった場合、このissueでは更新せず、対象限定VRTの差分と根拠を報告してユーザーの明示指示を待つ。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md` の `ex-15 skill acquisition level total comparison`
- VRT test / tags: `tests/vrt/character-sheet.spec.ts`、`@vrt @character-sheet` と `primary-skills-*`、`ikizama-skills-*`、`other-ryugi-skills-*`
- route / states / viewports:
  - route: `/character-sheet/`
  - states: `primary-skills-unavailable`、`primary-skills-input`、`primary-skills-error`、`primary-skills-total-error`、`ikizama-skills-unavailable`、`ikizama-skills-input`、`ikizama-skills-error`、`ikizama-skills-total-error`、`other-ryugi-skills-unavailable`、`other-ryugi-skills-input`、`other-ryugi-skills-error`、`other-ryugi-skills-total-error`
  - viewports: desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）

### レビュー結果

| 対象                                             | 判定       | 差分                                                                   | 対応                               |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 3区分のunavailable / input / error / total-error | OK         | actual screenshotで意図したsummaryの追加を確認                         | 実装修正なし                       |
| canonical VRT comparison                         | 要人間判断 | 既存targetはsummary追加による意図した差分、新規stateにはbaselineがない | baseline更新はユーザー明示承認待ち |

### 実画面確認

- locator screenshot（すべて`test-results/visual/character-sheet/sections/`、original pixel resolution）:
  - `primary-skills-{unavailable,input,error,total-error}-{desktop,tablet,mobile}.png`: 未選択時のsummary非表示、通常時の`N／M`、最大Lv違反時にsummaryを赤くしないこと、合計超過時の赤いsummaryとsection枠を確認した。
  - `ikizama-skills-{unavailable,input,error,total-error}-{desktop,tablet,mobile}.png`: 未選択時のsummary非表示、生き様bonus Lv1除外後の`N／M`、最大Lv違反時にsummaryを赤くしないこと、合計超過時の赤いsummaryとsection枠を確認した。
  - `other-ryugi-skills-{unavailable,input,error,total-error}-{desktop,tablet,mobile}.png`: 未選択時のsummary非表示、流儀ごとの`N／M`、最大Lv違反時にsummaryを赤くしないこと、合計超過時の赤いsummaryとsection枠を確認した。
  - checked acceptance criteria: 追加操作領域の配置、desktop / tabletの横並び、mobileのbutton先行・縦積み、文字の折り返し、clip・横overflowなし、error色、inputとvalidationの値一致。
  - result: 全36枚を開いて確認した。full-page screenshotは局所表示契約の根拠に使っていない。
- VRT comparison: `npm run visual:test`をtarget限定で実行した。既存canonicalとの差分と新規stateのbaseline未作成により失敗し、`primary-skills-input-desktop-diff.png`を開いてsummary領域だけの意図した差分であることを確認した。

### 自己修正した項目

- 既存の`*-error` stateが区分合計超過を表していなかったため、`*-total-error` stateを3区分へ追加した。
- 未選択時にsummaryを出さない契約を確認する`*-unavailable` stateを3区分へ追加した。

### 人間判断が必要な差分

- canonical VRT baselineを、summary追加と12 stateの対象へ更新するか。更新する場合は対象snapshotの明示承認が必要である。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [ ] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（該当する場合）

## レビュー指摘 1

### 指摘事項

- 共通スキルsummary tooltipの正しい文言は「自動習得の「基本の一撃」のレベルは含みません。」だが、current issueとdesign notesのG14には二重の「は」を含む旧文言が残っている。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `src/character-sheet/dictionary.ts`と`tests/components/character-sheet/CommonSkillsSection.test.tsx`は正しい単一の「は」を使用している。一方、`docs/issue/ex-15-skill-level-totals.md`と`docs/design/character-sheet/notes.md`の該当tooltip文言は二重の「は」のままである。

### 対応方針

- ユーザー確定済みの文言へ、current issueとdesign notesの該当箇所を訂正する。
- Visual Reviewとcanonical VRT baselineの人間判断待ち項目は本指摘とは別に未完了のままとする。

### 対応完了チェックリスト

- [x] current issueとdesign notesの共通スキルtooltip文言を訂正する
- [x] `npm run check` が通る（Markdownのみの変更のため実行不要）
- [x] `npm run build` が通る（Markdownのみの変更のため実行不要）
