# ex-02-30-sheet-help

## 最優先のデザイン入力

- 実装時に、要件、対象の`.tmp/design/character-sheet/`配下にある承認済みdesign画像、同じ目的の既存実装UIを照合する。既存実装UIがある場合は、draft画像を既存UIに整合するよう解釈する。
- ユーザーの最新指示は、これらのデザイン入力を上書きする。
- ヘルプdialogは、既存designの青緑アクセント（`CharacterSheetButton`の`default`と同じ`--color-link`）を外枠に使う。これは`docs/design/character-sheet/notes.md`のヘルプdialogの外枠指定と一致するため、design正本を変更しない。
- visible headingは`ヘルプ`とする。本文はこのGateでは空とし、`CharacterSheetDialogActions`を置かない。Header内の可視`閉じる`操作はaction footerではなく、既存dialogのdismiss・初期focus契約として置く。本文の作り方・内容はユーザーの後続指示を待ち、このGateで補完しない。
- design notes、実装結果のscreenshot、reviewer出力を、承認済みdesign画像またはユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

キャラクターシートのdesktopとtablet / mobileのヘルプ操作から、空のヘルプdialogを開けるようにする。本文の内容を決める前段として、既存dialog基盤を使う最小の表示・dismiss・focus復帰契約だけを接続する。

## 背景

親issueのG30はヘルプを扱う。G23でdesktopの`ヘルプ`buttonとtablet / mobileの`?` buttonは配置済みだが、いずれもモックでありdialogを開かない。G5の共通dialog shellとG23の操作ペインを使い、現在のユーザー指示に従ってヘルプdialogを接続する。

関連する要件・正本:

- `docs/requirements/character-sheet.md`のヘルプとdialog要件
- `docs/architectures/character-sheet.md`の実装時のアーキテクチャ遵守、Feature境界、Container / Presenterの責務、状態と派生値、ダイアログ、テストアーキテクチャ
- `docs/design/character-sheet/notes.md`の「ダイアログ」とVRT参照情報
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`: G30を直接対象とする未完了TODOはない
- `.tmp/design/character-sheet/desktop-help.png`、`tablet-help.png`

要件はヘルプ本文で説明を行うことを求めるが、本文の作り方はユーザーの後続指示待ちである。このissueでは空の本文領域とし、本文の内容を推測して追加しない。本文が確定するまで、G30を完了・archiveしない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G30: ヘルプ`

このissueはG30だけを実装する自己完結した契約である。ユーザー指示により新規branchは作成せず、現在の親branch `ex-02-web-character-sheet`で実装する。G31の統合、ヘルプ本文の作成、ほかの操作の仕様変更は扱わない。

## 適用するアーキテクチャ

以下の各節について、記載した境界外の変更は行わない。

- `実装時のアーキテクチャ遵守`:
  - 許可: 最終diffをこの節と本issueの対象範囲へ対応付け、対応できない変更は行わない。
  - 禁止: 個別Gateだけで共有境界の例外化・拡張を行わない。
  - テスト: 最終diffの契約照合。
- `Feature境界`、`Container / Presenterの責務`、`状態と派生値`、`ダイアログ`:
  - 許可: `CharacterSheetContainer`がヘルプdialogの開閉と各操作元へのfocus復帰先を所有する。`CharacterSheetActionPane`はdesktop / responsiveのhelp triggerをcallbackで通知し、root-levelのヘルプdialog Componentは表示propsとcallbackだけを受け取る。固定表示文言は`dictionary.ts`へ置く。
  - 禁止: Presenterまたはdialog ComponentへRHF、master-data検索、永続化、JSON、Clipboard、ブラウザAPIを持ち込まない。dialog状態をRHF、保存、JSONへ含めない。既存のほかのdialog・action menuの責務を変更しない。
  - テスト: Component testでdialogのheading、空本文、action footer不在、Header内の可視`閉じる`操作、初期focus、Escape、focus復帰、callbackを確認する。browser E2Eでdesktop / tablet / mobileのtriggerを確認する。
