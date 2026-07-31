# ex-02-17-sheet-weapons-armor

## 最優先のデザイン入力

- ユーザーが指定した武器・防具のdesktop / tablet / mobileの列、展開内容、候補dialogのgroupとheaderを、このGateの画面契約とする。`.tmp/design/character-sheet/`の承認済みdraftは、`武器・防具` sectionの位置、既存sheetの情報密度、section frameの見た目だけを参照し、今回の明示指定と競合する旧い列構成は採用しない。
- `docs/design/character-sheet/notes.md`、`docs/architectures/character-sheet.md`の可変行のデザイン指針、および既存の`FormulaTooltip`とdialogは、上記の画面契約を実現する範囲で適用する。design notes、実装結果のscreenshot、reviewer出力を、画面配置・導線・状態表現を決めるdesign画像の代わりにしない。
- 名称はdesktop / tablet / mobileで折り返してよい。名称列は既存スキルの名称列より短くし、`攻撃力／ガード値`または`防御力／ダメージ軽減`の式を折り返さないことを優先する。table全体、section、ページに横overflowを発生させない。
- 画面指定にない操作、confirmation、状態表現は実装都合で補完しない。不明点はこのissueのレビュー観点で確認し、実装開始前に決定する。

## 履歴: UI全面破棄後のsnapshot

- この節は再実装前の破棄時点のsnapshotであり、現在の実装状態ではない。最初の武器・防具UI実装は、既存スキルの画面デザイン、操作control、候補dialogの構造を遵守せず、ユーザーレビューで使用不能と判断されたため全面破棄した。部分修正や既存のUI / CSS / testの再利用はしない。
- 破棄した範囲は、武器・防具section Component、候補dialog Component、既存画面へのComponent結線、Component test、G17のE2E追加シナリオ、G17のVRT追加シナリオである。既存のE2E / VRT testファイル自体は復元済みである。
- 今回のstash復元で残す範囲は、dictionary、form values、schema、およびschema Node testである。items master-data adapter、純粋な性能計算logic、RHF form hookは現行treeに存在しないため、存在するものとして記録しない。画面上の武器・防具機能は存在しない。
- 今後のUI再実装では、今回破棄した構造を参照せず、最初に既存`SkillSection`と`SkillPickerDialog`のComponent、CSS、desktop / tablet / mobileの実画面状態を正本として確認する。武器・防具固有の列、式、候補dataだけを差分として加え、独自のcontrol / layout / dialog patternを作らない。
- この破棄後の状態では、UIの受入条件、Component test、E2E、VRT、actual screenshot確認はすべて未完了である。ユーザーがUI再実装を明示指示するまで、UI実装とE2E / VRT実行を再開しない。

## 現在の実装・検証状態

- 武器・防具のform値、master-data adapter、性能導出logic、RHF hook、section表示、候補dialog、Containerの選択とfocus復帰を実装した。候補dialogは既存`SkillPickerDialog`と同じdialog shell、候補名button、hover、二段詳細表示を用い、候補行を折り畳まない。
- 武器削除と防具クリアは、どちらもconfirmation dialogを開かない直接操作として実装した。武器の追加、並べ替え、最低1行、重複選択をRHF field arrayで扱う。
- 既存のpicker、confirmation dialog、pending action、focus復帰を確認した。G17で増えるのは武器と防具の候補dialogだけであり、既存Containerの状態とrefの扱いを共通hookへ移しても責務が単純化しないため、root orchestration hookは追加しない。
- `npm run check`、`npm run build`、Node 27件、Component / hook 93件、代表E2E 2件、target限定VRT（既存full-page snapshot 51件）、および7 state × 3 viewportのactual locator captureは実施済みである。詳細は「ビジュアルレビュー 1」「ビジュアルレビュー 2」と「レビュー指摘 21」を参照する。
- review serverは停止済みである。常駐serverを前提とするレビュー待ち状態ではない。
- レビュー指摘22・23の防具修正input同期、重複武器行のaccessible name、責務別テストを完了した。G17の未解決実装項目はない。

## 目的

`武器・防具` sectionへ、読み取り専用の生成アイテムデータをIDで選択する武器可変行と単一の防具行を追加する。武器・防具の性能と手動修正による最終値、展開詳細、候補選択dialogを、desktop / tablet / mobileで指定どおり表示する。

## 背景

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md` の`G17: 武器と防具を扱う。`
- 要件: `docs/requirements/character-sheet.md`の「アイテム」「経験点と信用」「エラーと警告」「共通動作」
- ゲームデータ: `data/generated/items.json`、`src/lib/types/item.ts`、`src/pages/data/items/weapons.mdx`、`src/pages/data/items/armors.mdx`
- architecture: `docs/architectures/character-sheet.md`の「可変行のデザイン指針」「Container / Presenterの責務」「状態と派生値の境界」「データ境界」「HTML / CSSの構造と責務」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/`の承認済みdraft。G17固有の列・dialog詳細はユーザー指定で確定しているため、`design-image-generation`は前提にしない。canonical VRT baselineの更新にはユーザーの明示承認を必要とする。
- 関連TODO: `docs/TODO.md`の「G17着手時にCharacterSheetContainerのdialog orchestrationをhookへ分離する要否を判断する」をこのGateで扱う。既存picker、confirmation dialog、pending action、focus復帰を列挙し、責務境界を単純化できる場合だけroot orchestration hookを導入する。

## Gate関係

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
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
- desktop / tabletの要約行は、左から並べ替え、名称、信用、`攻撃力／ガード値`、展開、削除とする。種別、技能、射程、装弾数は展開内容だけに置く。名称は折り返し可とし、式は折り返さない。`攻撃力／ガード値`には可視labelを置かない。
- mobileの要約行は、並べ替え、名称、信用、`攻撃力／ガード値`、展開、削除だけとする。種別、技能、射程、装弾数は要約行から除く。
- 武器行の展開は初期状態で閉じる。desktop / tablet / mobileともに、展開1行目へ種別、技能、射程、装弾数をこの順で置き、2行目へ効果を置く。
- `攻撃力／ガード値` headerは既存`FormulaTooltip`のtriggerとし、tooltip本文を次の完全一致の文言とする。`攻撃力やガード値が-や特殊の場合、修正を入力すると最終的な値が表示されます。`
- `攻撃力／ガード値`は、`武器の攻撃力／武器のガード値 + 攻撃の修正入力／ガードの修正入力 = 最終的な攻撃力／ガード値`の順で示す。修正inputは負数を許可し、可視labelなし・行名を含むaccessible nameありとする。mobileでは`＝`以降を次行へ折り返せるようにし、修正inputは2桁までを入力する幅とする。マスタ値が数値以外の場合、修正が空欄なら最終値を表示せず、修正が入力済みのときだけ修正値を最終値として示す。自由文は解析しない。

