# ex-02-14-sheet-common-skills

## 最優先のデザイン入力

- 対象design targetは`docs/design/character-sheet/notes.md`と`.tmp/design/character-sheet/`配下の承認済みdraftである。
- 現行の`components/skills/` shared Component、G12で確定したスキル区分のheader、展開、候補dialog、mobile個別最適化は、draftより優先する既存UIとして再利用する。
- ユーザーの最新指示と`docs/architectures/character-sheet.md`の`可変行のデザイン指針`を優先する。design notes、actual screenshot、reviewer出力を画面設計の根拠にしない。

## 目的

基本の一撃と共通スキルを編集し、共通スキル取得Lv合計に応じた経験点と上限をキャラクターシートへ反映する。

## 背景

G7は共通スキルボーナスを表示専用で参照している。G14は共通スキルの実際の取得状態、上限、経験点を接続するGateであり、G12のshared skill UIを再利用する。

- 要件: `docs/requirements/character-sheet.md`の「経験点と信用」「スキル」
- architecture: `docs/architectures/character-sheet.md`の「実装時のアーキテクチャ遵守」、スキル区分の共通表示、可変行のデザイン指針、Container / Presenter、状態と派生値、データ、style、テストの責務境界
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`のG14とG7引継ぎ
- design: `docs/design/character-sheet/notes.md`
- data: `data/generated/common-skills.json`
- TODO: `docs/TODO.md`のG24前の`useFieldArray`境界整合は扱わない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
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
- 基本の一撃を除く通常行の取得Lv合計を`N`、格の半分を端数切り上げた上限を`M`として、基本情報の経験点表示に、`FormulaTooltip`のlabel `共通スキルレベル合計／合計レベル上限`と読み取り専用値`N／M`を追加する。tooltipの文言は`合計レベル上限 = 格 ÷ 2（端数切り上げ）`とする。`ProfileSection`はこの読み取り専用ViewModelを表示するだけとし、mobileでは経験点の次行に置く。
- `SkillSection`の追加操作領域には、optionalな`actionDescription`とerror状態を持たせる。共通スキルadapterだけが`取得合計レベル：N／合計レベル上限：M`を渡し、desktop / tabletでは追加button右側、mobileでは追加buttonの下に表示する。他のスキル区分はこのoptional Propsを渡さず、既存表示を変えない。
- `BuildSection`の参照値領域にも、ゲーム用語としての共通スキル上限`M`を表示する。desktop / tabletでは格と同じ参照値gridで確認できる位置に置く。`N > M`時のerror状態は基本情報、ビルド側表示、共通スキル領域へ伝える。
- `N * 5`を共通スキルの消費経験点として既存の`spentExperience`へ加算し、残経験点・経験点エラーへ反映する。計算はpure logicへ置き、form adapterが共通スキル通常行の合計を明示的に渡す。G16の全スキル横断整合を待たず、G14で扱う共通スキル分だけを正しく合算する。
- `N > M`では、基本情報、共通スキル領域、ビルド側の共通スキル上限表示をエラー状態にする。通常行の最大Lvと重複、他区分の合計上限、advanced条件の統合validationはG16で扱う。
- 固定文言を追加・移動する場合は、ゲーム用語・スキル属性名・経験点の用語を`characterSheetDictionary.gameDomain.terms`へ、section名、操作、button、dialog説明、上限表示用copyを`characterSheetDictionary.characterSheet`へ分類する。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。
- browser E2Eは、領域表示、候補dialogでの1候補選択、経験点または合計Lv表示の反映など2〜3個の代表操作だけを最終smokeとして確認する。費用式、上限境界、固定候補の順序、disabled、callback、dialog copy、行順はNode / Component / hook testへ置き、test-onlyのDOM・state・data属性を製品コードへ追加しない。

## 初期スコープ外

- プライマリ、生き様、その他流儀スキルのフォーム値・adapter・候補を変更しない。
- 共通スキルボーナスや自由文の効果を派生値へ自動加算しない。
- G16の全スキル横断validation、G24の保存・復元、JSON入出力、canonical VRT baseline更新、追加依存の導入を行わない。

## 完了条件

- [ ] 基本の一撃を編集不可で表示し、通常2行を既存shared Componentで表示・編集できる。
- [ ] 基本情報の経験点表示に、`FormulaTooltip`のlabel `共通スキルレベル合計／合計レベル上限`と読み取り専用値`N／M`を表示する。tooltip文言は`合計レベル上限 = 格 ÷ 2（端数切り上げ）`とする。
- [ ] `SkillSection`のoptionalな追加操作説明を使い、通常行の取得Lv合計`N`と上限`M`を指定文言で表示する。他のスキル区分の表示は変えない。
- [ ] `N * 5`が消費経験点・残経験点・経験点エラーへ反映される。
- [ ] `BuildSection`で共通スキル上限`M`を表示する。`N > M`で基本情報、共通スキル領域、ビルド側上限表示がエラー状態になる。
- [ ] dictionaryのゲーム用語とキャラクターシートUI文言を指定の所有者へ分類し、生成データ文言を複製していない。
- [ ] E2Eが最終smokeの責務を越えず、局所契約をNode / Component / hook testへ分離している。
- [ ] `@character-sheet` targetのdefault、候補dialog、合計Lv / 経験点反映をdesktop、tablet、mobileでVisual Reviewする。canonical VRT baselineは更新しない。
- [ ] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [ ] 既存のプライマリ・生き様・その他流儀費用と二重計上せず、G16の後続統合を妨げない。
- [ ] `docs/requirements/character-sheet.md`、architecture、design targetと矛盾していない。
- [ ] GitHub Pagesのsubpath公開と既存routeに影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 新設する共通スキル通常行だけを`useFieldArray`で操作し、既存可変行の移行はG24前TODOへ残している。
- [ ] ユーザーの未コミット変更を破壊していない。

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
- 基本情報、共通スキル区分、ビルド側が同じ`N`・`M`を示し、上限超過を同じerror状態で伝えるか。
- 上限表示と追加buttonの配置が可変行デザイン指針、desktop / tablet / mobileのoverflow契約に沿うか。
- `actionDescription`がshared表示だけに留まり、dictionary所有者、E2Eの最終smoke責務、shared Component境界を守れているか。

## 備考

- G12のshared表示契約とrequirementsのdesktop / tablet列契約に差異がある場合は、実装前にrequirementsの正本を同期してから進める。
