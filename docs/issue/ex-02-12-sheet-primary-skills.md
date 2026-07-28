# ex-02-12-sheet-primary-skills

## 最優先のデザイン入力

- 対象の承認済みdesign draftは`.tmp/design/character-sheet/`配下のdesktop、tablet、mobile、picker画像である。
- ユーザーの最新指示により、スキル大セクションはdesign draftの配置ではなく`判定`セクション直下へ置く。desktop / tabletのスキル行ヘッダー、行内展開、名称列幅、密度、削除、並べ替え、プライマリ流儀変更確認と、レビュー指摘2のmobile行構成・候補dialog名称表示もdesign draftより優先する。
- 既存の`CharacterSheetSectionFrame`、`CharacterSheetDialog`、入力・削除button、Build sectionの実装UIは、draft画像より優先して整合させる。design notes、actual screenshot、reviewer出力を画面設計の根拠にしない。
- design draftとユーザー指示にないmobileの解決策は、このGateで補完しない。

## 目的

選択中プライマリ流儀のボーナススキルと通常スキルを、キャラクターシートの`スキル`大セクションで編集できるようにする。

## 背景

親issueのG12は、プライマリ流儀のスキルだけを独立して実装するGateである。G7でプライマリ流儀とレベルの編集基盤、G5で確認ダイアログの共通shellを提供済みである。

関連する正本は次のとおり。