### 武器の候補選択dialog

- 候補dialogは`CharacterSheetDialog`を使い、Containerが開閉、対象row、操作元へのfocus復帰を保持する。各候補行の選択後は選択対象の武器行だけを更新して閉じる。
- 通常武器は、小見出しを上から`喧嘩`、`暗殺`、`発砲`、`格闘`、`干渉`の順で表示する。各小見出しの直下に、名称、信用、`攻撃力／ガード値`、展開のtable headerを必ず置く。
- 生き様がスミの場合は`武器化ナノマシン`、ケジメの場合は`サイバネ武器`を候補へ追加する。これらは技能ごとの追加小見出しを作らない。生き様の変更は既に選択した専用武器と各修正値を変更せず、以後に開く候補dialogだけを現在の生き様で絞り込む。専用武器とサイバネ・ナノマシンの選択は連動させない。
- dialogのdesktop / tablet / mobile候補行は、名称、信用、`攻撃力／ガード値`を1行目へ置き、種別、技能、射程、装弾数、効果などの追加情報を2行目へ表示する。候補行を折り畳まず、展開buttonを置かない。武器は重複選択可能なため、選択済み候補をdisabled / mutedにしない。

### 防具のform・候補選択dialog

- 防具は単一の行だけを持ち、並べ替えと削除buttonを表示しない。desktop / tablet / mobileの要約行に`クリア`buttonを置き、確認dialogを開かず選択IDと防御・ダメージ軽減修正を初期値へ戻す。これは行削除ではない。
- desktop / tablet / mobileの防具要約行は、名称、信用、`防御力／ダメージ軽減`、展開、クリアとする。`防御力／ダメージ軽減`の計算式は、`防具の防御力／防具のダメージ軽減 + 防御の修正入力／ダメージ軽減の修正入力 = 最終的な防御力／ダメージ軽減`の順で示す。修正inputに可視labelは置かず、行名を含むaccessible nameを与える。
- `防御力／ダメージ軽減` headerはtooltip triggerとし、tooltip本文は`防御力やダメージ軽減が-や特殊の場合、修正を入力すると最終的な値が表示されます。`とする。数値以外のマスタ値と空欄 / 明示修正の扱いは武器と同じpure logicの契約とする。
- 防具行の展開は初期状態で閉じ、装備制限と効果を表示する。装備制限の自由文は表示だけとし、能力値などを自動検証しない。
- 防具選択dialogはdesktop / tablet / mobileで、名称、信用、`防御力／ダメージ軽減`、装備制限を候補行の1行目へ置き、効果などの追加情報を2行目へ表示する。候補行を折り畳まず、展開buttonを置かない。防具は1枠のみであり、重複候補・複数行は作らない。

### 結線・検証・Visual Review

- `CharacterSheetFormPresenter`の既存`weapons-and-armor` slotへ武器・防具section Propsを渡す。dict、form values、schema、master-data、pure logic、form hook、section / dialog Component、Container orchestration、対象testsを、上記の境界に沿って追加または更新する。
- `docs/TODO.md`のG17 TODOに従い、既存のpicker、confirmation dialog、pending action、focus復帰を実装前に列挙する。武器削除と防具クリアにはconfirmationを追加せず、root orchestration hookを抽出するかだけを、その列挙でContainer / Presenter境界を単純化できる場合に決定する。
- E2EとVRTのspecを実装するが、実装直後には実行しない。実装後はpreviewを起動せず、既定portのdev serverを維持してユーザーレビューを待つ。ユーザーがレビュー完了を明示した後にだけ、`/character-sheet/`の武器未選択・複数武器・武器候補dialog・武器詳細展開・防具候補dialog・防具詳細展開・tooltip openをdesktop（1440px）、tablet（820px）、mobile（390px）でactual screenshotとして開き、対象E2Eとtarget限定VRTを実行する。canonical VRT baselineの更新は、targetの明示承認がある場合だけ行う。

## 初期スコープ外

- G18以降の生き様専用アイテム入力、G22の生き様変更時のカテゴリ表示・警告・消費信用集計・他カテゴリの追加削除を実装しない。
- 武器・防具の自由文効果、装備制限、戦闘処理、装弾数を解析、自動計算、自動検証しない。ダイスローラー、戦闘シミュレーター、装備状態の管理を追加しない。
- localStorage / IndexedDBの保存・復元、JSON export / import、エラー集約、sticky操作ペイン、CCFOLIA、全消去を実装しない。
- 新しいnpm package、UI kit、state store、汎用Item行Component、生成JSONの変更を追加しない。
- `docs/out-of-scope.md`のサーバー、DB、認証、クラウド保存などの初期スコープ外機能を実装しない。

## 完了条件

- [x] 武器が初期1行・最低1行を保ち、追加、並べ替え、削除、重複選択を行える。防具が単一行で、並べ替えと削除buttonを持たない。
- [x] 武器のdesktop / tablet要約行、mobile要約行、展開内容、名称と式の折り返し優先順位が指定どおりで、横overflowがない。
- [x] 防具のdesktop / tablet / mobile要約行、展開内容、候補dialogの装備制限までの表示と効果の展開表示、確認dialogを開かない`クリア`操作が指定どおりである。
- [x] 武器候補dialogが通常5 groupを指定順で表示し、スミでは武器化ナノマシン、ケジメではサイバネ武器を追加する。武器の重複候補はdisabledにしない。
- [x] 武器・防具の式、負数の修正input、数値以外のマスタ値と空欄 / 明示修正の最終値表示、指定tooltip文言がpure logicと表示で一致する。
- [x] tooltip、candidate dialog、展開、選択、確認dialogを開かない武器削除・防具クリア、Escape、閉じる操作、focus復帰がアクセシブルに動作する。
- [x] G17 TODOのdialog orchestration判断と、武器削除・防具クリアにconfirmationを追加しないこと、採用時のhook境界または非採用理由がissueへ記録される。
- [x] G17の代表E2E、Node / hook / Component test、およびtarget限定VRTを、現在の実装契約に対応する範囲で実装・実行する。
- [x] UI actual screenshotを対象route・state・viewportごとに開いて確認し、対象E2Eとtarget限定VRTの結果を記録する。canonical VRT baselineはtargetの明示承認がある場合だけ更新する。防具クリアの修正input同期を直した後、該当状態を再確認する。
- [x] `npm run check`、`npm run build`、変更責務に対応するNode / Vitest testが通る。

