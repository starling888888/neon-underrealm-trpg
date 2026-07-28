# ex-02-17-sheet-weapons-armor

## 最優先のデザイン入力

- ユーザーが指定した武器・防具のdesktop / tablet / mobileの列、展開内容、候補dialogのgroupとheaderを、このGateの画面契約とする。`.tmp/design/character-sheet/`の承認済みdraftは、`武器・防具` sectionの位置、既存sheetの情報密度、section frameの見た目だけを参照し、今回の明示指定と競合する旧い列構成は採用しない。
- `docs/design/character-sheet/notes.md`、`docs/architectures/character-sheet.md`の可変行のデザイン指針、および既存の`FormulaTooltip`とdialogは、上記の画面契約を実現する範囲で適用する。design notes、実装結果のscreenshot、reviewer出力を、画面配置・導線・状態表現を決めるdesign画像の代わりにしない。
- 名称はdesktop / tablet / mobileで折り返してよい。名称列は既存スキルの名称列より短くし、`攻撃力／ガード値`または`防御力／ダメージ軽減`の式を折り返さないことを優先する。table全体、section、ページに横overflowを発生させない。
- 画面指定にない操作、confirmation、状態表現は実装都合で補完しない。不明点はこのissueのレビュー観点で確認し、実装開始前に決定する。

## 目的

`武器・防具` sectionへ、読み取り専用の生成アイテムデータをIDで選択する武器可変行と単一の防具行を追加する。武器・防具の性能と手動修正による最終値、展開詳細、候補選択dialogを、desktop / tablet / mobileで指定どおり表示する。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の`G17: 武器と防具を扱う。`
- 要件: `docs/requirements/character-sheet.md`の「アイテム」「経験点と信用」「エラーと警告」「共通動作」
- ゲームデータ: `data/generated/items.json`、`src/lib/types/item.ts`、`src/pages/data/items/weapons.mdx`、`src/pages/data/items/armors.mdx`
- architecture: `docs/architectures/character-sheet.md`の「可変行のデザイン指針」「Container / Presenterの責務」「状態と派生値の境界」「データ境界」「HTML / CSSの構造と責務」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/`の承認済みdraft。G17固有の列・dialog詳細はユーザー指定で確定しているため、`design-image-generation`は前提にしない。canonical VRT baselineは更新しない。
- 関連TODO: `docs/TODO.md`の「G17着手時にCharacterSheetContainerのdialog orchestrationをhookへ分離する要否を判断する」をこのGateで扱う。既存picker、confirmation dialog、pending action、focus復帰を列挙し、責務境界を単純化できる場合だけroot orchestration hookを導入する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G17: 武器と防具を扱う。`

このissueはG17だけを実装する自己完結した契約である。G18以降の生き様専用アイテム入力、G22のカテゴリ表示・生き様変更時の入れ替え・消費信用一元算出、G24の保存・復元、G25のエラー集約、G26 / G27のJSON入出力は実装しない。

ユーザーの明示指示により、このissueは専用child branchを作らず、親branch `ex-02-web-character-sheet`上で準備する。issueファイル名とGate識別子はparent Gate planの指定を維持する。

## アーキテクチャ適用

