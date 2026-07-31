# ex-02-14-sheet-common-skills

## 最優先のデザイン入力

- 対象design targetは`docs/design/character-sheet/notes.md`と`.tmp/design/character-sheet/`配下の承認済みdraftである。基本情報の配置は、ユーザー確認済みの`desktop.png`、`tablet.png`、`mobile.png`を直接参照する。
- 現行の`components/skills/` shared Component、G12で確定したスキル区分のheader、展開、候補dialog、mobile個別最適化は、draftより優先する既存UIとして再利用する。
- ユーザーの最新指示と`docs/architectures/character-sheet.md`の`可変行のデザイン指針`を優先する。実装後のactual screenshotとreviewer出力はdesign正本に置き換えない。

## 目的

基本の一撃と共通スキルを編集し、共通スキル取得Lv合計に応じた経験点と上限をキャラクターシートへ反映する。

## 背景

G7は共通スキルボーナスを表示専用で参照している。G14は共通スキルの実際の取得状態、上限、経験点を接続するGateであり、G12のshared skill UIを再利用する。

- 要件: `docs/requirements/character-sheet.md`の「経験点と信用」「スキル」
- architecture: `docs/architectures/character-sheet.md`の「実装時のアーキテクチャ遵守」、スキル区分の共通表示、可変行のデザイン指針、Container / Presenter、状態と派生値、データ、style、テストの責務境界
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`のG14とG7引継ぎ
- design: `docs/design/character-sheet/notes.md`
- data: `data/generated/common-skills.json`
- TODO: `docs/TODO.md`のG24前の`useFieldArray`境界整合は扱わない。

## Gate関係

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- Gate: `G14: 共通スキルを扱う`

このissueは、共通スキルのフォーム値、経験点への接続、上限表示、候補選択、局所validation、テストを新しいsessionから実装できる契約とする。

## アーキテクチャ遵守

| 適用節                    | 許可する変更                                                                                                                                                                                                  | 禁止する変更                                                                                                                       | 確認するテスト層                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Feature境界               | `src/character-sheet/`内のform、logic、master-data、components、dictionaryと対応testを変更する。                                                                                                              | Astro共通layout・サイト共通Component・新規依存を変更しない。                                                                       | Node、hook、Component、browser E2E                          |
| スキル区分の共通表示      | `SkillSection`へ任意の`actionDescription`とそのerror状態を追加し、共通スキルadapterだけが`N`・`M`から組み立てた表示値を渡す。shared Componentは行一覧下の追加操作領域に表示するだけとする。                   | 共通スキル専用の行Component、picker dialog、CSS Module、RHF field path・マスタ検索・計算・validationをshared Componentへ置かない。 | Component、hook                                             |
| 可変行のデザイン指針      | 追加buttonと`actionDescription`を同じsection frameの行一覧下へ置く。desktop / tabletでは横並び、mobileでは追加buttonを先に縦積みにする。                                                                      | section外への表示、横scroll、行の要約列・展開詳細・G15確定済み配置の変更をしない。                                                 | Component、browser E2E、Visual Review                       |
| Container / Presenter     | Container / form adapterが共通スキルと基本情報のsection ViewModel / Actionsを渡し、`ProfileSection`と`SkillSection`は表示とcallback通知だけを担う。`ProfileSection`は`FormulaTooltip`へ指定済みのcopyを渡す。 | Presenter / leaf Componentで派生値計算、RHF参照、マスタ検索、dialog状態を持たない。                                                | hook、Component                                             |
| 状態と派生値 / データ境界 | 通常行はRHFの`useFieldArray`、`N`・`M`・費用・errorはpure logicの派生値、候補と基本の一撃はread-only master dataから導出する。                                                                                | 派生値をRHFまたは別state storeへ保存しない。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。                               | Node、hook                                                  |
| style / テスト            | shared内部は既存`SkillSection.module.css`、基本情報は`ProfileSection.module.css`の所有範囲だけを変更する。Node / hook / Componentへ局所契約、browser E2Eへ最終smokeを置く。                                   | 親CSSからshared内部を選択しない。test-only DOM・state・data属性、canonical VRT baselineを追加しない。                              | Node、hook、Component、browser E2E、target限定Visual Review |

## 対象範囲

- RHFへ共通スキル通常行2行（最低1行）、各行の`rowId`、skill ID、取得Lvを追加する。通常行の追加・削除・上下移動は`useFieldArray`で行い、既存可変行の移行はG24前TODOへ残す。`common-skills.json`の基本の一撃を先頭へ導出し、内容・Lvとも編集不可にする。基本の一撃は通常行の取得合計と経験点に含めない。
- 共通スキル候補は生成JSONの定義順を保ち、bonusを候補から除外する。通常行は選択時と別スキルへの変更時にLvを`1`へ戻し、追加・削除・上下移動できる。
- `SkillSection`と`SkillPickerDialog`を再利用し、共通スキル専用の行Component、候補dialog、CSS Moduleを追加しない。共通スキルadapterが、行ViewModel、候補配列、上限・重複などの表示状態、callbackをshared Propsへ正規化する。
- 基本の一撃を除く通常行の取得Lv合計を`N`、格の半分を端数切り上げた上限を`M`として、基本情報のdesign画像にある既存の共通スキル上限枠を置き換える。`FormulaTooltip`のlabelは`共通スキルレベル合計／共通スキル上限`とし、desktop / tabletでは2行、mobileでは1行で表示する。値は読み取り専用の`N／M`とする。tooltipの文言は`合計レベル上限 = 格 ÷ 2（端数切り上げ）`とする。desktop / tabletでは既存5枠の経験点行の右端、mobileでは格を左1列、`N／M`を右2列に置く。`ProfileSection`はこの読み取り専用ViewModelを表示するだけとする。
- `SkillSection`の追加操作領域には、optionalな`actionDescription`とそのerror状態を持たせる。共通スキルadapterだけが`取得合計レベル：N／合計レベル上限：M`を渡し、desktop / tabletでは追加buttonと下揃えの横並び、mobileでは追加buttonの下に表示する。他のスキル区分はこのoptional Propsを渡さず、既存表示を変えない。
- `N * 5`を共通スキルの消費経験点として既存の`spentExperience`へ加算し、残経験点・経験点エラーへ反映する。計算はpure logicへ置き、form adapterが共通スキル通常行の合計を明示的に渡す。G16の全スキル横断整合を待たず、G14で扱う共通スキル分だけを正しく合算する。
- 共通スキル取得合計Lvが`2`、`5`、`9`に到達した場合、流儀・生き様 / 能力値領域の対応する共通スキルボーナス枠をゲームのaccent色の太い枠線で強調する。背景色と文字色は既存表示を維持する。未到達枠のボーナス本文は通常ウェイト、アンロック済み枠の本文ウェイトは既存表示とする。判定はpure logicからadapter経由でBuild sectionの表示ViewModelへ渡す。ボーナス効果の自動算出、Build領域のerror feedback、未到達枠の表示変更は行わない。
- `N > M`では、基本情報の`N／M`枠と共通スキル領域だけをerror状態にする。流儀・生き様 / 能力値領域へ共通スキル上限の表示・feedbackを追加しない。通常行の最大Lvと重複、他区分の合計上限、advanced条件の統合validationはG16で扱う。
- 固定文言を追加・移動する場合は、ゲーム用語・スキル属性名・経験点の用語を`characterSheetDictionary.gameDomain.terms`へ、section名、操作、button、dialog説明、上限表示用copyを`characterSheetDictionary.characterSheet`へ分類する。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。
- browser E2Eは、領域表示、候補dialogでの1候補選択、経験点または合計Lv表示の反映など2〜3個の代表操作だけを最終smokeとして確認する。費用式、上限境界、固定候補の順序、disabled、callback、dialog copy、行順はNode / Component / hook testへ置き、test-onlyのDOM・state・data属性を製品コードへ追加しない。

## 初期スコープ外

- プライマリ、生き様、その他流儀スキルのフォーム値・adapter・候補を変更しない。
- 共通スキルボーナスや自由文の効果を派生値へ自動加算しない。
- G16の全スキル横断validation、G24の保存・復元、JSON入出力、canonical VRT baseline更新、追加依存の導入を行わない。

## ユーザー指摘の反映

- 共通スキルは生き様スキルの下、その他流儀の上に置く。G15で確定した配置を変更しない。
- 基本情報は、design画像の経験点5枠の右端を置き換える。流儀・生き様 / 能力値領域へ共通スキル上限の表示・feedbackを追加しない。
- 基本情報のtooltip labelは`共通スキルレベル合計／共通スキル上限`とする。desktop / tabletでは2行、mobileでは1行で表示する。mobileでは格を左1列、共通スキル値を右2列に置く。
- 2行labelにより値枠へ余白を加えない。経験点の各枠を下揃えにして、labelと値枠の既存間隔を保つ。
- 共通スキル区分の`取得合計レベル：N／合計レベル上限：M`は、desktop / tabletでは`＋ スキルを追加`buttonと下揃えにする。mobileではbuttonを先に縦積みする。
- `N > M`のfeedbackは基本情報の`N／M`枠と共通スキル区分だけに置く。エラー理由の可視文言を追加しない。

## 完了条件

- [x] 基本の一撃を編集不可で表示し、通常2行を既存shared Componentで表示・編集できる。
- [x] 基本情報のdesign画像にある既存共通スキル上限枠へ、`FormulaTooltip`のlabel `共通スキルレベル合計／共通スキル上限`をdesktop / tabletでは2行、mobileでは1行で表示し、読み取り専用値`N／M`を置く。tooltip文言は`合計レベル上限 = 格 ÷ 2（端数切り上げ）`とする。
- [x] `SkillSection`のoptionalな追加操作説明を使い、通常行の取得Lv合計`N`と上限`M`を指定文言で表示する。desktop / tabletでは追加buttonと下揃えにし、他のスキル区分の表示は変えない。
- [x] `N * 5`が消費経験点・残経験点・経験点エラーへ反映される。
- [x] 共通スキル取得合計Lvが`2`、`5`、`9`に到達したボーナス枠だけ、流儀・生き様 / 能力値領域でゲームのaccent色の枠線になる。
- [x] `N > M`で基本情報の`N／M`枠と共通スキル領域だけがerror状態になり、流儀・生き様 / 能力値領域へ共通スキル上限の表示・feedbackを追加しない。
- [x] dictionaryのゲーム用語とキャラクターシートUI文言を指定の所有者へ分類し、生成データ文言を複製していない。
- [x] E2Eが最終smokeの責務を越えず、局所契約をNode / Component / hook testへ分離している。
- [x] `@character-sheet` targetのdefault、候補dialog、合計Lv / 経験点反映をdesktop、tablet、mobileでVisual Reviewする。canonical VRT baselineは更新しない。
- [x] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [x] 既存のプライマリ・生き様・その他流儀費用と二重計上せず、G16の後続統合を妨げない。
- [x] `docs/requirements/character-sheet.md`、architecture、design targetと矛盾していない。
- [x] GitHub Pagesのsubpath公開と既存routeに影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 新設する共通スキル通常行だけを`useFieldArray`で操作し、既存可変行の移行はG24前TODOへ残している。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/requirements/character-sheet.md`
- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/logic/build.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useCommonSkillsSectionProps.ts`
- `src/character-sheet/master-data/common-skills.ts`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/ProfileSection.tsx`
- `src/character-sheet/components/ProfileSection.module.css`
- `src/character-sheet/dictionary.ts`
- `src/character-sheet/components/skills/`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- `N`がbonusを含まず、`N * 5`だけを既存経験点算出へ明示的に合算しているか。
- 基本情報と共通スキル区分が同じ`N`・`M`を示し、上限超過を局所的なerror状態で伝えるか。
- 上限表示と追加buttonの配置が可変行デザイン指針、desktop / tablet / mobileのoverflow契約に沿うか。
- `actionDescription`がshared表示だけに留まり、dictionary所有者、E2Eの最終smoke責務、shared Component境界を守れているか。

