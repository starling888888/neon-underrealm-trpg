# ex-02-25-sheet-error-summary

## 最優先のデザイン入力

- `docs/requirements/character-sheet.md`、`docs/design/character-sheet/notes.md`、および`.tmp/design/character-sheet/`の承認済みdesktop / tablet / mobile draftを照合する。対象は既存の操作ペイン、エラーstatus、desktop dialog、tablet / mobile menuである。
- ユーザーの最新指示を優先する。エラーがあるdesktopのstatus外枠・文言・`確認`button、tablet / mobileのmenu buttonを`danger`カラーにする。desktop dialogはvisible titleを置かずアクセシブル名を`エラー`とし、本文を空状態`エラーはありません。`または`エラーがN件あります。`と通常本文色の順序なしリストから始め、`閉じる`buttonはmuted outlineにする。tablet / mobileのmenuも見出しを置かず、同じ件数文言と順序なしリストを直接表示する。縁の入力済み件数が結べる縁の上限を超えた状態はerrorとして集約する。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningは既存の局所フィードバックに留め、集約しない。
- 個別入力・行の可視エラー文言は増やさない。既存の局所error / warning表現、section配置、menuの固定位置と`CharacterSheetDialog`の既存focus・Escape契約を保つ。
- design notes、実装結果のscreenshot、reviewer出力をdraft画像の代わりにしない。design notesとdraftに競合する箇所は、上記ユーザー指示を採用して同じtaskでdesign notesを整合する。

## 目的

現在のフォーム値とマスタデータからゲームルール上のエラーを重複なく集約し、desktopでは確認dialog、tablet / mobileでは操作menu内で、色だけに依存しないテキスト一覧として確認できるようにする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の`G25`
- 要件: `docs/requirements/character-sheet.md`の「エラーと警告」「共通動作」「非機能要件」
- architecture: `docs/architectures/character-sheet.md`の「Feature境界」「Container / Presenterの責務」「状態と派生値の境界」「データ境界」「HTML / CSSの構造と責務」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/desktop-error.png`、`desktop-error-dialog.png`、`tablet-error.png`、`tablet-menu.png`、`mobile-menu.png`
- 関連TODO: `docs/TODO.md`にG25を直接の実装先とする項目はない。永続スキルID変更の検出、JSON形式の互換性、G31のVisual Review実行経路は対象外として維持する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G25: エラーの集約表示を扱う。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningは既存の局所フィードバックに留める。`

このissueはG25だけを実装する自己完結した契約である。ユーザー指示により新規branchは作成せず、現在の親branch `ex-02-web-character-sheet` で実装する。G26以降のJSON export / import、CCFOLIAコピー、全初期化、ヘルプの業務処理と文言は扱わない。

## アーキテクチャ適用

| architecture節              | このGateで許可する変更                                                                                                                                                           | このGateで禁止する変更                                                                                                                                                                           | 確認するテスト層                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Feature境界 / データ境界    | `logic/`にフォーム値・解決済みマスタデータを入力としてerrorの安定した識別子、対象行情報を返すpureな集約境界を置く。UI文言はその識別子を入力に専用の表示変換で組み立てる。        | Component、RHF、Zod schema、localStorageへ集約結果や表示文言を保持しない。ゲームデータ名を`dictionary.ts`へ複製しない。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningを集約しない。 | Node logic                                |
| 状態と派生値の境界          | `CharacterSheetContainer`またはform adapterが現在のRHF値から集約ViewModelを一度だけ作り、root-levelのActionPaneとdialogへ表示props / callbackだけを渡す。                        | RHF外の編集state、`formState.errors`の別系統、個別sectionからActionPaneへの逆方向参照を追加しない。                                                                                              | RHF hook、Component                       |
| Container / Presenterの責務 | Containerはdialog open state、`確認`trigger、Escape / close後のfocus復帰を扱う。ActionPaneとdialogはRHF・Zod・保存・browser APIへ直接アクセスしない。                            | Containerへ各ゲーム規則をベタ書きしない。Presenterやleaf Componentでerror条件を再計算しない。                                                                                                    | Component、browser E2E                    |
| HTML / CSSの構造と責務      | error summaryを意味のある見出し、状態文、`ul` / `li`で表し、`aria-live`、dialogのlabel、triggerの状態を既存構造と整合する。error時のdanger色は色以外の件数・本文一覧と併用する。 | 個々の入力の直下へ可視error理由を追加しない。エラー一覧に未指定の入力ジャンプ、並べ替え操作、icon-onlyの意味伝達を追加しない。                                                                   | Component、browser E2E、限定Visual Review |

