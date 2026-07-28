# ex-02-13-sheet-ikizama-skills

## 最優先のデザイン入力

- 対象design targetは`docs/design/character-sheet/notes.md`と`.tmp/design/character-sheet/`配下の承認済みdraftである。
- 現行の`components/skills/` shared Component、G12で確定したスキル区分のheader、展開、候補dialog、mobile個別最適化は、draftより優先する既存UIとして再利用する。
- ユーザーの最新指示と`docs/architectures/character-sheet.md`の`可変行のデザイン指針`を優先する。design notes、actual screenshot、reviewer出力を画面設計の根拠にしない。

## 目的

選択中生き様のボーナススキルと通常スキルを、`スキル`大セクション内で編集できるようにする。

## 背景

G12はプライマリ流儀スキルだけを接続し、再利用可能な`components/skills/`の表示・候補dialogを整備済みである。G13は生き様固有のフォーム値、候補条件、bonusの取得Lv編集を、そのshared Componentへadapterとして接続する。

- 要件: `docs/requirements/character-sheet.md`の「スキル」「経験点と信用」
- architecture: `docs/architectures/character-sheet.md`のスキル区分の共通表示、可変行のデザイン指針、Container / Presenter、テストアーキテクチャ
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`のG13
- design: `docs/design/character-sheet/notes.md`
- data: `data/generated/ikizama-skills.json`、`data/generated/ikizama-list.json`
- TODO: `docs/TODO.md`のG24前の`useFieldArray`境界整合は扱わない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G13: 生き様のスキルを扱う`

このissueは、生き様スキルのフォーム値、表示用adapter、候補選択、局所validation、テストを新しいsessionから実装できる契約とする。

## 対象範囲

- RHFへ、生き様通常スキル2行（最低1行）の`rowId`、skill ID、取得Lvと、生き様bonusの取得Lvを追加する。選択時と別スキルへの変更時はLvを`1`へ戻し、空行は合計へ含めない。通常行の追加・削除・上下移動は`useFieldArray`で行い、既存可変行の移行はG24前TODOへ残す。
- `ikizama-skills.json`から選択中生き様の`bonus`を先頭へ導出する。bonusは候補に含めず、名称・マスタ由来の内容は編集不可、取得Lvだけを初期値・最低値`1`で編集可能にする。生き様IDが変更・解除されたときはbonus Lvを`1`へ戻し、同じ生き様のLv変更では値を保持する。bonus Lvは通常行の取得合計へ含めない。
- 生き様レベル4未満では`basic`、4以上では`basic`と`advanced`を候補dialogのgroupとして表示する。通常行は追加・削除・上下移動でき、先頭・末尾以外へ移動できない方向のbuttonは表示しない。
- `SkillSection`と`SkillPickerDialog`を再利用し、生き様専用の重複した行Component、候補dialog、CSS Moduleを追加しない。生き様adapterが、行ViewModel、候補group、bonusのLv編集可否、候補条件、validation結果、callbackへ正規化する。
- 通常行の最大Lv、重複、advanced条件、生き様レベルとの合計整合は、G16の全スキル一貫validationへ先送りする。このGateはマスタ候補の絞り込みと行の選択・編集状態だけを扱う。
- 固定文言を追加・移動する場合は、ゲーム用語・スキル属性名を`characterSheetDictionary.gameDomain.terms`へ、section名、操作、button、dialog説明、未選択messageを`characterSheetDictionary.characterSheet`へ分類する。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。
- browser E2Eは、領域表示と候補dialogを開いて1候補を選ぶなど2〜3個の代表操作だけを最終smokeとして確認する。固定データ全件、Lv境界、候補group、disabled、callback、dialog copy、行順はNode / Component / hook testへ置き、test-onlyのDOM・state・data属性を製品コードへ追加しない。

## 初期スコープ外

- プライマリ、共通、その他流儀スキルのフォーム値・adapter・候補を変更しない。
- G14の共通スキル経験点、G15のその他流儀削除確認、G16の全区分横断validationを実装しない。G24前TODOで扱う既存可変行の`useFieldArray`移行は実装しない。
- スキル効果、取得制限、前提、排他、能力値・アイテム条件を解析・自動算出しない。
- 保存・復元、JSON入出力、canonical VRT baseline更新、追加依存の導入を行わない。

## 完了条件

- [ ] 選択中生き様のbonusと通常2行を、既存shared Componentで表示・編集できる。
- [ ] bonusは生き様IDの変更・解除時にLv`1`へ戻り、同じ生き様のLv変更時は値を保持する。通常行は`useFieldArray`で選択、Lv編集、追加・削除・上下移動をできる。
- [ ] 生き様Lv4で候補が`advanced`を含むよう切り替わる。
- [ ] dictionaryのゲーム用語とキャラクターシートUI文言を指定の所有者へ分類し、生成データ文言を複製していない。
- [ ] E2Eが最終smokeの責務を越えず、局所契約をNode / Component / hook testへ分離している。
- [ ] `@character-sheet` targetのdefault、候補dialog、詳細展開をdesktop、tablet、mobileでVisual Reviewする。canonical VRT baselineは更新しない。
- [ ] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [ ] `docs/requirements/character-sheet.md`、architecture、design targetと矛盾していない。
- [ ] GitHub Pagesのsubpath公開と既存routeに影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 新設する生き様通常行だけを`useFieldArray`で操作し、既存可変行の移行はG24前TODOへ残している。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useIkizamaSkillsSectionProps.ts`
- `src/character-sheet/master-data/ikizama-skills.ts`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/dictionary.ts`
- `src/character-sheet/components/skills/`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- 生き様固有の候補条件とbonus Lv編集をadapterへ閉じ、shared Componentへ業務条件を持ち込んでいないか。
- dictionary所有者、E2Eの最終smoke責務、可変行デザイン指針を守れているか。
- G16の全区分validationを前倒ししていないか。

## 備考

- G12のshared表示契約とrequirementsのdesktop / tablet列契約に差異がある場合は、実装前にrequirementsの正本を同期してから進める。