- `docs/requirements/character-sheet.md` のPC基本ビルドと能力値、スキル
- `docs/architectures/character-sheet.md` のContainer / Presenter / RHF境界、可変行、dialog、テストアーキテクチャ
- `docs/issue/ex-02-web-character-sheet/plan.md` のG7引継ぎとG12
- `docs/design/character-sheet/notes.md`
- `.tmp/design/character-sheet/` の承認済みdesign draft
- `data/generated/ryugi-skills.json` と`data/generated/ryugi-list.json`
- `docs/TODO.md` のG24前の`useFieldArray`境界整合TODOは本Gateでは扱わない

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G12: プライマリ流儀のスキルを扱う`

このissueは、プライマリ流儀スキルのフォーム値、マスタ参照、表示、候補選択、確認dialog、局所テストを新しいsessionから実装できる契約とする。

## 対象範囲

- `CharacterSheetFormPresenter`のsecondary columnで、`スキル`大セクションを`判定`の直下かつ`武器・防具`の前へ配置する。
- RHFのフォーム値へ、プライマリ流儀の通常スキル4行（最低1行）と、各行の`rowId`、選択済みskill ID、取得レベルを追加する。プライマリボーナススキルは生成JSONから導出し、フォーム値や通常スキルの取得レベル合計へ含めない。
- 選択中プライマリ流儀の`bonus`を読み取り専用で先頭表示する。通常行は追加・削除できるが、最低1行を維持する。bonus行には選択、削除、並べ替えを設けない。
- プライマリ流儀を選択中の内側スキル区分の見出しは`プライマリ流儀：${選択中のプライマリ流儀名}`とする。bonusスキルのLv表示は`自動`ではなく`1`とする。
- 通常行の左端drag handleによる順序変更を実装する。通常行だけを対象とし、bonus行より上には並べ替えられない。フォーム配列の順序を唯一の表示順とし、自動ソートしない。
- 通常行の選択操作から、選択中プライマリ流儀の`bonus`以外だけを候補ダイアログへ表示する。`basic`は「初期作成」、プライマリ流儀レベルが6以上のとき候補となる`advanced`は「Lv6以上」の小見出しで区切る。プライマリ流儀未選択時は候補を開かない。
- 同じ通常プライマリスキルが複数行で選択された場合は、重複する各行をエラー状態にする。候補dialogでは、既に通常行で選択済みのスキルをdisabledにして選択操作を受け付けない。
- desktop / tabletのプライマリ流儀スキル区分には、通常行とbonus行に共通するヘッダー行を追加する。drag handle列の次から、名称、Lv、`最大`／`Lv`の2行見出し、タイミング、コスト、使用制限、展開の順とする。タイミングはコストの左に置き、headerが折り返さない幅を確保する。最大Lv列はひと桁に必要な狭い幅とし、ヘッダー文字サイズは能力値作成のラベルと同程度まで小さくする。
- desktop / tabletのスキル表は、名称headerと名称cellを左寄せにする。通常行・bonus行はtable rowとして角丸を使わず、削除buttonは専用cellの上下左右中央へ置く。`＋ スキルを追加`は表から余白を空けて左寄せにする。
- desktop / tabletのプライマリ流儀スキル区分は、`CharacterSheetSectionFrame`と同じ灰色header、右端の開閉icon、外枠を持つsectionデザインにする。エラー枠の追加で行やheaderがずれないよう、通常時から同じ外枠寸法を持つ。
- desktop / tabletのスキル表示行は、名称、取得Lv、最大Lv、タイミング、コスト、使用制限、展開トグルだけを既定表示する。使用制限の複数値は`A`／`&B`のように、区切り記号の前で改行する。展開領域の1行目は`技能：XXX`と`取得制限：YYYY`を横並びにし、2行目に`効果：本文`を表示する。技能は`／`で折り返さない。展開領域は既定で閉じる。
- desktop / tabletの候補ダイアログは、`初期作成`と`Lv6以上`の各小見出しの直後に、名称、最大Lv、コスト、使用制限のheaderを表示する。名称headerと名称cellは左寄せにする。候補の詳細では、1行目と`技能：XXX`・`取得制限：YYYY`の詳細行の間だけに横罫線を置き、その詳細行と`効果：本文`の間には横罫線を置かない。候補行では対象と射程を表示しない。候補はcardではなく角丸なしの詰めたtable rowにする。候補数に起因する縦スクロールはdialog内容の領域へ閉じ、文書全体の縦スクロールを発生させない。tabletを含め、dialog内容の横overflowは許可しない。
- desktop / tabletのスキル区分・ヘッダー・行の文字サイズをわずかに下げる。drag handleは行の左上へ余白なく接続する。スキル選択buttonには`lucide-react`の`ListPlus`を使う。`lucide-react`を追加する理由は、文字記号ではなく意味が判別できる既存デザイン調和のiconを提供するためである。代替の手書きSVGはicon群の保守を増やし、既存の`simple-icons`はブランドicon用であるため、選択操作には用いない。
- mobileのプライマリ流儀スキル要約行は、drag handle、名称（スキル選択iconを含む）、Lv、最大Lv、タイミング、展開、削除iconをこの順に表示する。コスト、使用制限は要約行から外す。名称列は狭くし、スキル名のデータ内改行を表示する。要約headerとスキル名の文字サイズを下げ、headerと行の各cellは同じgrid列へ揃える。mobileの流儀行とスキル行の削除buttonにはcharacter sheet共通の小型classを適用する。
- mobileの展開部は1行目にコストと使用制限、2行目に技能と取得制限、3行目に効果を表示する。使用制限の`&`では改行しない。mobileの候補dialogは、候補名の文字サイズを下げ、データ内改行を表示して長い名称をclipしない。
- 通常行でスキルを新規選択または選択済みスキルから変更した時は、取得Lvを必ず`1`へ戻す。選択したスキルの最大レベル、コスト、技能、使用制限、対象、射程、取得制限、効果を読み取り専用で表示する。文章による取得制限や効果は解析・自動検証しない。
- 通常行の取得レベル入力は、選択済みスキルの最大レベルを`max`として超過入力を防ぐ。既存値または選択変更で最大レベルを超える行は、その行を赤枠で示す。選択済み通常スキルの取得レベル合計がプライマリ流儀レベルを超える場合は、プライマリ流儀のビルド枠とプライマリ流儀スキル区分を赤枠で示す。個別のエラー本文は追加しない。
- `スキル`大セクションとは別に、プライマリ流儀スキル区分も初期展開・独立開閉とする。開閉状態は保存せず、閉じても子要素をunmountしない。
- プライマリ流儀を変更する前に、bonus以外のプライマリ通常行で1件以上のskill IDが選択済みなら、G5のdialog shellで見出しなしの確認を出す。本文は「変更すると、現在選択中のスキルが消去されます。本当によろしいですか？」とする。操作labelは`キャンセル`と`変更`にする。確認時だけ通常行の選択を消去して流儀を変更し、キャンセル、Escape、閉じる操作では流儀・スキルを変更しない。流儀不一致スキルのエラー表示は実装しない。
- `DialogDemoTrigger`と、確認用に常設しているダミーの`CharacterSheetDialog`を`CharacterSheetContainer`から削除する。実際のプライマリ流儀変更確認だけを残す。
- 候補選択dialogの見出しは`プライマリ流儀スキルを選択`とする。
- プライマリ流儀が未選択、bonus、通常行追加・削除、候補選択、dialogのfocus復帰、dragによる並べ替え、最大名称幅を、logic / hook / Component / browser testの責務に分けて確認する。

## 初期スコープ外

- 生き様スキル、共通スキル、その他流儀スキルのフォーム値・表示・選択はG13〜G15で扱う。
- `advanced`条件、共通スキル上限と、生き様・その他流儀のレベル整合はG16で扱う。ただし、G12ではプライマリ流儀スキルの最大レベル、流儀レベル合計、同一通常スキルの重複だけを扱い、候補表示はプライマリ流儀レベル6未満で`advanced`を候補に含めない。
- canonical VRT baseline更新、design draft / notesの更新は扱わない。レビュー指摘2で定義したプライマリ流儀スキルと候補dialog以外のmobile向け追加設計・レイアウト解消は扱わない。
- 文章の取得制限、前提スキル、排他、能力値・格・アイテム条件、効果の自動解析・自動算出を追加しない。
- 保存・復元、JSON入出力、確認対象を除くroot操作を追加しない。スキル選択iconのための`lucide-react`導入だけは本Gateの対象とする。

## 完了条件

- [ ] プライマリ流儀を選ぶと、その流儀のbonusスキルが先頭の読み取り専用要約行と展開詳細で現れ、通常スキル4行が表示される。
- [ ] 通常行は1行を残して追加・削除でき、左端drag handleでbonus行の下だけを並べ替えられる。
- [ ] 通常行の候補ダイアログは選択中プライマリ流儀の`bonus`以外だけを表示し、`basic`とレベル6以上の`advanced`を指定小見出しで分ける。
- [ ] desktop / tabletのスキル区分は、名称、Lv、`最大`／`Lv`、タイミング、コスト、使用制限、展開のヘッダーを持つ。タイミングheaderは折り返さず、最大Lv列はひと桁幅で、ヘッダーと行の文字サイズは能力値作成ラベル程度へ下げる。
- [ ] desktop / tabletの行は技能・取得制限・効果を初期非表示にし、展開トグルで表示する。展開部は1行目に`技能：XXX`と`取得制限：YYYY`を横並び、2行目に`効果：本文`を表示し、技能は`／`で折り返さない。使用制限の複数値は指定の区切り改行で表示する。drag handleは左上に余白なく接続し、スキル選択buttonは`lucide-react`の`ListPlus`を使う。
- [ ] desktop / tabletの候補ダイアログは、各小見出し直後に名称、最大Lv、コスト、使用制限のヘッダーを持つ表形式である。候補詳細は技能・取得制限を効果の上に表示し、`効果：本文`を常時表示する。候補数によるスクロールはdialog内容だけに発生し、文書全体の縦スクロールおよびdialog内容の横overflowを発生させない。
- [ ] mobileのプライマリ流儀スキル要約行は、drag handle、スキル選択iconを含む名称、Lv、最大Lv、タイミング、展開、削除iconを表示する。名称は狭い列で改行データを反映し、headerと行のcellが揃う。展開部はコストと使用制限、技能と取得制限、効果の3行で表示し、使用制限は`&`で改行しない。削除buttonはcharacter sheet共通の小型classを使い、候補dialogの長い名称は縮小した文字サイズと改行データでclipしない。
- [ ] 通常スキルが1件以上選択済みのプライマリ流儀変更では、見出しなし、`キャンセル`／`変更`の指定文言確認dialogを出す。確認時だけ通常選択を消去して変更し、キャンセル・Escape・閉じる操作では変更しない。ダミー確認dialogは表示しない。
- [ ] 通常スキルの取得レベルは最大レベルを超えて変更できず、既存の超過行は行単位で赤枠になる。通常スキル取得レベル合計がプライマリ流儀レベルを超える場合は、プライマリ流儀のビルド枠とプライマリ流儀スキル区分を赤枠にする。
- [ ] 同じ通常プライマリスキルを複数行で選択した場合は各重複行を赤枠にし、候補dialogでは既に選択済みの候補をdisabledにする。
- [ ] プライマリ流儀スキル区分は、スキル大セクションとは独立して初期展開・開閉できる。
- [ ] プライマリ流儀未選択、bonus、削除下限、候補絞り込み、行順序、選択時のレベル`1`、dialogのfocus復帰を局所テストで確認する。
- [ ] desktop、tablet、mobileのactual screenshotを開いて、スキル大セクション、ヘッダー、通常行、bonus行、展開状態、候補dialog、確認dialogを確認する。mobileでは要約行の表示列・header整列・名称の改行・展開部のコストと使用制限・候補名のclip不在を確認する。canonical VRT baselineは更新しない。
- [ ] `npm run check`、関連Node / Component / hook test、対象browser testが通る。

## チェックポイント

- [ ] `CharacterSheetContainer`がdialogの開閉、保留中のプライマリ流儀変更、focus復帰だけを持ち、Presenter / leaf ComponentへRHFやマスタ検索を混在させていない。
- [ ] RHFのフォーム値を唯一の可変状態とし、行順を別stateへ複製していない。G24の`useFieldArray`整合TODOを先取りして回収していない。
- [ ] `data/generated/ryugi-skills.json`のIDと配列順を読み取り専用で利用し、generated dataや変換処理を変更していない。
- [ ] 既存の`CharacterSheetDialog`のEscape、閉じる、操作元へのfocus復帰、accessible nameを壊していない。
- [ ] `/character-sheet/`以外の既存route、GitHub Pagesのsubpath、Pagefind除外、G7〜G11の入力を壊していない。
- [ ] 不要な依存関係を追加していない。
- [ ] `docs/TODO.md`のG24前の可変行境界整合と矛盾していない。
- [ ] user指示により更新した`docs/requirements/character-sheet.md`と矛盾していない。

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/master-data/primary-skills.ts`
- `src/character-sheet/logic/primary-skills.ts`
- `src/character-sheet/form/usePrimarySkillsSectionProps.ts`
- `src/character-sheet/form/useBuildSectionProps.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/PrimarySkillsSection.tsx`
- `src/character-sheet/components/PrimarySkillsSection.module.css`
- `src/character-sheet/components/dialogs/PrimarySkillPickerDialog.tsx`
- `src/character-sheet/components/dialogs/PrimarySkillPickerDialog.module.css`
- `src/character-sheet/components/dialogs/PrimaryRyugiChangeConfirmDialog.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/dialogs/DialogDemoTrigger.tsx`（削除）
- `src/character-sheet/dictionary.ts`
- `package.json`
- `package-lock.json`
- `tests/node/character-sheet/primary-skills.test.ts`
- `tests/components/character-sheet/PrimarySkillsSection.test.tsx`
- `tests/components/character-sheet/PrimarySkillPickerDialog.test.tsx`
- `tests/hooks/character-sheet/usePrimarySkillsSectionProps.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `docs/requirements/character-sheet.md`
- `docs/issue/ex-02-12-sheet-primary-skills.md`

## レビュー観点

- G12がプライマリ流儀スキルだけに限定され、生き様・共通・その他流儀・G16の検証へ拡大していないか。
- bonus行を固定しつつ通常行だけの最低1行、削除、drag順序の制約が明確か。
- 候補の`basic` / `advanced`絞り込みと、小見出しの条件がレビュー可能か。
- 通常スキルを保持したままプライマリ流儀を変更しない確認dialogの文言・確認時だけの消去・focus復帰が明確か。
- desktop / tabletのヘッダー、初期折りたたみ、密度、drag handle位置が、名称列幅を保ちつつ横scrollを発生させない構成になっているか。mobileではレビュー指摘2の情報密度へ限定し、他sectionの最適化を混在させていないか。
- design draftとの差異をユーザー最新指示として扱い、実装前に追加のdesign-image-generationを必要としない判断が妥当か。

## 備考

- `docs/requirements/character-sheet.md`は、ユーザーの明示指示により、desktop / tabletのスキルヘッダー、行内展開、密度、icon、drag位置と、レビュー指摘2のmobileプライマリ流儀スキル表示へ更新した。
- canonical VRT baselineは更新しない。Visual ReviewはG12で変更したroute / state / viewportのactualを対象にし、G31の統合確認を置き換えない。
- branchは既存の`ex-02-web-character-sheet`を使用する。新規branchは作成しない。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` の`@primary-skills-selected`（以降、`@primary-skill-details-expanded`、`@primary-skill-picker-open`、`@primary-ryugi-change-confirm`）
- route / states / viewports: `/character-sheet/` の選択済み、行詳細展開、候補dialog、流儀変更確認dialogをdesktop / tabletで確認する。

