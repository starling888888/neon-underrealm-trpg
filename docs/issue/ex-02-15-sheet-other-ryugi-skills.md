# ex-02-15-sheet-other-ryugi-skills

## 最優先のデザイン入力

- 対象design targetは`docs/design/character-sheet/notes.md`と`.tmp/design/character-sheet/`配下の承認済みdraftである。
- 現行の`components/skills/` shared Component、G12で確定したスキル区分のheader、展開、候補dialog、mobile個別最適化は、draftより優先する既存UIとして再利用する。
- ユーザーの最新指示と`docs/architectures/character-sheet.md`の`可変行のデザイン指針`を優先する。design notes、actual screenshot、reviewer出力を画面設計の根拠にしない。

## 目的

ビルドで追加したその他流儀ごとに、対応する通常スキルを独立した領域で編集できるようにする。

## 背景

G7はその他流儀の可変入力を提供している。G15は、その各行へ対応するスキル配列と表示領域を結び、G12のshared skill UIを再利用する。

- 要件: `docs/requirements/character-sheet.md`の「PC基本ビルドと能力値」「スキル」
- architecture: `docs/architectures/character-sheet.md`のスキル区分の共通表示、可変行のデザイン指針、Container / Presenter、テストアーキテクチャ
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`のG15
- design: `docs/design/character-sheet/notes.md`
- data: `data/generated/ryugi-skills.json`、`data/generated/ryugi-list.json`
- TODO: `docs/TODO.md`のG24前の`useFieldArray`境界整合は扱わない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G15: その他流儀のスキルを扱う`

このissueは、その他流儀ごとのスキルフォーム値、表示用adapter、候補選択、削除確認、局所テストを新しいsessionから実装できる契約とする。

## アーキテクチャ適用

| 節                                              | 許可する変更                                                                                                                                                                                                                                                                                                                                                                             | 禁止する変更                                                                                                                                                                          | 確認するテスト層                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 実装時のアーキテクチャ遵守                      | 本表で列挙した節に対応するG15のform、adapter、Container、Presenter、shared Component接続だけを変更し、完了前に最終diffを本表と照合する。                                                                                                                                                                                                                                                 | 対応付けられない共有Component、Container / Presenter境界、状態所有者、データ境界、テスト層を変更しない。正本の更新またはユーザー承認なしに例外を作らない。                            | 最終diff照合                                        |
| スキル区分の共通表示                            | その他流儀adapterが、対象流儀だけの行ViewModel、候補group、選択済みskill ID、section見出し、error状態、callbackを`SkillSection`と`SkillPickerDialog`の既存Propsへ正規化する。候補groupの`basic` / `advanced`判定はadapterへ置く。                                                                                                                                                        | shared Componentへその他流儀ID、RHF field path、候補条件、最低行数、確認dialogの業務条件を追加しない。その他流儀専用の行Component、候補dialog、CSS Moduleを作らない。                 | Node / hook / Component                             |
| Container / Presenterの責務、状態と派生値の境界 | その他流儀と対応スキル配列の編集値・行順をRHFへ置き、新設する通常スキル行の追加・削除・上下移動だけを`useFieldArray`で操作する。`logic/`が流儀ごとの取得Lv合計超過を算出し、対応するビルド行とsectionのViewModelへerror状態を渡す。候補・変更確認・削除確認dialogの開閉、保留中の操作、focus復帰先は`CharacterSheetContainer`が持ち、Presenterへsection単位のViewModel / Actionsを渡す。 | RHF外へ編集値または行順を複製しない。Presenter / 表示ComponentへRHF参照、マスタ検索、候補条件、確認判断、取得Lv合計算出を置かない。既存可変行をG24前に`useFieldArray`へ移行しない。   | Node / hook / Component / 最終smoke                 |
| データ境界、dictionary                          | `master-data/` adapterが生成JSONを読み取り専用で参照し、対象流儀の`bonus`と取得制限が`プライマリ限定`のskillを通常候補から除外して表示用情報へ変換する。固定文言は既存dictionaryの所有者へ追加する。                                                                                                                                                                                     | generated data、変換処理、マスタ由来の名称・制限・効果を変更または複製しない。自由文の条件・効果を構造化、解析、自動算出しない。                                                      | Node / hook                                         |
| 可変行のデザイン指針                            | G12/G13で確定したshared skill UIを、各その他流儀の独立区分へ再利用する。各区分は初期展開・独立開閉とし、開閉状態を保存しない。選択済み候補は既存dialogと同じdisabled表示とし、行の一意なaccessible name、詳細toggleと詳細領域の関連付けを保つ。                                                                                                                                          | desktop / tabletの共通header、行・候補dialogのtable表示、展開詳細、mobile個別最適化をその他流儀固有の見た目へ分岐させない。clip、ellipsis、横overflowで名称または詳細情報を隠さない。 | Component / Visual Review                           |
| テストアーキテクチャ                            | row IDと対応配列の対応、候補group、選択済み候補のdisabled、行追加・削除・移動、変更・削除確認の原子性とcancel / Escape / close後のfocus復帰をNode / hook / Component testへ置く。browser E2Eは代表操作だけを最終smokeとする。                                                                                                                                                            | 局所契約、固定データ全件、候補・validationの組合せをE2EまたはVRTへ追加しない。test-onlyのDOM・state・data属性を製品コードへ追加しない。                                               | Node / hook / Component / 最終smoke / Visual Review |

