# 32-0-ikizama-detail-data

## 目的

`/data/ikizama/[ikizamaId]` の後続詳細ページが参照できる、生き様スキルと関連データのExcel由来データ基盤を整備する。

## 背景

`31-0-ikizama-index-data` は、生き様の基礎情報と専用アイテム種別の対応表を
`.raw/data/ikizama-list.xlsx` から `data/generated/ikizama.json` へ変換済みである。詳細ページには、
これと整合する生き様スキルと、生き様・スキル・関連アイテムをまとめて返す取得層が必要である。

`.raw/data/ikizama-skills.xlsx` は `burai`、`kejime`、`sumi`、`yaku` の4シートを持ち、既存
`Ikizama.id` 集合と一致する。全53スキルは、共通の `docs/conversion/skills.md` の入力検証を通過して
いる。この共通契約と、完了済み `30-0-ryugi-detail-data` の所有者別集約を再利用する。

一方、関連アイテムの実体JSON・個別アンカーは未整備であり、アイテムデータは後続の
`34-0`〜`39-0`で扱う。ケジメの専用アイテム種別IDは、既存要件・ルートに合わせて、ユーザー更新済みの
Excel正本でも `cybernetics` を使う。関連アイテム検証の境界は、実装前にユーザー承認済みの方針に従う。

- `docs/requirements/architecture.md` の AC-06〜AC-16
- `docs/requirements/data-id-policy.md` の 10.1〜10.3
- `docs/requirements/pages.md` の FR-06
- `docs/conversion/skills.md`
- `docs/conversion/ikizama-index.md`
- `docs/out-of-scope.md`
- `docs/plan.md` の `32-0-ikizama-detail-data`
- `docs/TODO.md` の生き様リストのサイドメニュー表示（本issueでは扱わない）

## 実装開始前のユーザー決定

ユーザーが次の方針を承認した。

1. ケジメの専用アイテム種別IDの正本は `cybernetics` とする。ユーザーがExcel / Google Driveの
   正本を更新済みであり、ローカル `.raw/data/ikizama-list.xlsx` も `cybernetics` を示す。agentは
   `.raw/` とGoogle Driveを書き換えず、実装時に更新済み入力から `data/generated/ikizama.json` を
   再変換する。`cybanetics` のaliasまたは正規化は追加しない。
2. 本issueの関連アイテム検証は、種別ID・名称、将来のItem JSON／個別アンカーに要求する参照契約、
   fixture上の関連検証までとする。実アイテムデータとの参照整合性は、各アイテムデータtask完了後の
   follow-upで扱う。実アイテムの入力、生成JSON、ID／アンカー形式を本issueへ追加しない。

## 対象範囲

- `.raw/data/ikizama-skills.xlsx` の実構造を根拠として、
  `docs/conversion/ikizama-skills.md` に生き様スキルの変換・関連検証・テスト契約を定義する。
- `docs/conversion/skills.md` の共通スキル契約を再利用し、シート名と `Ikizama.id` の完全一致、
  生き様ごとのスキルID、`sourceOrder`、全スキルIDの一意性を検証する。
- 生き様スキルを `data/generated/ikizama-skills.json` へ集約するローカル変換処理、npm script、
  schema、fixtureテスト、データ取得層を追加する。
- 生き様IDを受け取り、既存の `Ikizama` 基礎情報と対応するカテゴリ別スキルを返す詳細用取得層を
  追加する。
- `Ikizama`、生き様スキル、関連アイテム参照の関係を検証するschema / helperを整備する。ただし、
  実アイテムJSON・個別アンカーが未配置のため、現在の入力だけで検証できる範囲と、後続アイテム
  データタスクへ委ねる範囲を変換仕様に明記する。
- 上記「実装開始前のユーザー決定」に従い、アイテム種別IDとリンク先の正本、関連アイテム参照の
  検証境界を確定する。無断のalias追加、Excel手編集、未配置のItem schema・個別アンカーの推測はしない。

## 初期スコープ外

- `/data/ikizama/[ikizamaId].astro`、詳細ページUI、導線、MDX本文、design画像を作成しない。
  これらは `32-2-ikizama-detail-page` で扱う。
- 武器、防具、お守り、サイバネ、ナノマシン、ドラッグの実体データ、アイテム変換仕様、
  Item系Card、アイテムページ、個別アイテムアンカーを先取りして作成しない。これらは
  `34-0`〜`39-2` の対象である。
- `.raw/data/`、Google Drive、`raw-google-drive.url` を変更しない。Excel本体をGit管理しない。
- 未追跡の `public/images/data/` 配下のWebP・画像フォルダはユーザーの既存作業であり、
  本issueおよびこのセッション中のcommit対象に含めない。