## 対象範囲

- 既存のbuild、credit、各skill区分、サイバネ、ナノマシン、ドラッグなどが既に導出している局所errorを入力に、同じ違反を一件として集約するpure logicとViewModelを追加する。集約順はDOM順や入力行の偶発順ではなく、固定の識別子順とする。複数行を対象にする違反は対象行ごとに重複せず、利用者が判断できる一文へまとめる。
- エラー文言は各ゲーム規則の識別子と現在の表示値・解決済み名称から専用translatorで生成する。Zod v4の`error` / global error mapは、現在の`characterSheetFormSchema`が担う構造・整数正規化と、G25で扱う横断的なゲームルール違反を混同するため使用しない。`dictionary.ts`には固定の操作labelだけを残し、動的な集約文言を格納しない。
- 初期文言は、経験点・信用の不足、能力値ポイント配分・成長点、縁の上限超過、流儀重複・Lv不正、各スキルのLv下限 / 最大Lv・重複・`advanced`条件・区分合計、共通スキル上限、サイバネ / ナノマシン埋め込み上限、固定サイバネ部位不一致、ドラッグ重複を利用者が区別できる日本語にする。現在の生き様では通常使用不可の専用アイテムカテゴリの`通常使用不可`表示とwarningカラーは既存の局所フィードバックとして保ち、件数化・一覧化しない。
- desktopの固定幅error statusは、エラーなしでは既存の通常色・`エラーはありません。`・通常の`確認`buttonを維持する。エラーありでは外枠、件数文言、`確認`buttonをdangerカラーにし、`エラーがN件あります。`を表示する。`確認`で既存dialog shellを使ったerror dialogを開く。
- desktop error dialogはvisible titleを置かず、アクセシブル名を`エラー`とする。本文の先頭に空状態`エラーはありません。`またはdangerカラーの`エラーがN件あります。`を置き、その下に通常本文カラーのerrorを`ul`で表示する。errorなしのdialogでも同じ確認導線で内容を確認できる。
- tablet / mobileでは、エラーありの右下menu buttonをdangerカラーにし、開いたmenu内でdangerカラーの`エラーがN件あります。`と通常本文カラーの`ul`を直接表示する。エラーなしでは既存の`エラーはありません。`を表示する。desktopの確認dialogをtablet / mobileへ追加しない。
- `docs/design/character-sheet/notes.md`を上記の確定した文言、desktop status、desktop dialog、tablet / mobile menu buttonのdanger状態に整合する。実装・unit / hook / component / browser testを追加または更新する。
- UIを実装した後、E2E・VRTのspecを追加・更新する前に、既定portのdev serverで対象routeをユーザーが確認する。ユーザーの動作確認完了の明示指示後にだけ、対象E2E・VRT specを追加・更新し、errorなし・代表的な複数error・tablet / mobile menu open・desktop dialog openをdesktop（1440px）、tablet（820px）、mobile（390px）でactual screenshotとして開き、対象限定E2E / VRTを実行する。レビュー待ちにpreview serverは起動しない。canonical VRT baselineの追加・更新は、ユーザー明示承認がある場合だけ検討し、G31まで既存のGit管理snapshotを変更しない。

## 初期スコープ外

- JSON export / import、CCFOLIAコピー、全初期化、ヘルプ、保存・復元、画像失敗dialogの動作・文言を変更しない。
- Zod schemaへゲーム規則の`superRefine`、global error map、RHFの`setError`を導入しない。入力値の正規化、保持、局所error表示の契約を変更しない。
- エラー一覧から該当入力へのscroll・focus移動、修正button、フィルター、エラーの自動解消操作を追加しない。
- 個別入力・行・sectionに新しい可視error本文を追加しない。現在の生き様では通常使用不可の専用アイテムカテゴリの既存warning feedbackを変更・集約しない。warningの全画面notification、warningでのmenu buttonのdanger化、warning dialogを追加しない。
- 新しいnpm package、state store、UI kit、i18n framework、server、DB、認証を追加しない。`docs/out-of-scope.md`の初期スコープ外も実装しない。

## ユーザー承認による未実装のスコープ拡張

