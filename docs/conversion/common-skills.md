# 共通スキルデータ変換仕様

## 目的

共通スキルExcelを、共通スキル一覧ページで利用する静的JSONへ変換する。

生成したJSONは `data/generated/common-skills.json` としてGit管理し、サイト実行時・CI/CDのbuild時はExcel本体に依存しない。

この仕様は、生成JSONの契約、変換スクリプト、Zod Schema、テストの正本とする。画面表示の詳細は `docs/requirements/data-display.md` と後続のComponent・ページissueで扱う。

## 前提

入力正本はリポジトリ直下のローカル作業入力 `.raw/data/common-skills.xlsx` とする。`.raw/` はGit管理しない。

Git管理するのは、変換仕様、変換スクリプト、検証スキーマ、テスト、生成済みJSONである。生成JSONは手編集せず、Excelを修正して変換スクリプトを再実行する。

スキルIDは、共通スキルを `skill-common-{category}-{normalizedTiming}-{index}` とする。`normalizedTiming` は本仕様のタイミング正規化表を使い、`index` は3桁ゼロ埋めの連番とする。

流儀・生き様スキルはこの入力ファイルの対象外である。後続タスクでは同じ接頭辞方針を使い、流儀を `skill-ryugi-{ryugiId}-{category}-{normalizedTiming}-{index}`、生き様を `skill-ikizama-{ikizamaId}-{category}-{normalizedTiming}-{index}` とする。

## 入力Excel

### 入力ファイル

```txt
.raw/data/common-skills.xlsx
```

### 対象シート

```txt
common-skills
```

シートが存在しない場合はエラーとする。

### シート構造

1行目をヘッダー行とする。次の現行12列を、この順序で受け入れる。

```txt
区分、名称、最大レベル、タイミング、コスト、技能、取得制限、対象、射程、使用制限、概要、効果
```

ヘッダー名、列数、順序が一致しない場合はエラーとする。未知ヘッダー、列の入れ替え、`ID` 列を含む追加列は許可しない。

## 読み取り範囲

- データ行は2行目以降とする。
- 現行12列を読み取る。
- 全列が空欄の行は完全空行として扱う。
- 末尾の完全空行は無視する。
- データ行の途中に完全空行がある場合はエラーとする。
- 必須項目が空欄の行はエラーとする。

変換時の入力エラーには、修正箇所を特定できる行番号と列名を含める。

## 列仕様

すべての文字列は前後の空白を削除し、改行コードを `\n` に正規化する。

| ヘッダー     | JSONフィールド           | 必須 | 仕様                                                                         |
| ------------ | ------------------------ | ---: | ---------------------------------------------------------------------------- |
| `区分`       | `category`               | 必須 | `bonus`、`basic`、`advanced` のいずれか。                                    |
| `名称`       | `name`                   | 必須 | 1行の文字列。空欄・改行はエラー。                                            |
| `最大レベル` | `maxLevel`               | 必須 | 正の整数。Excel数値セル、または正の整数だけからなる文字列を許可する。        |
| `タイミング` | `timing`                 | 必須 | 本仕様の許容表記のいずれか。改行はエラー。                                   |
| `コスト`     | `cost`                   | 任意 | 1行の文字列。空欄は `null`。                                                 |
| `技能`       | `proficiency`            | 任意 | 1行の文字列。空欄は `null`。判定を伴わない `Pv` などのスキルでは空欄にする。 |
| `取得制限`   | `acquisitionRestriction` | 任意 | 1行の文字列。空欄は `null`。                                                 |
| `対象`       | `target`                 | 必須 | 1行の文字列。空欄・改行はエラー。                                            |
| `射程`       | `range`                  | 任意 | 1行の文字列。空欄は `null`。                                                 |
| `使用制限`   | `usageRestriction`       | 任意 | 1行の文字列。空欄は `null`。                                                 |
| `概要`       | `summary`                | 必須 | 文字列。空欄はエラー。セル内改行を許可し、LFへ正規化する。                   |
| `効果`       | `effect`                 | 必須 | 文字列。空欄はエラー。セル内改行を許可し、LFへ正規化する。                   |

`コスト`、`技能`、`取得制限`、`射程`、`使用制限` は `SkillCard` で `-` と表示できる任意項目である。空文字列を生成JSONへ残さず、必ず `null` にする。

## タイミングとID正規化

`タイミング` は以下の表記だけを受け入れる。変換時は表示用の `timing` を変更せず、IDの `normalizedTiming` だけを対応する値へ置き換える。

| タイミング | `normalizedTiming` |
| ---------- | ------------------ |
| `Pv`       | `pv`               |
| `SU`       | `su`               |
| `INI`      | `ini`              |
| `CU`       | `cu`               |
| `M`        | `m`                |
| `A-A`      | `a`                |
| `R`        | `r`                |
| `Aa`       | `aa`               |
| `Ra`       | `ra`               |
| `D`        | `d`                |
| `SP`       | `sp`               |
| `×-A`      | `first-a`          |
| `A-×`      | `a-last`           |
| `☆-A`      | `start-a`          |
| `A-☆`      | `a-finish`         |
| `○-○`      | `any`              |

