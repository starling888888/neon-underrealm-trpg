# ex-16-usage-restriction-labels

## 目的

Google Spreadsheetから同期した最新スキル入力の使用制限を、日本語の略号 `巡`、`幕`、`話` で検証し、表記を変更せず生成JSONへ出力する。

## 背景

`0750dc4 docs(data): localize usage restriction labels`で、`src/pages/data/index.mdx` の使用制限表記は `N/R`、`N/Sn`、`N/Sc` から `N/巡`、`N/幕`、`N/話` へ更新されている。古いローカル `.raw/data/` を入力として旧略号を置換する実装を開始したが、Google Spreadsheetを同期し直すと、最新の共通・流儀・生き様スキル入力はすでに `巡`、`幕`、`話` を使っていた。

- 要件正本: `docs/requirements.md`
  - Excel変換仕様とJSON出力仕様は `docs/conversion/*` を正本とする。
- 変換仕様正本: `docs/conversion/skills.md`
- 関連commit: `0750dc4 docs(data): localize usage restriction labels`
  - `src/pages/data/index.mdx` の公開表記を`N/巡`、`N/幕`、`N/話`へ更新している。
- `docs/TODO.md` と `docs/issue/milestone-02/plan.md` に、使用制限表記またはスキルJSONの再生成に直接対応する未対応項目はない。

## 対象範囲

- `npm run sync:google-sheets`で、Google Spreadsheetをリポジトリルートの `.raw/` へ同期する。
- `scripts/convert-skills/lib.ts` で、`/`を含む使用制限を次の新表記だけで検証する。
  - 回数: 正の整数、`lv`、または `LV`
  - 区分: `巡`、`幕`、`話`
  - 複数制限: `&`で連結する。
- `特殊`や`タイミングMのスキル`のように`/`を含まない個別の使用制限と、空欄を維持する。
- 旧略号の `R`、`Sn`、`Sc` を受け入れず、変換時に置換しない。
- `docs/conversion/skills.md` に、入力と生成JSONで共通する新表記の検証規則を記録する。
- 最小fixtureの変換テストで、新表記の単独・複数制限を受け入れ、旧略号を拒否することを確認する。
- `src/pages/data/index.mdx` の使用制限表記を、生成JSONと同じ新表記にする。
- 同期後の `.raw/data/common-skills.xlsx`、`.raw/data/ryugi-skills.xlsx`、`.raw/data/ikizama-skills.xlsx` を入力として、以下の生成JSONを変換コマンドで再生成する。
  - `data/generated/common-skills.json`
  - `data/generated/ryugi-skills.json`
  - `data/generated/ikizama-skills.json`

## 初期スコープ外

- Google Drive、Excel本体、入力シートの表記を編集しない。同期はread-only exportとして `.raw/` を更新するだけとする。
- スキルカード、キャラクターシート、使用回数のゲームルールを変更しない。
- 使用制限以外のスキルデータを意味的に変更しない。
- Web上でのExcel変換・データ編集、CI/CDでの変換実行、新規依存packageの追加は行わない。

## 完了条件