## 対象範囲

- その他流儀の各`rowId`へ対応する通常スキル配列をRHFへ追加する。新設する通常スキル行の追加・削除・上下移動は`useFieldArray`で行い、既存可変行の移行はG24前TODOへ残す。ビルドでその他流儀を追加した時点で、対応する独立したスキル区分と初期1行を表示する。空行は合計へ含めず、通常行は最低1行を維持する。
- 各区分は対象流儀の`bonus`と取得制限が`プライマリ限定`のskillを候補・表示から除外し、流儀Lv6未満では`basic`、6以上では`basic`と`advanced`を候補dialogへ表示する。通常行は選択時と別スキルへの変更時にLvを`1`へ戻し、追加・削除・上下移動できる。既に選択したskillは候補dialogでdisabledにし、同じskillを別の通常行へ選択できないようにする。
- `SkillSection`と`SkillPickerDialog`を再利用し、その他流儀専用の行Component、候補dialog、CSS Moduleを追加しない。その他流儀adapterが、各流儀の行ViewModel、候補group、選択済みskill ID、流儀名を含む見出し、callbackをshared Propsへ正規化する。各区分は初期展開・独立開閉とし、開閉状態を保存しない。
- ビルド側でその他流儀を削除するとき、対応する通常スキルに選択済みskill IDが1件でもあれば確認dialogを表示する。本文は「削除すると、現在選択中のスキルが消去されます。本当によろしいですか？」、操作は`キャンセル`と`削除`とする。確認時だけ対象流儀と対応スキル領域を削除し、キャンセル、Escape、閉じる操作ではどちらも変更しない。dialogを閉じた後は操作元へfocusを戻す。空行だけなら確認なしで削除する。
- その他流儀の選択値を別の流儀へ変更するとき、対応する通常スキルに選択済みskill IDが1件でもあれば確認dialogを表示する。確認時だけ流儀を変更して対応スキル選択を消去し、キャンセル、Escape、閉じる操作では流儀と対応スキルを変更しない。dialogを閉じた後は操作元へfocusを戻す。空行だけなら確認なしで流儀を変更する。
- 各その他流儀について、選択済み通常スキルの取得Lv合計が対応する流儀Lvを超えるときは、対応するビルド入力行とスキル区分の両方をerror状態にする。空行は合計へ含めない。最大Lv、重複、advanced条件は、G16の全スキル一貫validationへ先送りする。
- 既存の通常スキル入力にある最大Lvへの自動clampは採用しない。`docs/TODO.md`のG24 / G27前の入力・schema契約を先取りせず、最大Lv超過、復元、JSON入力の扱いを本Gateで補完しない。
- 固定文言を追加・移動する場合は、ゲーム用語・スキル属性名を`characterSheetDictionary.gameDomain.terms`へ、section名、操作、button、dialog説明、未選択messageを`characterSheetDictionary.characterSheet`へ分類する。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。
- browser E2Eは、その他流儀追加後の領域表示、候補dialogでの1候補選択、削除確認の確定またはキャンセルなど2〜3個の代表操作だけを最終smokeとして確認する。候補group、Lv境界、disabled、callback、dialog copy、行順、削除対象の全組合せはNode / Component / hook testへ置き、test-onlyのDOM・state・data属性を製品コードへ追加しない。

## 初期スコープ外