表にない値はエラーとする。

## ID生成と検証

### 形式

共通スキルIDは次の形式とする。

```txt
skill-common-{category}-{normalizedTiming}-{index}
```

- `category`: `bonus`、`basic`、`advanced` のいずれか。
- `normalizedTiming`: タイミング正規化表の値。
- `index`: 同じ `category` と `normalizedTiming` のグループ内連番。3桁ゼロ埋めの正の整数。

現在の入力例は、次のIDになる。

```txt
skill-common-bonus-any-001
```

### 自動採番

IDは常に変換時に自動採番する。各グループのExcel上の出現順に `001` から採番し、Excel側でIDを入力・固定しない。

初期スコープの静的ルールサイトでは、行の途中挿入、カテゴリ変更、タイミング変更、並び替えによってIDが変わることを許可する。個別アンカーへの既存リンクが変わることも許可する。

将来、キャラクターシート機能がスキルIDと取得レベルをDBへ保存する段階で、同一スキルのID変更を検出してエラーにする方針を別タスクで決定・実装する。この変換仕様は、その永続ID検出を実装しない。

## 出力JSON

### 出力先

```txt
data/generated/common-skills.json
```

### JSON形式

出力はメタ情報と、カテゴリをキー、各カテゴリのスキル配列を値に持つ `data` オブジェクトとする。

```json
{
  "dataName": "common-skills",
  "updatedAt": "2026-07-13T12:00:00+09:00",
  "data": {
    "bonus": [
      {
        "id": "skill-common-bonus-any-001",
        "owner": "common",
        "category": "bonus",
        "name": "基本の一撃",
        "maxLevel": 1,
        "timing": "○-○",
        "cost": "気0",
        "proficiency": "能動",
        "acquisitionRestriction": "自動習得",
        "target": "1体",
        "range": "武器",
        "usageRestriction": null,
        "summary": "仕事人が最初に身につける攻撃スキル。",
        "effect": "攻撃を行う。",
        "sourceOrder": 1
      }
    ],
    "basic": [],
    "advanced": []
  }
}
```

### トップレベルフィールド

| フィールド  | 型                       | 必須 | 説明                                                                       |
| ----------- | ------------------------ | ---: | -------------------------------------------------------------------------- |
| `dataName`  | `"common-skills"`        | 必須 | データ名称。固定値。                                                       |
| `updatedAt` | string                   | 必須 | `data` オブジェクトが最後に変化した日時。ISO 8601のJSTオフセット付き形式。 |
| `data`      | `CommonSkillsByCategory` | 必須 | カテゴリ別の共通スキル配列。                                               |

### CommonSkillsByCategoryフィールド

`data` は次の固定キーをすべて持つ。スキルがないカテゴリは空配列とする。

| キー       | 型        | 説明                              |
| ---------- | --------- | --------------------------------- |
| `bonus`    | `Skill[]` | `bonus` カテゴリのスキル配列。    |
| `basic`    | `Skill[]` | `basic` カテゴリのスキル配列。    |
| `advanced` | `Skill[]` | `advanced` カテゴリのスキル配列。 |

### Skillフィールド

| フィールド               | 型                                 | 必須 | 説明                            |
| ------------------------ | ---------------------------------- | ---: | ------------------------------- |
| `id`                     | string                             | 必須 | 共通スキルの安定ID。            |
| `owner`                  | `"common"`                         | 必須 | 所属種別。                      |
| `category`               | `"bonus" \| "basic" \| "advanced"` | 必須 | スキル区分。                    |
| `name`                   | string                             | 必須 | スキル名称。                    |
| `maxLevel`               | number                             | 必須 | 正の整数。                      |
| `timing`                 | string                             | 必須 | 表示用タイミング。              |
| `cost`                   | `string \| null`                   | 必須 | コスト。空欄は `null`。         |
| `proficiency`            | `string \| null`                   | 必須 | 技能。空欄は `null`。           |
| `acquisitionRestriction` | `string \| null`                   | 必須 | 取得制限。空欄は `null`。       |
| `target`                 | string                             | 必須 | 対象。                          |
| `range`                  | `string \| null`                   | 必須 | 射程。空欄は `null`。           |
| `usageRestriction`       | `string \| null`                   | 必須 | 使用制限。空欄は `null`。       |
| `summary`                | string                             | 必須 | 概要。LF改行を許可する。        |
| `effect`                 | string                             | 必須 | 効果。LF改行を許可する。        |
| `sourceOrder`            | number                             | 必須 | Excelの2行目を1とする正の連番。 |

## 表示順

生成JSONの `data` はカテゴリ別オブジェクトとする。各カテゴリ配列は、そのカテゴリに属するスキルのExcel入力順をそのまま保持する。カテゴリをまたぐ単一の配列は出力しない。

`sourceOrder` は、Excelの2行目を1とする全スキル共通の正の連番である。各カテゴリ配列では昇順とし、全カテゴリを合わせた値は重複・欠番なく `1` から総件数までの連番とする。Zod Schemaでこれらを検証する。

