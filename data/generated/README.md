# Generated Data

このディレクトリには、Excelから変換した公開用JSONを配置する。

## 方針

- `data/generated/` 配下のJSONは生成物として扱う。
- 原則として、生成済みJSONを手編集しない。
- データ修正が必要な場合は、元のExcelを修正し、変換スクリプトを再実行する。
- CI/CDのビルドは、Excel本体ではなく、このディレクトリ配下の生成済みJSONを参照する。

## Excel本体の扱い

Excel本体はリポジトリ直下の `.raw/` 配下でローカル管理する。

`.raw/` とExcelファイルはGit管理しない。
