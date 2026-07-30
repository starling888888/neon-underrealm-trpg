# ex-02-30-sheet-help

## 最優先のデザイン入力

- 実装時に、要件、承認済みdesign intent、同じ目的の既存実装UIを照合する。既存実装UIがある場合は、design intentを既存UIに整合するよう解釈する。
- ユーザーの最新指示は、これらのデザイン入力を上書きする。
- ヘルプdialogは、既存designの青緑アクセント（`CharacterSheetButton`の`default`と同じ`--color-link`）を外枠に使う。これは`docs/design/character-sheet/notes.md`のヘルプdialogの外枠指定と一致するため、design正本を変更しない。
- visible headingは`ヘルプ`とする。ユーザー承認済み本文を`CharacterSheetHelpDialog`内のJSXを正本として表示し、`CharacterSheetDialogActions`を置かない。Header内の可視`閉じる`操作はaction footerではなく、既存dialogのdismiss・初期focus契約として置く。
- design notes、実装結果のscreenshot、reviewer出力を、承認済みdesign画像またはユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

キャラクターシートのdesktopとtablet / mobileのヘルプ操作から、既存dialog基盤を使うヘルプdialogを開けるようにする。ユーザー承認済みの本文と、既存の表示・dismiss・focus復帰契約を接続する。

## 背景

親issueのG30はヘルプを扱う。G23でdesktopの`ヘルプ`buttonとtablet / mobileの`?` buttonは配置済みだが、いずれもモックでありdialogを開かない。G5の共通dialog shellとG23の操作ペインを使い、現在のユーザー指示に従ってヘルプdialogを接続する。

関連する要件・正本:

- `docs/requirements/character-sheet.md`のヘルプとdialog要件
- `docs/architectures/character-sheet.md`の実装時のアーキテクチャ遵守、Feature境界、Container / Presenterの責務、状態と派生値、ダイアログ、テストアーキテクチャ
- `docs/design/character-sheet/notes.md`の「ダイアログ」とVRT参照情報
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`: G30を直接対象とする未完了TODOはない

要件はヘルプ本文で説明を行うことを求める。本文は、指定されたコンテンツレビューとユーザーレビューを経て承認済みであり、Componentへ反映する。VRTはユーザーが実画面を確認してから実施するため、それまではG30を完了・archiveしない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G30: ヘルプ`

このissueはG30だけを実装する自己完結した契約である。ユーザー指示により新規branchは作成せず、現在の親branch `ex-02-web-character-sheet`で実装する。G31の統合、ほかの操作の仕様変更は扱わない。

## 適用するアーキテクチャ

以下の各節について、記載した境界外の変更は行わない。

- `実装時のアーキテクチャ遵守`:
  - 許可: 最終diffをこの節と本issueの対象範囲へ対応付け、対応できない変更は行わない。
  - 禁止: 個別Gateだけで共有境界の例外化・拡張を行わない。
  - テスト: 最終diffの契約照合。
- `Feature境界`、`Container / Presenterの責務`、`状態と派生値`、`ダイアログ`:
  - 許可: `CharacterSheetContainer`がヘルプdialogの開閉と各操作元へのfocus復帰先を所有する。`CharacterSheetActionPane`はdesktop / responsiveのhelp triggerをcallbackで通知し、root-levelのヘルプdialog Componentは表示propsとcallbackだけを受け取る。固定表示文言は`dictionary.ts`へ置く。
  - 禁止: Presenterまたはdialog ComponentへRHF、master-data検索、永続化、JSON、Clipboard、ブラウザAPIを持ち込まない。dialog状態をRHF、保存、JSONへ含めない。既存のほかのdialog・action menuの責務を変更しない。
  - テスト: Component testでdialogのheading、承認済み本文、action footer不在、Header内の可視`閉じる`操作、初期focus、Escape、focus復帰、callbackを確認する。browser E2Eでdesktop / tablet / mobileのtriggerを確認する。
