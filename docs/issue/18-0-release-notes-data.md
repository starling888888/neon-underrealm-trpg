# 18-0-release-notes-data

## 目的

トップページと更新履歴ページで共通利用するリリースノートデータを整備する。

具体的には、リポジトリ直下のローカル作業入力 `.raw/release-notes.xlsx` を読み取り、静的サイトで参照可能な `data/generated/release-notes.json` を生成するための変換仕様、検証スキーマ、変換スクリプト、テスト、データ取得処理を定義・実装する。

このタスクでは、トップページ本体および更新履歴ページ本体のUI実装は行わない。

## 背景

`docs/plan.md` では、ページ作成フェーズに入る前提として、Excel由来データが必要なページについては `NN-0` のデータ整備タスクを先に実施する方針になっている。

`18-0-release-notes-data` は、トップページと更新履歴ページの前段タスクである。

リリースノートデータは以下で利用される。

- `18-2-home-page`
  - トップページに最新リリースノート5件を表示する
- `19-2-release-notes-page`
  - `/release-notes` に全リリースノートを表示する
  - 更新日と全文を表示する
  - 全文が空欄なら簡単説明を表示する
  - 改行を反映する
  - ページ内目次は表示しない

最新の作業入力構造では、Google Drive由来のローカル入力は以下に固定されている。

```text
.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

そのため、このタスクのリリースノートExcel入力は `.raw/release-notes.xlsx` とする。

リリースノートは、トップページの最新5件表示と `/release-notes` の全件表示で同じ `data/generated/release-notes.json` を参照する。Excel本体はGit管理せず、変換後JSONをGit管理する。CI/CD上の静的サイトビルドはExcel本体に依存せず、変換済みJSONを参照する。

また、`data/generated/` 配下のJSONは生成物として扱い、原則として手編集しない。データ修正が必要な場合は、元のExcelを修正し、変換スクリプトを再実行する。

関連する要件・計画:

- `docs/plan.md`
  - `18-0-release-notes-data`
  - `18-2-home-page`
  - `19-2-release-notes-page`
- `docs/requirements.md`
  - `docs/requirements/architecture.md`
  - `docs/requirements/release-notes.md`
- `docs/development-structure.md`
- `docs/out-of-scope.md`
- `docs/TODO.md`
- `data/generated/README.md`

## 対象範囲

このタスクで変更してよい範囲は以下とする。

- `docs/conversion/release-notes.md`
  - リリースノートExcelからJSONへの変換仕様
  - 対象Excelファイル、対象シート、列定義、必須列、任意列
  - 空欄時fallback、改行保持、表示順、ID生成、出力形式
  - `dataName`、`updatedAt`、`data` を持つ出力JSON形式
  - `updatedAt` 更新ルール
  - 変換スクリプト、検証スキーマ、テスト観点
- `data/generated/release-notes.json`
  - 静的サイトが参照する生成済みJSON
  - 手編集ではなく、変換スクリプトによる生成物として扱う
- リリースノート用の型・スキーマ
  - 例: `src/lib/schemas/release-notes.ts`
  - 例: `src/lib/data/release-notes.ts`
- リリースノートExcel変換スクリプト
  - `scripts` 配下に変換用の専用ディレクトリを切る
  - 例: `scripts/convert-release-notes/main.ts`
  - `.raw/release-notes.xlsx` をローカル実行時に読む
  - CI/CDビルドではExcelを要求しない
- 変換スクリプトと検証スキーマのテスト
  - 例: `tests/node/release-notes.test.ts`
  - fixtureまたは最小サンプルを用いて、実Excel本体に依存しすぎないテストにする
- `package.json`
  - 必要であれば、ローカル実行用の変換scriptを追加する
  - 例: `convert:release-notes`
- 必要最小限のfixture
  - 例: `tests/fixtures/release-notes.*`
  - 実Excel本体をfixtureとしてコミットしない
- 既存データ生成方針との整合に必要なREADMEまたは補足
  - 例: `data/generated/README.md` の範囲内追記
  - 必要な場合のみ

## 初期スコープ外

このタスクでは以下を実装しない。

- トップページ `/` のUI実装
- 更新履歴ページ `/release-notes` のUI実装
- `ImageBlock.astro` など、後続Componentの作成
- リリースノート表示Componentの作り込み
- ページデザイン画像の生成・更新
- `docs/design/` の更新
- `.raw/contents/home.md` または `.raw/contents/release-notes.md` の作成・編集
- CMS、管理画面、投稿フォーム、ブラウザ上の編集UI
- DB、SSR、APIサーバー、認証
- GitHub Releasesとの連携
- 外部サービスからのリリースノート自動取得
- CI/CD上でExcel変換を必須化すること
- Excel本体、`.raw/`、`raw-google-drive.url`、`.raw/contents/` のGit管理
- 検索index生成
- Pagefind導入
- 多言語対応
- 高度な一覧フィルタ
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## データ仕様メモ

`release-notes.json` は、JSON単体でも何のデータか判別できるよう、トップレベルにメタ情報を持つオブジェクト形式とする。

```ts
export type ReleaseNotesDataName = "release-notes";

