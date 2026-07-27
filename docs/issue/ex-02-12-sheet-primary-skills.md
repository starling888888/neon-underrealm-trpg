# ex-02-12-sheet-primary-skills

## 最優先のデザイン入力

- 対象の承認済みdesign draftは`.tmp/design/character-sheet/`配下のdesktop、tablet、mobile、picker画像である。
- ユーザーの最新指示により、スキル大セクションはdesign draftの配置ではなく`判定`セクション直下へ置く。スキル行と候補ダイアログの2行構成、名称列幅、mobileでの幅維持、削除、並べ替え、プライマリ流儀変更確認もdesign draftより優先する。
- 既存の`CharacterSheetSectionFrame`、`CharacterSheetDialog`、入力・削除button、Build sectionの実装UIは、draft画像より優先して整合させる。design notes、actual screenshot、reviewer出力を画面設計の根拠にしない。
- design draftとユーザー指示にないmobileの解決策は、このGateで補完しない。指定幅を保ったactual表示を確認し、調整要否は実装後にユーザーへ報告する。

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
- 通常行の左端drag handleによる順序変更を実装する。通常行だけを対象とし、bonus行より上には並べ替えられない。フォーム配列の順序を唯一の表示順とし、自動ソートしない。
- 通常行の選択操作から、選択中プライマリ流儀の`bonus`以外だけを候補ダイアログへ表示する。`basic`は「初期作成」、プライマリ流儀レベルが6以上のとき候補となる`advanced`は「Lv6以上」の小見出しで区切る。プライマリ流儀未選択時は候補を開かない。
- スキル表示行と候補ダイアログの候補行は、名称を含むメタ情報を1行目へ横並びにし、効果本文だけを2行目へ置く。名称領域は、流儀・生き様・共通スキルの全生成スキル名の最大文字列を折り返さない幅とする。G12ではmobileでもこの幅を縮めず、幅不足の横方向overflowはスキル区分内のスクロールに閉じてほかの領域へ漏らさない。
- 通常行の選択時はレベルを`1`にし、変更時は選択とレベルを正規化する。選択したスキルの最大レベル、コスト、技能、使用制限、対象、射程、取得制限、効果を読み取り専用で表示する。文章による取得制限や効果は解析・自動検証しない。
- 通常行の取得レベル入力は、選択済みスキルの最大レベルを`max`として超過入力を防ぐ。既存値または選択変更で最大レベルを超える行は、その行を赤枠で示す。選択済み通常スキルの取得レベル合計がプライマリ流儀レベルを超える場合は、プライマリ流儀のビルド枠とプライマリ流儀スキル区分を赤枠で示す。個別のエラー本文は追加しない。
- `スキル`大セクションとは別に、プライマリ流儀スキル区分も初期展開・独立開閉とする。開閉状態は保存せず、閉じても子要素をunmountしない。
- プライマリ流儀を変更する前に、bonus以外のプライマリ通常行で1件以上のskill IDが選択済みなら、G5のdialog shellで確認する。本文は「変更すると、現在選択中のスキルが消去されます。本当によろしいですか？」とする。確認時だけ通常行の選択を消去して流儀を変更し、キャンセル、Escape、閉じる操作では流儀・スキルを変更しない。流儀不一致スキルのエラー表示は実装しない。
- プライマリ流儀が未選択、bonus、通常行追加・削除、候補選択、dialogのfocus復帰、dragによる並べ替え、最大名称幅を、logic / hook / Component / browser testの責務に分けて確認する。

## 初期スコープ外

- 生き様スキル、共通スキル、その他流儀スキルのフォーム値・表示・選択はG13〜G15で扱う。
- スキルの重複、`advanced`条件、共通スキル上限と、生き様・その他流儀のレベル整合はG16で扱う。ただし、G12のプライマリ流儀スキルの最大レベルと流儀レベル合計だけは本Gateで扱い、候補表示はプライマリ流儀レベル6未満で`advanced`を候補に含めない。
- mobile表示の追加設計・レイアウト解消、canonical VRT baseline更新、design draft / notesの更新は扱わない。
- 文章の取得制限、前提スキル、排他、能力値・格・アイテム条件、効果の自動解析・自動算出を追加しない。
- 保存・復元、JSON入出力、確認対象を除くroot操作、追加パッケージを導入しない。

## 完了条件

- [ ] プライマリ流儀を選ぶと、その流儀のbonusスキルが先頭の読み取り専用2行表示で現れ、通常スキル4行が表示される。
- [ ] 通常行は1行を残して追加・削除でき、左端drag handleでbonus行の下だけを並べ替えられる。
- [ ] 通常行の候補ダイアログは選択中プライマリ流儀の`bonus`以外だけを表示し、`basic`とレベル6以上の`advanced`を指定小見出しで分ける。
- [ ] 表示行と候補行は、名称を含むメタ情報が1行目、効果本文だけが2行目である。名称領域は全スキル中の最長名称を折り返さない幅とし、mobileでも縮めない。
- [ ] 通常スキルが1件以上選択済みのプライマリ流儀変更では、指定文言の確認dialogを出す。確認時だけ通常選択を消去して変更し、キャンセル・Escape・閉じる操作では変更しない。
- [ ] 通常スキルの取得レベルは最大レベルを超えて変更できず、既存の超過行は行単位で赤枠になる。通常スキル取得レベル合計がプライマリ流儀レベルを超える場合は、プライマリ流儀のビルド枠とプライマリ流儀スキル区分を赤枠にする。
- [ ] プライマリ流儀スキル区分は、スキル大セクションとは独立して初期展開・開閉できる。
- [ ] プライマリ流儀未選択、bonus、削除下限、候補絞り込み、行順序、選択時のレベル`1`、dialogのfocus復帰を局所テストで確認する。
- [ ] 指定幅を保ったdesktop、tablet、mobileのactual screenshotを開いて、スキル大セクション、表示行、候補dialog、確認dialogを確認し、mobileで発生した表示崩れの有無をissueへ記録する。canonical VRT baselineは更新しない。
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
- `src/character-sheet/dictionary.ts`
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
- 全スキル中の最長名称幅を維持し、mobileの解決策をこのGateへ先取りしない範囲が妥当か。
- design draftとの差異をユーザー最新指示として扱い、実装前に追加のdesign-image-generationを必要としない判断が妥当か。

## 備考

- `docs/requirements/character-sheet.md`は、ユーザーの明示指示により、スキル行・候補行の2行構成、全スキル最長名称幅、drag順序、プライマリ流儀変更確認、`判定`直下の配置へ更新した。
- canonical VRT baselineは更新しない。Visual ReviewはG12で変更したroute / state / viewportのactualを対象にし、G31の統合確認を置き換えない。
- branchは既存の`ex-02-web-character-sheet`を使用する。新規branchは作成しない。
