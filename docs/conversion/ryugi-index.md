# 流儀一覧変換仕様

## 目的

`.raw/data/ryugi-list.xlsx` を、流儀一覧ページと流儀詳細ページで共用する非スキル情報のJSONへ変換する。

この仕様は、`29-0-ryugi-index-data` における現時点の変換仕様正本である。変換処理、schema、生成JSONは、この契約に従って実装する。

## 入出力

| 項目             | 値                               |
| ---------------- | -------------------------------- |
| 入力Excel        | `.raw/data/ryugi-list.xlsx`      |
| 対象シート       | `ryugi-list`                     |
| 出力JSON         | `data/generated/ryugi-list.json` |
| JSONの`dataName` | `ryugi-list`                     |
| 変換コマンド     | `npm run convert:ryugi-list`     |
| データ取得層     | `src/lib/data/ryugi-list.ts`     |

Excel本体はローカル作業入力であり、Git管理しない。`data/generated/ryugi-list.json` は変換の出力としてGit管理し、手編集しない。CI/CDのbuildは入力Excelにも変換コマンドにも依存しない。

## 入力シート

`ryugi-list` シートは、1行目を項目グループ見出し、2行目を列見出し、3行目以降をデータ行とする。

### 1行目: 項目グループ見出し

1行目はデータへ出力しない。次のグループ見出しで列の意味を確認する。

| 列  | グループ見出し       |
| --- | -------------------- |
| E-F | `補足`               |
| G-H | `増加値`             |
| I-M | `基礎能力値`         |
| N-P | `共通スキルボーナス` |

グループ見出し以外のセルは空欄とする。変換時は1行目の構造を検証し、列追加、列削除、グループの移動を入力エラーとする。

### 2行目: 列見出しと変換先

| 列 | Excel見出し    | JSONフィールド              | 入力規則                                                                           |
| -- | -------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| A  | `ID`           | `id`                        | 必須。英小文字、数字、`-`だけを使う流儀ID。                                        |
| B  | `名称`         | `name`                      | 必須の1行テキスト。                                                                |
| C  | `短い説明`     | `shortDescription`          | 必須の1行テキスト。一覧カード用。                                                  |
| D  | `説明`         | `description`               | 必須テキスト。改行を保持する。                                                     |
| E  | `補足タイプ`   | `note.type`                 | Fと対で任意。`note`、`tip`、`warning`、`danger`、`example`、`version` のいずれか。 |
| F  | `補足本文`     | `note.content`              | Eと対で任意。改行を保持する。                                                      |
| G  | `体力増加値`   | `healthIncrease`            | 必須の正整数。                                                                     |
| H  | `精神力増加値` | `mindIncrease`              | 必須の正整数。                                                                     |
| I  | `筋力`         | `baseAttributes.strength`   | 必須の正整数。                                                                     |
| J  | `敏捷`         | `baseAttributes.agility`    | 必須の正整数。                                                                     |
| K  | `感覚`         | `baseAttributes.perception` | 必須の正整数。                                                                     |
| L  | `肉体`         | `baseAttributes.body`       | 必須の正整数。                                                                     |
| M  | `精神`         | `baseAttributes.mind`       | 必須の正整数。                                                                     |
| N  | `2lv`          | `commonSkillBonuses.level2` | 必須テキスト。改行を保持する。                                                     |
| O  | `5lv`          | `commonSkillBonuses.level5` | 必須テキスト。改行を保持する。                                                     |
| P  | `9lv`          | `commonSkillBonuses.level9` | 必須テキスト。改行を保持する。                                                     |

2行目の見出しは、上表の順序と完全一致しなければならない。

## 行の扱い

- 3行目以降を上から順に読み込む。
- 末尾の完全空行は読み込まない。
- データ領域内の完全空行、または必須列だけが空欄の部分行は入力エラーとする。
- 文字列の先頭・末尾の空白は除去する。本文、補足本文、共通スキルボーナス内の改行はLFへ正規化し、内部の改行と空白は保持する。
- `id`、`name`、`shortDescription`、`note.type` は改行を許可しない。
- 数値列は文字列や小数を許可せず、正整数として読み込む。
- `補足タイプ`と補足本文は、両方が空欄なら`note: null`、両方が入力されていれば`note`オブジェクトへ変換する。片方だけの入力はエラーとする。
- 共通スキルボーナスは文言を構造化分解せず、各レベルの改行を含むテキストとして保持する。

