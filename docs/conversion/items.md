# items.xlsx 変換仕様

## 目的と範囲

- 入力は `.raw/data/items.xlsx` の6シートだけとする。
- この文書は変換実装、Schema、生成JSONの契約を定義する。画面実装は対象外とする。
- 出力は `data/generated/items.json` 1ファイルとする。既存の生成JSONと同様に、`dataName`、JST ISO 8601の`updatedAt`、型別の`data`を持たせる。

```json
{
  "dataName": "items",
  "updatedAt": "2026-07-22T00:00:00+09:00",
  "data": {
    "weapons": {
      "normal": {
        "kenka": []
      }
    },
    "armors": [],
    "omamori": [],
    "cybernetics": {
      "head": []
    },
    "nanomachines": [],
    "drugs": []
  }
}
```

`updatedAt` は変換実行時刻であり、Excelセルから取得しない。

## 共通の入力処理

- 各シートの1行目は完全一致する見出し行として検証する。A列から定義済み最終列までの列順変更・必須列の欠落、または非空の未知見出しはエラーにする。書式だけの末尾空列は無視する。
- データ行は名称列が空でない行だけとする。入力ファイルにある書式のみの末尾空行は無視する。
- 各出力配列の順序はExcelの行順を維持し、`sourceOrder` は当該シート内で1始まりの連番にする。IDは入力順に依存しない。
- 文字列は外側の空白を除去し、改行はLFへ正規化する。内部の空白と改行、句読点、全角半角、効果文の表記は変更しない。
  - 例: `チタンプレート` は `チタンプレート` にする。
  - 例: `感覚 +1。` と `「状態復元」 の` の内部空白は保持する。
- 数値列は有限の非負整数だけを許可し、Excelの`3.0`はJSONの`3`へ変換する。小数、負数、文字列数値はエラーにする。
- nullableな数値列の空欄は`null`へ変換する。明示的な`-`は値なしの記号として扱わず、すべて入力エラーにする。
- `0`は欠損ではないため`0`のまま保持する。
- 効果・制限はルール文としてそのまま文字列で保持する。変換時に条件、回数、ダメージ、BS、能力値などを構造化しない。
- 行の途中挿入・並び替えでIDと個別アンカーは変更しない。入力順は`sourceOrder`だけで表す。

## シート別マッピング

| シート         | 出力配列       | 実データ件数 | 見出し                                                             | 出力フィールド                                                                                                |
| -------------- | -------------- | -----------: | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `weapons`      | `weapons`      |           50 | 区分、名称、信用、射程、種別、判定、攻撃力、ガード値、装弾数、効果 | `id`, `group`, `name`, `credit`, `range`, `kind`, `check`, `attack`, `guard`, `ammo`, `effect`, `sourceOrder` |
| `armors`       | `armors`       |           16 | 名称、信用、防御力、ダメージ軽減、制限、効果                       | `id`, `name`, `credit`, `defense`, `damageReduction`, `restriction`, `effect`, `sourceOrder`                  |
| `omamori`      | `omamori`      |           21 | 名称、信用、効果                                                   | `id`, `name`, `credit`, `effect`, `sourceOrder`                                                               |
| `cybernetics`  | `cybernetics`  |           31 | 部位、名称、信用、埋め込み点数、効果                               | `id`, `part`, `name`, `credit`, `implantPoints`, `effect`, `sourceOrder`                                      |
| `nanomachines` | `nanomachines` |           19 | 名称、信用、埋め込み点数、発動精神力、効果                         | `id`, `name`, `credit`, `implantPoints`, `activationMentalCost`, `effect`, `sourceOrder`                      |
| `drugs`        | `drugs`        |           18 | 名称、信用、使用T、1セット数量、BT強度、効果                       | `id`, `name`, `credit`, `timing`, `setQuantity`, `badTripIntensity`, `effect`, `sourceOrder`                  |

### 武器の特別値

- `group` は入力の`normal`、`cybernetics`、`nanomachines`をそのまま保持する。この列は武器種別とは別の分類である。
- `range` は必須とし、整数または`"シーン"`だけを許可する。空欄と`-`は入力エラーにする。
- `attack` と `guard` は整数、`"特殊"`、または`null`とする。
- `ammo` は整数または`null`とする。
- `kind` と `check` は空欄を許可しない文字列とする。`check`は、武器の使用判定種別を表す。`格闘/干渉`は表示値として分割しない。
- `credit` は整数または`null`とする。`-`は`null`へfallbackしない。