- `テストアーキテクチャ`:
  - 許可: dialogとActionPaneの表示・操作はComponent test、代表操作はbrowser E2E、表示契約はtarget限定VRTへ分離する。
  - 禁止: hydrateだけを目的とする製品DOM・state・data属性を追加しない。ユーザーが明示承認したHelp dialog以外のcanonical VRT baselineとcapture-only手順を更新しない。
  - テスト: ユーザーの2026-07-30の明示指示により、Help dialogのtarget限定VRT scenarioを追加し、既存4321 preview serverでcapture・比較する。Visual Reviewはscenarioのdesktop / tablet / mobile stateを対象にし、同日の明示承認時だけHelp dialogのcanonical baselineを更新する。

## 対象範囲

- desktopの文言付き`ヘルプ`buttonとtablet / mobileのfloating `?` buttonを、同じヘルプdialogを開くcallbackへ接続する。
- visible heading `ヘルプ`、ユーザー承認済み本文、`CharacterSheetDialogActions`なし、Header内の可視`閉じる`操作を持つヘルプdialog専用Componentを実装する。本文の見出しはdialog headingより一段小さい文字サイズとする。
- ヘルプdialogの外枠を`CharacterSheetButton`の`default`と同じ青緑アクセント（`--color-link`）にする。dialogの既存surface、modal、最大高、本文領域のscroll、responsive幅の契約は維持する。
- open時はHeader内の`閉じる`操作へfocusを置き、Escapeまたは同操作で閉じ、呼出し元buttonへfocusを復帰する。desktopとresponsiveの両方で、実際に押下したtriggerへ戻す。
- dialogが開いている間は、G23のEscape優先順位に従いdialogを先に閉じる。tablet / mobileでmenuが開いている場合は、help triggerがmenu外の常設buttonである既存配置を維持する。
- `dictionary.ts`、Component / browser E2E、Help dialogだけのtarget限定VRT scenarioを、このGateに必要な最小範囲で更新する。ユーザー明示承認済みのHelp dialog baseline以外のcanonical VRT baselineまたはcapture-only手順はG31へ残す。
- 実装後、ユーザーレビューとVisual Reviewの前に`gate_technical_reviewer`によるTechReviewを1回実施し、有効な指摘は本issueの`レビュー指摘`へ記録して対応する。
- ユーザー承認済み本文以外の説明、操作、導線を補完しない。本文の最終確認はCodexが行い、新たなコンテンツレビュワーを起動しない。

## 初期スコープ外

- ユーザー承認済み本文の範囲外の説明、見出し、リスト、リンク、説明対象、スクロール量を作成・推測しない。
- JSON入出力、CCFOLIAコピー、初期化、エラー集約、保存・復元、画像、候補選択、各sectionの入力・算出・validationを変更しない。
- 既存dialog shellの共通API、ほかのdialogのvisible heading・本文・action・色・focus契約を変更しない。
- 新規npm package、UI library、browser native `alert` / `confirm`、サーバー・DB・認証・SSR・CMSを追加しない。
- `docs/plan.md`、親Gate planのG30状態、ユーザー明示承認済みのHelp dialog以外のcanonical VRT baselineを変更しない。

## ヘルプ本文の確定

ヘルプ本文は、キャラクター作成に必要な操作を対象にしたコンテンツレビューとユーザーレビューを経て確定した。最終表示内容の正本は`CharacterSheetHelpDialog`のJSXである。作成過程のdraftやreview inputは、G30の完了後に参照する正本ではない。

## 完了条件