## チェックポイント

- [x] `CharacterSheetContainer`、Presenter、section hook、pure logic、master-dataの責務境界を保ち、RHF以外へ編集値を複製していない。
- [x] GitHub Pagesのサブパス公開、既存ルート、既存skill picker / confirmation dialog / focus復帰を壊していない。
- [x] 不要な依存関係、グローバルstyle、generated data変更を追加していない。
- [x] `FormulaTooltip`と`CharacterSheetDialog`の内部CSS責務を利用側から侵害していない。
- [x] errorとwarningを混同せず、各入力・行へ可視のerror理由を追加していない。
- [x] 関連TODOとdesign targetに矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

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

## 実装判断

- 武器・防具候補dialogのContainer orchestrationとfocus復帰は、初回のUI実装とともに破棄した。再実装時に既存skill pickerを確認してから、`CharacterSheetContainer`が持つか、既存構造を単純化するhookを新設するかを改めて決定する。
- 現在はUIへ結線するform hookを残していない。武器の削除と防具のクリアにconfirmation stateを持ち込まない要件は、UI再実装時にも維持する。
- G17のE2E / VRT specは初回UIとともに破棄した。再実装完了後も、ユーザーレビューが完了するまでpreview serverを起動せず、E2E / VRTを実行しない。ユーザーの既存指示によりdefault portのdev serverは維持する。

## ユーザーレビュー指摘

### 1. 武器要約行の情報量とmobile式の折り返し

- status: 未実装
- desktop / tabletの武器要約行に種別、技能、射程、装弾数を置くことは表示密度上無理があるため、これらは展開内容だけに表示する。
- mobileの`攻撃力／ガード値`の式は、全体を1行へ固定せず、`＝`以降を次行へ折り返せるようにする。
- 修正inputは2桁までの入力を想定した幅へ縮める。
- この指摘の実装・E2E / VRT・actual screenshot確認は、ユーザーの実装再開指示後に行う。

### 2. 既存のスキルUI・選択dialogデザインを無視した実装

- status: 未実装
- ユーザーはキャラクターシート行の`展開`だけを指定しており、候補選択dialogの候補行を折り畳むようには指示していない。候補dialogでは、効果などの追加情報を候補行の2行目へ常時表示し、展開buttonを置かない。
- 現状の武器・防具実装は、既存のスキル行・スキル選択dialogのUIを一切遵守していない。武器・防具の修正時は、既存実装を正本として、削除button、並べ替えcontrol、スキル選択icon、header、算出値の背景、行・headerの整列、追加buttonの位置とデザイン、候補dialogのhover feedbackとscroll構造を同じ設計言語へ合わせる。
- 特に、独自の削除button、独自の並べ替え／選択icon、headerの縦罫線、算出値のaccent muted背景欠如、header行の不整列、独自の追加button、候補dialog全体の縦scroll、スキル選択dialogと異なるUI / hover feedbackを修正対象とする。
- 実装開始時は、先に既存`SkillSection`と`SkillPickerDialog`のComponent・CSS・各状態の実画面を確認し、武器・防具固有の差分だけを追加する。独自のcontrol / layout / dialog patternを新設しない。
- この指摘の実装・E2E / VRT・actual screenshot確認は、ユーザーの実装再開指示後に行う。

## レビュー指摘 3

### 指摘事項

- 武器・防具と既存スキル行・候補dialogで、名称列の右端、候補dialogの名称／信用境界、スキルの名称／最大レベル境界を、既存のtable構造を壊さない縦罫線で明確にする。
- 最低1行を残すスキル行は削除不可でも削除buttonを残してdisabled表示にし、可視の削除buttonを行セル内の上下左右中央へ配置する。武器行を含む削除buttonの位置も同じ基準へ合わせる。
- `FormulaTooltip`を使うヘッダーが既存のmuted header colorから変化しないようにする。ヘッダー行自体へ外枠を追加せず、必要な列境界と行間の罫線だけを残す。
- 武器・防具・スキルの候補dialogで、候補の要約1行と効果などの詳細領域の間に横罫線を置く。候補行を折り畳まない。
- 防具の`クリア`は、既存の縁のクリアbuttonとフォントサイズ・色・形状を揃える。

### 判定

- source: ユーザー
- classification: valid
- local validation: 現在のG17実装と既存スキル実装では、列境界・tooltip付きヘッダーの色・削除不可時のbutton表示・候補の要約／詳細の区切りが一貫していない。G17は既存スキルUIを正本として整合させる契約であり、ユーザーがスキル側の同時修正を明示している。

### 対応方針

- `SkillSection` / `SkillPickerDialog`を共通の見た目の基準とし、`WeaponsAndArmorSection`と武器・防具候補dialogへ必要な列境界・区切り・control配置だけを揃えて適用する。
- ヘッダーの外枠は追加せず、各ComponentのCSSで対象列・対象要素を限定する。`FormulaTooltip`と`CharacterSheetDialog`の内部実装へ広いselectorを越境させない。
- 防具の`クリア`は既存の縁の実装を参照し、同じ視覚トークンで実装する。

### 対応完了チェックリスト

- [x] スキル行と武器・防具行の列境界、削除buttonのdisabled表示・中央配置を実装し、最低1行を残す削除制約を維持する
- [x] 武器・防具・スキル候補dialogの列境界と要約／詳細の横罫線、tooltip付きヘッダーの色、ヘッダー外枠なしを実装する
- [x] 防具`クリア`の視覚表現を既存の縁のclear buttonと揃える
- [x] npm run check
- [x] npm run build

## レビュー指摘 4

### 指摘事項

