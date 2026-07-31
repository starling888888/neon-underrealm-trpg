# 55-initial-release

## 目的

初期公開に必要なリリースノートの生成済みJSONを、ローカルのExcel正本から更新し、公開前の品質確認と対象ページのVRT baseline更新を完了する。

## 背景

`docs/plan.md` の `55-initial-release` は、初期リリースノートの追加、最終build確認、初期スコープ外機能が混入していないことの確認を求めている。

リリースノートのユーザー編集正本は `.raw/release-notes.xlsx` であり、公開サイトとCI/CDは変換済みの `data/generated/release-notes.json` を参照する。Excelを変更せず、既存変換処理で生成JSONを更新する。

関連する正本と手順:

- `docs/requirements/release-notes.md`
- `docs/conversion/release-notes.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `.agents/rules/data-management.md`
- `docs/design/home/notes.md`
- `docs/design/release-notes/notes.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `.agents/skills/visual-implementation-review/SKILL.md`

`docs/TODO.md` にこのtaskへ直接紐付く未対応項目はない。全件VRTをCIまたは公開後に実行するTODOは、本issueでは扱わず、初期公開前の対象ページだけをローカルで確認する。

`docs/plan.md` の「version tag または初期release名を決定」は、初期version tagをマージ後にユーザーがGitHub上で決定・付与するというユーザー指示で扱う。本issueはtag名の決定・作成・pushを行わない。

## 対象範囲

- `.raw/release-notes.xlsx` を入力に `npm run convert:release-notes` を実行し、`data/generated/release-notes.json` を更新する。
- 生成済みJSONのschema、並び順、ID、表示用データが既存仕様に従うことを確認する。
- 更新後のリリースノート件数・文言を正本として、必要な `docs/design/home/notes.md` と `docs/design/release-notes/notes.md` の現行データ記述を整合させる。
- `/` と `/release-notes/` の既存VRT targetを対象にVisual Reviewを実施する。
- Visual Reviewに必要な、各ページのリリースノート表示領域を対象とするtest-owned原寸locator screenshotを既存VRT targetへ追加する。対象は、`home` のdefaultと`home-viewport`、`release-notes`のdefaultで、それぞれdesktop・tablet・mobileとする。
- ユーザーが明示指示したbaseline更新として、差分確認後に対象targetだけのcanonical VRT baselineを更新する。
- `npm run check`、`npm run build`、`npm run test`、`npm run test:e2e` を実行する。
- 公開手順と同じ順序で `npm run build:public`、`npm run build:search-index` を実行し、公開対象外routeの除外と検索indexを含む公開成果物を確認する。
- 現行の公開route、公開用build成果物、依存関係、外部service・server要件を `docs/out-of-scope.md` と照合し、承認済みの初期スコープ内例外以外の混入がないことをissueに記録する。

## 初期スコープ外

- リリースノートのExcel変換仕様、変換script、JSON schema、ページ実装、CSS、レイアウトを変更しない。
- 原寸locator screenshotの取得に必要な最小限の既存VRT test変更以外、VRT test定義を変更しない。
- `.raw/release-notes.xlsx`、`raw-google-drive.url`、VRTの一時成果物、canonical snapshotをGit管理しない。
- 新機能、依存関係、CMS、認証、DB、SSR、API server、PWAを追加しない。
- GitHub Releaseを作成しない。
- version tagを作成、push、または変更しない。マージ後のtag付与はユーザーがGitHub上で行う。
- 全件VRTおよびGitHub ActionsのVRT整備は実施しない。

## 完了条件

- [x] `.raw/release-notes.xlsx` から `data/generated/release-notes.json` を既存変換scriptで更新している
- [x] 更新済みJSONがリリースノート仕様のschema、日付降順・sourceOrder降順、ID規則に従う
- [x] トップページの最新5件表示と `/release-notes/` の全件表示が同じ生成JSONを参照する既存仕様を維持している
- [x] 現行リリースノート件数・文言に関するdesign notesを必要な範囲で整合させている
- [x] `/` と `/release-notes/` の対象VRTで、`home` default / home-viewport / release-notes default のdesktop・tablet・mobileを確認している
- [x] 各対象route・state・viewportで、リリースノート表示領域のtest-owned原寸locator screenshotを開き、文言の折返し、欠け、横overflow、既存レイアウトとの関係を確認している
- [x] ユーザー承認済みの対象canonical VRT baselineだけを更新し、更新後に同じtargetの比較を再実行している
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] `npm run test` が通る
- [x] `npm run test:e2e` が通る
- [x] `npm run build:public` と `npm run build:search-index` が公開手順の順序で通る
- [x] 公開route、公開成果物、依存関係、外部service・server要件を `docs/out-of-scope.md` と照合し、未承認の初期スコープ外機能がないと記録している
- [x] GitHub Releaseとversion tagを作成していない

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] `docs/design/home/` と `docs/design/release-notes/` の既存design意図と矛盾していない
- [x] `dist/` の公開成果物にprivate routeが残らず、検索indexが生成されている
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `data/generated/release-notes.json`
- `docs/design/home/notes.md`（現行データ記述に変更が必要な場合）
- `docs/design/release-notes/notes.md`（現行データ記述に変更が必要な場合）
- `tests/visual/vrt/home.spec.ts` またはそのtest-owned capture helper（locator screenshotの追加が必要な場合）
- `tests/visual/vrt/release-notes.spec.ts` またはそのtest-owned capture helper（locator screenshotの追加が必要な場合）
- `tests/visual/README.md`（static page VRT helperのlocator screenshot契約を更新する場合）
- `package.json`（初期リリースversionを `0.9.0` として更新）
- `docs/issue/55-initial-release.md`

