# 30-0-ryugi-detail-data

## 目的

`/data/ryugi/[ryugiId]` の後続詳細ページが参照できる、流儀スキルのExcel由来データ基盤を整備する。

## 背景

`29-0-ryugi-index-data` は、流儀の非スキル情報を `ryugi-list.xlsx` から
`data/generated/ryugi-list.json` へ変換済みである。流儀詳細ページには、これと別に所属流儀と
整合する流儀スキルデータが必要である。

現時点で `.raw/data/` に対象Excelは未配置であるため、列・シート・出力JSON・データ内容を
推測して固定しない。対象Excelを確認してから、流儀スキルの個別変換仕様を
`docs/conversion/ryugi-skills.md` に作成する。

変換仕様の正本ファイル名は `ryugi-skills.md` とする。`docs/plan.md` のタスク名・参照と
一致し、汎用の `docs/conversion/skills.md` が共通契約、`ryugi-skills.md` が流儀スキル固有の
入力・関連契約を担う構成とする。`docs/requirements/architecture.md` の例示にある
`ryugi-detail.md` は、このissueで `ryugi-skills.md` へ統一する。

- `docs/requirements/architecture.md` の AC-06〜AC-16
- `docs/requirements/data-id-policy.md` の 10.1〜10.3
- `docs/conversion/skills.md`
- `docs/conversion/ryugi-index.md`
- `docs/out-of-scope.md`
- `docs/plan.md` の `30-0-ryugi-detail-data`
- `docs/TODO.md` の「流儀スキル変換仕様のファイル名を計画と要件で統一する」

## 対象範囲

- 対象Excelを実際に確認した後、`docs/conversion/ryugi-skills.md` に入力ファイル・シート、
  列、必須・任意値、空欄・改行、表示順、出力先、検証、テストの契約を定義する。
- `docs/conversion/skills.md` の共通スキル契約を、流儀スキルの変換に再利用する。実Excelで
  共通契約の拡張が必要と判明した場合だけ、影響範囲と理由を記録して変更する。
- 流儀スキルの所属流儀IDと、`data/generated/ryugi-list.json` の `Ryugi.id` の関連を検証する
  schema / helperを整備する。
- 実Excelで確定した構造に従い、ローカル変換処理、npm script、生成JSON、生成JSONを読む
  後続詳細ページ用のデータ取得層を追加する。詳細用取得層は流儀IDを受け取り、既存の `Ryugi` と
  対応する流儀スキルを同じ結果として返す。
- 変換、schema、関連検証、取得層を、実Excel本体に依存しないfixtureでテストする。
- `docs/requirements/architecture.md`、`docs/plan.md`、関連参照で、流儀スキル変換仕様の
  正本名を `docs/conversion/ryugi-skills.md` へ統一する。

## 初期スコープ外

- このissueの準備時点では、対象Excelが未配置のため `docs/conversion/ryugi-skills.md`、列契約、
  変換処理、schema、生成JSON、テストを作成しない。実Excel配置後に本issueを明示承認してから
  実装する。
- `/data/ryugi/[ryugiId].astro`、詳細ページUI、MDX本文、導線、design画像を作成しない。
  これらは `30-2-ryugi-detail-page` で扱う。
- `ryugi-list.json` の非スキル情報、共通スキル、生き様、アイテム、NPCの変換・取得層を変更しない。
- `.raw/data/`、Google Drive、`raw-google-drive.url` を変更しない。Excel本体をGit管理しない。
- 未追跡の `public/images/data/` 配下のWebP・画像フォルダはユーザーの既存作業であり、
  本issueおよびこのセッション中のcommit対象に含めない。
- Web上のExcel編集・変換実行、CI/CDでのExcel変換、検索、DB、認証、SSR、CMS、
  クライアント状態管理、不要な依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [ ] 実際に配置された対象Excelを根拠として、`docs/conversion/ryugi-skills.md` に流儀スキルの
      入力・出力・関連検証・テスト契約を定義している。