- 今回のsessionが分割されていても、ユーザー指示で作成したcurrent issueはdesign draftより優先する。武器の`攻撃力／ガード値`と防具の`防御力／ダメージ軽減`を、値と修正inputを分離した2列や独立した入力欄として表示しない。
- 各性能はissue指定どおり、`マスタ値 + 修正input = 算出値`の一続きの計算式として表示する。mobileでは`＝`以降を次行へ折り返せるようにする。
- 算出値は既存スキル行と同じaccent-muted領域へ置く。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: current `WeaponsAndArmorSection`は`ValueEditor`を武器の攻撃力・ガード値、防具の防御力・ダメージ軽減へそれぞれ独立して配置しており、issueの式表示契約から逸脱している。current issueは、design draftと競合する場合にユーザー指定を優先すること、mobileで`＝`以降を折り返すこと、既存スキルUIの算出値背景へ合わせることを既に明記している。

### 対応方針

- `ValueEditor`の2列構造を廃止し、各値を`マスタ値 + 修正input = 算出値`の計算式として一体表示する。desktop / tabletでは式を1行に保ち、mobileでは`＝`以降だけを許容された位置で改行する。
- 算出値の表示領域、修正inputの幅、tooltip triggerを既存`SkillSection`の視覚仕様と揃え、design draftの古い列構成を再採用しない。
- この指摘を優先して既存の関連レビュー指摘を実装し、対象viewportのactual screenshotを開いて確認してからE2E / VRTへ進む。

### 対応完了チェックリスト

- [x] 武器の`攻撃力／ガード値`と防具の`防御力／ダメージ軽減`を、2列の入力欄ではない指定の計算式表示へ修正する
- [ ] mobileで`＝`以降を折り返せ、修正inputが2桁幅に収まり、横overflowがないことをactual screenshotで確認する
- [x] 算出値を既存スキル行と同じaccent-muted領域へ置く
- [x] npm run check
- [x] npm run build

## レビュー指摘 5

### 指摘事項

- 武器の性能列は、攻撃力とガード値を別々の式として縦に置かず、`攻撃力／ガード値 + 攻撃修正／ガード修正 = 最終攻撃力／最終ガード値`という1本の式で表示する。防具も同様に、`防御力／ダメージ軽減 + 防御修正／ダメージ軽減修正 = 最終防御力／最終ダメージ軽減`とする。
- 元値もread-onlyの枠で囲み、最終値が未算出の場合は空欄にせず`-`を表示する。mobileでは`＝`以降だけを次行へ折り返す。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: レビュー指摘4への対応で性能列を1列へ戻したが、攻撃力・ガード値、防御力・ダメージ軽減を縦に分けた2本の式として実装しており、指定された対になる値の並びを満たしていない。また、元値をread-only枠にせず、最終値が未算出のとき空欄にしている。

### 対応方針

- 武器・防具の性能列を、元値ペア、修正inputペア、最終値ペアがそれぞれ`／`で結ばれる単一の式へ置き換える。元値と最終値は既存の`character-sheet-number-value`のaccent-muted表示を使う。
- mobileでは元値と修正inputを1行目に保ち、`＝`と最終値だけを2行目へ移す。未算出の最終値は共有の`-`表記へフォールバックする。

### 対応完了チェックリスト

- [x] 武器・防具の性能列を、値ペア・修正inputペア・最終値ペアの単一式へ修正する
- [x] 元値・最終値のread-only枠と未算出時の`-`、mobileの`＝`以降の改行を実装する
- [x] npm run check
- [x] npm run build

## レビュー指摘 6

### 指摘事項

- 武器の`攻撃力／ガード値`、防具の名称と`防御力／ダメージ軽減`のheaderは左寄せにする。
- 防具の`クリア`buttonは固定の高さにし、mobileで性能式が折り返されても高さを増やさず、行内で上下中央に置く。desktopで文字列が折り返されない状態では、枠内にわずかな上下余白を確保する。
- スキルを含め、formと候補選択dialogのheader行には列の区切り線を置かない。区切り線を置くのはデータ行のスキル名称／Lv入力、武器・防具名称／信用の境界だけとする。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘3への対応でheader行と候補dialogのheaderにも列罫線を追加し、データ行の限定された境界という指定を取り違えた。武器・防具のdata行にも全列へ罫線を置いているため、対象境界以外の区切りが残っている。

### 対応方針

- header行と候補dialog headerの罫線を除去し、data行の指定された名称列の右端だけへ縦罫線を残す。候補dialogも同じ境界規則を適用する。
- G17 headerの対象列を左寄せにし、防具`クリア`は固定高・中央配置・既存縁の視覚トークンを保つ。

### 対応完了チェックリスト

- [ ] G17 headerの対象列の左寄せと防具`クリア`の固定高・中央配置を実装する
- [ ] スキル・武器・防具と候補dialogのheader罫線を除去し、data行の指定境界だけに罫線を残す
- [ ] npm run check
- [ ] npm run build

## レビュー指摘 7

### 指摘事項

- header行はスキル・武器・防具および候補選択dialogのすべてで列罫線なしとする。
- data行は、既存の全列境界を維持し、スキルでは名称／Lv入力、武器・防具では名称／信用の境界も含めて全列を区切る。既存罫線を消す指示ではない。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘6で「指定境界だけに罫線を残す」と誤記・誤実装し、data行の既存の全列境界を除去した。ユーザー指定はheader行だけから罫線を除去し、data行は全列境界を維持したうえで不足していた名称右端の罫線を追加することである。

### 対応方針

- formと候補dialogでheader selectorへ縦罫線を置かず、data-row selectorだけで全セルの右境界（最終セルを除く）を定義する。

### 対応完了チェックリスト

- [x] header行に列罫線がなく、form・候補dialogのdata行には全列境界があることを実装する
- [x] npm run check
- [x] npm run build

## レビュー指摘 8

### 指摘事項

- 武器の`攻撃力／ガード値`と防具の`防御力／ダメージ軽減`の最終値は、flexで可変にせず、`2桁／2桁`を表示できる固定幅とする。
- 元値・最終値には、キャラクターシート共通の算出値read-only枠が持つ右側paddingを適用する。

### 判定

- source: ユーザー
- classification: valid
- local validation: 現在の性能式は最終値を可変`minmax()`列へ置き、Component CSSで共通のread-only値paddingを上書きしているため、算出値の固定幅と右側余白の契約を満たしていない。

### 対応方針

- 最終値のgrid列を`2桁／2桁`に必要な固定幅へ変更し、元値・最終値の局所padding上書きを除去して共通の`character-sheet-number-value`のpaddingを使う。