- `テストアーキテクチャ`:
  - 許可: dialogとActionPaneの表示・操作はComponent test、代表操作はbrowser E2E、表示契約はtarget限定VRTへ分離する。
  - 禁止: hydrateだけを目的とする製品DOM・state・data属性を追加しない。canonical VRT baseline、VRT scenario、capture-only手順を追加・更新しない。
  - テスト: この段階ではTechReviewまでを完了条件とし、ユーザーレビュー、本文の確定、G31のcapture-only手順に関する決定前にVisual Reviewを実行しない。レビュー待ちではpreview serverを起動しない。

## 対象範囲

- desktopの文言付き`ヘルプ`buttonとtablet / mobileのfloating `?` buttonを、同じヘルプdialogを開くcallbackへ接続する。
- visible heading `ヘルプ`、空の本文、`CharacterSheetDialogActions`なし、Header内の可視`閉じる`操作を持つヘルプdialog専用Componentを追加する。
- ヘルプdialogの外枠を`CharacterSheetButton`の`default`と同じ青緑アクセント（`--color-link`）にする。dialogの既存surface、modal、最大高、本文領域のscroll、responsive幅の契約は維持する。
- open時はHeader内の`閉じる`操作へfocusを置き、Escapeまたは同操作で閉じ、呼出し元buttonへfocusを復帰する。desktopとresponsiveの両方で、実際に押下したtriggerへ戻す。
- dialogが開いている間は、G23のEscape優先順位に従いdialogを先に閉じる。tablet / mobileでmenuが開いている場合は、help triggerがmenu外の常設buttonである既存配置を維持する。
- `dictionary.ts`、Component / browser E2Eを、このGateに必要な最小範囲で更新する。Visual Reviewの新規VRT scenarioまたはcapture-only手順はG31へ残す。
- 実装後、ユーザーレビューとVisual Reviewの前に`gate_technical_reviewer`によるTechReviewを1回実施し、有効な指摘は本issueの`レビュー指摘`へ記録して対応する。
- ユーザーが本文作成を指示した後にだけ、`contents_beginner_reviewer`と`contents_expert_reviewer`へコンテンツレビューを依頼する。レビュー完了前にヘルプ本文をComponentへ実装しない。

## 初期スコープ外

- ヘルプ本文の文章、見出し、リスト、リンク、説明対象、スクロール量を作成・推測しない。これらはユーザーの後続指示を待つ。
- JSON入出力、CCFOLIAコピー、初期化、エラー集約、保存・復元、画像、候補選択、各sectionの入力・算出・validationを変更しない。
- 既存dialog shellの共通API、ほかのdialogのvisible heading・本文・action・色・focus契約を変更しない。
- 新規npm package、UI library、browser native `alert` / `confirm`、サーバー・DB・認証・SSR・CMSを追加しない。
- `docs/plan.md`、親Gate planのG30状態、canonical VRT baselineを変更しない。

## コンテンツレビューとヘルプ本文作成

### レビュー入力と渡し方

コンテンツレビュワーには、実際にキャラクターを作れそうかを判断するため、次だけを渡す。

- キャラクターメイキングページ
- キャラクター成長ページ
- キャラクターシートページ
- キャラクターシートのcanonical snapshot

ヘルプはまだ空であるため、レビュー対象から除外する。requirements、issue、既存review、実装方針、ヘルプ本文案、画像ファイル名、canonical snapshotのファイル名は渡さない。

canonical snapshotは、画像名・snapshot名・テスト名から内容を推測せず、画像に表示されている要素だけで判断する。キャラクターシートページの確認では、URL、role、`aria-*`、screen reader専用文言を可能な限り判断材料にせず、画面で読めるラベルと対応する入力欄・操作だけで判断する。

### レビュー依頼の出力形式

各コンテンツレビューは、次の3項目だけをこの順で返す。

1. `キャラクターシートだけで操作できる項目`
2. `ルールブックのキャラクターメイキングとキャラクター成長があれば操作できる項目`
3. `使い方、見方がよくわからなかった項目`

