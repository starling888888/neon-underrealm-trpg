# 生き様スキル変換仕様

## 目的

`.raw/data/ikizama-skills.xlsx` の生き様別シートを、`/data/ikizama/[ikizamaId]` の後続詳細ページが
生き様IDで参照できる1つのJSONへ変換する。既存の生き様基礎情報と、生き様スキルを同じ詳細用取得結果で
返せるようにする。

Excel列、カテゴリ、タイミング、スキルID、生成JSON、Schema、Warningの共通契約は
[スキルデータ変換仕様](./skills.md) に従う。この仕様は生き様スキル固有の入力、`Ikizama`との関連、
出力、関連アイテム種別の参照契約、取得契約を定義する。

## 入出力

| 項目                     | 値                                               |
| ------------------------ | ------------------------------------------------ |
| 入力Excel                | `.raw/data/ikizama-skills.xlsx`                  |
| 対象シート               | `ikizama.json`の全`Ikizama.id`と同名             |
| 出力JSON                 | `data/generated/ikizama-skills.json`             |
| JSONの`dataName`         | `ikizama-skills`                                 |
| 生き様基礎データ         | `data/generated/ikizama.json`                    |
| 生き様基礎変換コマンド   | `npm run convert:ikizama`                        |
| 生き様スキル変換コマンド | `npm run convert:ikizama-skills`（今回追加する） |
| データ取得層             | `src/lib/data/ikizama-detail.ts`（今回追加する） |

Excel本体はローカル作業入力であり、Git管理しない。2つの生成JSONは変換の出力としてGit管理し、
手編集しない。CI/CDのbuildは入力Excelにも変換コマンドにも依存しない。

`ikizama-list.xlsx`を更新した場合は、先に`npm run convert:ikizama`で基礎データを再生成する。
その後、生成済み`ikizama.json`から所有者IDを読み、`npm run convert:ikizama-skills`でスキルを再生成する。

## 入力シート

`ikizama.json` の各 `Ikizama.id` と同名のシートを、1つずつ入力とする。シート名が所属生き様IDであり、
スキル行へ所属ID列を追加しない。生き様ごとのシートは統合しない。

Excelのシート名集合は `ikizama.json` の `Ikizama.id` 集合と完全一致しなければならない。生き様IDと
一致しないシート名、生き様に対応するシートの欠落、生き様IDに対応しない余分なシートは関連検証エラーとする。

各生き様シートは、1行目をヘッダー行、2行目以降をデータ行とする。ヘッダーは次と完全一致しなければ
ならない。

```txt
区分、名称、最大レベル、タイミング、コスト、技能、取得制限、対象、射程、使用制限、概要、効果
```

各列の必須・任意、空欄、改行、完全空行、カテゴリ、タイミング、Warningの規則は
[スキルデータ変換仕様](./skills.md) に従う。

## 生き様ID、スキルID、表示順

- シート名は既存 `Ikizama.id` とスキルを結び付ける唯一の外部キーとする。生き様名、シートの位置、
  スキル行の値から所属を推測しない。
- スキルIDは `skill-ikizama-{ikizamaId}-{category}-{normalizedTiming}-{index}` とする。
- `index` は同じ生き様ID、カテゴリ、正規化タイミングのグループ内で、該当シートのExcel入力順に
  `001`から自動採番する。
- `sourceOrder` は各生き様シートのExcel入力順を表す1からの連番とする。同じ生き様のカテゴリ配列は
  `sourceOrder`昇順を維持する。異なる生き様間で同じ `sourceOrder` を持つことは許可する。
- 生成JSON全体でスキルIDは一意でなければならない。データカードの個別アンカーはこのIDを使う。

## 出力JSON

出力は次の形とする。`updatedAt`は変換時刻をJSTオフセット`+09:00`付きISO 8601形式で記録する。
同一データを再変換した場合は、既存JSONの`updatedAt`を維持する。生き様ID集合の追加・削除などで
`data`が変化した場合は、新しい変換時刻へ更新する。

```json
{
  "dataName": "ikizama-skills",
  "updatedAt": "2026-07-22T00:00:00+09:00",
  "data": {
    "burai": {
      "bonus": [],
      "basic": [],
      "advanced": []
    }
  }
}
```

`data`のキーは生き様IDであり、各シートの変換結果をこの1つのJSONへ集約する。各 `Skill` の
フィールド規則は [スキルデータ変換仕様](./skills.md) に従う。

## 生き様詳細の取得