## 備考

- G12のshared表示契約とrequirementsのdesktop / tablet列契約に差異がある場合は、実装前にrequirementsの正本を同期してから進める。

## ビジュアルレビュー 1（是正前・再確認が必要）

この記録は、ユーザー指摘前の実装を対象とする。基本情報の文言・配置とBuild領域への不正なfeedbackが受入条件から逸脱していたため、以下の肯定結果は現行実装の確認結果として扱わない。是正後のVisual Reviewを完了するまで、完了条件のVisual Review項目は未チェックとする。

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`、`@common-skills-default`、`@common-skill-picker-open`、`@common-skill-limit-tooltip-open`、`@common-skill-selected`、`@common-skill-level-error`
- route / states / viewports: `/character-sheet/`のdefault、候補dialog、共通スキル上限tooltip、1候補選択後、`N > M`のerror。desktop、tablet、mobile。

### レビュー結果

| 対象                   | 判定       | 差分 | 対応                                                                                                                                                |
| ---------------------- | ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| locator actual         | OK         | なし | 各state・viewportの原寸locator screenshotを確認した。                                                                                               |
| canonical VRT baseline | 要人間判断 | あり | `character-sheet` defaultのcanonical snapshotが現在の既存画面と大きく異なり、3 viewportで比較失敗。baseline更新は本issueのscope外のため更新しない。 |
| unrelated VRT target   | 要人間判断 | あり | broad grepで一致した`common-skills` targetにも既存canonicalとの差分がある。今回の未変更targetのため対応しない。                                     |

### 実画面確認

- `/character-sheet/` / default / desktop、tablet、mobile:
  - locator screenshot（profile、build、共通スキルsection / original pixel resolution）を確認した。
  - 基本の一撃、通常2行、`0／1`、追加buttonと合計表示の配置、横overflowがないことを確認した。
- `/character-sheet/` / 候補dialog / desktop、tablet、mobile:
  - locator screenshot（共通スキルsection、共通スキルpicker dialog / original pixel resolution）を確認した。
  - dialogの候補一覧、横overflowなし、mobileの縦scroll可能な表示を確認した。
- `/character-sheet/` / 共通スキル上限tooltip / desktop、tablet、mobile:
  - locator screenshot（profile、tooltip / original pixel resolution）を確認した。
  - `合計レベル上限 = 格 ÷ 2（端数切り上げ）`の表示とtooltipのviewport内配置を確認した。
- `/character-sheet/` / 1候補選択後 / desktop、tablet、mobile:
  - locator screenshot（profile、build、共通スキルsection / original pixel resolution）を確認した。
  - `1／1`、消費経験点`5`、残経験点`45`、共通スキル上限`1`、追加操作領域を確認した。
- `/character-sheet/` / `N > M` error / desktop、tablet、mobile:
  - locator screenshot（profile、build、共通スキルsection / original pixel resolution）を確認した。
  - `2／1`、消費経験点`10`、残経験点`40`、基本情報・ビルド参照・共通スキルsectionのerror状態を確認した。

### 自己修正した項目

- [x] 共通スキルsectionのlocatorを既存`data-skill-section`と見出しで特定し、test-onlyの製品DOM属性を追加しない形にした。
- [x] mobile tooltip stateはhoverではなくclickで開くよう、capture側のstate準備を分けた。

### 人間判断が必要な差分

- `character-sheet` default canonical baselineが現在の既存画面と大きく乖離している。baseline更新は本issueのscope外であり、更新可否を判断する。
- `common-skills` targetのcanonical差分は、今回未変更のtargetであるため別taskで状態を確認する。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] Visual Review 2で対象scenarioをlocator-onlyとして再確認し、canonical baselineを更新しない判断を記録した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る（該当する場合）。
- [x] `npm run build` が通る（該当する場合）。

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@common-skills-default`、`@common-skill-picker-open`、`@common-skill-limit-tooltip-open`、`@common-skill-selected`、`@common-skill-level-error`、`@common-skill-bonus-level-2`、`@common-skill-bonus-level-5`、`@common-skill-bonus-level-9`
- route / states / viewports: `/character-sheet/`のdefault、候補dialog、共通スキル上限tooltip、1候補選択後、`N > M` error、共通スキル合計Lvが`2`、`5`、`9`のアンロック状態。desktop、tablet、mobile。