- サイドメニューへの生き様リスト表示は、関連TODOに従い本issueでは実装しない。
- Web上のExcel編集・変換実行、CI/CDでのExcel変換、検索、DB、認証、SSR、CMS、
  クライアント状態管理、不要な依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] 実際に配置された `.raw/data/ikizama-skills.xlsx` を根拠として、
      `docs/conversion/ikizama-skills.md` に入力・出力・関連検証・テスト契約を定義している。
- [ ] `docs/conversion/skills.md` の共通契約を再利用し、生き様スキルIDが
      `skill-ikizama-{ikizamaId}-{category}-{timing}-{index}` に一致する。
- [ ] 入力Excelのシート名集合と `Ikizama.id` 集合を完全一致で検証し、所属生き様ID、
      スキルID、詳細ページ用の個別アンカーIDが整合する。
- [ ] ローカル変換コマンドが対象ExcelからGit管理する生成JSONを出力し、CI/CD buildが
      `.raw/` またはExcel本体に依存しない。
- [ ] 後続詳細ページが生き様IDを指定して、既存の `Ikizama` 基礎情報と対応する
      生き様スキルを合わせて取得できる。
- [ ] 承認済みの `cybernetics` 正本と関連アイテム検証境界を、変換仕様、schema、fixture、
      生成JSONの扱いへ反映している。
- [ ] 承認された検証境界に従い、関連アイテム種別ID・リンク先・個別アンカーについて、
      現在検証できる契約と実アイテムデータが必要な検証を分けて仕様化している。
- [ ] 更新済みのExcel入力を再変換し、`cybanetics` のaliasを追加せず、`cybernetics` と
      既存ルートの整合を確認している。
- [ ] fixtureを使うテストが、必須項目、カテゴリ・タイミング、ID採番、所属生き様ID不整合、
      ID／アンカー重複、表示順、改行、出力JSON形状を検証する。
- [ ] 関連TODOを本issueで扱わない理由が記録されている。
- [ ] `npm run test`、`npm run check`、`npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] CI/CDのbuildが `.raw/` またはExcel本体に依存しない。
- [ ] 生成JSONを手編集せず、Excel変換の出力として管理している。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の詳細ページ、導線、design、アイテム実体データを実装していない。
- [ ] `docs/TODO.md` のサイドメニュー項目と矛盾していない。
- [ ] UI、CSS、layout、page、Componentタスクではないため、design targetおよび
      design-image-generation前提条件は不要である。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/conversion/ikizama-skills.md`
- `docs/conversion/skills.md`（実Excel確認で共通契約の拡張が必要な場合のみ）
- `src/lib/schemas/ikizama.ts`
- `src/lib/schemas/ikizama-skills.ts`
- `scripts/convert-ikizama-skills/main.ts`
- `scripts/convert-ikizama-skills/lib.ts`
- `src/lib/data/ikizama-skills.ts`
- `src/lib/data/ikizama-detail.ts`
- `data/generated/ikizama-skills.json`
- `tests/node/ikizama-skills.test.ts`
- `package.json`

変換仕様の確定後に既存の共通変換補助、型、テストの更新が必要な場合に限り、関連ファイルを変更してよい。
変更理由と、共通・流儀スキル変換への影響を記録する。

## レビュー観点

- `.raw/data/ikizama-skills.xlsx` の4シートを `Ikizama.id` と結び付ける方法、共通仕様の再利用、
  JSON集約の責務分離が、完了済みの流儀スキル基盤と整合するか。
- 生き様基礎情報、カテゴリ別スキル、専用アイテム種別の関連を扱いながら、アイテム実体データと
  詳細ページUIを後続taskへ分離できているか。
- 専用アイテムIDを種別IDとして扱い、実データ整合性を後続follow-upへ分離した検証境界が
  実装と一致するか。
- 更新済み入力の `cybernetics` が、生成JSON、リンク先、fixtureで一貫し、`cybanetics` の
  aliasまたは推測による補正を含まないか。
- 未追跡のWebP画像を本issueおよびcommit対象から除外する指定が明確か。

## 備考

`docs/TODO.md` のサイドメニュー項目は、一覧ページまたはナビゲーション補完taskで扱う追跡項目であり、
本issueでは変更しない。

`.raw/contents/ikizama-detail.md` と `docs/design/ikizama-detail/` は現時点で未配置である。どちらも
`32-2-ikizama-detail-page` のUI実装前に確認または作成する。今回のデータ基盤では、ページの可視構成を
推測して固定しない。

実アイテムの生成JSONと個別アンカーは未配置である。この実データとの参照整合性は、各アイテムデータtaskが
完了した後のfollow-upで扱う。32-0では、将来の検証で必要となる参照契約とfixture検証だけを整備する。

実装前にこのissueの内容をユーザーが明示承認する。Git commit / push はこのissue準備では実行しない。
