# ex-02-16-sheet-experience-consistency

## 最優先のデザイン入力

- `docs/requirements/character-sheet.md`、`src/pages/advancement.mdx`、`src/pages/character-making.mdx`の数値規則を優先し、`.tmp/design/character-sheet/`の承認済みdraft（desktop / tablet / mobile）と既存のキャラクターシートUIを照合して、経験点・スキル・可変行の既存配置を維持する。
- このGateでは可視のエラー理由を入力直下へ追加しない。既存どおり該当入力・行・sectionのerror状態で示し、エラー集約UIはG25で扱う。
- design notes、実装結果のscreenshot、reviewer出力はdesign draftの代わりにしない。画面配置または状態表現に競合・不明点があれば、実装せずにユーザー判断を求める。

## 目的

流儀、生き様、共通スキル、各流儀スキルを含む消費経験点と局所エラーを同じ入力値から一貫して導出する。可変行をRHFの`useFieldArray`操作に統一し、後続G24 / G27が保存・復元・JSON入力を追加してもrow ID、uncontrolled number input、schemaの契約を壊さない状態にする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の`G16`
- 要件: `docs/requirements/character-sheet.md`の「共通動作」「経験点と信用」「スキル」「エラー・警告表示」
- ルール正本: `src/pages/advancement.mdx`の経験点使用規則と、`src/pages/character-making.mdx`のフルスクラッチ規則
- architecture: `docs/architectures/character-sheet.md`の「スキル区分の共通表示」「状態と派生値の境界」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/`の承認済みdraft
- 関連TODO: `docs/TODO.md`の次の3件をこのGateで回収する。
  - G16で生き様bonusを含む全スキルの最大Lv制約を定義する。
  - G24 / G27着手前にスキルLvの未確定入力、最大Lv超過、復元・JSON入力値の扱いをrequirements / schema契約として確定する。
  - G24着手前にキャラクターシート可変行のRHF操作境界を`useFieldArray`契約へ整合する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G16: 消費経験点の算出整合性を確認する。`

このissueはG16だけを実装する自己完結した契約である。G17以降のアイテム、G23の操作ペイン、G24の保存・復元、G25のエラー集約、G26 / G27のJSON入出力は実装しない。

## アーキテクチャ適用

| architecture節              | このGateで許可する変更                                                                                                                                                                    | このGateで禁止する変更                                                                                                                       | 確認するテスト層                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| スキル区分の共通表示        | 各skill adapterが最大Lv・重複・区分合計のvalidationをrow / section Propsへ正規化し、生き様bonusを含めて同じ局所error契約を渡す。                                                          | shared skill ComponentへRHF、field path、マスタ検索、経験点算出、区分判定を渡さない。                                                        | Node logic、RHF hook、Component                       |
| 可変行のデザイン指針        | 既存の行・header・追加・削除・並べ替え・error表示を維持したまま、配列操作を`useFieldArray`へ置き換える。                                                                                  | 行種別を単一の汎用Componentへ統合しない。新しい可視error文言、layout、mobile最適化を追加しない。                                             | RHF hook、既存Component、必要時のPlaywright smoke     |
| Container / Presenterの責務 | section hookとpure logicでViewModel / Actionsを組み立て、既存Containerのdialog・focus orchestrationを保つ。                                                                               | Containerへ算出式・schema・RHF配列の細部を集約しない。Presenter / shared表示Componentへ業務判断を移さない。                                  | Node logic、RHF hook、Component                       |
| 状態と派生値の境界          | 編集値の唯一の保持先をRHFに保ち、可変行は`useFieldArray`の`append`、`remove`、`move`、`replace`で操作する。未確定number inputはDOMにだけ保持し、確定値をschema / adapter経由でRHFへ渡す。 | 配列全体の`setValue`更新、RHF以外の編集state、genericなpath文字列による行更新を導入しない。G24 / G27の永続化・JSON adapterを先行実装しない。 | schema、RHF hook、Component                           |
| テストアーキテクチャ        | 経験点・上限・error識別子をNode、RHF更新・row操作・外部更新契約をhook、表示済みPropsをComponent、代表操作だけをPlaywrightへ置く。                                                         | VRTへ数式・schema・RHF内部状態の網羅を置かない。UI変更がない場合にVRTを実行しない。                                                          | Node、Vitest hook / Component、必要最小限のPlaywright |