### レビュー結果

| 対象                   | 判定   | 差分 | 対応                                                                                                                        |
| ---------------------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| locator actual         | OK     | なし | 各state・viewportの原寸locator screenshotを開いて確認した。                                                                 |
| canonical VRT baseline | 対象外 | なし | 対象scenarioは既存契約どおりlocator-onlyであり、`npm run visual:test`は24件skipした。canonical baselineは追加・更新しない。 |

### 実画面確認

- `/character-sheet/` / default / desktop、tablet、mobile:
  - locator screenshot（profile、build、共通スキルsection / original pixel resolution）を確認した。
  - 基本の一撃、通常2行、`0／1`、基本情報の2行labelと値枠の下揃え、追加buttonと合計表示、mobileの2列専有、横overflowがないことを確認した。
- `/character-sheet/` / 候補dialog / desktop、tablet、mobile:
  - locator screenshot（共通スキルsection、共通スキルpicker dialog / original pixel resolution）を確認した。
  - 候補一覧、dialog内の縦scroll、mobileのviewport内表示、横overflowがないことを確認した。
- `/character-sheet/` / 共通スキル上限tooltip / desktop、tablet、mobile:
  - locator screenshot（profile、tooltip / original pixel resolution）を確認した。
  - `合計レベル上限 = 格 ÷ 2（端数切り上げ）`の表示とtooltipのviewport内配置を確認した。