- [ ] `docs/conversion/skills.md` の共通契約を再利用し、流儀スキルのIDが
      `skill-ryugi-{ryugiId}-{category}-{timing}-{index}` に一致する。
- [ ] 所属流儀IDが `ryugi-list.json` の既存 `Ryugi.id` に存在すること、スキルID、
      後続ページで使う個別アンカーIDが整合することを検証する。
- [ ] ローカル変換コマンドが対象ExcelからGit管理する生成JSONを出力し、CI/CD buildが
      `.raw/` またはExcel本体に依存しない。
- [ ] 後続の流儀詳細ページが流儀IDを指定して、既存の `Ryugi` 非スキル情報と対応する流儀スキルを
      合わせて取得できる。詳細用取得結果の正確な型・JSON形状は実Excel確認後に確定する。
- [ ] fixtureを使うテストが、必須項目、カテゴリ・タイミング、ID採番、所属流儀ID不整合、
      ID／アンカー重複、表示順、改行、出力JSON形状を検証する。
- [ ] `docs/requirements/architecture.md`、`docs/plan.md`、関連参照で、流儀スキル変換仕様の
      正本名が `docs/conversion/ryugi-skills.md` に統一されている。
- [ ] 関連TODOを扱った結果が記録されている。
- [ ] `npm run test`、`npm run check`、`npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] CI/CDのbuildが `.raw/` またはExcel本体に依存しない。
- [ ] 生成JSONを手編集せず、Excel変換の出力として管理している。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外のページ、Component、UIを実装していない。
- [ ] `docs/TODO.md` の流儀スキル変換仕様ファイル名の追跡項目と矛盾していない。
- [ ] UI、CSS、layout、page、Componentタスクではないため、design targetおよび
      design-image-generation前提条件は不要である。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/conversion/ryugi-skills.md`（対象Excel確認後）
- `docs/conversion/skills.md`（共通契約の拡張が実Excel確認で必要な場合のみ）
- `docs/requirements/architecture.md`
- `docs/plan.md`
- `src/lib/schemas/skill.ts`
- `scripts/convert-skills/`
- `scripts/convert-ryugi-skills/`
- `src/lib/data/ryugi-skills.ts`
- `src/lib/data/ryugi-detail.ts`
- `data/generated/ryugi-skills.json`
- `tests/node/ryugi-skills.test.ts`
- `package.json`

対象Excel確認の結果、既存の汎用変換器で対応できる場合は、新しい変換ディレクトリを作らず、
設定と入口だけを追加してよい。JSONの正確なファイル名・形状、入力ファイル名・シート名は、
実Excelを確認してから確定する。

## レビュー観点

- 実Excel確認前に列・シート・JSON形状を推測せず、変換仕様の作成を実装フェーズへ留保できて
  いるか。
- `ryugi-skills.md` を正本名として選び、共通仕様 `skills.md`、plan、architectureの役割を
  混同せずに関連TODOを回収できるか。
- 既存の流儀IDと流儀スキルの所属ID、スキルID、個別アンカーIDの検証範囲が後続ページに
  十分か。
- WebPを含む未追跡画像を、このissueおよびこのセッションのcommit対象から除外する指定が
  明確か。

## 備考

対象Excelが未配置のため、このissue準備では変換仕様本文を作成しない。現在の
`docs/conversion/skills.md` と完了済み `29-0-ryugi-index-data` の
`docs/conversion/ryugi-index.md` を、実装時に参照する先行契約とする。

`docs/TODO.md` の「流儀スキル変換仕様のファイル名を計画と要件で統一する」は、このissueで
回収する。TODOのチェック変更は人間レビュー後のユーザー指示に従う。

対象Excel配置後は、対象入力のファイル名・シート名と、流儀IDの入力元・重複・変更時の扱いを
変換仕様へ追記し、実装開始前に必要ならissueをユーザーと更新する。

実装前にこのissueの内容をユーザーが明示承認する。Git commit / push はこのissue準備では
実行しない。