### 対応完了チェックリスト

- [x] 武器・防具の最終値を固定幅にし、元値・最終値へ共通right paddingを適用する
- [x] npm run check
- [x] npm run build

## レビュー指摘 9

### 指摘事項

- 固定幅にする対象は最終値だけでなく、元値・最終値の両方の算出値read-only枠である。どちらも`2桁／2桁`を表示できる同じ固定幅とする。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘8への対応で最終値だけを固定grid列にし、元値を可変列のまま残している。

### 対応方針

- 元値・最終値を同じ固定幅へ置き換える。mobileの`＝`前の行にも収まるよう、`2桁／2桁`に必要十分な幅を使う。

### 対応完了チェックリスト

- [x] 元値・最終値の算出値read-only枠を同一固定幅へ揃える
- [x] npm run check
- [x] npm run build

## レビュー指摘 10

### 指摘事項

- 性能式は列全体へflexやgridで引き伸ばさず、元値・修正input・最終値を含む計算式全体を左寄せで表示する。元値・最終値の枠内文字列を左寄せする指示ではない。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘9への対応で個々の算出値枠を固定幅にしたが、式全体を性能列幅へ伸ばすgridのまま残しており、計算式全体の左寄せになっていない。

### 対応方針

- 性能式のgridを内容幅で配置し、性能列内の開始位置へ寄せる。fixed-widthの算出値枠とmobileの`＝`以降の改行は維持する。

### 対応完了チェックリスト

- [x] 性能式全体を引き伸ばさず左寄せへ修正する
- [x] npm run check
- [x] npm run build

## レビュー指摘 11

### 指摘事項

- 元値・最終値の固定幅は、`2桁／2桁`と共通right paddingを実際に収める幅にする。現在の幅では収まっていない。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘9で設定した`3.75rem`は、`2桁／2桁`と共通right paddingを含む実際の表示幅として不足している。

### 対応方針

- 元値・最終値をより広い固定幅へ変更し、mobileの性能列もその内容幅を受け止める最小幅へ合わせる。

### 対応完了チェックリスト

- [x] `2桁／2桁`とright paddingを収める元値・最終値の固定幅を実装する
- [x] npm run check
- [x] npm run build

## レビュー指摘 12

### 指摘事項

- mobileでは、`元値／元値 + 修正値／修正値 = 最終値／最終値`を1行へ収めない。武器は`攻撃力 + 修正 = 最終値`、`ガード値 + 修正 = 最終値`の2行にし、防具も`防御力 + 修正 = 最終値`、`ダメージ軽減 + 修正 = 最終値`の2行にする。
- mobileの元値・最終値は、`2桁／2桁`ではなく単一の2桁値が入る固定幅へ縮小する。

### 判定

- source: ユーザー
- classification: valid
- local validation: mobileでペアの式を保つと、fixed-widthの元値・最終値、修正input 2つ、演算子が同一行に収まらない。

### 対応方針

- desktop / tabletはペアの式を維持し、mobileだけ性能ごとの単一式2行へ切り替える。mobileの元値・最終値は単一の2桁値と共通right paddingに必要な固定幅を使う。

### 対応完了チェックリスト

- [x] mobileの武器・防具性能式を性能ごとの2行表示へ切り替える
- [x] mobileの元値・最終値を単一2桁用の固定幅へ縮小する
- [x] npm run check
- [x] npm run build

## レビュー指摘 13

### 指摘事項

- mobileの性能式で横overflowを起こさないよう、元値・最終値のフォントサイズを小さくし、right paddingを除去する。
- mobileの元値・最終値の枠は修正inputと同じ高さに揃える。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: mobileの単一式でも共通read-only枠のフォントサイズ・right padding・minimum heightを維持しており、性能列で横overflowし、修正inputより高い。

### 対応方針

- mobile限定で元値・最終値を小さい文字、right paddingなし、修正inputと同一高へ上書きする。desktop / tabletの共通read-only枠は維持する。

### 対応完了チェックリスト

- [x] mobileの性能式でoverflowしない算出値のfont-size・padding・heightを実装する
- [x] npm run check
- [x] npm run build

## レビュー指摘 14

### 指摘事項

- mobileの算出値は、`.625rem`まで小さくしない。既存mobileセルと整合する読みやすいサイズへ戻す。
- right paddingを外した後の固定幅は、小さくしたフォントで単一の2桁値が収まる最小限の幅へ縮小する。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘13でoverflow回避を優先して`.625rem`と`2.5rem`を採用し、文字を必要以上に小さくしたまま枠幅も広く残している。

### 対応方針

- mobileの算出値を既存mobileセル相当の`.6875rem`へ戻し、right paddingなしで単一の2桁値を収める`2rem`固定幅にする。

### 対応完了チェックリスト

- [x] mobileの算出値font-sizeと固定幅を読みやすい2桁用の組み合わせへ修正する
- [x] npm run check
- [x] npm run build

## レビュー指摘 15

### 指摘事項

- mobile算出値のright paddingを0にせず、最小限の余白を残す。
- 算出値の文字はさらに大きくし、2桁が収まる範囲で固定枠を決める。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: right paddingを完全に除去した`.6875rem`の文字と`2rem`枠は、overflow回避を優先しすぎて余白と可読性を損ねている。

### 対応方針

- mobile算出値を`.75rem`へ上げ、左右の最小余白を含めて2桁を収める`2.125rem`固定幅にする。

### 対応完了チェックリスト

- [x] mobile算出値のfont-size、right padding、固定幅を読みやすい2桁用に調整する
- [x] npm run check
- [x] npm run build

## レビュー指摘 16

### 指摘事項

- mobileの性能式がまだ横overflowしている。
- 算出値枠のleft paddingだけが大きく見え、二桁用としては枠幅も広すぎる。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: `.75rem`へ戻した時に固定枠を`2.125rem`まで広げ、left paddingをright paddingより大きくしたため、式全体がmobile性能列の幅を超え、余白も非対称になっている。

### 対応方針

- mobileの元値・最終値枠を`1.875rem`へ縮め、上下左右を`.125rem`の同一paddingにする。`.75rem`の二桁数値が収まる内容幅を残しながら、式全体の幅を縮める。

### 対応完了チェックリスト