export type ReleaseNote = {
  id: string;
  date: string;
  summary: string;
  body: string | null;
  sourceOrder: number;
};

export type ReleaseNotesJson = {
  dataName: ReleaseNotesDataName;
  updatedAt: string;
  data: ReleaseNote[];
};
```

### 入力Excel

入力ファイルは以下とする。

```text
.raw/release-notes.xlsx
```

対象シートは以下とする。

```text
release-notes
```

シートは以下の列を持つ。

| 列 | ヘッダー | 必須 | 説明                                 |
| -- | -------- | ---: | ------------------------------------ |
| A  | 更新日   | 必須 | リリースノートの日付                 |
| B  | 概要     | 必須 | トップページなどで表示する短い説明   |
| C  | 本文     | 任意 | 更新履歴ページで表示する全文。空欄可 |

ユーザー運用として、更新履歴はExcel上で下方向に追記される。

```text
1行目: ヘッダー
2行目: 古い履歴
3行目: 次の履歴
4行目: さらに新しい履歴
...
```

このため、同じ更新日の履歴が複数ある場合は、より下の行を新しい履歴として扱う。

### 出力JSON

出力先は以下とする。

```text
data/generated/release-notes.json
```

出力JSONは以下の形とする。

```json
{
  "dataName": "release-notes",
  "updatedAt": "2026-07-07T19:30:00+09:00",
  "data": [
    {
      "id": "2026-07-07-001",
      "date": "2026-07-07",
      "summary": "仮公開しました。",
      "body": "仮公開しました。\n現在作成中です。",
      "sourceOrder": 1
    }
  ]
}
```

### `updatedAt` 更新ルール

`updatedAt` は、変換スクリプトの実行日時を無条件に入れてはならない。

変換スクリプトは、今回Excelから生成した `data` 配列と、既存の `data/generated/release-notes.json` の `data` 配列を比較する。

- 既存JSONが存在しない場合
  - 初回生成として扱う
  - エラーにしない
  - `updatedAt` には今回の生成時刻を入れる
- 既存JSONが存在し、今回生成した `data` と既存JSONの `data` が同一の場合
  - 既存JSONの `updatedAt` を維持する
  - 実行時刻で更新しない
- 既存JSONが存在し、今回生成した `data` と既存JSONの `data` が異なる場合
  - `updatedAt` を今回の生成時刻に更新する
- 既存JSONが存在するが、JSONとして壊れている、または期待する形式でない場合
  - エラーとする
  - ただし、ファイル不存在だけは初回実行として許可する

比較対象は `data` 配列のみとする。`dataName` や `updatedAt` の違いだけで、データ差分があるとは判定しない。

### ID生成ルール

各リリースノートには、安定した `id` を生成する。

形式は以下。

```text
YYYY-MM-DD-NNN
```

- `YYYY-MM-DD` は正規化済みの更新日。
- `NNN` は同じ更新日内での出現順。
- 出現順はExcel上の上から下への順序で数える。
- 3桁ゼロ埋めとする。

例:

```text
2026-07-07-001
2026-07-07-002
```

同じ日に2件追加した場合、下に追記した2件目は `2026-07-07-002` となる。

### 表示順

生成JSON内の `data` 配列は以下の順で並べる。

1. `date` の降順
2. 同じ `date` の場合、Excel上で下にある行を優先
3. それでも同一になる場合は、変換時にエラーとする

Excel上の更新日は、上から下へ向かって古い順、または同日付で並んでいる必要がある。

つまり、下の行の日付が上の行の日付より古い場合はエラーとする。

## 完了条件

- [x] `docs/conversion/release-notes.md` にリリースノートデータ変換仕様が作成されている
- [x] 変換仕様に、対象Excelファイル `.raw/release-notes.xlsx` が記載されている
- [x] 変換仕様に、対象シート `release-notes` が記載されている
- [x] 変換仕様に、列定義、必須列、任意列、空欄時の扱い、改行の扱い、ID生成ルール、表示順ルール、JSON出力先、JSON出力形式、バリデーションルール、テスト観点が記載されている
- [x] `ReleaseNote` / `ReleaseNotesJson` の型または検証スキーマが定義されている
- [x] `data/generated/release-notes.json` が生成済みJSONとして配置されている
- [x] `data/generated/release-notes.json` は `dataName`、`updatedAt`、`data` を持つオブジェクト形式になっている
- [x] `dataName` は `release-notes` である
- [x] `data` はトップページ最新5件表示と更新履歴ページ全件表示の両方で利用可能な形になっている
- [x] `.raw/release-notes.xlsx` から `data/generated/release-notes.json` を生成する変換スクリプトが作成されている
- [x] 変換スクリプトは `scripts` 配下の専用ディレクトリに配置されている
- [x] 変換スクリプトは `.raw/release-notes.xlsx` をローカル実行時に読み込む前提になっている
- [x] CI/CDビルドはExcel本体なしで成功する前提を壊していない
- [x] 既存JSONが存在しない初回実行時にエラーにならない
- [x] 既存JSONと今回生成dataが同一の場合、`updatedAt` を維持する
- [x] 既存JSONと今回生成dataが異なる場合のみ、`updatedAt` を更新する
- [x] トップページ用に最新5件を取得できるデータ取得処理がある
- [x] 更新履歴ページ用に全件を取得できるデータ取得処理がある
- [x] `body` が空欄の場合に `summary` へfallbackできる処理またはデータ取得関数がある
- [x] 更新日降順が検証されている
- [x] 必須項目の欠落が検証されている
- [x] ID重複が検証されている
- [x] 改行保持が検証されている
- [x] `body` 空欄時fallbackが検証されている
- [x] 出力JSONのトップレベル形状が検証されている
- [x] 変換スクリプトと検証スキーマのテストが追加されている
- [x] `npm run test` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている

## チェックポイント

- [x] `data/generated/` 配下のJSONを手編集前提にしていない
- [x] `.raw/`、Excel本体、`.raw/contents/`、`raw-google-drive.url` をGit管理対象にしていない
- [x] `.raw/release-notes.xlsx` をリポジトリ内の実装ファイルとして参照していない
- [x] Excel変換はローカル明示実行のメンテナンス作業として分離されている
- [x] CI/CDや通常buildがExcel本体に依存していない
- [x] トップページ・更新履歴ページのUI実装へ踏み込んでいない
- [x] 更新履歴ページのページ内目次非表示実装へ踏み込んでいない
- [x] 検索index生成、Pagefind、GitHub Actions deploy設定へ踏み込んでいない
- [x] CMS、管理画面、投稿フォーム、認証、DB、APIサーバーを追加していない
- [x] 不要な依存関係を追加していない
- [x] 新しいnpm packageを追加する場合は、追加理由、代替案、初期スコープに必要な理由がissueまたは作業報告に記録されている
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 既存ルートが壊れていない
- [x] `docs/TODO.md` の既存未対応項目と矛盾していない
- [x] `docs/development-structure.md` のscript配置方針と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

実際の既存構成に合わせて調整すること。

- `docs/conversion/release-notes.md`
- `data/generated/release-notes.json`
- `scripts/convert-release-notes/main.ts`
- `src/lib/data/release-notes.ts`
- `src/lib/schemas/release-notes.ts`
- `tests/node/release-notes.test.ts`
- `package.json`
- `data/generated/README.md`（必要な場合のみ）

## レビュー観点

人間レビューでは以下を確認する。

- `18-0-release-notes-data` として、スコープがデータ整備に閉じているか
- トップページ本体や更新履歴ページ本体のUI実装に踏み込みすぎていないか
- 入力パスが最新方針どおり `.raw/release-notes.xlsx` になっているか
- `.raw/data/*.xlsx` と誤って扱っていないか
- `release-notes.json` のトップレベル形式が、JSON単体でデータ名称と最終更新日時を判別できる形になっているか
- `dataName`、`updatedAt`、`data` の責務が明確か
- `updatedAt` が実行日時ではなく、`data` 差分発生時だけ更新される仕様になっているか
- 初回実行時に既存JSONが存在しなくてもエラーにならない仕様になっているか
- `summary` と `body` の責務が明確か
- `body` 空欄時fallbackをデータ変換時に埋めるか、データ取得時に解決するかが妥当か
- 改行保持の仕様がページ表示側で扱いやすいか
- ID生成ルールが安定しているか
- 同一日付複数件の順序が安定しているか
- 変換仕様、スクリプト、スキーマ、テストの責務分離が妥当か
- script配置が `scripts` 配下の専用ディレクトリに収まっているか
- `docs/development-structure.md` のscript配置方針から逸脱していないか
- CI/CDビルドがExcel本体に依存しない方針を壊していないか
- `data/generated/release-notes.json` を手編集する運用に見えないか
- 依存関係追加が必要最小限か
- 後続の `18-2-home-page` / `19-2-release-notes-page` がこのデータ取得層を自然に利用できるか

## 備考

このissueは `18-2-home-page` と `19-2-release-notes-page` の前提タスクである。

ユーザー指示として、リリースノートは以下の方針を持つ。

- トップページには更新日と簡単な説明を表示する
- リリースノートページには更新日とフル説明を表示する
- Excelで管理する
- Excelは `.raw/release-notes.xlsx` から読む
- 対象シートは `release-notes`
- 列は、更新日、概要、本文を基本とする
- 本文は空欄可能
- 本文が空欄の場合、リリースノートページでは概要を表示する
- 改行も反映する
- Git上にはJSONに変換したものをpushして静的サイト構成とする
- 出力JSONはJSON単体でも判別できるように、データ名称と最終更新日時を入れ、`data` キーに配列データを入れる
- 最終更新日時は実行時ではなく、出力した `data` と既存 `data` を比較して変化がある場合のみ更新する
- 初回実行時に既存JSONがなくてもエラーにしない
- 変換スクリプトは `scripts` 下に専用directoryを切って変換対象 `.ts` ファイルにする

このタスクでは、`.raw/contents/*.md` は扱わない。`.raw/contents/*.md` はページ作成タスク用のローカル作業入力であり、リリースノートデータ変換仕様の正本ではない。

`docs/TODO.md` の現時点の未対応項目に、リリースノートデータへ直接紐づくものは見当たらないため、このissueでは新規TODO回収を前提にしない。

実装時に `zod` をdependencyとして追加した。理由は、今後の計画でExcel由来JSONが多数増えることが確定しており、生成済みJSONの型、必須項目、列挙値、ID形式、重複、表示順、関連整合性などのデータ契約をデータ種別ごとに一貫して定義するためである。リリースノートでは `ReleaseNotesJsonSchema` / `ReleaseNoteSchema` をZod Schemaとして定義し、TypeScript型はSchemaから推論する。

Zod Schemaは、主に変換スクリプト実行時、データ変換テスト、必要に応じたCI検証で使う。Git管理された `data/generated/` 配下のJSONは、手編集しない生成物として扱うため、サイト表示時に毎回Zod検証することは必須にしない。Excel入力のヘッダー、途中空行、日付入力順など、Excelを修正するための検証は変換スクリプト側の責務とする。

実装時に `read-excel-file` と `fflate` をdevDependencyとして追加した。`read-excel-file` は `.raw/release-notes.xlsx` の実ExcelファイルをTypeScript変換スクリプトから直接読み、シート名・セル値・改行を安定して扱うために使う。`fflate` はテスト内で実Excel本体に依存しない最小xlsx fixtureを生成するために使う。代替案として独自にxlsx zip/XMLをすべて解析する方法もあるが、仕様外の実装量と保守リスクが大きいため採用しない。`exceljs` も検討したが、`npm audit` で推移依存 `uuid` のmoderate vulnerabilityが残ったため採用しない。サイト本体とCI/CD通常buildは生成済みJSONを読むだけで、Excel本体や変換script実行を要求しない。

実装確認:

- `npm run convert:release-notes`: pass
- `npm run test`: pass
- `npm run check`: pass
- `npm run build`: pass
- `npm audit --omit=optional`: pass
- `docs/TODO.md`: リリースノートデータへ直接紐づく未対応項目なし

## ローカル検証メモ

- mode: local repository mode
- local branch: `18-0-release-notes-data`
- issue file: `docs/issue/18-0-release-notes-data.md`
- validated files:
  - `.github/ISSUE_TEMPLATE/issue-first-development.md`
  - `docs/plan.md`
  - `docs/TODO.md`
  - `docs/requirements/release-notes.md`
  - `docs/requirements/architecture.md`
  - `docs/development-structure.md`
  - `docs/out-of-scope.md`
  - `data/generated/README.md`
  - `package.json`
- local input check:
  - `.raw/release-notes.xlsx` exists
  - sheet name: `release-notes`
  - header row: `更新日`, `概要`, `本文`
  - sample body text includes a newline
- related TODO check:
  - `docs/TODO.md` currently has no unresolved item directly tied to release notes data
- design check:
  - this is a data preparation task, not a UI / CSS / layout / page / Component implementation task
  - no `docs/design/` target is required before implementation
- not yet verified:
  - `npm run test`
  - `npm run check`
  - `npm run build`
- note:
  - `docs/requirements/release-notes.md` still describes the user-facing column labels as `かんたんな説明` and `全文`, while the local Excel currently uses `概要` and `本文`. This issue treats the actual local Excel headers as the conversion source for task `18-0`, and the implementation should keep the conversion specification explicit about those headers.
