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

- [ ] desktopとtablet / mobileの`初期化`buttonが、titleなしでアクセシブル名を持つ確認dialogを開く。
- [ ] dialog本文が「入力済みのデータと画像を初期状態に戻します。\n本当によろしいですか？」であり、改行コードを可視の改行として表示する。`キャンセル`はmuted outline、`初期化`はdanger solidで表示される。
- [ ] `キャンセル`、Escape、dialogを閉じた場合に、入力、画像、端末内保存を変更せず、操作元へfocusを戻す。
- [ ] dialogを開いた直後は`キャンセル`にfocusし、`初期化`の確認後だけフォーム値、可変行、画像、エラー・警告、localStorage、IndexedDB画像recordを初期化する。
- [ ] 画像record削除または保存初期化の失敗時に、フォームと画像の状態を不整合にせず、既存の失敗feedbackへ接続する。
- [ ] `docs/design/character-sheet/notes.md`の初期化dialog記述がユーザー指示と一致する。
- [ ] ユーザーレビュー完了後に、`@character-sheet` targetの初期化確認dialogをdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）でVisual Reviewし、canonical VRT baselineを更新しない。
- [ ] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [ ] `docs/requirements/character-sheet.md`、親issueのGate plan、design targetと矛盾していない。
- [ ] 既存routeとGitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md`の既存項目と矛盾していない。
- [ ] 既存のJSONインポート、画像操作、確認dialogのfocus・失敗処理を回帰させていない。
- [ ] ユーザーの未コミット変更を破壊していない。

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

## 備考

`docs/design/character-sheet/notes.md`の旧記述（「本当に初期化してよろしいですか？」、`OK`と`キャンセル`）は、ユーザーの最新指示により本Gateで更新する。初期化の成否とフォーム・画像の原子性は、既存のroot operation / persistence境界を確認してから実装時に確定する。