| architecture節              | このGateで許可する変更                                                                                                                                                                           | このGateで禁止する変更                                                                                                                                                                              | 確認するテスト層                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 可変行のデザイン指針        | 武器と防具を別々のsection表示Componentとして実装し、指定された列header、初期非展開の詳細、追加・並べ替え・削除の操作領域、mobileの情報移動を定める。                                             | 武器・防具・生き様専用アイテム・スキルを単一の汎用行Componentへ統合しない。desktop tableを単に縮小してmobile横scrollにしない。                                                                      | Component、target限定Visual Review            |
| Container / Presenterの責務 | section hook / master-data adapterで武器・防具のViewModelとActionsを作り、Containerで候補dialog、選択対象、focus復帰を調整する。既存dialog stateを列挙し、共通hookが単純化する場合だけ抽出する。 | Containerへ性能計算、マスタ検索、schema、表示列の判断を集約しない。武器削除・防具クリアのためのconfirmation dialogを追加せず、Presenter / leaf ComponentへRHF、候補絞り込み、業務ルールを渡さない。 | Node logic、RHF hook、Component               |
| 状態と派生値の境界          | 武器の行順、選択ID、攻撃 / ガード修正、防具の選択IDと防御 / ダメージ軽減修正をRHFの`useFieldArray`または単一form値として保持する。武器は初期1行・最低1行を`useFieldArray`で保証する。            | 編集値を別state storeへ複製しない。G24 / G27の保存、復元、JSON adapterを先行実装しない。                                                                                                            | schema、RHF hook、Component                   |
| データ境界                  | `data/generated/items.json`を読み取り専用master dataとしてadapterで解決し、ID、候補group、性能表示、数値 / 非数値の最終値導出をpure logicへ分ける。                                              | 生成JSONを手編集しない。自由文の効果・装備制限を解析、自動検証、自動加算しない。                                                                                                                    | master-data、Node logic                       |
| HTML / CSSの構造と責務      | 行を`fieldset` / `legend`で意味付け、見た目にlabelを置かない修正inputへ行名を含むaccessible nameを与える。既存`FormulaTooltip`と`CharacterSheetDialog`の責務を保つ。                             | section CSSからTooltip / dialog内部buttonへ広く一致するselectorを追加しない。tooltip / dialogの独自実装やUI libraryを導入しない。                                                                   | Component、Visual Review                      |
| テストアーキテクチャ        | 数値・特殊値の導出をNode、RHFの行追加・移動・削除・選択をhook、表示・展開・tooltip・dialog・focus復帰をComponent、代表操作だけをPlaywrightで検証する。                                           | VRT / E2Eへ数式、schema、全候補データの網羅、Container内部stateを置かない。                                                                                                                         | Node、Vitest hook / Component、最小Playwright |

## 対象範囲

### 武器のform・一覧

- 武器は初期1行かつ最低1行を維持する。空行を追加でき、選択済み行を上下へ入れ替え、最低1行を超える行を確認dialogなしで削除できる。武器IDの重複選択を許可する。
- desktop / tabletの要約行は、左から並べ替え、名称、信用、種別、技能、射程、装弾数、`攻撃力／ガード値`、展開、削除とする。名称は折り返し可とし、式は折り返さない。`攻撃力／ガード値`には可視labelを置かない。
- mobileの要約行は、並べ替え、名称、信用、`攻撃力／ガード値`、展開、削除だけとする。種別、技能、射程、装弾数は要約行から除く。
- 武器行の展開は初期状態で閉じる。desktop / tablet / mobileともに、展開1行目へ種別、技能、射程、装弾数をこの順で置き、2行目へ効果を置く。
- `攻撃力／ガード値` headerは既存`FormulaTooltip`のtriggerとし、tooltip本文を次の完全一致の文言とする。`攻撃力やガード値が-や特殊の場合、修正を入力すると最終的な値が表示されます。`
- `攻撃力／ガード値`は、`武器の攻撃力／武器のガード値 + 攻撃の修正入力／ガードの修正入力 = 最終的な攻撃力／ガード値`の順で示す。修正inputは負数を許可し、可視labelなし・行名を含むaccessible nameありとする。マスタ値が数値以外の場合、修正が空欄なら最終値を表示せず、修正が入力済みのときだけ修正値を最終値として示す。自由文は解析しない。

### 武器の候補選択dialog

