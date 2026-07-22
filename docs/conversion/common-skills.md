# 共通スキル変換設定

## 目的

共通スキル用の入力・出力設定を定義する。Excel列、カテゴリ、タイミング、ID、生成JSON、Schema、Warningの共通契約は [スキルデータ変換仕様](./skills.md) に従う。

## 設定

共通スキルのentrypointは、汎用変換器へ次の設定を渡す。

| 設定         | 値                                  |
| ------------ | ----------------------------------- |
| `inputPath`  | `.raw/data/common-skills.xlsx`      |
| `sheetName`  | `common-skills`                     |
| `outputPath` | `data/generated/common-skills.json` |
| `dataName`   | `common-skills`                     |
| `idPrefix`   | `skill-common`                      |

入力Excelの対象シートには、現在 `bonus` / `○-○` の共通スキル1件がある。

## 共通スキルID

共通スキルIDは次の形式とする。

```txt
skill-common-{category}-{normalizedTiming}-{nameHash}
```

Skill IDには`nameHash`を採用する。生成規則は[データID管理方針](../requirements/data-id-policy.md)に従う。現在の入力例は、`skill-common-bonus-a-{nameHash}` になる。

## 変換コマンド

```sh
npm run convert:common-skills
```

このコマンドは、上記の入力Excelから生成JSONを更新する。CI/CDのbuild工程には含めない。

## 対象外

この設定は共通スキルだけを対象とする。流儀・生き様スキルは、それぞれの専用変換仕様とentrypointを参照する。