### レビュー結果

| 対象                    | 判定 | 差分                                                                             | 対応                                                    |
| ----------------------- | ---- | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| primary-skills-selected | 未達 | Playwrightの流儀select操作がtimeoutし、actual locator screenshotを生成できない。 | form再描画を伴うselect操作のcapture基盤を別途調査する。 |

### 実画面確認

- `/character-sheet/` / 選択済み / desktop・tablet:
  - locator screenshot: 未生成。`npm run visual:capture -- --grep "@primary-skills-selected"`がfixture準備の`selectOption("kenkaya")`でtimeoutした。
  - result: 未確認。full-page screenshotや独自browser scriptで代用しない。

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した
- [ ] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [ ] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [ ] VRT差分を修正した、または修正不要と判断した
- [ ] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- プライマリ流儀スキル表の名称headerをtooltip化し、「名称欄をクリックするとスキル選択ダイアログが開きます。」と表示する。
- スキル選択ダイアログのcontent先頭に、太字で「スキル名称をクリックすると選択したスキルがキャラクターシートに反映されます。」と表示する。

### 判定

- source: human
- classification: valid
- local validation: いずれもG12のプライマリ流儀スキル表と候補選択dialogだけの表示説明であり、現在のissue scope内である。既存の`FormulaTooltip`と`CharacterSheetDialogContent`を利用できる。