- [x] mobile算出値枠の幅とpaddingを対称な二桁用サイズへ修正する
- [x] npm run check
- [x] npm run build

## レビュー指摘 17

### 指摘事項

- 防具の`クリア`buttonがmobileで横overflowしている。
- buttonの縦横をもう少し縮める。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: mobileのbutton列が`2.75rem`なのに`min-width: 3rem`を維持しており、横overflowする。button高も性能inputより大きい。

### 対応方針

- desktopのclear buttonを`2.75rem × 1.625rem`へ縮める。mobileはbutton列を`2.5rem`、buttonを`2.375rem × 1.5rem`にして、input高と合わせつつ中央配置を維持する。

### 対応完了チェックリスト

- [x] 防具clear buttonの縦横とmobile列幅を縮めてoverflowを解消する
- [x] npm run check
- [x] npm run build

## レビュー指摘 18

### 指摘事項

- mobileの防具`クリア`buttonは、横overflowではなく右側が描画されていないように見える。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: mobile共通ruleがclear buttonの文字を`.6875rem`へ上書きし、3文字のラベルに対する内容幅を過度に狭めている。button自身も列幅を明示していないため、右端のborderと文字の表示を安定させられない。

### 対応方針

- mobile clear buttonを列幅いっぱいの`width: 100%`、`min-width: 0`にし、ラベルは既定の`.625rem`へ戻す。`2.5rem × 1.5rem`のbutton内で右端borderと3文字を確実に描画する。

### 対応完了チェックリスト

- [x] mobile clear buttonの幅とfont-sizeを列内描画用に調整する
- [x] npm run check
- [x] npm run build

## レビュー指摘 19

### 指摘事項

- 防具`クリア`buttonの右側が表示されない問題はmobileだけではない。
- mobileでbuttonを列幅いっぱいにしてはならない。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: 指摘18でmobileだけに`width: 100%`を追加したが、desktopの同じbuttonには右端の描画を保証する制約がなく、mobileの見た目も列幅いっぱいになって要件から外れた。

### 対応方針

- desktopとmobileの両方でclear buttonを列内中央の明示幅へ統一する。desktopは`2.5rem × 1.5rem`、mobileは`2.25rem × 1.375rem`とし、`max-width: calc(100% - .125rem)`で親列内の右端を確保する。buttonのpaddingも最小化して3文字のラベルを収める。

### 対応完了チェックリスト

- [x] clear buttonをdesktopとmobileの両方で列幅いっぱいにせず、列内寸法へ修正する
- [x] npm run check
- [x] npm run build

## レビュー指摘 20

### 指摘事項

- desktopの防具`クリア`buttonは右側に余白があってもright borderが表示されていない。原因を特定して修正する。

### 判定

- source: ユーザー
- classification: valid / implementation regression
- local validation: desktop `1280px`のbrowser computed styleでclear buttonは`40px`幅、親の最後の列は`56px`幅であり、右側に余白がある。一方、buttonの`border-right`は`0px none`だった。`.row > .armorLine > :last-child { border-right: 0; }`が`.clearButton`のborder指定より高いspecificityで、最後のgrid itemであるbuttonのright borderを消している。

### 対応方針

- 最後のcellの区切り線を除去する既存ruleは維持し、その後に`.row > .armorLine > .clearButton`だけのright borderを明示してbutton外枠を復元する。mobileのbutton幅・中央配置は変更しない。

### 対応完了チェックリスト

- [x] computed styleで原因となるselectorのcascadeを特定する
- [x] desktop／mobile共通でclear buttonのright borderを復元する
- [x] npm run check
- [x] npm run build

## レビュー指摘 21

### 指摘事項

- 今後追加する専用アイテムも、スキル・武器・防具で確定したheader、列表示、並べ替え、button、展開、追加button、折り返し、選択dialogのデザイン指針を踏襲する。
- `SkillSection`と武器・防具の個別CSSから、共通の見た目を共通CSSと共通classへ分離し、個別CSSは固有の列とデータ差分だけにする。
- 専用アイテム実装時にデザイン踏襲を破りにくくする。

### 判定

- source: ユーザー
- classification: valid
- local validation: 現在は`SkillSection`、`WeaponsAndArmorSection`、各候補dialogが個別CSSで同じ種別のheader、行、control、候補表示を持つ。G17のarchitectureは固有行Component・固有列の統合を禁止する一方、`docs/out-of-scope.md`は共通CSSの再利用を許容している。したがって、振る舞い・列定義を汎用Componentへ統合せず、視覚トークンとclassだけを共通化する方針は現行scopeと整合する。

### 対応方針

- character-sheet内に共通form design CSSを設け、header、データ行、列境界、並べ替え／削除／clear／追加button、展開領域、responsive折り返し、候補dialogの共通classを定義する。
- スキル・武器・防具はそれぞれのComponentと個別CSSを維持し、固有のgrid列、性能式、候補データ、操作制約だけを個別CSSへ残す。新しい汎用Item行Component、固有列の共通grid、業務ロジックの統合は行わない。
- 後続の専用アイテムGateでは、この共通CSSをdesignの出発点にし、固有差分を明示してから追加する。

### 対応結果

- `CharacterSheetFormList.module.css`へ、table header、行枠、並べ替えcontrol、選択button、展開button、追加button、候補dialogの外枠・候補行を共通classとして置いた。
- `SkillSection`、武器・防具section、スキル・武器・防具の候補dialogは共通classをCSS Modulesの`composes`で利用する。個別moduleには、固有のgrid列、性能式、候補の補足行だけを残した。
- 共通classはmobile規則も所有し、CSS Modulesの出力順が個別moduleのmobile上書きを壊さないようにした。行Component、form値、候補data、dialog orchestrationは統合していない。

### デグレ確認ループ

| 回数 | 確認                             | 結果                          | 対応                                                                                                            |
| ---- | -------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | `@character-sheet` target限定VRT | mobileの既存スキルstateに差分 | 共通classの読み込み順でmobile font size / paddingが再上書きされていたため、同じmobile規則を共通moduleへ移した。 |
| 2    | `@character-sheet` target限定VRT | 成功                          | existing full-page snapshot 51件が成功。G17 locator-only state 86件は比較対象外としてskip。                     |

- `@weapons-and-armor-*`、`@weapon-picker-open`、`@weapon-details-expanded`、`@armor-picker-open`、`@armor-details-expanded`、`@weapons-tooltip-open`のactual locator captureは、desktop / tablet / mobileの21 scenarioで成功した。