## 対象範囲

- 流儀・生き様の追加レベル、その他流儀、共通スキル通常行について、`src/pages/advancement.mdx`とフルスクラッチ規則どおりの消費経験点をpure logicで一元導出する。自動取得のプライマリbonus、基本の一撃、生き様bonusのLv 1は経験点へ加算しない。生き様bonusのLv 2以上は、生き様の成長に伴うスキルLvとして二重計上せず、生き様Lvの経験点だけで扱う。
- 消費経験点、残経験点、経験点不足のerror状態を、全区分の入力変更で一貫して更新する。スキル区分ごとの合計上限・重複・最大Lv超過は、既存の局所表示境界（Build、該当行、該当section、共通スキルの基本情報枠）を保つ。
- 全通常スキルと生き様bonusについて、選択中マスタの`maxLevel`を超える値をbrowser入力、schema、pure validation、行 / sectionのerror状態で同じ規則として扱う。値をclamp・拒否・自動削除せず保持し、`max`属性だけを正しさの根拠にしない。
- 未確定なnumber inputはfocus中のDOMだけに保持し、確定可能な値をRHFへ渡す。blur、`reset`、端末内復元、JSON入力では、schemaで受理した値をuncontrolled inputへ同期する契約をrequirements / schema / form adapterに明記する。G16では保存・復元・JSON入力のUIやadapterを実装しない。
- `build.otherRyugi`、`bonds.rows`、`checks.attacks`、`checks.reactions`、プライマリ・生き様・共通・その他流儀スキルの可変配列を`useFieldArray`で操作する。配列全体の`setValue`による追加・削除・並べ替え・置換をなくし、各行の`rowId`、最小行数、派生行数、確認dialog、focus復帰、section固有の業務規則を保つ。
- 可変行のfield / value callbackは、genericなパス文字列ではなく各行型の編集可能fieldと値の対応を型で表す。shared表示ComponentへRHF、field path、マスタ検索、validation計算を渡さない。
- `docs/requirements/character-sheet.md`、`docs/architectures/character-sheet.md`、このissueの関連TODO記述を、決定した契約へ整合する。TODOは実装・ユーザー承認後にのみ完了扱いへ移す。
- Node logic / schema、RHF hook、Component、必要最小限のPlaywright smokeを、各責務境界へ追加または更新する。UIを変更した場合だけ、PRレビュー直前に`@character-sheet`の必要な状態をdesktop（1440px）、tablet（820px）、mobile（390px）でVisual Reviewする。canonical VRT baselineは更新しない。

## 初期スコープ外

- 武器、防具、専用アイテム、消費信用、G17以降のアイテムGateを実装しない。
- エラー一覧、sticky control、確認用エラーdialog、入力への移動などG25のエラー集約を実装しない。
- localStorage / IndexedDBの保存・復元、JSON export / import、スキーマバージョンや未知IDの復元除外を実装しない。G24 / G27は、このGateで確定した入力・schema・同期契約を適用する。
- 文章の取得制限・効果、スキルの使用コスト、共通スキルボーナスを解析または自動算出しない。
- 新しいnpm package、別のstate store、UI kit、汎用form abstractionを追加しない。
- `docs/out-of-scope.md`の初期スコープ外機能を実装しない。

## 完了条件