2026-07-30のユーザー指示により、縁の上限超過error表示と行操作をG25へ追加する。

- 縁の上限超過行のtext inputは、他の入力欄のerrorと同じ背景を保ち、dangerカラーはborderなど既存のerror表現だけで示す。`--color-danger-soft`の背景は使わない。
- 縁の入力行の左端へ、スキルと武器・防具で既存の順序入れ替えcontrolと同じ操作契約・アクセシブル名・グレー背景を持つcontrolを追加する。行の並びを変更して、上限内に残す縁と上限外となる縁を利用者が選べるようにする。
- 上限超過行を自動削除しない既存の保持契約は維持する。上限超過時の既存delete actionは任意操作として残し、順序入れ替え導線と併存させる。
- 実装前に、既存の順序入れ替えcontrolのComponent、design intent、desktop / tablet / mobileの表示・操作状態、必要なtarget限定E2E / VRTを確認する。

- [x] 上限超過行のtext input backgroundが他のerror inputと揃い、danger borderだけを示す。
- [x] 縁の各行が既存の順序入れ替えcontrolと同じ上下操作を持ち、移動後も入力内容・上限error・削除契約を保つ。

この拡張は、error summary自体、通常使用不可の専用アイテムカテゴリのwarning除外、既存の保存・JSON出力契約を変更しない。

## 取り込み済みのユーザー指摘

- 縁の入力済み件数が結べる縁の上限を超える状態は、通常使用不可の専用アイテムカテゴリだけに限定するwarningではなく、局所表示とerror summaryの両方でerrorとして扱う。summaryには`入力済みの縁が結べる縁の上限を超えています。`を一件だけ置く。
- tablet / mobileのerror時のdanger色は、右下のmenu buttonへだけ付ける。ヘルプbuttonは通常色を保つ。この状態をComponent testで両buttonのclassとして確認する。
- desktop error dialogにはvisible titleを置かず、本文を`エラーはありません。`または`エラーがN件あります。`から始める。dialogのアクセシブル名だけを`エラー`として保つ。
- tablet / mobileの開いたmenu内にも`エラー`のsection見出しを置かず、空状態または件数文言から始める。
- desktop error dialogの`閉じる`buttonはmuted outlineとする。

## 完了条件

- [x] 現在のフォーム値から、既存の局所errorと矛盾しない、重複のない安定順の集約ViewModelがpure logicで導出される。
- [x] dynamicなエラー文言が、Zodの構造エラーや`dictionary.ts`へ混在せず、識別子と実行時値を入力に専用translatorで生成される。
- [x] desktopのerror statusは、エラー時だけ外枠・文言・`確認`buttonをdangerカラーにし、固定幅と操作列の配置を保つ。
- [x] desktopの`確認`で、visible titleなし・アクセシブル名`エラー`、空状態またはdangerカラーの件数文言、通常本文カラーの`ul`を持つdialogが開き、既存dialogのclose・Escape・focus復帰を保つ。
- [x] tablet / mobileのmenu buttonはエラー時だけdangerカラーになり、開いたmenuで空状態またはdangerカラーの件数文言と通常本文カラーの`ul`を直接表示する。
- [x] 個別のerror入力・行・sectionの可視本文を増やさず、現在の生き様では通常使用不可の専用アイテムカテゴリの既存warning feedback、入力値の保持・保存・JSON出力の既存契約を変えない。
- [x] `docs/design/character-sheet/notes.md`がユーザー指定の状態・文言へ整合している。
- [x] 関連TODOを追加せず、対象外のTODOを変更していない。
- [x] UI系タスクとしてdesign target、actual screenshotの確認対象、canonical VRT baselineを無断更新しない扱いが記録されている。
- [x] `npm run check`、`npm run build`、関連Node / Vitest / browser testが通る。

## チェックポイント