- プライマリ、生き様、共通スキルのフォーム値・adapter・候補を変更しない。
- G16の全スキル横断validation（その他流儀の取得Lv合計と対応流儀Lvの局所error UIを除く）、G14の共通スキル経験点、G24の保存・復元と既存可変行の移行、JSON入出力、canonical VRT baseline更新、追加依存の導入を行わない。
- 自由文の取得制限、前提、排他、能力値・アイテム条件、スキル効果を解析・自動算出しない。

## 完了条件

- [x] その他流儀の追加に応じて、流儀ごとの独立した通常スキル区分と初期1行を表示できる。
- [x] 各区分が対象流儀だけの候補を表示し、`bonus`と取得制限が`プライマリ限定`のskillを除外する。Lv6で`advanced`を候補へ含める。
- [x] 選択済み通常スキルの取得Lv合計が対応するその他流儀Lvを超えるとき、対応するビルド入力行とスキル区分の両方をerror状態にする。空行は合計へ含めない。
- [x] 対応スキル選択済みのその他流儀を変更・削除するときだけ確認dialogを出す。変更の確定時だけスキル選択を消去し、削除確認は「削除すると、現在選択中のスキルが消去されます。本当によろしいですか？」の本文と`キャンセル`・`削除`を表示して、確定時だけ流儀と対応スキルを削除する。
- [x] shared Componentを再利用し、独立開閉、選択済み候補のdisabled表示、行と詳細のアクセシビリティ関連付けを保つ。dictionaryのゲーム用語とキャラクターシートUI文言を指定の所有者へ分類している。
- [x] 確認dialogの確定、キャンセル、Escape、閉じる操作で流儀と対応スキルを原子的に扱い、閉じた後に操作元へfocusを戻す。
- [x] E2Eが最終smokeの責務を越えず、局所契約をNode / Component / hook testへ分離している。
- [x] `@character-sheet` targetのその他流儀1件・複数件、候補dialog、削除確認をdesktop、tablet、mobileでVisual Reviewする。canonical VRT baselineは更新しない。
- [x] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [x] その他流儀ごとのrow IDと対応スキル配列が、追加・削除後も誤って別流儀へ結び付かない。
- [x] 通常行の新規選択・別skillへの変更時は取得Lvを`1`へ戻し、その他流儀ごとの取得Lv合計だけを対応する流儀Lvと比較してerror状態を返す。
- [x] 新設するその他流儀スキル行だけを`useFieldArray`で操作し、既存可変行の移行はG24前TODOへ残している。
- [x] すべての実装差分を`アーキテクチャ適用`の許可範囲へ対応付け、許可範囲外の変更がないことを最終diffで確認している。
- [x] `docs/requirements/character-sheet.md`、architecture、design targetと矛盾していない。
- [x] GitHub Pagesのsubpath公開と既存routeに影響しない。
- [x] 不要な依存関係を追加していない。
- [x] G24 TODOの`useFieldArray`移行を先取りしていない。
- [x] G24 / G27前の通常スキルLvの自動補正、復元、JSON入力の契約を先取りしていない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useBuildSectionProps.ts`
- `src/character-sheet/form/useOtherRyugiSkillsSectionProps.ts`
- `src/character-sheet/logic/other-ryugi-skills.ts`
- `src/character-sheet/master-data/other-ryugi-skills.ts`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/BuildSection.tsx`
- `src/character-sheet/dictionary.ts`
- `src/character-sheet/components/skills/`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- その他流儀のrow IDと対応スキル配列の対応、変更・削除確認の原子性を守れているか。
- dictionary所有者、E2Eの最終smoke責務、shared Component境界を守れているか。

## 備考

- G12のshared表示契約とrequirementsのdesktop / tablet列契約に差異がある場合は、実装前にrequirementsの正本を同期してから進める。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@other-ryugi`
- route / states / viewports: `/character-sheet/` / その他流儀1件、複数件、候補dialog、取得Lv合計超過、削除確認 / desktop、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                           | 対応                                                                                                                          |
| ----------------- | ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 新設した5状態・15 viewportすべてのcanonical snapshotが未登録のため比較対象なし | locator screenshotを実際に開き、各状態の領域、候補dialog、error枠、削除確認の表示を確認した。canonical baselineは更新しない。 |

### 人間判断が必要な差分

- 新設したその他流儀VRT 15件のcanonical baseline追加の要否。current issueの初期スコープ外であり、ユーザーの明示承認なしに更新していない。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得し、locator screenshotを確認した
- [ ] VRT差分を修正した、または修正不要と判断した（canonical baselineの人間判断待ち）
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