### 対応方針

- 通常行の名称列headerだけへ既存tooltipを適用し、候補dialogのcontent先頭へ指定文言を追加する。

### 対応完了チェックリスト

- [x] 名称headerのtooltipと指定文言を実装する。
- [x] 候補選択dialogのcontent先頭に指定の太字説明文を表示する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- mobileのプライマリ流儀スキル行は、drag handle、スキル選択iconを含む名称、Lv、最大Lv、タイミング、展開、削除iconを要約行に置く。名称列を狭くし、名称とheaderの文字を小さくする。
- スキル名に含まれる改行を、通常行と候補dialogの候補名に表示する。長い候補名をclipしない。
- mobileの展開部は1行目にコストと使用制限、2行目に技能と取得制限、3行目に効果を置く。使用制限の`&`では改行しない。
- mobileの流儀行とスキル行の削除buttonを、character sheet共通の小型classで統一する。
- mobileでheaderと本文cellの列位置を揃える。

### 判定

- source: human
- classification: valid
- local validation: 現行G12はmobileを初期スコープ外としているが、ユーザーがプライマリ流儀スキルと候補dialogに限定してmobile改善を明示した。requirementsのmobile個別task境界を同じ対象へ更新し、desktop / tablet契約と他sectionのmobile最適化は拡大しない。

