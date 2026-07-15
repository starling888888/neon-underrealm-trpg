# 29-0-ryugi-index-data

## 目的

`/data/ryugi/` の後続一覧ページと流儀詳細ページが参照できる、流儀の非スキル情報用Excel由来データ基盤を整備する。

## 背景

`docs/plan.md` の `29-0-ryugi-index-data` は、流儀一覧用の変換仕様、検証、変換処理、取得層、テストを先行して整備するタスクである。ユーザー指示により、`ryugi-list.xlsx` に含まれる流儀詳細ページ用の非スキル情報も同じ変換仕様と生成JSONで扱う。静的サイトのCI/CD buildはExcel本体に依存せず、Git管理する生成JSONを読み込む必要がある。

変換仕様は推測で固定しない。ユーザーが後ほど `<repo-root>/.raw/data/ryugi-list.xlsx` に配置するExcelを実際に確認してから、対象シート、列、必須・任意項目、空欄・改行・表示順・IDの扱い、出力JSON、検証、テストを `docs/conversion/ryugi-index.md` に定義する。

- `docs/requirements/architecture.md` の AC-06〜AC-13
- `docs/requirements/data-id-policy.md`
- `docs/out-of-scope.md`
- `docs/plan.md` の `29-0-ryugi-index-data`
- `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」

## 対象範囲

- `.raw/data/ryugi-list.xlsx` の実ファイルを確認後、`docs/conversion/ryugi-index.md` に流儀一覧データと流儀詳細ページで共用する非スキル情報の変換仕様を定義する。
- 流儀一覧ページと流儀詳細ページで必要な非スキル情報の最小データ形状の `Ryugi` 検証スキーマと、`ryugi-list.json` 全体または一覧配列を検証するschema / helperを策定する。
- Excelから `data/generated/ryugi-list.json` を生成するローカル変換処理とnpm scriptを追加する。
- 生成JSONを読み込む、流儀一覧ページと後続の流儀詳細ページ用のデータ取得層を追加する。
- 変換、スキーマ、取得層のテストを追加し、必須項目、ID重複、表示順を検証する。
- Excelを配置するまでは、実データを仮定して変換仕様、列契約、生成JSON、変換処理を作成しない。Excel配置後に本issueを承認して実装する。

## 初期スコープ外

- `/data/ryugi/index.astro`、一覧UI、流儀詳細ページ、導線、MDX本文、design画像を作成しない。これらは `29-2-ryugi-index-page`、`30-2-ryugi-detail-page` または後続タスクで扱う。
- 流儀スキルデータ、流儀スキルとの関連、流儀スキルExcelの変換・検証は `30-0-ryugi-detail-data` で扱う。`29-0` では `ryugi-list.xlsx` に含まれる非スキル情報だけをデータ化する。
- 生き様、アイテム、NPC、共通スキルのデータ変換・取得層を変更しない。
- `.raw/data/ryugi-list.xlsx`、Google Drive、`raw-google-drive.url` を変更しない。Excel本体をGit管理しない。
- サイドメニューへの流儀リスト表示は、関連TODOに従い本issueでは実装しない。
- 検索、DB、認証、SSR、CMS、クライアント状態管理、不要な依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] 実際に配置された `.raw/data/ryugi-list.xlsx` を根拠として、`docs/conversion/ryugi-index.md` に流儀一覧と流儀詳細ページ用非スキル情報の入力・出力・検証・テスト契約を定義している。
- [ ] 流儀一覧と流儀詳細ページに必要な非スキル情報を表す `Ryugi` 検証スキーマと、生成JSON全体または一覧配列を検証するschema / helperが、必須項目、ID重複、表示順を検証する。
- [ ] ローカル変換コマンドが `.raw/data/ryugi-list.xlsx` から `data/generated/ryugi-list.json` を生成し、CI/CD buildをExcelに依存させない。
- [ ] 流儀一覧用と流儀詳細ページ用のデータ取得層が、生成JSONから後続ページが必要とする非スキル情報を返す。
- [ ] 変換・スキーマ・取得層のテストが、実Excelに依存しないfixtureを用いて必須項目欠落、ID重複、表示順、および確定した仕様に必要な異常系を検証する。
- [ ] 関連TODOを確認し、サイドメニュー表示を本issueで扱わない理由を記録している。
- [x] 実Excel確認で確定した流儀IDと表示順の規則を、`docs/conversion/ryugi-index.md` と本issueへ反映し、ユーザーがその具体化内容を明示承認している。
- [ ] `npm run test`、`npm run check`、`npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] CI/CDのbuildが `.raw/` またはExcel本体に依存しない。
- [ ] 生成JSONを手編集せず、Excel変換の出力として管理している。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外のページ、Component、UIを実装していない。
- [ ] `docs/TODO.md` のサイドメニュー追跡項目と矛盾していない。
- [ ] UI、CSS、layout、page、Componentタスクではないため、design targetおよびdesign-image-generation前提条件は不要である。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/conversion/ryugi-index.md`
- `src/lib/schemas/ryugi.ts`
- `scripts/convert-ryugi-index/main.ts`
- `src/lib/data/ryugi-list.ts`
- `data/generated/ryugi-list.json`
- `tests/node/ryugi-index.test.ts`
- `package.json`

Excel確認の結果、汎用変換器の拡張または分離が必要な場合に限り、既存の `scripts/convert-*/`、関連スキーマ、関連テストを変更してよい。その変更理由と、既存の共通スキル変換への影響を記録する。

## レビュー観点

- 変換仕様を実Excel確認後に作成する前提が明確で、未配置のExcelから列・シート・ID規則を推測して固定しない範囲になっているか。
- `ryugi-list.xlsx` に含まれる流儀詳細用非スキル情報を今回の生成JSONへ含めつつ、流儀スキル・UI・サイドメニューを後続タスクへ分離できているか。
- `ryugi-list.xlsx` をローカル作業入力として保持し、Git管理・CI/CD依存に含めない方針が明確か。
- 実Excelの構造確認後に、スキーマとテストの契約を十分に具体化できる完了条件になっているか。

## 備考

このissueはデータ基盤だけを対象とする。後続の流儀一覧ページは、ユーザーが準備する `.raw/contents/ryugi-index.md` と `29-2-ryugi-index-page` の承認済みissueで扱う。29-2では、各流儀の共通スキルボーナスによるキャラクターメイキングと成長の項を、今回の変換済み流儀データから表示する。この補足は `docs/TODO.md` で追跡する。

`docs/TODO.md` のサイドメニュー項目は、`data/generated/ryugi-list.json` とデータ取得層が整った後に検討する追跡項目である。本issueでは生成基盤を整備するが、メニューを変更しない。

Excel配置後に対象Excelを確認し、流儀IDの入力元・形式・変更時の扱いと、表示順の根拠・重複／欠番／並び替え時の扱いを `docs/conversion/ryugi-index.md` へ定義した。ユーザーは現時点の変換仕様を承認済みである。変換処理、schema、生成JSONの実装開始には、本issue全体への明示承認が別途必要である。

実装前にこのissueの内容をユーザーが明示承認する。Git commit / push はこのissue準備では実行しない。