- 候補dialogは`CharacterSheetDialog`を使い、Containerが開閉、対象row、操作元へのfocus復帰を保持する。各候補行の選択後は選択対象の武器行だけを更新して閉じる。
- 通常武器は、小見出しを上から`喧嘩`、`暗殺`、`発砲`、`格闘`、`干渉`の順で表示する。各小見出しの直下に、名称、信用、`攻撃力／ガード値`、展開のtable headerを必ず置く。
- 生き様がスミの場合は`武器化ナノマシン`、ケジメの場合は`サイバネ武器`を候補へ追加する。これらは技能ごとの追加小見出しを作らない。生き様の変更は既に選択した専用武器と各修正値を変更せず、以後に開く候補dialogだけを現在の生き様で絞り込む。専用武器とサイバネ・ナノマシンの選択は連動させない。
- dialogのdesktop / tablet / mobile要約行は、名称、信用、`攻撃力／ガード値`、展開とする。展開内容は、1行目に種別、技能、射程、装弾数、2行目に効果を置く。武器は重複選択可能なため、選択済み候補をdisabled / mutedにしない。

### 防具のform・候補選択dialog

- 防具は単一の行だけを持ち、並べ替えと削除buttonを表示しない。desktop / tablet / mobileの要約行に`クリア`buttonを置き、確認dialogを開かず選択IDと防御・ダメージ軽減修正を初期値へ戻す。これは行削除ではない。
- desktop / tablet / mobileの防具要約行は、名称、信用、`防御力／ダメージ軽減`、展開、クリアとする。`防御力／ダメージ軽減`の計算式は、`防具の防御力／防具のダメージ軽減 + 防御の修正入力／ダメージ軽減の修正入力 = 最終的な防御力／ダメージ軽減`の順で示す。修正inputに可視labelは置かず、行名を含むaccessible nameを与える。
- `防御力／ダメージ軽減` headerはtooltip triggerとし、tooltip本文は`防御力やダメージ軽減が-や特殊の場合、修正を入力すると最終的な値が表示されます。`とする。数値以外のマスタ値と空欄 / 明示修正の扱いは武器と同じpure logicの契約とする。
- 防具行の展開は初期状態で閉じ、装備制限と効果を表示する。装備制限の自由文は表示だけとし、能力値などを自動検証しない。
- 防具選択dialogはdesktop / tablet / mobileで、名称、信用、`防御力／ダメージ軽減`、装備制限までをtable headerと候補行に表示する。効果だけを候補行の展開内へ置く。防具は1枠のみであり、重複候補・複数行は作らない。

### 結線・検証・Visual Review

- `CharacterSheetFormPresenter`の既存`weapons-and-armor` slotへ武器・防具section Propsを渡す。dict、form values、schema、master-data、pure logic、form hook、section / dialog Component、Container orchestration、対象testsを、上記の境界に沿って追加または更新する。
- `docs/TODO.md`のG17 TODOに従い、既存のpicker、confirmation dialog、pending action、focus復帰を実装前に列挙する。武器削除と防具クリアにはconfirmationを追加せず、root orchestration hookを抽出するかだけを、その列挙でContainer / Presenter境界を単純化できる場合に決定する。
- E2EとVRTのspecを実装するが、実装直後には実行しない。実装後はpreviewを起動せず、既定portのdev serverを維持してユーザーレビューを待つ。ユーザーがレビュー完了を明示した後にだけ、`/character-sheet/`の武器未選択・複数武器・武器候補dialog・武器詳細展開・防具候補dialog・防具詳細展開・tooltip openをdesktop（1440px）、tablet（820px）、mobile（390px）でactual screenshotとして開き、対象E2Eとtarget限定VRTを実行する。canonical VRT baselineは更新しない。

## 初期スコープ外

- G18以降の生き様専用アイテム入力、G22の生き様変更時のカテゴリ表示・警告・消費信用集計・他カテゴリの追加削除を実装しない。
- 武器・防具の自由文効果、装備制限、戦闘処理、装弾数を解析、自動計算、自動検証しない。ダイスローラー、戦闘シミュレーター、装備状態の管理を追加しない。
- localStorage / IndexedDBの保存・復元、JSON export / import、エラー集約、sticky操作ペイン、CCFOLIA、全消去を実装しない。
- 新しいnpm package、UI kit、state store、汎用Item行Component、生成JSONの変更を追加しない。
- `docs/out-of-scope.md`のサーバー、DB、認証、クラウド保存などの初期スコープ外機能を実装しない。

