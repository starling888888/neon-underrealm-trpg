# リリースノートデータ変換仕様

## 目的

リリースノートExcelを、トップページおよび更新履歴ページで利用する静的JSONへ変換する。

生成したJSONは `data/generated/release-notes.json` としてGit管理し、サイト実行時・CI/CDビルド時はExcel本体に依存しない。

出力JSONは、JSON単体でも何のデータか判別できるように、データ名称、最終更新日時、配列データ本体を持つオブジェクト形式とする。

## 前提

この仕様は、リポジトリ直下のローカル作業入力 `.raw/release-notes.xlsx` を入力正本とする。

`.raw/` はGit管理しない。Git管理するのは、変換仕様、変換スクリプト、検証スキーマ、テスト、生成済みJSONである。

リリースノートExcelは下方向に追記される。つまり、古い更新履歴が上、新しい更新履歴が下に増える。

## 入力Excel

### 入力ファイル

```txt
.raw/release-notes.xlsx
```

### 対象シート

```txt
release-notes
```

### シート構造

1行目をヘッダー行とする。

| 列 | ヘッダー | 必須 | 説明                                 |
| -- | -------- | ---: | ------------------------------------ |
| A  | 更新日   | 必須 | リリースノートの日付                 |
| B  | 概要     | 必須 | トップページなどで表示する短い説明   |
| C  | 本文     | 任意 | 更新履歴ページで表示する全文。空欄可 |

`概要` は要件上の「かんたんな説明」に相当する。

`本文` は要件上の「全文」に相当する。

現時点の想定ヘッダーは以下。

```txt
A1: 更新日
B1: 概要
C1: 本文
```

## 入力データの追加方針

更新履歴は、Excel上で下方向に追記する。

```txt
1行目: ヘッダー
2行目: 古い履歴
3行目: 次の履歴
4行目: さらに新しい履歴
...
```

この前提により、同じ更新日の履歴が複数ある場合は、より下の行を新しい履歴として扱う。

## 読み取り範囲

- データ行は2行目以降とする。
- A列からC列までを読み取る。
- A列、B列、C列がすべて空欄の行は空行として扱う。
- 末尾の完全空行は無視する。
- データ行の途中に完全空行がある場合はエラーとする。
  - 理由: 更新履歴は下方向に連続追記される前提であり、途中空行は行の削除漏れ・入力漏れの可能性が高いため。

## 列仕様

### 更新日

- 必須。
- Excelの日付セル、または `YYYY-MM-DD` 形式の文字列を許可する。
- 変換後は `YYYY-MM-DD` 形式の文字列に正規化する。
- 時刻情報が含まれている場合、日付部分のみを使用する。
- 不正な日付、空欄、解釈不能な文字列はエラーとする。

例:

```txt
2026-07-07
```

### 概要

- 必須。
- 前後の空白は削除する。
- 空欄はエラーとする。
- 原則として1行の短文とする。
- 改行が含まれる場合はエラーとする。
  - 複数行の説明は `本文` に記載する。

例:

```txt
仮公開しました。
```

### 本文

- 任意。
- 空欄を許可する。
- 前後の空白は削除する。
- セル内改行は保持する。
- 改行コードは `\n` に正規化する。
- 本文が空欄の場合、JSON上は `null` とする。
- 表示時には `本文` が `null` の場合、`概要` をfallbackとして表示する。

例:

```txt
仮公開しました。
現在作成中です。
```

## 入力順バリデーション

Excel上の更新日は、上から下へ向かって古い順、または同日付で並んでいる必要がある。

つまり、下の行の日付が上の行の日付より古い場合はエラーとする。

許可:

```txt
2026-07-01
2026-07-07
2026-07-07
2026-07-10
```

エラー:

```txt
2026-07-10
2026-07-07
```

理由は、更新履歴は下方向へ追記される運用であり、途中に古い日付が混ざると表示順とID生成の安定性が崩れるため。

## ID生成ルール

各リリースノートには、安定した `id` を生成する。

形式は以下。

```txt
YYYY-MM-DD-NNN
```

- `YYYY-MM-DD` は正規化済みの更新日。
- `NNN` は同じ更新日内での出現順。
- 出現順はExcel上の上から下への順序で数える。
- 3桁ゼロ埋めとする。

例:

```txt
2026-07-07-001
2026-07-07-002
```

同じ日に2件追加した場合、下に追記した2件目は `2026-07-07-002` となる。

## 出力JSON

### 出力先

```txt
data/generated/release-notes.json
```

このJSONは生成物として扱い、原則として手編集しない。

リリースノートを修正する場合は、Excelを修正して変換スクリプトを再実行する。

### JSON形式

出力は、メタ情報と `data` 配列を持つオブジェクトとする。

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

### トップレベルフィールド

| フィールド | 型            | 必須 | 説明                                       |
| ---------- | ------------- | ---: | ------------------------------------------ |
| dataName   | string        | 必須 | データ名称。固定値 `release-notes`         |
| updatedAt  | string        | 必須 | このJSONの `data` 配列が最後に変化した日時 |
| data       | ReleaseNote[] | 必須 | リリースノート配列                         |

### ReleaseNoteフィールド

| フィールド  | 型             | 必須 | 説明                                    |
| ----------- | -------------- | ---: | --------------------------------------- |
| id          | string         | 必須 | 安定ID                                  |
| date        | string         | 必須 | `YYYY-MM-DD` 形式の更新日               |
| summary     | string         | 必須 | 簡単な説明                              |
| body        | string \| null | 必須 | 全文。空欄の場合は `null`               |
| sourceOrder | number         | 必須 | Excel上のデータ順。2行目を1として数える |

`sourceOrder` は表示用ではなく、同日付内の安定順序確認およびデバッグ用の内部情報として扱う。

## 表示順

生成JSON内の `data` 配列は、新しい履歴を先に表示できるよう、変換時に並べ替える。

ソートルールは以下とする。

1. `date` の降順
2. 同じ `date` の場合、`sourceOrder` の降順
3. それでも同一になる場合は、変換時にエラーとする

このため、同一日付で複数の更新履歴を追加した場合、後から下に追記したものが先に表示される。

## updatedAt 更新ルール

`updatedAt` は、変換スクリプトの実行日時を無条件に入れてはならない。

変換スクリプトは、今回Excelから生成した `data` 配列と、既存の `data/generated/release-notes.json` の `data` 配列を比較する。

- 既存JSONが存在しない場合
  - 初回生成として扱う。
  - エラーにしない。
  - `updatedAt` には今回の生成時刻を入れる。
- 既存JSONが存在し、今回生成した `data` と既存JSONの `data` が同一の場合
  - 既存JSONの `updatedAt` を維持する。
  - 実行時刻で更新しない。
- 既存JSONが存在し、今回生成した `data` と既存JSONの `data` が異なる場合
  - `updatedAt` を今回の生成時刻に更新する。
- 既存JSONが存在するが、JSONとして壊れている、または期待する形式でない場合
  - エラーとする。
  - ただし、ファイル不存在だけは初回実行として許可する。

比較対象は `data` 配列のみとする。

以下だけでは、データ差分があるとは判定しない。

- `updatedAt` の違い
- `dataName` の違い
  - ただし、既存JSONの `dataName` が `release-notes` でない場合は、差分ではなく形式エラーとする。
- JSONのインデント差
- オブジェクトキー順の違い

以下は差分として扱う。

- リリースノート件数の増減
- `id` の変化
- `date` の変化
- `summary` の変化
- `body` の変化
- `sourceOrder` の変化
- 配列順序の変化

### updatedAt形式

`updatedAt` はISO 8601形式の文字列とする。

日本時間で出力する場合は以下の形式を基本とする。

```txt
YYYY-MM-DDTHH:mm:ss+09:00
```

例:

```txt
2026-07-07T19:30:00+09:00
```

## TypeScript型

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

## 検証スキーマ

検証スキーマは、生成済みJSONのデータ契約を定義する。

Excel入力の検証、正規化、行番号付きエラーは変換スクリプトの責務とする。検証スキーマは、変換後に組み立てた `ReleaseNotesJson` が公開用JSONとして妥当かを確認するために使う。

サイト表示時のデータ取得処理では、Git管理された `data/generated/release-notes.json` を通常は信頼する。ページ表示のたびにZodで再検証することは必須にしない。

`ReleaseNotesJson` の検証では以下を確認する。

- `dataName` が `release-notes` である。
- `updatedAt` がISO 8601形式の日時文字列である。
- `data` が配列である。
- `data` 内の各要素が `ReleaseNote` スキーマに従う。