各項目では、表示されている根拠、実際に作成操作を進めるときの判断、必要な場合だけの具体的な不足情報を記録する。存在しない操作や非表示の情報を推測しない。

### ヘルプ本文の作成・承認順序

1. ユーザーの本文作成開始指示後、上記の制約でコンテンツレビューを実施する。
2. レビュー結果だけを根拠に、Codexがヘルプ本文のMarkdown draftをこのissueへ作成する。Component、`dictionary.ts`、E2E、VRTは変更しない。
3. ユーザーがMarkdown draftをレビューする。ユーザーの明示承認前に本文をComponentへ反映しない。
4. 承認済み本文だけを`CharacterSheetHelpDialog`へ実装し、必要なComponent / browser E2Eを更新する。VRTは本文実装後もユーザーの別指示まで保留する。

この内容レビューは、本文を作るための利用者視点の入力であり、G30のTechReview、Visual Review、canonical snapshotの更新、G31のcapture-only手順を置き換えない。

## 完了条件

- [x] desktopの`ヘルプ`buttonとtablet / mobileの`?` buttonが、同一のヘルプdialogを開く。
- [x] dialogはvisible heading `ヘルプ`を持ち、本文は空であり、`CharacterSheetDialogActions`を描画しない。Header内には可視`閉じる`操作があり、open直後の初期focus対象になる。
- [x] dialog外枠が`CharacterSheetButton`の`default`と同じ青緑アクセント（`--color-link`）で表示される。
- [x] EscapeまたはHeader内の`閉じる`操作でdialogを閉じ、desktop / tablet / mobileの各呼出し元へfocusが戻る。dialogが開いている間のEscapeはaction menuより優先される。
- [x] ヘルプの開閉がフォーム値、画像、端末内保存、JSON、Clipboard、エラー集約へ副作用を起こさない。
- [x] 実装後、`gate_technical_reviewer`のTechReviewを1回完了し、有効な指摘を解消またはユーザー承認済みの後続作業へ明記している。
- [ ] 本文内容はユーザー後続指示待ちであることを残し、本文未確定のままG30をdone / archiveしない。
- [x] TechReview完了後も、本文内容の後続指示、ユーザーレビュー、G31で扱うcapture-only手順の決定前にVisual Reviewを実行しない。canonical VRT baseline、VRT scenario、capture-only手順は変更しない。
- [x] `npm run check`、`npm run build`、関連テストが通る。

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
- ヘルプ本文が未確定のため、TechReview完了後もG30をarchiveしない判断が適切なこと。
- 本文未確定の現段階ではTechReviewだけを先行し、Visual Reviewの新規VRT scenario／capture-only手順をG31へ残す方針が適切なこと。
- コンテンツレビュワーへ渡す入力を3ページとcanonical snapshotに限定し、ヘルプ、要件、issue、既存review、画像名を渡さない方針が、利用者視点のレビューに必要かつ十分であること。
- レビュー出力の3分類と、Markdown draftをユーザー承認後にだけComponentへ反映する順序が、本文の作り方として適切なこと。

## Tech Review 1

### レビュー結果

- reviewer: `gate_technical_reviewer`
- conclusion: 指摘なし。
- checked: dialog構造、`--color-link`の外枠、accessible name、初期focus、Escape、desktop / responsive triggerへのfocus復帰、action menu優先順位、状態境界、GitHub Pages subpath、VRT保留。
- verification: `npm run check`、Component test、browser E2E。`npm run test:e2e`は64件成功、2件skipであり、追加したdesktop / tablet / mobileのヘルプ操作E2Eを含む。
- VRT: 実行・更新ともにしていない。本文とVisual Reviewの判断は後続指示を待つ。

## 備考

このissueはG30の実装契約である。ユーザーの2026-07-30の明示指示により、ヘルプdialogの本文は空、actionはなしとする。`default`カラーはキャラクターシートbuttonの`default`、すなわち青緑アクセントを指すことをユーザーが確認している。本文の作り方は後続指示で決めるため、このissueのTechReview完了はG30の完了やarchiveを意味しない。