### 対応完了チェックリスト

- [x] 共通form design CSSとclassの責務・対象を定義する
- [x] スキル・武器・防具の共通デザインを共通classへ移し、個別CSSを固有差分へ限定する
- [x] 後続専用アイテムが参照するデザイン踏襲契約をissueへ記録する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 22

### 指摘事項

- 防具の性能修正inputは`defaultValue`を使う未制御inputであり、防具の`クリア`でRHFの`armor`値を初期化しても、可視inputの値が残る。クリア後に修正inputが空欄であるという画面契約を満たさない。
- G17のテストアーキテクチャは、性能導出をNode、RHF操作をhook、表示・dialog・focus復帰をComponent、代表操作をPlaywrightで確認すると定める。しかし、`getModifiedItemValue`、武器・防具master-data adapter、`useWeaponsAndArmorSectionProps`、section / picker dialog / Container結線を直接確認するG17固有のNode / hook / Component testがない。
- current issueの「UI未実装・レビュー待ち」という破棄後snapshotが、実装・Visual Review済みの現在状態と併記されていた。
- `docs/TODO.md`のG17 dialog orchestration判断は実装済みだが、未完了TODOの退避にはmergeまたはユーザー承認が必要なため、このreview時点では移動しない。

### 判定

- source: PR #69の通常Document Review / Technical Review（reviewed range: `d3546333fca85d157702d4986a41abd826685e8b8..3eb21ad2020596affbe411a84c4703f2091d7063`）
- classification: valid current-issue implementation and test gaps; valid documentation-state correction
- local validation: `WeaponsAndArmorSection`の性能修正inputは`defaultValue={modifiers[...] ?? ""}`であり、`useWeaponsAndArmorSectionProps`の`onClearArmor`はRHF値のみを`null`へ更新する。このため外部clear時に未制御inputのDOM値を同期しない。加えて、issueが定めるテスト境界に対応するG17固有のtestファイルを確認できなかった。破棄後snapshotを履歴として明示し、現在状態を本sectionへ集約した。

### 対応方針

- 防具をクリアしたとき、2つの修正input表示とRHFの両方が空欄 / `null`になるよう、inputの制御方式または外部同期を修正する。修正値を入力してからクリアするComponentまたはhook testを追加する。
- G17の境界に従い、数値・`特殊`・`null`の性能導出と候補groupをNode、武器の追加・移動・最低1行・重複選択、および防具の修正値を含むクリアをhook、式表示・詳細展開・dialogのEscape / 選択 / focus復帰をComponent / Container testで固定する。
- 実装修正とテスト追加は、ユーザーの明示承認後に開始する。TODOの退避は、PR mergeまたはユーザーによる完了扱い承認後に`docs/TODO-done.md`へ行う。

### 対応結果

- 性能修正inputをcontrolled inputへ変更し、防具クリア・外部値更新・小数の整数正規化でdesktop / mobileのDOM表示をRHF値へ同期した。
- Node、hook、Component / Container、代表E2Eを追加・更新した。TODOはユーザーのGate close指示により`docs/TODO-done.md`へ退避する。

## レビュー指摘 23

### 指摘事項

- 防具クリア後に未制御の性能修正inputがRHFの`null`へ同期しない問題は、レビュー指摘22で記録済みである。`1.9`のような小数を整数へ正規化した後もDOM表示が旧値のまま残ること、およびdesktop / mobileの別inputで旧表示が再出現し得ることを、修正対象とテスト条件へ追加する。
- 同じ武器IDを複数行で選択できるが、現状は`刀攻撃力の修正`、`刀詳細を開く`、`刀を削除`などが重複する。行名を含む一意のaccessible nameというarchitecture契約に反し、支援技術で対象行を識別できない。
- G17のNode / hook / Component test不足はレビュー指摘22で記録済みである。重複武器行の一意な操作名、修正inputの外部同期・小数正規化・viewport変更を追加の確認対象とする。

### 判定

- source: `.tmp/chatgpt-review.md`（browser-draft。remote snapshotはローカル実装とSSoTで検証した）
- classification: valid current-issue accessibility and test gaps; review指摘22のvalid findingを補強
- local validation: `WeaponsAndArmorSection`は`props.weaponRows.map((row, index) => ...)`で表示順を取得できるが、`WeaponFormRow`にはindexを渡さず、`legend`、修正input、詳細・移動・削除buttonのnameを武器名だけから生成している。`docs/architectures/character-sheet.md`は可視labelを省略する数値欄にも行名を含む一意のaccessible nameを要求する。ChatGPT reviewの「issue状態の矛盾」はレビュー指摘22で既に修正済みのためstaleとして新規対応に含めない。

### 対応方針

- 現在の表示順に基づく行番号を武器行のlegendと各操作・inputのaccessible nameへ含め、重複武器の並べ替え後も各行を識別できるようにする。表示用の武器名と内部`rowId`を同一視しない。
- 防具クリア、外部値更新、小数の整数正規化、desktop / mobileの表示切替後に、RHF値と各inputの表示値が同じであることを固定する。input DOMの統合か同期方式かは、既存のdesktop / mobile表示契約を保てる実装を選ぶ。
- Node / hook / Component testの不足はレビュー指摘22と一体で対応し、このsectionの追加条件を同じテスト設計へ含める。実装はユーザーの明示承認後に開始する。

### 対応完了チェックリスト

