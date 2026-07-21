# 31-0-ikizama-index-data

## 目的

`/data/ikizama/` の後続一覧ページと生き様詳細ページで共用する基礎情報の、生き様Excel由来データ基盤を整備する。

## 背景

`docs/plan.md` の `31-0-ikizama-index-data` は、一覧ページ用の変換仕様、検証、変換処理、取得層、テストを先行して整備するタスクである。静的サイトのCI/CD buildはExcel本体に依存せず、Git管理する生成JSONを読み込む必要がある。

変換仕様の具体的な入力シート、列、ID、空欄・改行・表示順、JSON形状、検証、テスト契約は、`.raw/data/ikizama-list.xlsx` を確認して `docs/conversion/ikizama-index.md` に定義する。本issueでは、その詳細を重複して固定しない。

- `docs/requirements/architecture.md` の AC-06〜AC-16
- `docs/requirements/data-id-policy.md`
- `docs/out-of-scope.md`
- `docs/plan.md` の `31-0-ikizama-index-data`
- `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」
- `docs/conversion/ikizama-index.md`（今回策定する変換仕様正本）

## 対象範囲

- `.raw/data/ikizama-list.xlsx` を実際に確認し、`docs/conversion/ikizama-index.md` に生き様一覧および後続詳細ページで共用する基礎データの変換仕様を定義する。
- 31-0では一覧表示に必要なデータと詳細ページでも共用する基礎データを扱う。`.raw/data/ikizama-list.xlsx` の専用アイテムID・名称は、生き様との対応表として生成JSONへ含める。アイテム実体、個別アンカー、リンク先との整合性検証、生き様スキル、関連ページとの関連変換は `32-0-ikizama-detail-data` で扱う。
- 変換仕様に従う `Ikizama` 検証スキーマと、生成JSON全体または一覧配列を検証するschema / helperを策定する。
- Excelから `data/generated/ikizama.json` を生成するローカル変換処理とnpm scriptを追加する。
- 生成JSONを読み込む、生き様一覧ページと後続の生き様詳細ページ用のデータ取得層を追加する。
- 変換、スキーマ、取得層のテストを追加し、必須項目、ID重複、表示順、および変換仕様で確定した異常系を検証する。
- 関連TODOを確認し、サイドメニューへの生き様リスト表示を本issueでは実装しない理由を記録する。

## 初期スコープ外

- `/data/ikizama/index.astro`、一覧UI、生き様詳細ページ、導線、MDX本文、design画像を作成しない。これらは `31-2-ikizama-index-page`、`32-2-ikizama-detail-page` または後続タスクで扱う。
- 詳細ページだけで使用するデータ、生き様スキル、関連ページとの関連変換・整合性検証は `32-0-ikizama-detail-data` で扱う。専用アイテム対応表の出力は本issueに含めるが、アイテム実体、個別アンカー、リンク先との整合性検証は32-0で扱う。流儀、共通スキル、NPCのデータ変換・取得層も変更しない。
- `.raw/data/ikizama-list.xlsx`、Google Drive、`raw-google-drive.url` を変更しない。Excel本体をGit管理しない。
- サイドメニューへの生き様リスト表示は、関連TODOに従い本issueでは実装しない。
- 検索、DB、認証、SSR、CMS、クライアント状態管理、不要な依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] 実際に配置された `.raw/data/ikizama-list.xlsx` を根拠として、`docs/conversion/ikizama-index.md` に入力・出力・検証・テスト契約を定義している。
- [x] 生き様一覧と後続詳細ページで共用する基礎データおよび専用アイテム対応表を表す `Ikizama` 検証スキーマと、生成JSON全体または一覧配列を検証するschema / helperが、変換仕様で定める必須項目、ID重複、表示順を検証する。
- [x] ローカル変換コマンドが `.raw/data/ikizama-list.xlsx` から `data/generated/ikizama.json` を生成し、CI/CD buildをExcelに依存させない。
- [x] 生き様一覧用と後続詳細ページ用のデータ取得層が、生成JSONから変換仕様で定める共用基礎データを返す。
- [x] 変換・スキーマ・取得層のテストが、実Excelに依存しないfixtureを用いて、必須項目欠落、ID重複、表示順、および確定した仕様に必要な異常系を検証する。
- [x] 関連TODOを確認し、サイドメニュー表示を本issueで扱わない理由を記録している。
- [x] `npm run test`、`npm run check`、`npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] CI/CDのbuildが `.raw/` またはExcel本体に依存しない。
- [x] 生成JSONを手編集せず、Excel変換の出力として管理している。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外のページ、Component、UIを実装していない。
- [x] `docs/TODO.md` のサイドメニュー追跡項目と矛盾していない。
- [x] UI、CSS、layout、page、Componentタスクではないため、design targetおよびdesign-image-generation前提条件は不要である。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/conversion/ikizama-index.md`
- `src/lib/schemas/ikizama.ts`
- `scripts/convert-ikizama-index/main.ts`
- `scripts/convert-ikizama-index/lib.ts`
- `src/lib/data/ikizama.ts`
- `data/generated/ikizama.json`
- `tests/node/ikizama-index.test.ts`
- `package.json`

変換仕様の確定後に既存の共通変換補助、型、テストの更新が必要な場合に限り、関連ファイルを変更してよい。変更理由と既存データ変換への影響を記録する。

## レビュー観点

- `docs/conversion/ikizama-index.md` を変換仕様の正本とし、issue本文でExcelの列やJSON形状を早期に重複固定していないか。
- 生き様のデータ基盤と専用アイテム対応表だけを対象とし、一覧UI、詳細UI、サイドメニュー、アイテム実体との整合性検証、生き様スキル、関連ページを後続taskへ分離できているか。
- `.raw/data/ikizama-list.xlsx` をローカル作業入力として保持し、Git管理・CI/CD依存に含めない方針が明確か。
- 実Excelの構造確認後に、変換仕様・スキーマ・テストの契約を十分に具体化できる完了条件になっているか。

## 備考

`docs/TODO.md` のサイドメニュー項目は、`data/generated/ikizama.json` と `src/lib/data/ikizama.ts` が整った後に検討する追跡項目である。本issueでは生成基盤を整備するが、メニューを変更しない。

このissueはデータ基盤だけを対象とする。変換仕様の具体化は `docs/conversion/ikizama-index.md` を参照し、issue本文へ列定義やJSONフィールドを展開しない。31-0では専用アイテム対応表をExcel由来の基礎データとして保持し、アイテム実体との整合性検証などの詳細関連データを先取りしない。実装前にこのissueの内容をユーザーが明示承認する。Git commit / push はこのissue準備では実行しない。

## レビュー指摘 1

### 指摘事項

- [軽微] 変換仕様がテスト契約として定める、既存生き様の削除拒否とヘッダー列削除のfixtureテストがない。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `docs/conversion/ikizama-index.md` は既存IDの削除拒否と列削除のエラー検証をテスト対象として定めている。`scripts/convert-ikizama-index/lib.ts` には両方を拒否する実装がある一方、`tests/node/ikizama-index.test.ts` はこれら2経路を個別には検証していない。

### 対応方針

- 既存JSONの生き様を入力から除いたfixtureで削除エラーを検証する。
- 15列未満のヘッダーfixtureで、列・見出しを含む列削除エラーを検証する。

### 対応完了チェックリスト

- [x] 既存生き様の削除を拒否するfixtureテストを追加する。
- [x] ヘッダー列削除を拒否するfixtureテストを追加する。
- [x] `npm run test` が通る。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