- [x] `npm run sync:google-sheets`で、最新のGoogle Spreadsheetが `.raw/` へ同期されている。
- [x] 共通スキル変換器が、`/`を含む使用制限で新表記の `巡`、`幕`、`話` だけを受け入れ、入力値を変更せず出力する。
- [x] `lv`、`LV`、`&`、`特殊`、空欄、および`/`を含まない個別の使用制限本文が意図せず変更されない。
- [x] 旧略号の `R`、`Sn`、`Sc` を含む使用制限が変換エラーになる。
- [x] `docs/conversion/skills.md` が、入力と生成JSONに共通する新表記の検証規則を定義している。
- [x] 共通変換器を使う最小fixture testが、新表記の単独・複数制限を受け入れ、旧略号を拒否することを確認している。
- [x] `src/pages/data/index.mdx` の使用制限表記が、生成JSONと同じ`N/巡`、`N/幕`、`N/話`を使う。
- [x] `data/generated/common-skills.json`、`data/generated/ryugi-skills.json`、`data/generated/ikizama-skills.json` が同期後のローカルExcel入力から変換コマンドで再生成され、各 `usageRestriction` が新表記または`/`を含まない個別表記だけを使う。
- [x] 関連TODOがないこと、または変更しない理由が記録されている。
- [x] `npm run test -- tests/node/common-skills.test.ts tests/node/ryugi-skills.test.ts tests/node/ikizama-skills.test.ts` が通る。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [x] ユーザー指示により、影響するVRT targetのlocal canonical baselineを更新し、target限定の比較が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md`、`docs/conversion/skills.md`、公開表記のcommitと矛盾していない。
- [x] 公開表記のcommitと、同期後の `.raw/` 入力を破壊していない。
- [x] 可視差分を持つVRT targetを確認している。

## 想定変更ファイル

- `docs/issue/ex-16-usage-restriction-labels.md`
- `docs/conversion/skills.md`
- `src/pages/data/index.mdx`
- `scripts/convert-skills/lib.ts`
- `tests/node/common-skills.test.ts`
- `data/generated/common-skills.json`
- `data/generated/ryugi-skills.json`
- `data/generated/ikizama-skills.json`
- `docs/agent-failure-log/active.md`

## レビュー観点

- `/`を含む使用制限だけを新表記で検証し、`特殊`と個別の使用制限本文を不必要に制限していないか。
- 3つの生成JSONを手編集せず、同じ共通変換器とローカルExcel入力から再生成する契約になっているか。
- 同期済みの最新Google Spreadsheet入力を根拠にしており、古い `.raw/` の表記を仕様としていないか。
- 変換仕様が、入力と生成JSONが同じ新表記であることを明確にできているか。

## 備考

- 通常issueであり、Gate planは作成しない。
- 使用制限表記と生成JSONによる可視差分は、既存の`data`、`common-skills`、`ryugi-index`、`ryugi-detail`、`ikizama-index`、`ikizama-detail` VRT targetで確認する。local canonical baselineの更新はユーザー明示指示時だけ行う。
- 最新入力の同期前に変換・検証の根拠を判断しない。
- Git commit / pushはユーザー指示の範囲で実行する。

## レビュー指摘 1

### [中] 可視変更をissueとVRTの対象外にしたまま完了している

- 根拠: PR #208には`src/pages/data/index.mdx`と3つの生成スキルJSONによる可視差分がある一方、当初のissueはページ変更・VRTを対象外としていた。
- 対応: 対象範囲と完了条件を実際のPR差分に合わせ、影響する既存VRT targetを記録した。ユーザー指示によりlocal canonical baselineを更新し、target限定比較を実行した。
- routing: current issueで対応済み。

## ビジュアルレビュー 1

### VRT対象

- design target / tags: `data`、`common-skills`、`ryugi-index`、`ryugi-detail`、`ikizama-index`、`ikizama-detail`
- route / state / viewport: 各VRT specのdefault state。indexと`data`、`common-skills`はdesktop / tablet / mobile、流儀詳細は全流儀desktopとケンカヤtablet / mobile、生き様詳細は全生き様desktopとスミtablet / mobile。

### レビュー結果

| 対象                | 判定     | 差分                           | 対応                                         |
| ------------------- | -------- | ------------------------------ | -------------------------------------------- |
| 6 target / 30 cases | 比較成功 | 使用制限表記と生成データの更新 | ユーザー指示でlocal canonical baselineを更新 |

### 実画面確認

- `/data/` / default / desktop:
  - full-page overview: 使用制限表が`N/巡`、`N/幕`、`N/話`を表示することを確認。
- locator screenshot:
  - 既存VRT specに対象section locatorがなく、今回の表記・生成データ変更に局所表示契約はないため、原寸locator screenshotの追加・確認は不要。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] local canonical baselineを更新した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 局所表示契約ごとの原寸locator screenshotの確認は不要（既存VRT specに対象locatorがなく、今回の変更に局所表示契約がない）
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT比較が通る
- [x] baseline更新はユーザー指示による