`ReleaseNote` の検証では以下を確認する。

- `id` が空でない。
- `id` が `YYYY-MM-DD-NNN` 形式である。
- `date` が `YYYY-MM-DD` 形式である。
- `summary` が空でない。
- `summary` に改行が含まれない。
- `body` は `string` または `null` である。
- `body` が `string` の場合、改行コードは `\n` に正規化されている。
- `sourceOrder` が正の整数である。
- `id` が重複していない。
- `data` 配列が `date` 降順、同日付では `sourceOrder` 降順に並んでいる。

`date` と `updatedAt` の形式検証は、Zodの組み込みISO helperを優先する。`id` の `YYYY-MM-DD-NNN` 形式はプロジェクト固有ルールとして正規表現またはカスタム検証で扱う。

## データ取得処理

ページ側はJSONを直接加工せず、データ取得関数を通して利用する。

想定する関数は以下。

```ts
export function getReleaseNotesJson(): ReleaseNotesJson;
export function getReleaseNotes(): ReleaseNote[];
export function getLatestReleaseNotes(limit?: number): ReleaseNote[];
export function getReleaseNoteBody(note: ReleaseNote): string;
```

### getReleaseNotesJson

- `data/generated/release-notes.json` を読み込む。
- 生成時・テスト時に検証済みのGit管理JSONを `ReleaseNotesJson` として返す。
- サイト表示時に毎回Zod検証を行うことは必須にしない。
- `updatedAt` を表示またはデバッグ用途で参照する場合に使用する。

### getReleaseNotes

- `getReleaseNotesJson().data` を返す。
- 生成時・テスト時に検証済みの全件を返す。
- 戻り値は `date` 降順、同日付では `sourceOrder` 降順とする。

### getLatestReleaseNotes

- `getReleaseNotes()` の先頭から指定件数を返す。
- `limit` のデフォルトは `5` とする。
- トップページの最新5件表示で使用する。

### getReleaseNoteBody

- `note.body` が `null` または空文字相当の場合、`note.summary` を返す。
- それ以外の場合、`note.body` を返す。
- 更新履歴ページの本文表示で使用する。

## 変換スクリプト

### 配置方針

変換スクリプトは `scripts` 配下に専用ディレクトリを切って配置する。

配置パスは実装時にリポジトリの最新のscript配置方針へ合わせる。

この仕様では、スクリプトの責務と入出力仕様を正本とし、具体的な配置パスは承認済みissueおよび `docs/development-structure.md` に従う。

### 想定npm script

```json
{
  "scripts": {
    "convert:release-notes": "node --import tsx <release-notes-converter-entrypoint>"
  }
}
```

`<release-notes-converter-entrypoint>` は実装時の配置パスに置き換える。

### 変換処理の責務

変換スクリプトは以下を行う。

1. `.raw/release-notes.xlsx` を読み込む。
2. `release-notes` シートを取得する。
3. 1行目のヘッダーを検証する。
4. 2行目以降を読み取る。
5. 末尾空行を無視する。
6. 途中空行を検出した場合はエラーにする。
7. 各行の `更新日`、`概要`、`本文` を正規化する。
8. 入力順が古い順になっているか検証する。
9. `id` を生成する。
10. `sourceOrder` を付与する。
11. JSON出力順へ並べ替える。
12. 今回生成した `data` 配列を作成する。
13. 既存の `data/generated/release-notes.json` が存在するか確認する。
14. 既存JSONが存在しない場合は初回生成として扱い、エラーにしない。
15. 既存JSONが存在する場合は `ReleaseNotesJson` として検証する。
16. 既存JSONの `data` 配列と今回生成した `data` 配列を比較する。
17. `data` が同一なら既存JSONの `updatedAt` を維持する。
18. `data` が異なる、または初回生成なら `updatedAt` を今回の生成時刻にする。
19. `dataName`、`updatedAt`、`data` を持つ `ReleaseNotesJson` を組み立てる。
20. 生成済みJSONの契約として `ReleaseNotesJson` スキーマで検証する。
21. `data/generated/release-notes.json` に整形済みJSONを書き出す。

### 初回実行時の扱い

`data/generated/release-notes.json` が存在しない場合、変換スクリプトはエラーにしない。

