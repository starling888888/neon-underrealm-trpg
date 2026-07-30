# ex-02-29-sheet-reset

## 最優先のデザイン入力

- 実装時に、要件、対象の`.tmp/design/character-sheet/`配下にある承認済みdesign画像、同じ目的の既存実装UIを照合する。既存実装UIがある場合は、draft画像を既存UIに整合するよう解釈する。
- ユーザーの最新指示は、これらのデザイン入力を上書きする。
- 初期化確認dialogはtitleを表示しない。本文は「入力済みのデータと画像を初期状態に戻します。\n本当によろしいですか？」とし、actionはmuted outlineの`キャンセル`、danger solidの`初期化`とする。
- 本文に含まれる改行コード`\n`は、空白に折り畳まず可視の改行として表示する。
- design notes、実装結果のscreenshot、reviewer出力を、draft画像または既存実装UIの代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

キャラクターシートの`初期化`操作で、確認後にフォーム入力、画像、可変行、エラー・警告、端末内保存を初期状態へ戻せるようにする。

## 背景

親issueのG29は全クリアを扱う。現行の操作領域には`初期化`buttonがあるが、副作用と確認dialogは未接続である。

関連する要件と参照は以下のとおり。

- `docs/requirements/character-sheet.md`の全消去と確認dialog要件
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`: G29に直接対応する未完了TODOはない
- `docs/design/character-sheet/notes.md`
- `.tmp/design/character-sheet/desktop-confirm.png`、`tablet.png`、`mobile.png`

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G29: 全クリア`

## 適用するアーキテクチャ

以下の各節について、記載した境界外の変更は行わない。

- `実装時のアーキテクチャ遵守`:
  - 許可: 最終diffをこの節と本issueの対象範囲へ対応付け、対応できない変更は行わない。
  - 禁止: 個別Gateだけで共有境界の例外化・拡張を行わない。
  - テスト: 最終diffの契約照合。
- `Feature境界`、`状態と派生値`、`ダイアログ`:
  - 許可: Containerがdialogの開閉と操作元focusを保持し、root state hookがRHFの初期化、root operation、画像recordとlocalStorageの削除を調整する。ActionPaneとdialog Componentはpropsとcallbackで表示する。固定UI文言はdictionaryへ置く。
  - 禁止: Presenterまたは表示ComponentへRHF、永続化、ブラウザAPIを直接持ち込まない。dialog状態をRHF、保存、JSONへ含めない。
  - テスト: Component testでdialogの文言・action variant・focus・callback、hook testで確認前の非破壊性と確認後の初期化・失敗境界を確認する。
- `ブラウザ永続化`:
  - 許可: 既存のlocalStorage adapterと画像record IndexedDB adapterを使い、初期化確認後だけ保存済みformと画像recordを削除する。
  - 禁止: 保存先、record形式、保存対象を変更しない。画像削除失敗時に既存画像を消去したように見せない。
  - テスト: Nodeまたはhook testでadapter呼出し、削除失敗時の状態、RHF resetと可変行の初期値を確認する。
- `テストアーキテクチャ`:
  - 許可: root stateの永続化調整はhook test、dialogとActionPaneの表示・操作はComponent test、代表操作はbrowser E2E、表示契約はtarget限定VRTへ分離する。
  - 禁止: hydrateだけを目的とする製品DOM・state・data属性を追加しない。canonical VRT baselineを更新しない。
  - テスト: ユーザーレビュー完了の明示指示後にだけ、対象E2E、`@character-sheet` target限定VRT、actual screenshot確認を実行する。レビュー待ちではpreview serverを起動しない。

## 対象範囲

- 初期化buttonからtitleなしの確認dialogを開く接続
- dialog本文（改行コードを含む）、accessible name、Escape、キャンセル時の入力保持、非破壊actionへの初期focus、閉じた後の操作元へのfocus復帰
- 確認後のRHFフォーム値、可変行、画像、エラー・警告、localStorageとIndexedDB画像recordの初期化
- root操作中の操作ロックと失敗時の既存失敗feedbackへの整合
- `docs/design/character-sheet/notes.md`の初期化確認dialog記述をユーザー指示へ更新
- このGateに必要なNode、hook、Component、browser、target限定VRTテスト

