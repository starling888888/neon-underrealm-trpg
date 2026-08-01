# ex-08-game-consistency

## 目的

Webキャラクターシートで新規作成するキャラクターの抵抗判定について、既定の対応能力値を肉体にする。

## 背景

ゲームルールとの整合のため、抵抗の既定対応能力値を精神から肉体へ変更する。既存の判定行では能力値をユーザーが選択できるため、変更対象は初期値と既定値の定義に限定する。

ゲーム上の数値・用語・制約は `docs/requirements/character-sheet.md` が指定する正本に従う。キャラクターシートの画面・VRT参照情報は `docs/design/character-sheet/notes.md` を参照する。

関連TODOは確認したが、この変更に直接対応する項目はない。既存のキャラクターシートTODOは扱わない。

## 対象範囲

- `src/character-sheet/form-values.ts` の新規フォーム用・抵抗判定行の初期能力値
- `src/character-sheet/logic/checks.ts` の抵抗判定の既定能力値定義
- 上記の既定値を検証する既存または追加のテスト

## 初期スコープ外

- 抵抗以外の判定の既定能力値を変更しない
- 保存済みキャラクターデータの選択済み能力値を変換しない
- ルール本文、マスタデータ、画面layout、CSS、依存関係を変更しない
- キャラクターシートの既存TODOを回収しない
- `docs/out-of-scope.md` に定める機能を追加しない

## 完了条件

- [ ] 新規キャラクターシートの抵抗判定の初期能力値が肉体である
- [ ] 判定の既定能力値定義で、抵抗が肉体へ対応付けられている
- [ ] 既存のユーザー選択済み能力値を上書きしない
- [ ] 既定値を確認する自動テストがある
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] `/character-sheet/` の既存ルートと判定行の編集操作が壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない
- [ ] `docs/design/character-sheet/notes.md` の能力値選択UIと矛盾していない
- [ ] PRレビュー直前に、`@character-sheet` の`default`と`combat-default`をdesktop、tablet、mobileでVisual Reviewする
- [ ] Visual Reviewでは既存のlocal-only canonical baselineと比較し、design契約への適合をactual screenshotで確認する。baselineの追加・更新はユーザー承認なしに行わない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/logic/checks.ts`
- `tests/node/character-sheet/checks.test.ts`
- `tests/node/character-sheet/persistence/character-sheet-form.test.ts`

## レビュー観点

- 抵抗だけが肉体を既定値として初期化され、他の判定行の既定値に影響がないこと。
- 明示的に選択・保存された能力値を既定値の変更によって書き換えないこと。
- `docs/design/character-sheet/notes.md` が定める、攻撃・リアクション判定で5能力値から選べるUIを維持すること。
- あなたが並行して行うゲーム整合性修正と、担当ファイルまたは意図が衝突する場合は、実装前に範囲を確認すること。

## 備考

- milestone外のメンテナンスタスクとして扱う。`docs/issue/milestone-02/plan.md` は更新しない。
- design targetは既存の `docs/design/character-sheet/notes.md` を参照する。画面構造・表示状態の追加やbaseline更新はこのissueの前提にしない。