### 防具・お守り・サイバネ・ナノマシン・ドラッグ

- 防具の`damageReduction`は整数、`"特殊"`、または`null`とする。`restriction`と`effect`は空欄なら`null`、値があれば文字列とする。
- お守りの`effect`は必須文字列とする。
- サイバネの`part`は、表示用には入力値（`頭`、`胴体`、`腕`、`足`、`任意`）を保持する。ID用の正規化は下表に従う。
- ナノマシンの`implantPoints`と`activationMentalCost`は必須整数とする。
- ドラッグの`timing`は表示用に入力値（`SU`、`INI`、`CU`、`SP`）を保持する。`setQuantity`と`badTripIntensity`は必須整数とする。

## ID生成

Item IDには`nameHash`を採用する。`nameHash`の生成規則、IDの一意性、名称・hashの重複検証は[データID管理方針](../requirements/data-id-policy.md)に従う。

| 種別       | 形式                                        | グループ・タイミングの扱い                                                         |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| 武器       | `item-weapon-{group}-{checkKey}-{nameHash}` | `group`は入力値を小文字のまま使う。`checkKey`は下表のローマ字キーを`_`で連結する。 |
| 防具       | `item-armor-{nameHash}`                     | 種別と名称hashで一意にする。                                                       |
| お守り     | `item-omamori-{nameHash}`                   | 種別と名称hashで一意にする。                                                       |
| サイバネ   | `item-cybernetics-{part}-{nameHash}`        | `part`は下表のID用値を使う。                                                       |
| ナノマシン | `item-nanomachine-{nameHash}`               | 種別と名称hashで一意にする。                                                       |
| ドラッグ   | `item-drug-{timing}-{nameHash}`             | `timing`は小文字化した入力値を使う。                                               |

武器の`checkKey`は、表示用の`check`を次のASCIIキーへ変換する。`/`は`_`へ正規化し、未知の判定種別または空の要素は入力エラーにする。

| 表示用の`check` | ID用`checkKey`    |
| --------------- | ----------------- |
| 喧嘩            | `kenka`           |
| 暗殺            | `ansatsu`         |
| 発砲            | `happou`          |
| 格闘            | `kakutou`         |
| 干渉            | `kanshou`         |
| 格闘/干渉       | `kakutou_kanshou` |

サイバネのID用`part`は次の固定マップを使う。

| 入力値 | ID用    |
| ------ | ------- |
| 頭     | `head`  |
| 胴体   | `torso` |
| 腕     | `arm`   |
| 足     | `leg`   |
| 任意   | `any`   |

ドラッグのID用`timing`は小文字化する（`SU`→`su`、`INI`→`ini`、`CU`→`cu`、`SP`→`sp`）。

## 出力JSONのアクセス構造

武器は`group`、`checkKey`、配列indexでアクセスできる3階層のオブジェクトとして出力する。`Weapon`自身には表示用の`check`を保持する。

```json
{
  "data": {
    "weapons": {
      "normal": {
        "kenka": []
      }
    }
  }
}
```

サイバネはID用`part`、配列indexでアクセスできるオブジェクトとして出力する。`Cybernetic`自身には表示用の`part`を保持する。

```json
{
  "data": {
    "cybernetics": {
      "head": []
    }
  }
}
```

## 検証の責務

- 各種別の変換関数は、シートのヘッダー、件数、名称の非空、セルの型、列挙値、`-`、武器の射程空欄、未知の武器判定種別を、Excel行番号・列記号・列名を含む入力エラーとして検証する。ナノマシンの見出しは`埋め込み点数`だけを許可する。
- 生成JSONのZod Schemaは、型、必須・nullable項目、列挙値、[データID管理方針](../requirements/data-id-policy.md)に定めるID制約、`sourceOrder`の連番、表示用文字列のLF正規化、武器・サイバネの出力階層を検証する。
- 出力JSONは2スペース、LF、末尾改行とする。変換後にSchema検証と、上表の件数（50、16、21、31、19、18）を確認する。

## 入力確認

- 同期済みのGoogle Drive `items`とローカル`.raw/data/items.xlsx`で、ナノマシンの見出しが`埋め込み点数`であることを確認した。
- 武器50件の信用欄に`-`がなく、武器50件の射程に空欄がないことを確認した。