- [x] 既存routeとerrorなしの操作ペインが壊れていない。
- [x] GitHub Pagesのsubpath公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`、`docs/design/character-sheet/notes.md`、親Gate planと矛盾していない。
- [x] UI実装後かつE2E・VRT specを追加・更新する前に、既定portのdev serverでユーザーが対象routeを動作確認している。
- [x] ユーザーの動作確認完了の明示指示後にだけ、desktop / tablet / mobileの指定stateのactual screenshotを実際に開き、error色、本文色、`ul`、clip / overflow、dialog / menuの状態を確認している。
- [x] ユーザーの動作確認完了の明示指示後にだけ、変更targetのE2E・VRT specを追加・更新し、限定VRTで比較してcanonical baselineの扱いを記録している。
- [x] ユーザーの未コミット変更を破壊していない。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`。`action-pane-desktop`、`action-controls`、`action-menu-open`、`action-pane-error`、`action-controls-error`、`action-menu-error`、`error-dialog`、`error-dialog-empty`、`bonds-default`、`bonds-input`、`bonds-error`。
- route / states / viewports: `/character-sheet/`。errorなしのdesktop action pane / desktop dialog、tablet / mobile controls / menu、代表的な2 errorのdesktop status / dialog、tablet / mobile controls / menu、縁のdefault / input / over-limitをdesktop（1440px）、tablet（820px）、mobile（390px）で確認した。desktop専用stateはdesktopだけとした。

### レビュー結果

| 対象                     | 判定 | 差分 | 対応                                                   |
| ------------------------ | ---- | ---- | ------------------------------------------------------ |
| 操作ペイン・dialog・menu | OK   | なし | errorなしと2 errorのstateを追加・更新した。            |
| 縁                       | OK   | なし | default / input / over-limitの既存baselineを更新した。 |

### 実画面確認

- `/character-sheet/` / errorなし / desktop:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-pane-desktop-desktop.png`、`test-results/visual/character-sheet/dialogs/error-dialog-empty-desktop.png`
  - 確認: 通常色のstatus、`エラーはありません。`、visible titleなしのdialog、muted outlineの`閉じる`、clip / overflowなし。
- `/character-sheet/` / errorなし / tablet・mobile:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-controls-{tablet,mobile}.png`、`test-results/visual/character-sheet/sections/action-menu-open-{tablet,mobile}.png`
  - 確認: ヘルプとmenu buttonが通常色、menuが件数見出しなしで`エラーはありません。`から始まり、clip / overflowなし。
- `/character-sheet/` / 代表的な2 error / desktop:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-pane-error-desktop.png`、`test-results/visual/character-sheet/dialogs/error-dialog-desktop.png`
  - 確認: status枠・件数・`確認`がdanger、visible titleなしのdialogがdanger件数と通常本文色の`ul`を表示し、折返し・button境界・clip / overflowなし。
- `/character-sheet/` / 代表的な2 error / tablet・mobile:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-controls-error-{tablet,mobile}.png`、`test-results/visual/character-sheet/sections/action-menu-error-{tablet,mobile}.png`
  - 確認: menu buttonだけがdanger、ヘルプは通常色、menuは見出しなしでdanger件数と通常本文色の`ul`を表示し、折返し・clip / overflowなし。
- `/character-sheet/` / 縁 default・input・over-limit / desktop・tablet・mobile:
  - locator screenshot: `test-results/visual/character-sheet/sections/bonds-{default,input,error}-{desktop,tablet,mobile}.png`
  - 確認: 各行左端のグレー背景の上下control、入力済み値、over-limit inputの通常backgroundとdanger border、delete action、section内の配置・折返し・clip / overflowなし。

### 自己修正した項目

- [x] browser E2Eの既存縁error locatorを、error summary listとの重複を避けるsection scopeへ更新した。

### 人間判断が必要な差分

- なし。2026-07-30のユーザー明示指示により、G25のlocal canonical baselineを追加・更新した。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した。
- [x] baseline更新をユーザー明示承認として記録した。
- [x] `npm run check` が通る（該当する場合）。
- [x] `npm run build` が通る（該当する場合）。

## レビュー指摘 1

### 指摘事項

- プライマリ流儀とその他流儀の同一重複が、同じ衝突に対して2件のsummary errorになる。
- summary adapterが行ID・解決済み名称をbooleanへ潰しているため、その他流儀、スキル、ドラッグ、固定サイバネ部位などの行errorで、利用者が該当行を一覧から特定できない。
- tablet / mobileの閉じた操作menu buttonがdanger色だけで、支援技術へエラーの有無・件数を伝えない。
- `docs/requirements/character-sheet.md`の「エラーと警告」が縁最大数超過をwarningとし、G25のerror扱いと矛盾する。

### 判定