詳細用取得層は生き様IDを受け取り、次の形を返す。存在しないID、または基礎データとスキルデータの
対応が欠けるIDには `undefined` を返す。

```ts
interface IkizamaDetail {
  ikizama: Ikizama;
  skills: SkillsByCategory;
}
```

`ikizama.exclusiveItem` はこの結果内の基礎データに含む。スキルごとに生き様IDを重複出力せず、
取得層は独自の並び替えを行わない。

## 関連アイテム種別の参照契約

`Ikizama.exclusiveItem` は個別アイテムではなく、関連アイテム一覧へのリンク先を決める**アイテム種別**を
表す。`exclusiveItem.id` は `Item.id` や個別ItemCardのアンカーIDとして扱わない。

32-0で受け入れる種別IDと表示名、リンク先は次の固定対応とする。`cybanetics` は受け入れず、
`cybernetics` へのaliasまたは自動正規化を行わない。

| 種別ID         | 表示名     | リンク先                   |
| -------------- | ---------- | -------------------------- |
| `omamori`      | お守り     | `/data/items/omamori`      |
| `cybernetics`  | サイバネ   | `/data/items/cybernetics`  |
| `nanomachines` | ナノマシン | `/data/items/nanomachines` |
| `drugs`        | ドラッグ   | `/data/items/drugs`        |

`ikizama-list.xlsx` の更新済みケジメ行は `cybernetics` / `サイバネ` を使う。変換時または詳細データの
関連検証では、各 `exclusiveItem` が上表のID・名称対と一致し、リンク先が一意に導けることを検証する。

個別アイテムの実体JSON、`Item.id`、個別ItemCardのアンカーはまだ存在しないため、この仕様では生成・
参照・存在検証しない。各アイテムデータtaskが完了した後のfollow-upで、個別アイテムを関連付ける入力が
追加される場合に限り、`Item.id`とアンカーの存在および一意性を検証する。このfollow-upまでは
`exclusiveItem`に個別アンカーを追加しない。

## 検証

`IkizamaSkillsJsonSchema` または同等のassert helperは、少なくとも次を検証する。

- `dataName`が`ikizama-skills`であること
- `updatedAt`がJSTオフセット付きISO 8601形式であること
- 入力Excelのシート名集合と、生成JSONの生き様ID集合が `ikizama.json` の `Ikizama.id` 集合と完全一致すること
- 各生き様が `bonus`、`basic`、`advanced` の固定キーをすべて持つこと
- 各スキルIDが所属生き様ID、カテゴリ、正規化タイミング、連番と一致し、全体で一意であること
- `sourceOrder`が生き様ごとに1からの連番かつ一意であり、各カテゴリ配列が昇順であること
- 詳細用取得層が返す `Ikizama` とスキルの所有者IDが一致すること
- `Ikizama.exclusiveItem` がアイテム種別の固定対応に一致し、`cybanetics` を受け入れないこと

入力エラーには、Excelの行番号、列記号、列見出しを含める。関連アイテム種別の不一致は、対象の
生き様ID、入力された種別ID・名称、許可値を含むエラーとして報告する。

## テスト

実Excel本体に依存しない最小fixtureを用意し、少なくとも次を確認する。

- 12列・1行ヘッダー・複数生き様シートを、1つのJSONへ正しく集約できること
- シート名と `Ikizama.id` の一致、シートの欠落・余分・不正なシート名を検証できること
- 生き様ごとのID採番、`sourceOrder`、カテゴリ配列の表示順を検証すること
- スキルID重複、必須値欠落、部分空行を拒否すること
- 生き様IDと対応するスキルを、詳細用取得層が同じ結果として返すこと
- 存在しない生き様ID、または生き様・スキルの対応欠落で詳細用取得層が `undefined` を返すこと
- `cybernetics` を含む許可済みのアイテム種別ID・名称・リンク先を受け入れること
- `cybanetics`、未知の種別ID、種別IDと名称の不一致を拒否すること
- 個別Item JSONまたは個別アンカーがなくても、種別参照契約の検証とsite buildができること
- Excelなしで、生成済み`ikizama.json`と`ikizama-skills.json`を使ったsite buildができること

## 対象外

- 生き様詳細ページ、カードUI、MDX本文、designの実装
- 個別アイテムの実体データ、アイテム変換仕様、`Item.id`、個別ItemCardのアンカー、
  これらとの存在・整合性検証
- Excel本体またはGoogle Driveの編集
- Web上でのExcel編集・変換実行
- CI/CD上でのExcel変換