この場合は初回生成として扱い、以下のような構造で出力する。

```json
{
  "dataName": "release-notes",
  "updatedAt": "2026-07-07T19:30:00+09:00",
  "data": []
}
```

実際には、Excelから読み取ったデータが `data` に入る。

既存ファイルが存在しないことだけを理由に変換失敗としてはならない。

### JSON整形

- インデントは2スペースとする。
- ファイル末尾に改行を付ける。
- 日本語はエスケープしない。

## エラー条件

以下の場合は変換を失敗させる。

- 入力Excel `.raw/release-notes.xlsx` が存在しない。
- 対象シート `release-notes` が存在しない。
- ヘッダーが `更新日 / 概要 / 本文` と一致しない。
- データ行の途中に完全空行がある。
- `更新日` が空欄。
- `更新日` が日付として解釈できない。
- `概要` が空欄。
- `概要` に改行が含まれる。
- 上から下への日付順が逆転している。
- 生成された `id` が重複している。
- 既存JSONが存在するが、JSONとして壊れている。
- 既存JSONが存在するが、`ReleaseNotesJson` 形式に違反している。
- 既存JSONの `dataName` が `release-notes` ではない。
- 生成JSONが `ReleaseNotesJson` スキーマに違反している。
- `data/generated/release-notes.json` への書き込みに失敗した。

## テスト観点

最低限、以下をテストする。

### 正常系

- 1件のリリースノートを変換できる。
- 複数件のリリースノートを変換できる。
- 出力JSONが `dataName`、`updatedAt`、`data` を持つ。
- `dataName` が `release-notes` になる。
- Excel上で下に追記された新しい履歴が、JSONの `data` では先頭に来る。
- 同一日付の場合、下にある行がJSONの `data` では先頭に来る。
- `本文` のセル内改行が `\n` として保持される。
- `本文` が空欄の場合、JSONでは `body: null` になる。
- 既存JSONが存在しない初回実行でもエラーにならない。
- 初回実行時は `updatedAt` が設定される。
- 既存JSONの `data` と今回生成した `data` が同じ場合、既存の `updatedAt` が維持される。
- 既存JSONの `data` と今回生成した `data` が異なる場合、`updatedAt` が更新される。
- `updatedAt` の違いだけではdata差分扱いにならない。
- `getReleaseNotesJson()` がメタ情報付きJSONを返す。
- `getReleaseNotes()` が `data` 配列を返す。
- `getReleaseNoteBody()` が `body: null` のとき `summary` を返す。
- `getLatestReleaseNotes()` が最新5件を返す。

### 異常系

- 入力Excelが存在しない場合にエラーになる。
- 対象シートが存在しない場合にエラーになる。
- ヘッダーが異なる場合にエラーになる。
- `更新日` が空欄の場合にエラーになる。
- `更新日` が不正な文字列の場合にエラーになる。
- `概要` が空欄の場合にエラーになる。
- `概要` に改行がある場合にエラーになる。
- 途中空行がある場合にエラーになる。
- 下の行に古い日付がある場合にエラーになる。
- ID重複が検出される。
- 既存JSONが壊れている場合にエラーになる。
- 既存JSONの `dataName` が `release-notes` ではない場合にエラーになる。
- 既存JSONに `data` がない場合にエラーになる。
- 既存JSONに `updatedAt` がない場合にエラーになる。

## サンプル

入力Excel:

| 更新日     | 概要             | 本文                                 |
| ---------- | ---------------- | ------------------------------------ |
| 2026-07-07 | 仮公開しました。 | 仮公開しました。<br>現在作成中です。 |

出力JSON:

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

## 備考

この仕様では、Excel上の行順を履歴追加順として扱う。

ユーザー運用として「更新履歴は下に増えていく」ため、Excel上の最新履歴は下にある。一方で、サイト表示では最新履歴を上に出す必要があるため、変換時に `date` 降順、同日付では `sourceOrder` 降順へ並べ替える。

`updatedAt` は変換スクリプト実行時刻ではなく、出力される `data` 配列が最後に変化した日時を表す。したがって、Excel内容に変更がない状態で変換スクリプトを再実行しても、`updatedAt` は変化しない。

トップページおよび更新履歴ページの具体的なUI実装は、この変換仕様の対象外とする。