## IDと表示順

- 流儀IDはA列の明示値を使い、自動採番や名称からの生成をしない。
- IDは`^[a-z][a-z0-9-]*$`に一致し、全データで一意でなければならない。
- IDは後続の`/data/ryugi/[ryugiId]`と、流儀スキルの所属流儀IDを結び付ける基準とする。
- 出力配列の順序はExcelの入力順とする。ページ側や取得層で独自のソートをしない。
- 各データに、Excel入力順を1から連番で記録する`sourceOrder`を追加する。重複、欠番、順序逆転を許可しない。

## 出力JSON

出力は次の形とする。`updatedAt`は変換時刻をJSTオフセット`+09:00`付きISO 8601形式で記録する。同一データを再変換した場合は、既存JSONの`updatedAt`を維持する。

```json
{
  "dataName": "ryugi-list",
  "updatedAt": "2026-07-15T00:00:00+09:00",
  "data": [
    {
      "id": "kenkaya",
      "name": "ケンカヤ",
      "shortDescription": "気合獲得に優れた扱いやすい流儀です。",
      "description": "多くの気合いを獲得することができ、最も攻撃に優れた流儀です。",
      "note": {
        "type": "warning",
        "content": "補足本文"
      },
      "healthIncrease": 5,
      "mindIncrease": 2,
      "baseAttributes": {
        "strength": 5,
        "agility": 5,
        "perception": 1,
        "body": 3,
        "mind": 2
      },
      "commonSkillBonuses": {
        "level2": "攻撃判定数+1\n攻撃力+3",
        "level5": "行動回数+1",
        "level9": "攻撃判定数+1\nリアクション判定数+1"
      },
      "sourceOrder": 1
    }
  ]
}
```

このJSONは、次の表示で共用する。

- `29-2-ryugi-index-page` の流儀一覧と、共通スキルボーナスによるキャラクターメイキング／成長の項
- `30-2-ryugi-detail-page` の流儀名、説明、補足、基礎能力値、体力／精神力増加値、共通スキルボーナス

プライマリボーナススキルと流儀スキル一覧は、このJSONに含めない。これらは流儀スキルExcelを入力とする`30-0-ryugi-detail-data`で扱う。

## 検証

`RyugiSchema`は各データ行の型、必須項目、改行、数値、補足の組み合わせを検証する。`RyugiJsonSchema`または同等のassert helperは、JSON全体について次を検証する。

- `dataName`が`ryugi-list`であること
- `updatedAt`がJSTオフセット付きISO 8601形式であること
- `id`の書式と一意性
- 出力配列が空でないこと
- `sourceOrder`が1からの連番で、Excel入力順と一致すること
- 共通スキルボーナスの`level2`、`level5`、`level9`がすべて存在すること

入力エラーには、Excelの行番号、列記号、列見出しを含める。

## テスト

実Excel本体に依存しない最小fixtureを用意し、少なくとも次を確認する。

- 16列・2行ヘッダー・複数流儀を正しく変換できること
- 出力順と`sourceOrder`がExcel入力順を維持すること
- ID重複、不正なID、必須項目欠落、部分空行を拒否すること
- 補足列の片方だけの入力と、不正な補足タイプを拒否すること
- 正整数でない増加値・基礎能力値を拒否すること
- ヘッダー不一致、列追加、列削除を、行・列・見出しを含むエラーとして報告すること
- CRLFをLFへ正規化し、説明・補足・共通スキルボーナスの改行を保持すること
- 取得層が全流儀の入力順配列と、IDで指定した1件の流儀を返すこと
- Excelなしで、生成済み`ryugi-list.json`を使ったsite buildができること

## 対象外

- Excelや生成JSONを使うページUI、Component、designの実装
- 流儀スキルExcelの入力仕様、流儀スキルのJSON、所属流儀IDとの関連検証
- 共通スキルボーナスの文言を、効果種別・対象・増減値などの構造化データへ分解すること。現行は2／5／9レベルごとの複数行文字列として保持し、将来TODOで検討する。
- Excel上でのID自動生成、補足文や共通スキルボーナスの文言の自動修正
- CI/CD上でのExcel変換