- source: `.tmp/chatgpt-review.md`（ChatGPT review）およびpush後のNon Gate Review（local-agent）。ChatGPT reviewのsource snapshot `16ce7c1`は現在のHEADと一致する。
- classification: valid
- local validation: `calculateBuild()`はプライマリ／その他流儀の同一衝突を双方のderived flagへ出し、`getCharacterSheetErrorSummary()`は別codeとして加算する。presenter adapterは行情報をbooleanへ変換し、translatorは固定文言だけを返す。menu buttonのaccessible nameはopen / closeだけで、閉じた状態にerror件数を表すtext alternativeはない。requirements 197行は縁最大数超過をwarningと明記している。
- failure-log: 通常の実装レビュー指摘であり、workflow逸脱・未確認報告・同種失敗の反復には該当しないため追加しない。

### 対応方針

- 流儀重複は同一の衝突を一つのerror factに統合し、プライマリとその他流儀の名称を含む一文にする。その他流儀同士の重複は、重複する行ごとに名称を示す。
- 集約inputをbooleanではなく安定したrow ID・分類・解決済みの流儀名／スキル名／アイテム名／固定部位名を持つerror factへ変更する。summary listは、行ごとの違反なら該当する行の名称と現在のLvまたは不正条件を一文で示す。
- 2026-07-30のユーザー指示により、同じ規則でも該当行ごとにsummary errorを増やしてよい。件数は表示するerror factの件数とし、順序は規則種別、section、行の安定順に固定する。局所入力・行の可視error本文は増やさない。
- tablet / mobileのmenu buttonは、open / closeの状態とerrorなし／`エラーがN件あります。`を含むaccessible nameまたは同等のtext alternativeを持つ。desktop statusと開いたmenu / dialogのtext一覧は維持する。
- 実装修正と同じtaskでrequirementsの縁最大数超過をerrorへ統一し、design notes・VRT・Node / Component / browser E2Eを行単位の文言、重複統合、支援技術向けmenu状態へ更新する。

### 対応完了チェックリスト

- [x] 同一のプライマリ／その他流儀衝突が1件のsummary errorになる。
- [x] 行単位のsummary errorが、該当する名称・Lvまたは不正条件を示し、行ごとの件数と安定順を保つ。
- [x] tablet / mobile menu buttonが閉じた状態でもerror件数を支援技術へ伝える。
- [x] requirementsの縁最大数超過をerrorへ統一する。
- [x] Node / Component / browser E2Eを行単位のsummaryとmenuのtext alternativeへ更新する。
- [x] 変更targetのVRTをユーザー確認後に更新する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- error factの組み立てと集約呼び出しが`useCharacterSheetFormPresenterProps`へベタ書きされ、Presenterの構成責務と横断的なerror集約が混在している。
- 行走査を含むsummary ViewModelの生成は、入力に変化がないrenderでも不要に新しいobjectを生成しないようmemo化する必要がある。

### 判定

- source: ユーザー実装レビュー（2026-07-30）。
- classification: valid
- local validation: 現状のPresenter hookはerror fact配列、流儀・スキル・縁・アイテムの行走査、translator入力の組み立てを直接持つ。root-level action UIへ渡すViewModelは横断的な導出であり、専用hookへ分離する。

### 対応方針

- `useCharacterSheetErrorSummary`をform adapter配下へ追加し、既存section presenter stateからerror factを組み立てる責務と`getCharacterSheetErrorSummary()`呼び出しを移す。
- 既存のerror code、文言、行単位の件数・順序、UI propsは変えない。専用hookは`useMemo`でsummary ViewModelを返し、依存するsection inputが変わらない限り同じsummary objectを保つ。
- VRT対象の画面状態とbaselineは、ユーザーが今回明示承認した範囲だけを更新する。切り出し以外のUI・ゲームルール・入力状態の変更は行わない。

### 対応完了チェックリスト