- `/character-sheet/` / 1候補選択後 / desktop、tablet、mobile:
  - locator screenshot（profile、build、共通スキルsection / original pixel resolution）を確認した。
  - `1／1`、消費経験点`5`、残経験点`45`、追加操作領域の下揃えまたはmobile縦積みを確認した。
- `/character-sheet/` / `N > M` error / desktop、tablet、mobile:
  - locator screenshot（profile、build、共通スキルsection / original pixel resolution）を確認した。
  - `2／1`、消費経験点`10`、残経験点`40`、基本情報と共通スキルsectionだけのerror状態、Build領域への上限feedback追加がないことを確認した。
- `/character-sheet/` / 共通スキル合計Lv `2`、`5`、`9` / desktop、tablet、mobile:
  - locator screenshot（build section / original pixel resolution）を確認した。
  - `2`ではLv 2枠、`5`ではLv 2・5枠、`9`ではLv 2・5・9枠だけがaccent色の太い枠線になること、未到達枠の背景色・枠線・本文通常ウェイト、効果本文の折返し、横overflowがないことを確認した。

### 自己修正した項目

- [x] Lv 5・9のVisual Review fixtureを、個別スキルの最大Lvを超える値ではなく複数の通常スキルの合計Lvで構成した。
- [x] Lv 9 fixtureの`＋ スキルを追加`buttonを共通スキルsection内に限定した。