## レビュー観点

- 生成JSONのリリースノート内容、日付、ID、表示順がExcel正本と変換仕様に一致すること。
- トップページは最新5件、更新履歴ページは全件を、同じ生成JSONから表示すること。
- `/` は既存の最新リリースノート枠と主要導線の関係を、`/release-notes/` はToCなし・日付の下に本文を置く一覧構成を維持すること。
- VRT比較、actual screenshotの確認、baseline更新を `home` と `release-notes` の対象targetだけに限定し、リリースノート表示領域の原寸locator screenshotを根拠にすること。
- 公開用buildがprivate routeを除外し、検索indexを含むこと、また現行公開対象が `docs/out-of-scope.md` に抵触しないこと。
- GitHub Releaseやtag作成を含めず、初期公開に不要な機能変更を混ぜないこと。

## 備考

- baseline更新はユーザーがこのissue作成指示で明示承認済み。ただし、更新前後の対象VRT差分を確認し、`design-image-generation` のapproved baseline update手順で行う。
- canonical VRT baselineは `canonical-snapshots/visual/` のローカル比較入力であり、Git管理しない。
- Visual Reviewはデータ変更により表示が変わる `/` と `/release-notes/` に限定する。対象targetは `@vrt @home` と `@vrt @release-notes`。
- Visual Reviewで確認するstateは、`home` default / home-viewport / release-notes default、viewportはdesktop `1440x1200`、tablet `820x1180`、mobile `390x900`とする。
- GitHub上のリリースノートは、コードが製品ではないため作成しない。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/home/`、`docs/design/release-notes/`
- VRT test / tags: `@vrt @home`、`@vrt @release-notes`
- route / states / viewports:
  - `/`: default、home-viewport。desktop `1440x1200`、tablet `820x1180`、mobile `390x900`
  - `/release-notes/`: default。desktop `1440x1200`、tablet `820x1180`、mobile `390x900`

### レビュー結果

| 対象              | 判定 | 差分                         | 対応                                                   |
| ----------------- | ---- | ---------------------------- | ------------------------------------------------------ |
| `/`               | OK   | 初期canonical baseline未作成 | 現行リリースノートに対してbaselineを作成し、再比較した |
| `/release-notes/` | OK   | 初期canonical baseline未作成 | 現行リリースノートに対してbaselineを作成し、再比較した |

### 実画面確認

- `/` / default / desktop・tablet・mobile、home-viewport / desktop・tablet・mobile:
  - full-page overview: `test-results/visual/home/*.png` を確認
  - locator screenshot: 「最新リリースノート」sectionを `test-results/visual/home/sections/*.png` で原寸確認
  - checked acceptance criteria: 日付・概要の表示、折返し、欠け、横overflow、更新履歴・はじめに導線との関係
  - result: OK
- `/release-notes/` / default / desktop・tablet・mobile:
  - full-page overview: `test-results/visual/release-notes/*.png` を確認
  - locator screenshot: `.release-notes-page` を `test-results/visual/release-notes/sections/*.png` で原寸確認
  - checked acceptance criteria: 日付の下に本文を置く構成、本文内改行、折返し、欠け、横overflow、ToCなし構成
  - result: OK

captureの一時artifactは後続のE2E実行で削除され得るためGit管理せず、上記はcapture直後の確認記録である。

### 対象VRTの実行結果

- 更新前比較: `npm run visual:test -- --grep '@vrt.*@(home|release-notes)(?:\\s|$)'` は、対象9件すべてのcanonical baseline未作成を検出。
- actual capture: `npm run visual:capture -- --grep '@vrt.*@(home|release-notes)(?:\\s|$)'` は9件通過。full-page / viewport 9枚とlocator 9枚を出力。
- baseline更新: `npm run visual:update -- --grep '@vrt.*@(home|release-notes)(?:\\s|$)'` は9件通過。
- 更新後比較: 同じ `visual:test` は9件通過。

### 公開前監査

- `npm run build:public` で `dist/-local` の削除を確認。
- `npm run build:search-index` で35公開ページ、2,861語のPagefind index生成を確認。
- `git diff --name-only` と `package.json` を確認。依存関係追加、外部service・server、初期スコープ外機能の追加はない。
- `docs/out-of-scope.md` と照合し、既存の初期スコープ内キャラクターシート以外の未承認例外は確認されなかった。