- [x] error集約の行走査とViewModel生成が専用custom hookへ分離される。
- [x] summary ViewModelが`useMemo`でmemo化され、Presenterがhookの結果だけを渡す。
- [x] Node / Component / browser E2Eと対象限定VRTが通る。
- [x] 承認済みの対象canonical VRT baselineを更新し、差分比較とactual screenshot確認を記録する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 2

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`。`action-pane-desktop`、`action-controls`、`action-menu-open`、`action-pane-error`、`action-controls-error`、`action-menu-error`、`error-dialog`、`error-dialog-empty`。
- route / states / viewports: `/character-sheet/`。errorなしのdesktop action pane / dialog、tablet / mobile controls / menu、代表的な2 errorのdesktop status / dialog、tablet / mobile controls / menuを対象とした。desktop専用stateはdesktopだけとした。

### レビュー結果

| 対象                        | 判定 | 差分                                                                               | 対応                                 |
| --------------------------- | ---- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| action pane / controls      | OK   | なし                                                                               | 現行baselineとの比較が通過した。     |
| error menu / dialog         | OK   | 行単位の縁文言への置換でtablet / mobile menuとdesktop dialogの本文だけが変化した。 | ユーザー承認により3 baselineを更新。 |
| 空error dialog / empty menu | OK   | なし                                                                               | 現行baselineとの比較が通過した。     |

### 実画面確認

- `/character-sheet/` / errorなし / desktop:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-pane-desktop-desktop.png`、`test-results/visual/character-sheet/dialogs/error-dialog-empty-desktop.png`
  - 確認: 通常色のstatus、空状態文言、visible titleなしのdialog、muted outlineの`閉じる`、clip / overflowなし。
- `/character-sheet/` / errorなし / tablet・mobile:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-controls-{tablet,mobile}.png`、`test-results/visual/character-sheet/sections/action-menu-open-{tablet,mobile}.png`
  - 確認: ヘルプとmenu buttonが通常色、menuは件数見出しなしで`エラーはありません。`から始まり、clip / overflowなし。
- `/character-sheet/` / 代表的な2 error / desktop:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-pane-error-desktop.png`、`test-results/visual/character-sheet/dialogs/error-dialog-desktop.png`
  - 確認: status枠・件数・`確認`がdanger、dialogは`縁2「ベラ」`を含む通常本文色の`ul`を表示し、折返し・button境界・clip / overflowなし。
- `/character-sheet/` / 代表的な2 error / tablet・mobile:
  - locator screenshot: `test-results/visual/character-sheet/sections/action-controls-error-{tablet,mobile}.png`、`test-results/visual/character-sheet/sections/action-menu-error-{tablet,mobile}.png`
  - 確認: menu buttonだけがdanger、ヘルプは通常色、menuは`縁2「ベラ」`を含む通常本文色の`ul`を表示し、折返し・clip / overflowなし。

### 自己修正した項目

- [x] action menuのbrowser E2Eを、open / close状態とerror件数を含むaccessible nameへ更新した。
- [x] 縁上限超過のbrowser E2Eを、対象行名を含むsummary文言へ更新した。

### 人間判断が必要な差分

- なし。2026-07-30のユーザー明示指示により、対象3件のlocal canonical baselineを更新した。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した。
- [x] baseline更新をユーザー明示承認として記録した。
- [x] `npm run check` が通る（該当する場合）。
- [x] `npm run build` が通る（該当する場合）。

## 想定変更ファイル

- `src/character-sheet/logic/`配下のerror集約と文言translator
- `src/character-sheet/form/`配下の集約ViewModel adapter
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.module.css`
- `src/character-sheet/components/BondsSection.tsx`
- `src/character-sheet/components/BondsSection.module.css`
- `src/character-sheet/form/useBondsSectionProps.ts`
- `src/character-sheet/components/dialogs/`配下のerror dialog
- `docs/design/character-sheet/notes.md`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、必要最小限のbrowser / VRT test
- `docs/issue/ex-02-25-sheet-error-summary.md`

## レビュー観点

- Zodの構造検証と横断ゲームルールの集約を分離し、dynamicな文言を`dictionary.ts`へ押し込まない境界が妥当か。
- エラー件数はerrorだけを数え、同じ違反の局所表示とsummary listが矛盾・重複しないか。
- desktop status / dialog、tablet / mobile menuが、ユーザー指定のdanger色、見出し、空状態、件数文言、通常本文色の順序なしリストを満たすか。
- 現在の生き様では通常使用不可の専用アイテムカテゴリのwarningを既存局所feedbackに留め、error summaryへ含めない範囲が妥当か。
- design notes更新と限定Visual Reviewの対象・canonical VRT baselineを無断更新しない扱いが妥当か。

## 備考

- 親Gate planのG25はplannedのままとする。実装完了後、child completion-record auditを満たしてから親Gate planへ耐久的な引継ぎだけを戻す。
- このissue作成時点で`.raw/contents/`にcharacter-sheet対応Markdownは存在しない。ページ本文・可視構成の追加の正本は、ユーザー指示、requirements、design target、承認済みdraftの順で照合する。