### 人間判断が必要な差分

- なし。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] locator-only targetのためcanonical VRT比較はskipされ、更新対象のbaselineを作成していない。
- [x] baseline更新が必要な差分はない。
- [x] `npm run check` が通る（該当する場合）。
- [x] `npm run build` が通る（該当する場合）。

## レビュー指摘 1

### 指摘事項

- その他流儀スキルのLv入力が`0`または負数をRHFへ保存でき、schemaの`min(1)`と不整合になる。
- `CharacterSheetContainer`へpicker・確認dialog・pending actionの状態が増え、今後のアイテムGateで肥大化する懸念がある。
- その他流儀候補の`プライマリ限定`除外が生成データの完全一致に依存する。
- 永続化・JSON入力時には、存在しない`ryugiRowId`を持つスキル行などの孤児行を正規化する必要がある。

### 判定

- source: browser-draft（`.tmp/chatgpt-review.md`）
- classification:
  - 指摘1: valid / out-of-scope。現行実装でも`useOtherRyugiSkillsSectionProps`は`0`・負数を保存し、schemaは`min(1)`である。G14はその他流儀スキルを変更しない。
  - 指摘2: follow-up。現行ContainerにもG15由来のdialog orchestrationが残るが、G14で追加するのは共通スキルpickerだけであり、この抽象化は現在Gateの範囲外である。
  - 指摘3: invalid。生成データ内の`プライマリ限定`は現時点で完全一致の列挙値であり、Node testもこの候補除外を確認している。自由文の取得制限を解析する要件はない。
  - 指摘4: follow-up。G24 / G27の復元・JSON入力境界で扱う。
- local validation: reviewの比較範囲はG13からG15までで、G14実装前のsnapshotである。現行HEADのG14差分に対する直接の指摘ではない。

### 対応方針

- 指摘1・4は`docs/TODO.md`のG24 / G27入力契約TODOへsourceを追加する。
- 指摘2は、次に確認dialogが増えるG17のTODOとして追跡する。
- 指摘3は現行要件・生成データ・Node testで否定されるため、コード・TODOへは追加しない。

### 対応完了チェックリスト

- [x] review source snapshotと現行HEADの差分時点を照合した。
- [x] 指摘1・4をG24 / G27の既存TODOへルーティングした。
- [x] 指摘2をG17のfollow-up TODOへルーティングした。
- [x] 指摘3が現行SSoTと矛盾することを確認した。