- [x] desktopの`ヘルプ`buttonとtablet / mobileの`?` buttonが、同一のヘルプdialogを開く。
- [x] dialogはvisible heading `ヘルプ`とユーザー承認済み本文を持ち、`CharacterSheetDialogActions`を描画しない。Header内には可視`閉じる`操作があり、open直後の初期focus対象になる。本文の見出しはdialog headingより一段小さい文字サイズである。
- [x] dialog外枠が`CharacterSheetButton`の`default`と同じ青緑アクセント（`--color-link`）で表示される。
- [x] EscapeまたはHeader内の`閉じる`操作でdialogを閉じ、desktop / tablet / mobileの各呼出し元へfocusが戻る。dialogが開いている間のEscapeはaction menuより優先される。
- [x] ヘルプの開閉がフォーム値、画像、端末内保存、JSON、Clipboard、エラー集約へ副作用を起こさない。
- [x] 実装後、`gate_technical_reviewer`のTechReviewを1回完了し、有効な指摘を解消またはユーザー承認済みの後続作業へ明記している。
- [x] Help dialogのtarget限定VRT scenarioを、desktop / tablet / mobileの先頭・中間・最下部でcapture・比較・実画面確認する。ユーザー明示承認済みの9枚だけcanonical VRT baselineを更新し、capture-only手順は変更しない。
- [x] 本文をComponentへ反映する前に、指定されたコンテンツレビュー、ユーザーによる本文レビュー、Codexによる最終確認を完了した。
- [x] `npm run check`、`npm run build`、本文更新後の関連Component testが通る。
- [x] ユーザーレビュー後に、本文更新後のtarget browser E2Eを既存のVRTとは別に実行する。

## チェックポイント

- [x] `docs/requirements/character-sheet.md`、親issueのGate plan、design targetと矛盾していない。
- [x] 既存routeとGitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md`の既存項目と矛盾していない。
- [x] 既存のJSON入出力、CCFOLIAコピー、初期化、エラーdialog、action menu、dialogのfocus・Escape処理を回帰させていない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/components/dialogs/CharacterSheetHelpDialog.tsx`
- `src/character-sheet/components/dialogs/CharacterSheetHelpDialog.module.css`
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/CharacterSheetActionPane.test.tsx`
- `tests/components/character-sheet/CharacterSheetHelpDialog.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`

## レビュー観点

- ヘルプdialogの外枠が既存designの青緑アクセントと`CharacterSheetButton`の`default`に一致し、本文とaction footerを勝手に補っていないこと。Header内の可視`閉じる`操作と初期focusが既存dialog契約に一致すること。
- desktop / tablet / mobileのどのtriggerからでも、開いたdialogのEscapeとfocus復帰が正しいこと。
- G23のaction menuとG5のdialog shellの責務・Escape優先順位を回帰させないこと。
- ユーザー承認済みの本文を`CharacterSheetHelpDialog`のJSXだけで表示し、action footerや本文外の導線を追加していないこと。
- Help dialogの先頭・中間・最下部をdesktop / tablet / mobileで比較し、header、閉じる操作、本文領域のscrollを回帰させないこと。

## Tech Review 1

### レビュー結果

- reviewer: `gate_technical_reviewer`
- conclusion: 指摘なし。
- checked: dialog構造、`--color-link`の外枠、accessible name、初期focus、Escape、desktop / responsive triggerへのfocus復帰、action menu優先順位、状態境界、GitHub Pages subpath、VRT保留。
- verification: `npm run check`、Component test、browser E2E。`npm run test:e2e`は64件成功、2件skipであり、追加したdesktop / tablet / mobileのヘルプ操作E2Eを含む。
- VRT: 実行・更新ともにしていない。本文とVisual Reviewの判断は後続指示を待つ。

## レビュー指摘 1

### 指摘事項

- ヘルプdialogで本文だけでなくdialog全体がscrollしている。
- 詳細表示の説明に置いた展開iconが、キャラクターシートで使うiconと一致していない。
- 「注意」と「例」は、静的ページのCalloutと同じwarning / exampleカラーに揃える。Callout Componentそのものは使わず、太い左線、枠なし、塗りつぶし背景とする。
- 「入力の進め方」の番号付きリストは、番号を太字で表示する。

### 判定

- source: human（dev server上の実装に対する直接レビュー）
- classification: valid
- local validation:
  - `docs/design/character-sheet/notes.md`は、ヘルプdialogの本文だけを独立してscroll可能にすることを定める。初回の実画面指摘を受けて共有dialog shellを調整し、後続のVRTではdialogの`scrollTop`を`0`のまま本文要素だけがscrollすることを確認した。
  - 現在の説明は`▷`を表示している。一方、スキル、武器・防具、専用アイテムの詳細操作は、閉じた状態で`▸`、開いた状態で`▾`を表示する。
  - `src/components/_common/Callout.astro`のwarningは`--color-warning`と`--color-warning-soft`、exampleは`#5f7686`と`--color-example-soft`を用いる。`docs/out-of-scope.md`によりCallout Componentの導入は対象外であり、色と左線だけをHelp dialogの専用CSSへ採用するのはG30の表示調整として妥当である。
  - 現在の番号付きリストにはmarkerのfont weight指定がない。