## 初期スコープ外

- CCFOLIAコピー、ヘルプ、JSON入出力を実装・変更しない
- 複数キャラクター保存、クラウド保存、認証、SSR、CMSを追加しない
- browser native `alert`または`confirm`を使わない
- 既存の個別画像クリア、個別行削除、他の確認dialogの仕様を変更しない
- canonical VRT baselineを更新しない

## 完了条件

- [x] desktopとtablet / mobileの`初期化`buttonが、titleなしでアクセシブル名を持つ確認dialogを開く。
- [x] dialog本文が「入力済みのデータと画像を初期状態に戻します。\n本当によろしいですか？」であり、改行コードを可視の改行として表示する。`キャンセル`はmuted outline、`初期化`はdanger solidで表示される。
- [x] `キャンセル`、Escape、dialogを閉じた場合に、入力、画像、端末内保存を変更せず、操作元へfocusを戻す。
- [x] dialogを開いた直後は`キャンセル`にfocusし、`初期化`の確認後だけフォーム値、可変行、画像、エラー・警告、localStorage、IndexedDB画像recordを初期化する。
- [x] 画像record削除または保存初期化の失敗時に、フォームと画像の状態を不整合にせず、既存の失敗feedbackへ接続する。
- [x] `docs/design/character-sheet/notes.md`の初期化dialog記述がユーザー指示と一致する。
- [x] ユーザーレビュー完了後に、`@character-sheet` targetの初期化確認dialogをdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）でVisual Reviewし、ユーザー明示承認によりcanonical VRT baselineを更新した。
- [x] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [x] `docs/requirements/character-sheet.md`、親issueのGate plan、design targetと矛盾していない。
- [x] 既存routeとGitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md`の既存項目と矛盾していない。
- [x] 既存のJSONインポート、画像操作、確認dialogのfocus・失敗処理を回帰させていない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/useCharacterSheetRootState.ts`
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/components/dialogs/CharacterSheetResetConfirmDialog.tsx`
- `src/character-sheet/dictionary.ts`
- `src/character-sheet/persistence/character-sheet-form.ts`
- `docs/design/character-sheet/notes.md`
- `tests/components/character-sheet/`
- `tests/hooks/character-sheet/`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- 初期化が、確認されるまで一切の入力・画像・端末内保存を変更しないこと。
- 確認dialogがtitleなしでも十分なaccessible nameを持ち、本文、actionの文言・variant、focus、Escape、focus復帰がユーザー指示に一致すること。
- 画像とフォームの削除失敗時に一方だけを初期化して不整合を残さないこと。
- design notesの更新がユーザー指示を正しく記録し、G29以外のdesignを変更しないこと。
- target限定Visual Reviewで3 viewportと開いたdialog stateを確認し、canonical VRT baselineを更新しないこと。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `@character-sheet`、`@reset-confirm`
- route / states / viewports: `/character-sheet/`の初期化確認dialogをdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）で確認。

### レビュー結果

| 対象                    | 判定 | 差分                                                                 | 対応                                               |
| ----------------------- | ---- | -------------------------------------------------------------------- | -------------------------------------------------- |
| reset-confirm / desktop | OK   | 初回baseline未作成。更新後に7px（0.01%）のアンチエイリアス差を検出。 | baselineを再生成し、再比較で通過。                 |
| reset-confirm / tablet  | OK   | 初回baseline未作成。                                                 | ユーザー承認によりbaselineを追加し、再比較で通過。 |
| reset-confirm / mobile  | OK   | 初回baseline未作成。                                                 | ユーザー承認によりbaselineを追加し、再比較で通過。 |

### 実画面確認

- `/character-sheet/` / 初期化確認dialog / desktop:
  - locator screenshot: `[role="dialog"][aria-label="入力内容を初期化"]`（`test-results/visual/character-sheet/dialogs/reset-confirm-desktop.png`、original pixel resolution）
  - checked acceptance criteria: visible titleなし、本文の2行改行、muted outlineの`キャンセル`、danger solidの`初期化`、actionのbounds、横overflowなし。
  - result: OK。
- `/character-sheet/` / 初期化確認dialog / tablet:
  - locator screenshot: `[role="dialog"][aria-label="入力内容を初期化"]`（`test-results/visual/character-sheet/dialogs/reset-confirm-tablet.png`、original pixel resolution）
  - checked acceptance criteria: visible titleなし、本文の2行改行、actionの到達性、横overflowなし。
  - result: OK。
- `/character-sheet/` / 初期化確認dialog / mobile:
  - locator screenshot: `[role="dialog"][aria-label="入力内容を初期化"]`（`test-results/visual/character-sheet/dialogs/reset-confirm-mobile.png`、original pixel resolution）
  - checked acceptance criteria: visible titleなし、本文の2行改行、actionの横並びとbounds、横overflowなし。
  - result: OK。

### 自己修正した項目

- [x] desktop snapshotに生じた7pxのアンチエイリアス差を、ユーザー承認済みbaselineの再生成後に再比較した。

### 人間判断が必要な差分

- なし。baseline更新はユーザーが明示承認済み。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した。
- [x] baseline更新が必要な差分をユーザー明示承認として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## 備考

`docs/design/character-sheet/notes.md`の旧記述（「本当に初期化してよろしいですか？」、`OK`と`キャンセル`）は、ユーザーの最新指示により本Gateで更新する。初期化の成否とフォーム・画像の原子性は、既存のroot operation / persistence境界を確認してから実装時に確定する。

## レビュー指摘 1

### 指摘事項

- localStorageのフォーム削除が失敗しても、IndexedDB画像recordの削除とRHF resetを続行するため、再読込時に旧フォームだけが復元される。
- responsive action menuの`初期化`buttonをdialog表示前にunmountするため、キャンセル、Escape、確認、画像削除失敗後のfocus復帰先が失われる。
- G29のdesign notesがcanonical snapshot総数を183枚と記録しているが、G27時点の202枚と今回の3枚から205枚が正しい。

### 判定

- source: `.tmp/chatgpt-review.md`（ChatGPT review、source snapshot `2b86dd8d12b5f8ec46c48e468226effdefc7b282`）およびpush後のNon Gate Review（local-agent、同commit）。
- classification: valid。
- local validation: `onResetConfirmed()`は画像record削除後に`deleteCharacterSheetForm()`の例外を握りつぶし、そのままimage stateとRHFを初期化する。responsive action menuはreset action直後に閉じ、dialogのreturn focus refへunmount済みbuttonを渡す。local canonical snapshotは205枚である。通常の実装レビュー指摘であり、agent failureには該当しない。

### 対応方針

- localStorage削除に失敗した場合はIndexedDB削除とRHF resetを開始せず、既存状態を保持して失敗feedbackを表示する。localStorage削除成功後の画像削除失敗では、直前のフォーム値をlocalStorageへ補償書込みし、UI stateを保持する。補償失敗時も成功扱いにせず失敗feedbackを表示する。
- responsive action menuから開いたdialogとreset起因の失敗feedbackは、unmountされないaction menu triggerへfocusを戻す。desktopは押下buttonを復帰先に維持する。
- design notesのG29 snapshot総数を205枚へ訂正する。

### 対応完了チェックリスト

- [x] localStorage削除失敗時に画像・RHF・端末内保存を初期状態へ進めず、hook testで固定する。
- [x] 画像削除失敗時にフォーム保存を補償し、既存stateと失敗feedbackを維持する。
- [x] desktop、tablet、mobileでキャンセル、Escape、確認、reset起因の失敗feedback後に安定した操作元へfocusが戻る。
- [x] G29のdesign notesがcanonical snapshot総数205枚を記録する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