## 完了条件

- [ ] 武器が初期1行・最低1行を保ち、追加、並べ替え、削除、重複選択を行える。防具が単一行で、並べ替えと削除buttonを持たない。
- [ ] 武器のdesktop / tablet要約行、mobile要約行、展開内容、名称と式の折り返し優先順位が指定どおりで、横overflowがない。
- [ ] 防具のdesktop / tablet / mobile要約行、展開内容、候補dialogの装備制限までの表示と効果の展開表示、確認dialogを開かない`クリア`操作が指定どおりである。
- [ ] 武器候補dialogが通常5 groupを指定順で表示し、スミでは武器化ナノマシン、ケジメではサイバネ武器を追加する。武器の重複候補はdisabledにしない。
- [ ] 武器・防具の式、負数の修正input、数値以外のマスタ値と空欄 / 明示修正の最終値表示、指定tooltip文言がpure logicと表示で一致する。
- [ ] tooltip、candidate dialog、展開、選択、確認dialogを開かない武器削除・防具クリア、Escape、閉じる操作、focus復帰がアクセシブルに動作する。
- [ ] G17 TODOのdialog orchestration判断と、武器削除・防具クリアにconfirmationを追加しないこと、採用時のhook境界または非採用理由がissueへ記録される。
- [ ] E2EとVRTのspecを実装し、ユーザーレビュー完了までは実行せず、dev serverを維持したレビュー待ちを記録する。
- [ ] ユーザーレビュー完了後にUI actual screenshotを対象route・state・viewportごとに開いて確認し、対象E2Eとtarget限定VRTの結果を記録する。canonical VRT baselineは更新しない。
- [ ] `npm run check`、`npm run build`、変更責務に対応するNode / Vitest testが通る。E2EとVRTはユーザーレビュー完了後に実行する。

## チェックポイント

- [ ] `CharacterSheetContainer`、Presenter、section hook、pure logic、master-dataの責務境界を保ち、RHF以外へ編集値を複製していない。
- [ ] GitHub Pagesのサブパス公開、既存ルート、既存skill picker / confirmation dialog / focus復帰を壊していない。
- [ ] 不要な依存関係、グローバルstyle、generated data変更を追加していない。
- [ ] `FormulaTooltip`と`CharacterSheetDialog`の内部CSS責務を利用側から侵害していない。
- [ ] errorとwarningを混同せず、各入力・行へ可視のerror理由を追加していない。
- [ ] 関連TODOとdesign targetに矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/master-data/`、`src/character-sheet/logic/`、`src/character-sheet/form/`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`と同CSS Module
- `src/character-sheet/components/`、`src/character-sheet/components/dialogs/`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`

## レビュー観点

- 指定した武器の直接削除、防具の直接クリア、行数制約、候補dialogの範囲が意図どおりか。
- G17の実装を親branchで継続するという例外と、上記の範囲・完了条件が妥当か。

## 備考

- このissueは、G17の実装契約としてユーザーの武器・防具画面指定を記録する。実装はユーザー承認後に開始する。
- 武器削除は確認dialogを開かず、最低1行を残して直接行う。防具の`クリア`も確認dialogを開かず、単一行を未選択状態へ戻す。G17 TODOのdialog orchestration確認は、これらの操作をconfirmationへ昇格させるためではなく、候補dialogの状態とfocus復帰を既存Containerで保つか判断するために行う。
- 実装完了後は、previewを起動せず、既定portのdev serverを停止せずに維持してユーザーレビューを待つ。E2EとVRTはspecだけを実装し、ユーザーレビュー完了の明示指示があるまで実行しない。
- Git commit / pushは、このissue作成では実行しない。
