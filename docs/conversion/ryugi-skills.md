# 流儀スキル変換仕様

## 目的

`.raw/data/ryugi-skills.xlsx` の流儀別シートを、流儀詳細ページと将来のキャラクターシートが
流儀IDで参照できる1つのJSONへ変換する。

Excel列、カテゴリ、タイミング、ID、生成JSON、Schema、Warningの共通契約は
[スキルデータ変換仕様](./skills.md) に従う。この仕様は流儀スキル固有の入力、流儀との関連、
出力、取得契約を定義する。

## 入出力

| 項目             | 値                                     |
| ---------------- | -------------------------------------- |
| 入力Excel        | `.raw/data/ryugi-skills.xlsx`          |
| 対象シート       | `ryugi-list.json`の全`Ryugi.id`と同名  |
| 出力JSON         | `data/generated/ryugi-skills.json`     |
| JSONの`dataName` | `ryugi-skills`                         |
| 変換コマンド     | `npm run convert:ryugi-skills`（予定） |
| データ取得層     | `src/lib/data/ryugi-detail.ts`（予定） |
| 関連流儀データ   | `data/generated/ryugi-list.json`       |

Excel本体はローカル作業入力であり、Git管理しない。`data/generated/ryugi-skills.json` は変換の
出力としてGit管理し、手編集しない。CI/CDのbuildは入力Excelにも変換コマンドにも依存しない。

## 入力シート

`ryugi-list.json` の各 `Ryugi.id` と同名のシートを、1つずつ入力とする。シート名が所属流儀IDであり、
スキル行へ所属ID列を追加しない。流儀ごとのシートは統合しない。

Excelのシート名集合は `ryugi-list.json` の `Ryugi.id` 集合と完全一致しなければならない。流儀IDと
一致しないシート名、流儀に対応するシートの欠落、流儀IDに対応しない余分なシートは関連検証エラーとする。

各流儀シートは、1行目をヘッダー行、2行目以降をデータ行とする。ヘッダーは次と完全一致しなければ
ならない。

```txt
区分、名称、最大レベル、タイミング、コスト、技能、取得制限、対象、射程、使用制限、概要、効果
```

各列の規則は [スキルデータ変換仕様](./skills.md) に従う。

## 流儀ID、スキルID、表示順

- シート名は既存 `Ryugi.id` とスキルを結び付ける唯一の外部キーとする。流儀名、シートの位置、
  スキル行の値から所属を推測しない。
- スキルIDは `skill-ryugi-{ryugiId}-{category}-{normalizedTiming}-{index}` とする。
- `index` は同じ流儀ID、カテゴリ、正規化タイミングのグループ内で、該当シートのExcel入力順に
  `001`から自動採番する。
- `sourceOrder` は各流儀シートのExcel入力順を表す1からの連番とする。同じ流儀のカテゴリ配列は
  `sourceOrder`昇順を維持する。異なる流儀間で同じ `sourceOrder` を持つことは許可する。
- 生成JSON全体でスキルIDは一意でなければならない。データカードの個別アンカーはこのIDを使う。

## 出力JSON

出力は次の形とする。`updatedAt`は変換時刻をJSTオフセット`+09:00`付きISO 8601形式で記録する。
同一データを再変換した場合は、既存JSONの`updatedAt`を維持する。

```json
{
  "dataName": "ryugi-skills",
  "updatedAt": "2026-07-21T00:00:00+09:00",
  "data": {
    "kenkaya": {
      "bonus": [],
      "basic": [],
      "advanced": []
    }
  }
}
```

`data` のキーは流儀IDであり、各シートの変換結果をこの1つのJSONへ集約する。各 `Skill` の
フィールド規則は [スキルデータ変換仕様](./skills.md) に従う。後続の詳細用取得層は流儀IDを受け取り、
`ryugi-list.json` の `Ryugi` と、このJSONの対応するカテゴリ別スキルを同じ結果として返す。

## 検証

`RyugiSkillsJsonSchema` または同等のassert helperは、少なくとも次を検証する。

- `dataName`が`ryugi-skills`であること
- `updatedAt`がJSTオフセット付きISO 8601形式であること
- 入力Excelのシート名集合と、生成JSONの流儀ID集合が `ryugi-list.json` の `Ryugi.id` 集合と完全一致すること
- 各流儀が `bonus`、`basic`、`advanced` の固定キーをすべて持つこと
- 各スキルIDが所属流儀ID、カテゴリ、正規化タイミング、連番と一致し、全体で一意であること
- `sourceOrder`が流儀ごとに1からの連番かつ一意であり、各カテゴリ配列が昇順であること

## テスト

実Excel本体に依存しない最小fixtureを用意し、少なくとも次を確認する。

- 12列・1行ヘッダー・複数流儀シートを、1つのJSONへ正しく集約できること
- シート名と `Ryugi.id` の一致、シートの欠落・余分・不正なシート名を検証できること
- 流儀ごとのID採番、流儀ごとの`sourceOrder`、カテゴリ配列の表示順を検証すること
- スキルID重複、必須値欠落、部分空行を拒否すること
- Excelなしで、生成済み`ryugi-skills.json`と`ryugi-list.json`を使ったsite buildができること

## 対象外

- 流儀詳細ページ、カードUI、MDX本文、designの実装
- Excel本体またはGoogle Driveの編集
- Web上でのExcel編集・変換実行
- CI/CD上でのExcel変換