- [x] 重複武器行のlegend、修正input、詳細、移動、削除を一意のaccessible nameで識別できる
- [x] 防具クリア・外部更新・小数正規化後に、RHF値とdesktop / mobileの修正input表示が一致する
- [x] 重複武器の並べ替えと、修正input同期をComponentまたはhook testで確認する
- [x] レビュー指摘22のNode / hook / Component test範囲と重複なく統合する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`。G17追加stateは`@weapons-and-armor-default`、`@weapons-and-armor-multiple-weapons`、`@weapon-picker-open`、`@weapon-details-expanded`、`@armor-picker-open`、`@armor-details-expanded`、`@weapons-tooltip-open`。
- route / states / viewports: `/character-sheet/`の未選択、複数武器、武器候補dialog、武器詳細展開、防具候補dialog、防具詳細展開、武器性能tooltip open。desktop（1440px）、tablet（820px）、mobile（390px）。

### レビュー結果

| 対象                            | 判定 | 差分                                              | 対応                                                                                                                                      |
| ------------------------------- | ---- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 武器・防具のlocator capture     | OK   | なし                                              | 7 state × 3 viewportのactual snapshotを取得し、局所画面を開いて確認した。                                                                 |
| 既存character-sheet default VRT | OK   | 初回比較でdesktop、ultrawide、tablet、mobileの4件 | ユーザー承認後、G17前のページ高を持つbaselineを、武器・防具sectionを含む現行画面へ更新した。                                              |
| 既存character-sheet全target VRT | OK   | 初回比較で既存baselineとの差分21件                | `@character-sheet`の既存full-page snapshot 51件を更新し、更新後の同一target比較は51件成功した。G17追加stateはlocator-onlyのまま維持した。 |

### 実画面確認

- `/character-sheet/` / 未選択・複数武器・武器詳細展開・防具詳細展開 / desktop・tablet・mobile:
  - full-page overview: 取得しない。局所表示契約の根拠には用いない。
  - locator screenshot: `data-weapons-and-armor-section` のoriginal-pixel-resolution snapshot。
  - checked acceptance criteria: header、列境界、read-only値と修正input、性能式、追加／並べ替え／削除／clear button、mobileの性能2行化、展開詳細、横overflow・clip。
  - result: 各viewportで確認した局所要素に横overflow・clipはない。
- `/character-sheet/` / 武器候補dialog・防具候補dialog / desktop・tablet・mobile:
  - full-page overview: 取得しない。
  - locator screenshot: `data-weapons-and-armor-section`と各dialog本体のoriginal-pixel-resolution snapshot。
  - checked acceptance criteria: dialog外枠、header、候補の名称／信用境界、候補要約／詳細の横罫線、mobileの行内折返し、横overflow・clip。
  - result: 各viewportでdialog本体と候補行が表示範囲に収まり、対象の罫線と折返しを確認した。
- `/character-sheet/` / 武器性能tooltip open / desktop・tablet・mobile:
  - full-page overview: 取得しない。
  - locator screenshot: `data-weapons-and-armor-section`と`tooltip`本体のoriginal-pixel-resolution snapshot。
  - checked acceptance criteria: header色、tooltip本文、section外へ表示されるtooltip本体、横overflow・clip。
  - result: tooltip本体をsectionとは別に確認し、本文と外枠が表示範囲に収まる。

### 自己修正した項目

- [x] VRT scenarioの詳細button locatorを、実装のaccessible name（`刀詳細を開く`、`チンピラ服詳細を開く`）へ修正した。

### baseline更新

- ユーザーの明示指示により、`npm run visual:update -- --grep '@vrt.*@character-sheet(?:\\s|$)'`で既存full-page snapshot 51件をローカル更新した。
- 更新後に同じgrepで通常比較し、full-page snapshot 51件は成功した。G17追加の7 state × 3 viewportはlocator-onlyであり、canonical full-page baselineを作成しない。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（該当する場合）

## ビジュアルレビュー 2

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`、およびG17 locator-only stateの`@weapons-and-armor-default`、`@weapons-and-armor-multiple-weapons`、`@weapon-picker-open`、`@weapon-details-expanded`、`@armor-picker-open`、`@armor-details-expanded`、`@weapons-tooltip-open`。
- route / states / viewports: `/character-sheet/`の未選択、複数武器、武器候補dialog、武器詳細展開、防具候補dialog、防具詳細展開、武器性能tooltip open。desktop（1440px）、tablet（820px）、mobile（390px）。

### レビュー結果

| 対象                                 | 判定 | 差分 | 対応                                                                                                                   |
| ------------------------------------ | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------- |
| G17 locator capture                  | OK   | なし | 7 state × 3 viewportの21 scenarioをcaptureし、section、dialog、tooltipの原寸locator screenshotをすべて開いて確認した。 |
| 既存`@character-sheet` full-page VRT | OK   | なし | 既存baselineとの差分artifactなしで完了した。G17 locator-only stateは通常比較でskipされる。                             |

### 実画面確認

- `/character-sheet/` / 未選択、複数武器、武器詳細展開、防具詳細展開 / desktop・tablet・mobile:
  - locator screenshot: `data-weapons-and-armor-section` のoriginal-pixel-resolution snapshot。
  - checked acceptance criteria: 行番号を含む操作名の導線、修正input、性能式、展開、mobileの性能2行化、横overflow・clip、button bounds。
  - result: 各viewportで列、式、展開内容、button、inputにclip・overflowはない。
- `/character-sheet/` / 武器候補dialog、防具候補dialog / desktop・tablet・mobile:
  - locator screenshot: `data-weapons-and-armor-section`と各dialog本体のoriginal-pixel-resolution snapshot。
  - checked acceptance criteria: dialog外枠、候補行、名称／信用／性能列、mobileの折返し、横overflow・clip。
  - result: 各dialogと候補行は表示範囲に収まり、候補名と操作導線は維持される。
- `/character-sheet/` / 武器性能tooltip open / desktop・tablet・mobile:
  - locator screenshot: `data-weapons-and-armor-section`と`tooltip`本体のoriginal-pixel-resolution snapshot。
  - checked acceptance criteria: header trigger、tooltip本文、section外のtooltip本体、横overflow・clip。
  - result: tooltip本文と外枠は全viewportで表示範囲に収まる。

### 自己修正した項目

- [x] VRT helperの武器picker locatorを、行番号付きaccessible nameだけへ完全一致させた。

### baseline更新

- baseline更新は不要。accessible nameとinput同期の変更は既存canonical full-page screenshotに差分を発生させなかった。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（該当する場合）

## 備考

- このissueは、G17の実装契約と完了記録としてユーザーの武器・防具画面指定を記録する。
- 武器削除は確認dialogを開かず、最低1行を残して直接行う。防具の`クリア`も確認dialogを開かず、単一行を未選択状態へ戻す。G17 TODOのdialog orchestration確認は、これらの操作をconfirmationへ昇格させるためではなく、候補dialogの状態とfocus復帰を既存Containerで保つか判断するために行う。
- 初回実装時の「ユーザーレビュー完了までE2E / VRTを実行しない」指示は、後続のユーザー指示で解除済みであり、実行結果はビジュアルレビュー1・2に記録した。