共通スキル一覧ページは、`bonus`、`basic`、`advanced` の順にカテゴリを上から表示し、各カテゴリ内では生成JSONの配列順をそのまま表示する。変換処理とUIは、スキルを独自に並び替えない。

### タイミング順の警告

ユーザーがカテゴリ内で意図的にスキルを並べたかを判断できないため、変換処理はタイミング順の不一致をエラーにしない。生成JSONは入力順を保持し、変換を成功させたまま警告を出力する。

順序検査では、各カテゴリ内のタイミングを次のグループ順として扱う。

1. 攻撃: `A-A`、`×-A`、`A-×`、`☆-A`、`A-☆`
2. `R`
3. `Pv`
4. `M`
5. `SU`
6. `INI`
7. `CU`
8. `Aa`
9. `Ra`
10. `D`
11. `SP`

同じグループ内の並びは自由とする。途中のグループを省略してよい。前に出現したグループより優先順位が高いグループが後から現れた場合は、その行について警告する。たとえば、`Pv` の後に `R` が現れた場合や、`R` の後に攻撃タイミングが現れた場合が対象である。

警告には、カテゴリ、Excel行番号、スキル名、直前までに出現したグループ、今回のタイミング、期待するグループ順を含める。警告は標準エラー出力へ出し、変換コマンドは成功として終了する。

## updatedAt 更新ルール

`updatedAt` は変換スクリプトの実行日時を無条件に入れてはならない。

変換スクリプトは、今回生成した `data` オブジェクトと既存の `data/generated/common-skills.json` の `data` オブジェクトを比較する。

- 既存JSONが存在しない場合は初回生成とし、今回の生成時刻を `updatedAt` に入れる。
- 既存JSONが存在し、`data` オブジェクトが同一の場合は既存の `updatedAt` を維持する。
- 既存JSONが存在し、`data` オブジェクトが異なる場合は今回の生成時刻を `updatedAt` に入れる。
- 既存JSONが壊れている、`dataName` が `common-skills` ではない、またはSchemaに一致しない場合はエラーとする。

比較対象は `data` オブジェクトだけとする。JSONのインデント、キー順、`updatedAt` の差だけではデータ変更と扱わない。

## 検証責務

### 変換スクリプト

変換スクリプトは、Excel入力をユーザーが修正できる形で検証する。

- 入力ファイルとシートの存在
- ヘッダー構成
- 途中空行
- 必須項目と正の最大レベル
- カテゴリとタイミング
- 改行を許可しない列
- 自動生成IDの形式と重複
- 既存JSONの読み込みと `updatedAt` 更新規則

### Zod Schema

Zod Schemaは、生成JSONのデータ契約を検証する。

- トップレベルの厳密なフィールド構成
- `dataName`、ISO 8601の `updatedAt`
- `data` の固定カテゴリキーと、各配列内の `Skill.category` の一致
- `Skill` の必須・nullableフィールド、`owner: "common"`、カテゴリ、タイミング、最大レベル
- ID形式、ID重複、IDとカテゴリ・タイミングの整合
- LF以外の改行を含まない文字列
- `sourceOrder` の全カテゴリにわたる正の連番・一意性と、各カテゴリ配列内の昇順

通常のサイト表示では、Git管理された生成JSONを都度再検証しない。変換時、テスト時、必要なデータ検証時にSchemaを使う。

## 変換コマンド

変換スクリプトのentrypointは `scripts/convert-common-skills/main.ts` とする。

```sh
npm run convert:common-skills
```

このコマンドは `.raw/data/common-skills.xlsx` を読み、`data/generated/common-skills.json` を更新する。CI/CDのbuild工程には含めない。

## テスト観点

変換スクリプト、Zod Schema、データ取得層は少なくとも次を検証する。

- 現在の12列・1件の共通スキルを `skill-common-bonus-any-001` として変換できる。
- `data` が `bonus`、`basic`、`advanced` をキーに持ち、各カテゴリへ該当スキルだけを格納する。
- Excelの入力順に従って自動採番し、途中挿入や並び替えでIDが変わることを許容する。
- 必須項目の空欄、正でない最大レベル、途中空行、無効なヘッダーを拒否する。
- 無効なカテゴリ、タイミング、生成IDの形式、ID重複を拒否する。
- `技能` を含む任意項目の空欄を `null` にし、`概要`・`効果` の改行をLFへ正規化する。
- カテゴリ別配列内の入力順と、全カテゴリにわたる `sourceOrder` を保持する。
- タイミンググループの順序が逆転した場合は、変換を失敗させず行番号付きの警告を出力する。
- 既存データと同一なら `updatedAt` を維持し、異なるなら更新する。
- 取得層がコミット済みの生成JSONを読み込める。

## 備考

この仕様は共通スキルの変換だけを対象とする。`SkillList`、`SkillCard`、`/data/common-skills` の実装、流儀・生き様スキルの変換は対象外とする。

スキルIDの共通方針は、同一タスクで `docs/requirements/data-id-policy.md` と `docs/game-design/skills.md` へ反映する。
