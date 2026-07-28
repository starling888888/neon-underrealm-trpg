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

## 対象範囲

- その他流儀の各`rowId`へ対応する通常スキル配列をRHFへ追加する。新設する通常スキル行の追加・削除・上下移動は`useFieldArray`で行い、既存可変行の移行はG24前TODOへ残す。ビルドでその他流儀を追加した時点で、対応する独立したスキル区分と初期1行を表示する。空行は合計へ含めず、通常行は最低1行を維持する。
- 各区分は対象流儀の`bonus`を候補・表示から除外し、流儀Lv6未満では`basic`、6以上では`basic`と`advanced`を候補dialogへ表示する。通常行は選択時と別スキルへの変更時にLvを`1`へ戻し、追加・削除・上下移動できる。
- `SkillSection`と`SkillPickerDialog`を再利用し、その他流儀専用の行Component、候補dialog、CSS Moduleを追加しない。その他流儀adapterが、各流儀の行ViewModel、候補group、流儀名を含む見出し、callbackをshared Propsへ正規化する。
- ビルド側でその他流儀を削除するとき、対応する通常スキルに選択済みskill IDが1件でもあれば確認dialogを表示する。確認時だけ対象流儀と対応スキル領域を削除し、キャンセル、Escape、閉じる操作ではどちらも変更しない。空行だけなら確認なしで削除する。
- その他流儀の選択値を別の流儀へ変更するとき、対応する通常スキルに選択済みskill IDが1件でもあれば確認dialogを表示する。確認時だけ流儀を変更して対応スキル選択を消去し、キャンセル、Escape、閉じる操作では流儀と対応スキルを変更しない。空行だけなら確認なしで流儀を変更する。
- 通常行の最大Lv、重複、advanced条件、その他流儀レベルとの合計整合は、G16の全スキル一貫validationへ先送りする。このGateはマスタ候補の絞り込みと行の選択・編集状態だけを扱う。
- 固定文言を追加・移動する場合は、ゲーム用語・スキル属性名を`characterSheetDictionary.gameDomain.terms`へ、section名、操作、button、dialog説明、未選択messageを`characterSheetDictionary.characterSheet`へ分類する。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。
- browser E2Eは、その他流儀追加後の領域表示、候補dialogでの1候補選択、削除確認の確定またはキャンセルなど2〜3個の代表操作だけを最終smokeとして確認する。候補group、Lv境界、disabled、callback、dialog copy、行順、削除対象の全組合せはNode / Component / hook testへ置き、test-onlyのDOM・state・data属性を製品コードへ追加しない。

## 初期スコープ外

- プライマリ、生き様、共通スキルのフォーム値・adapter・候補を変更しない。
- G16の全スキル横断validation、G14の共通スキル経験点、G24の保存・復元と既存可変行の移行、JSON入出力、canonical VRT baseline更新、追加依存の導入を行わない。
- 自由文の取得制限、前提、排他、能力値・アイテム条件、スキル効果を解析・自動算出しない。

## 完了条件

- [ ] その他流儀の追加に応じて、流儀ごとの独立した通常スキル区分と初期1行を表示できる。
- [ ] 各区分が対象流儀だけの候補を表示し、Lv6で`advanced`を候補へ含める。
- [ ] 対応スキル選択済みのその他流儀を変更・削除するときだけ確認dialogを出す。変更の確定時だけスキル選択を消去し、削除の確定時だけ流儀と対応スキルを削除する。
- [ ] shared Componentを再利用し、dictionaryのゲーム用語とキャラクターシートUI文言を指定の所有者へ分類している。
- [ ] E2Eが最終smokeの責務を越えず、局所契約をNode / Component / hook testへ分離している。
- [ ] `@character-sheet` targetのその他流儀1件・複数件、候補dialog、削除確認をdesktop、tablet、mobileでVisual Reviewする。canonical VRT baselineは更新しない。
- [ ] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [ ] その他流儀ごとのrow IDと対応スキル配列が、追加・削除後も誤って別流儀へ結び付かない。
- [ ] 新設するその他流儀スキル行だけを`useFieldArray`で操作し、既存可変行の移行はG24前TODOへ残している。
- [ ] `docs/requirements/character-sheet.md`、architecture、design targetと矛盾していない。
- [ ] GitHub Pagesのsubpath公開と既存routeに影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] G24 TODOの`useFieldArray`移行を先取りしていない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useOtherRyugiSkillsSectionProps.ts`
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