### 対応方針

- ヘルプdialogのheaderを固定し、本文領域だけが縦scrollするよう、shared dialog shellを必要最小限で調整する。共有CSSを変更する場合は、既存dialogのheader、本文、actionの到達性を回帰確認する。
- 説明内のiconを、閉じた詳細操作と同じ`▸`に変更する。
- 「注意」と「例」を別々の専用classで囲み、いずれも外枠・角丸を付けず、Callout対応色の背景と`0.375rem`の左線を使う。注意はwarning、例はexampleの色を使う。
- 「入力の進め方」の`ol` markerだけを太字にし、本文の可読性は維持する。

### 対応完了チェックリスト

- [x] headerを残して、ヘルプ本文だけが縦scrollする。
- [x] 説明内の展開iconが閉じた詳細操作と同じ`▸`になる。
- [x] 「注意」と「例」がCallout対応色の左線・背景を持ち、外枠と角丸を持たない。
- [x] 「入力の進め方」の番号付きリストのmarkerが太字になる。
- [x] 変更したshared dialog shellの既存dialogを対象に、header、本文、actionの到達性をComponent testで確認する。
- [x] 関連Component testとtarget browser E2Eが通る。Component testと、desktop / tablet / mobileのヘルプ操作を含むtarget browser E2Eが通過した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@help-dialog`、`@help-dialog-middle`、`@help-dialog-end`
- route / states / viewports: `/character-sheet/`でHelp dialogを開いた先頭・中間・最下部のscroll状態。desktop（1440x1200）、tablet（820x1180）、mobile（390x900）。

### レビュー結果

| 対象                  | 判定       | 差分                     | 対応                                                           |
| --------------------- | ---------- | ------------------------ | -------------------------------------------------------------- |
| Help dialog / desktop | 要人間判断 | canonical baseline未作成 | capture画像をcontents reviewerへ渡した。baselineは更新しない。 |
| Help dialog / tablet  | 要人間判断 | canonical baseline未作成 | capture画像を確認した。baselineは更新しない。                  |
| Help dialog / mobile  | 要人間判断 | canonical baseline未作成 | capture画像をcontents reviewerへ渡した。baselineは更新しない。 |

### 実画面確認

- `/character-sheet/` / Help dialog open / desktop:
  - locator screenshot（`[role="dialog"][aria-labelledby]`、原寸）: `test-results/visual/character-sheet/dialogs/help-dialog-desktop.png`
  - checked acceptance criteria: 青緑の外枠、`ヘルプ` heading、右上の閉じる操作、本文見出しと番号付き手順、本文領域の縦方向の続き。
  - result: 可視範囲で横overflow・clipはなく、本文はdialog内で続く。canonical比較はbaseline未作成のためできない。
- `/character-sheet/` / Help dialog open / tablet:
  - locator screenshot（`[role="dialog"][aria-labelledby]`、原寸）: `test-results/visual/character-sheet/dialogs/help-dialog-tablet.png`
  - checked acceptance criteria: dialog幅、headingと本文の階層、閉じる操作、本文の折り返し。
  - result: 可視範囲で横overflow・clipはない。canonical比較はbaseline未作成のためできない。
- `/character-sheet/` / Help dialog open / mobile:
  - locator screenshot（`[role="dialog"][aria-labelledby]`、原寸）: `test-results/visual/character-sheet/dialogs/help-dialog-mobile.png`
  - checked acceptance criteria: viewport内のdialog幅、headingと本文の階層、閉じる操作、本文の折り返し。
  - result: 可視範囲で横overflow・clipはない。本文が下端まで続くことの見え方はcontents reviewerから要検討とされた。canonical比較はbaseline未作成のためできない。

### 自己修正した項目

- なし。VRT実行中の実装変更は行っていない。

### 人間判断が必要な差分

- Help dialogのcanonical baselineは存在しない。親Gate planの方針どおり、このGateではbaselineを追加・更新しない。
- contents reviewerは、初期表示で本文の続きを読めること・scroll可能性が分かりにくいと指摘した。この表示上の手掛かりを追加するかはユーザー判断を待つ。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した。ビジュアルレビュー3でbaselineを更新し、9件の通常比較が通過した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る（VRT scenario追加後）。
- [x] `npm run build` が通る（`npm run visual:build`）。

## ビジュアルレビュー 2

### VRT対象

- design target: `docs/design/character-sheet/`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@help-dialog`、`@help-dialog-middle`、`@help-dialog-end`
- route / states / viewports: `/character-sheet/`のHelp dialogを開いた先頭・中間・最下部。desktop（1440x1200）、tablet（820x1180）、mobile（390x900）。