### 対応方針

- mobile breakpointだけで主表のgridを要約列へ切り替え、drag handleとスキル選択iconを表示したままにする。展開部はコストと使用制限、技能と取得制限、効果の3行にし、通常行・候補dialogの名称は改行を保持して縮小表示する。
- 主表のheaderと通常・bonus行で同じmobile grid templateを共有し、列ずれを解消する。

### 対応完了チェックリスト

- [x] mobile要約行、展開部、名称改行、候補dialog名称を指定どおりに実装する。
- [x] Component testでmobile固有の表示構造を確認する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [ ] mobileのactual locator screenshotを開いて表示契約を確認する。

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` の`@primary-skills-selected`、`@primary-skill-details-expanded`、`@primary-skill-picker-open`
- route / states / viewports: `/character-sheet/` の選択済み、行詳細展開、候補dialogをmobileで確認する。

### レビュー結果

| 対象                        | 判定 | 差分                                                                                            | 対応                                                    |
| --------------------------- | ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| primary mobile skill states | 未達 | fixture準備の`selectOption("kenkaya")`が既知のtimeoutとなり、locator screenshotを生成できない。 | form再描画を伴うselect操作のcapture基盤を別途調査する。 |

### 実画面確認

- `/character-sheet/` / 選択済み・行詳細展開・候補dialog / mobile:
  - locator screenshot: 未生成。既知のfixture timeoutを解消していないため、同じcaptureを再実行していない。
  - result: 未確認。full-page screenshotや独自browser scriptで代用しない。

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した
- [ ] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [ ] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [ ] VRT差分を修正した、または修正不要と判断した
- [ ] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