- [ ] 全ての消費経験点が、流儀・生き様・その他流儀・共通スキルの入力値から一度だけ導出され、無料の初期 / 自動取得Lvを二重計上しない。
- [ ] 生き様bonusを含む全スキルの最大Lv超過、重複、区分ごとの合計上限、経験点不足が、値を自動補正せず既存の局所error状態として一貫して示される。
- [ ] browser入力、blur、schema、後続の復元・JSON入力における未確定値・最大Lv超過・uncontrolled input同期の契約がrequirementsとschema / form adapterへ明記され、G24 / G27と矛盾しない。
- [ ] 現在存在する可変行を`useFieldArray`で追加・削除・移動・置換し、配列全体の`setValue`更新を残さない。row ID、最小・派生行数、確認dialog、focus復帰を維持する。
- [ ] 変更したlogic、schema、hook、Componentのテストが、経験点境界、最大Lv前後、未選択、bonus、重複、可変行の追加・削除・並べ替え・外部更新を確認する。
- [ ] 関連TODO 3件をこのissueで扱った根拠と、G24 / G27へ残す実装境界が記録されている。
- [ ] UI変更がある場合、必要な`/character-sheet/`状態をactual screenshotで確認し、canonical VRT baselineを更新しない理由を記録する。
- [ ] `npm run check`、`npm run build`、関連Node / Vitest / Playwright testが通る。

## チェックポイント

- [ ] 既存ルート、既存スキル選択dialog、確認dialog、focus復帰が壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] RHF以外へ編集値を複製せず、Presenter / shared skill Componentの責務境界を保つ。
- [ ] エラー理由の可視文言を各入力・各行へ追加せず、errorとwarningの色を混同しない。
- [ ] 関連する`docs/TODO.md`、`docs/design/character-sheet/`、`docs/architectures/character-sheet.md`と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `src/character-sheet/logic/build.ts`
- `src/character-sheet/logic/primary-skills.ts`
- `src/character-sheet/logic/ikizama-skills.ts`
- `src/character-sheet/logic/common-skills.ts`
- `src/character-sheet/logic/other-ryugi-skills.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useBuildSectionProps.ts`
- `src/character-sheet/form/useBondsSectionProps.ts`
- `src/character-sheet/form/useChecksSectionProps.ts`
- `src/character-sheet/form/usePrimarySkillsSectionProps.ts`
- `src/character-sheet/form/useIkizamaSkillsSectionProps.ts`
- `src/character-sheet/form/useCommonSkillsSectionProps.ts`
- `src/character-sheet/form/useOtherRyugiSkillsSectionProps.ts`
- `src/character-sheet/components/skills/SkillSection.tsx`
- `tests/node/character-sheet/*.test.ts`
- `tests/hooks/character-sheet/useCharacterSheetFormPresenterProps.test.tsx`
- `tests/components/character-sheet/*.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- スキルLvを流儀・生き様の成長と別の経験点として二重計上せず、`advancement.mdx`の費用規則に一致しているか。
- 最大Lv超過を保持して局所エラーにする契約が、「不整合を自動補正しない」要件とG24 / G27の外部更新契約を両立できるか。
- `useFieldArray`への統一が、可変行ごとのrow ID、最小・派生行数、削除確認、focus復帰を壊さず、汎用path更新へ戻っていないか。
- このissueでTODO 3件を回収し、保存・復元・JSON入力の実装を後続Gateへ残す境界が妥当か。
- 既存designと同じエラー配置・情報密度を保ち、canonical VRT baseline更新を必要とする見た目の変更を増やしていないか。

## 備考

- G16のGate plan上の範囲「消費経験点の算出整合性」を、ユーザー指示により、その算出値を正しく保つ全スキル局所エラーと可変行のRHF操作境界まで拡張する。G24 / G27の保存・JSON機能そのものは取り込まない。
- `docs/TODO.md`の関連3件は、実装完了・人間承認・merge前まで未対応のまま残す。完了後の移動は`post-merge-plan-update`で行う。