### 調査結果

- `scrollHelpDialog`はdialog内の`header + div`、すなわち本文要素だけへ`scrollTop`を設定する。dialog locatorやheaderをscroll対象にしていない。
- 現行4321 previewで実行時の値を確認した。desktop / tablet / mobileのすべてでdialogの`scrollTop`は`0`、本文要素の`scrollTop`だけが最下部値へ移動した。
- 同じ9状態を現行previewで再captureし、各原寸dialog locator screenshotでheading `ヘルプ`と右上の閉じる操作が先頭・中間・最下部のすべてで表示されることを確認した。
- 以前contents reviewerへ渡したdesktop・mobileの最下部captureは現行buildの結果ではなかった。本文実装の不備とした判定を撤回する。

### 比較と未実施項目

- canonical baselineが未作成のため、`npm run visual:test`による比較はこの時点で実行していない。比較不能な状態で同commandを実行すると一時captureが削除されるため、今回のVRT scenario診断には不要と判断した。
- baseline更新は当時のユーザー指示および親Gate planに従い、実行していなかった。後続のユーザー明示承認により、ビジュアルレビュー3で9枚を追加する。

### 対応

- source、CSS、Help本文、VRT scenarioは変更していない。
- contents reviewの一時報告を訂正した。本文の追加・修正は行わない。

## ビジュアルレビュー 3

### VRT対象

- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@help-dialog`、`@help-dialog-middle`、`@help-dialog-end`
- route / states / viewports: `/character-sheet/`のHelp dialogを開いた先頭・中間・最下部。desktop（1440x1200）、tablet（820x1180）、mobile（390x900）。
- canonical snapshots: `canonical-snapshots/visual/character-sheet/dialogs/help-dialog{,-middle,-end}-{desktop,tablet,mobile}.png`

### 結果

- `npm run visual:test -- --grep @help-dialog`の更新前比較では、先頭3件は既存baselineと一致し、中間・最下部の6件はbaseline未作成として失敗した。
- ユーザー明示承認後に`npm run visual:update -- --grep @help-dialog`で9件を更新した。
- 同じtarget限定の通常比較を再実行し、9件すべて通過した。
- 現行buildの原寸dialog locator screenshotで、全state / viewportにheading、閉じる操作、本文領域のscroll、横overflow・clipがないことを確認した。

### baseline管理

- 9枚はlocal canonical snapshotとして作成した。`.gitignore`の既存方針に従い、Git管理へ追加しない。
- Help dialog以外のbaselineは更新していない。

## 備考

このissueはG30の実装契約である。ヘルプdialogはユーザー承認済みの本文を持ち、action footerは置かない。`default`カラーはキャラクターシートbuttonの`default`、すなわち青緑アクセントを指す。完了条件、レビュー指摘、VRT baseline、target browser E2Eをすべて確認済みであり、G30をarchiveできる状態である。
