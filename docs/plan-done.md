# 完了済み計画履歴

このファイルは、`docs/plan.md` から退避した完了済み計画項目の履歴を保持する。

`docs/plan.md` は未完了・進行対象・直近で参照する計画を中心に保つ。完了済みの計画項目を退避する場合は、削除ではなくこのファイルへ移す。

## 退避条件

- 対象計画がmerge済みである
- 対応issueの完了条件とチェックポイントが確認済みである
- 後続作業者がactive plan側で常時読む必要がない
- ユーザーがplan更新またはpost-merge tracking更新を指示している

## 記録形式

退避する項目は、元のphase、task ID、完了日、関連PRまたはcommitが分かる形で残す。

```md
## Phase N

- [x] `NN-task-slug` — task summary
  - completed: YYYY-MM-DD
  - PR: #N または commit: `<hash>`
```

## 完了済み

## Phase 0: リポジトリ初期化

- [x] `01-docs-requirements` — 要件定義ドキュメントを配置する
  - completed: 2026-07-03 d4a6507

  - [x] `docs/requirements.md` を配置
  - [x] `docs/out-of-scope.md` を配置
  - [x] 初期スコープ外項目を明示

- [x] `02-init-astro-project` — Astro + TypeScript プロジェクトを初期化する
  - completed: 2026-07-03 6792015

  - [x] Astroプロジェクト作成
  - [x] `package.json` 作成
  - [x] `tsconfig.json` 作成
  - [x] `npm run build` が通る状態にする

- [x] `03-gitignore-raw-policy` — `.raw/` と生成データ管理方針を追加する
  - completed: 2026-07-03 e55366e

  - [x] `.raw/` を `.gitignore` に追加
  - [x] `*.xlsx`, `*.xlsm`, `~$*.xlsx` を `.gitignore` に追加
  - [x] `data/generated/` を作成
  - [x] `data/generated/README.md` に手編集禁止方針を書く

- [x] `04-basic-project-docs` — READMEと開発手順の初期版を作成する
  - completed: 2026-07-03 606cb33

  - [x] `README.md` 作成
  - [x] `docs/deployment.md` 作成
  - [x] `docs/content-writing-guide.md` 作成
  - [x] 初期開発・ビルド手順を記載

## Phase 1: Astro基盤

- [x] `05-config-mdx` — MDX対応を追加する
  - completed: 2026-07-04 c02473d

  - [x] Astro MDX integration を追加
  - [x] `.mdx` ページの表示を確認
  - [x] MDX内Component埋め込み方針を確認

- [x] `06-config-base-path` — GitHub Pagesサブパス対応を追加する
  - completed: 2026-07-04 8c01373

  - [x] `astro.config.mjs` に `site` / `base` 設定を追加
  - [x] base path helper を用意
  - [x] 内部リンク・画像パスがサブパスで壊れない方針を作る

- [x] `07-0-prepare-design-review` — Visual Review基盤を準備する
  - completed: 2026-07-04 ada513c

  - [x] Visual Review用skillを追加
  - [x] design正本とVisual Review成果物の配置方針を定義
  - [x] package.jsonにVisual Review用scriptと必要最小限の依存関係を追加
  - [x] `.tmp/*.md` と `review-to-issue` との責務分離を明記
  - [x] 既存ドキュメントに必要であれば対応方針を追記

- [x] `07-global-styles` — CSS基盤を追加する
  - completed: 2026-07-05 3afbf80

  - [x] `src/styles/tokens.css` 作成
  - [x] `src/styles/global.css` 作成
  - [x] `src/styles/prose.css` 作成
  - [x] 基本文字組み・本文幅・背景・色トークンを定義

- [x] `08-seo-component` — SEO/OGP Componentを作成する
  - completed: 2026-07-05 71c3d7d

  - [x] `src/components/seo/Seo.astro` 作成
  - [x] 共通OGP設定を実装
  - [x] `title`, `description`, `og:*` を設定可能にする
  - [x] 共通OGP画像の参照パスをbase path対応にする

## Phase 2: レイアウト・ナビゲーション

- [x] `09-base-layout` — 共通Layoutを作成する
  - completed: 2026-07-05 ae6648b

  - [x] designを生成する
  - [x] `src/layouts/BaseLayout.astro` 作成
  - [x] `src/layouts/ContentLayout.astro` 作成
  - [x] ヘッダー・本文・フッターの基本構造を作成

- [x] `10-header-footer` — Header / Footerを実装する
  - completed: 2026-07-05 8754afa

  - [x] designを生成する
  - [x] `Header.astro` 作成
  - [x] `Footer.astro` 作成
  - [x] コピーライトを表示
  - [x] GitHub、X、Discordリンク枠をアイコンで表示
  - [x] アイコンリンクに `aria-label` を設定

- [x] `11-site-menu` — PC左サイトメニューを実装する
  - completed: 2026-07-06 0fbcf5f

  - [x] designを生成する
  - [x] `src/lib/site/menu.ts` 作成
  - [x] `SiteMenu.astro` 作成
  - [x] PC版で左サイドに常設表示

- [x] `12-mobile-menu` — スマホ用開閉メニューを実装する
  - completed: 2026-07-06 ee2395a

  - [x] designを生成する
  - [x] 既存 `SiteMenu.astro` をスマホdrawerで再利用
  - [x] ヘッダーのボタンで開閉
  - [x] メニュー項目選択後に閉じる
  - [x] Escキーで閉じられることが望ましい

- [x] `12-1-site-menu-layout-copy` — サイトメニューの文言と階層レイアウトを調整する
  - completed: 2026-07-06 07eb806

  - [x] `サイトメニュー` 表示文言を削除またはより適切な文言へ変更
  - [x] 子項目開閉トグルを項目左側ではなく右端へ移動
  - [x] トグル用スペースでリンク群の左側が空きすぎないよう、全体を左寄せに調整
  - [x] PC左サイトメニューとスマホdrawer内メニューの両方で表示を確認

- [x] `13-page-toc` — PC右ページ内目次を実装する
  - completed: 2026-07-06 330ccf2

  - [x] designを生成する
  - [x] `PageToc.astro` 作成
  - [x] ページ見出しから目次を生成
  - [x] PC版では右サイドに固定表示
  - [x] 見出しリンクでページ内ジャンプ可能にする
  - [x] Layout propsでページ内目次の表示/非表示を制御可能にする
  - [x] MDX frontmatterでページ内目次の表示/非表示を制御可能にする
  - [x] トップページ、更新履歴ページ、404ページではページ内目次を表示しない
  - [x] MDX / Markdown / Astro / データ生成ページを最終HTMLベースで統一的にTOC生成する
  - [x] build後postprocessでTOC対象見出しにアンカーIDを自動付与する
  - [x] 日本語見出し本文をそのままアンカーIDにしない
  - [x] ASCII-onlyのhash形式アンカーIDを生成する
  - [x] 自動生成IDにページ内出現順の連番を含めない
  - [x] 自動生成IDが同一ページ内で衝突した場合はbuild時に検出する
  - [x] 重複見出しは黙ってsuffix付与せず、必要に応じて `data-anchor-id` で明示解決する
  - [x] ユーザー承認済み追加仕様として、表示制御要件とアンカーID生成方針を `docs/requirements.md` に反映する

- [x] `14-mobile-page-toc` — スマホ用ページ内目次を実装する
  - completed: 2026-07-07 3858ff8

  - [x] designを生成する
  - [x] `MobilePageToc.astro` 作成
  - [x] 「このページの目次」をワンタッチで開ける
  - [x] 項目選択で該当見出しへジャンプ
  - [x] サイトメニューとは導線を分離

- [x] `15-current-menu-highlight` — 現在ページハイライトを実装する
  - completed: 2026-07-07 31de58f

  - [x] designを生成する
  - [x] 現在ページをサイトメニューで視覚的に識別
  - [x] 親カテゴリを展開または強調
  - [x] `aria-current="page"` を設定できるようにする

- [x] `15-1-menu-expand-current-ancestors-only` — 現在ページに至る親カテゴリだけを初期展開する
  - completed: 2026-07-07 9ae4885

  - [x] `defaultExpanded` 前提の初期展開をやめる
  - [x] 現在ページが子孫ページの場合のみancestor親カテゴリを初期展開する
  - [x] 親カテゴリ自身がcurrentの場合は子項目を初期展開しない
  - [x] PC左サイトメニューとスマホdrawer内サイトメニューで同じ初期展開ルールを使う
  - [x] `aria-expanded` と `hidden` の初期状態を展開状態と一致させる

- [x] `16-layout-screenshot-design-refresh` — レイアウト一式を画面キャプチャベースのdesignに更新する
  - completed: 2026-07-07 d9af7fb

  - [x] 実装済みレイアウト一式の画面キャプチャを取得する
  - [x] PC、タブレット、スマホ幅の代表スクリーンショットを取得する
  - [x] Header / Footer / SiteMenu / MobileMenu / PageToc / MobilePageToc / 現在ページハイライトの状態を確認する
  - [x] 画面キャプチャをもとにdesign正本を更新する
  - [x] design正本と実装の差分、未解決事項、後続で調整すべきUI課題を記録する
  - [x] このタスクでは、design更新を主目的とし、追加の機能実装は行わない

- [x] `17-github-actions-deploy-basic` — GitHub Actionsによる基本デプロイを追加する
  - completed: 2026-07-07 509cefa

  - [x] `.github/workflows/deploy.yml` 作成
  - [x] `npm ci` を実行する
  - [x] `npm run check` を実行する
  - [x] `npm run build` を実行する
  - [x] GitHub Pagesへdeployする
  - [x] この段階では検索index生成をCIに含めない
  - [x] この段階では `npm run index:search` を実行しない
  - [x] この段階では `npm run build:search` を実行しない
  - [x] Excel本体なしでCI/CDビルドが成功することを確認する

## Phase 3: ページ作成

- [x] `18-0-release-notes-data` — トップページ・更新履歴ページ用リリースノートデータを整備する
  - completed: 2026-07-09 e505b91

  - [x] `docs/conversion/release-notes.md` にリリースノートデータ変換仕様を策定する
  - [x] `ReleaseNote` 検証スキーマを策定する
  - [x] リリースノートExcelから `data/generated/release-notes.json` を生成する変換スクリプトを策定する
  - [x] トップページ最新5件表示と更新履歴ページ全件表示に必要なデータ取得処理を策定する
  - [x] 変換スクリプトと検証スキーマのテストを追加する
  - [x] 更新日降順、必須項目、改行保持、`body` 空欄時fallbackを検証する

- [x] `18-1-common-image-block-component` — 共通画像Componentを作成する
  - completed: 2026-07-09 7906f49

  - [x] Component designを追加しない判断をissueに記録する
  - [x] `ImageBlock.astro` を作成する
  - [x] タイトルロゴ画像を表示できるようにする
  - [x] `src`, `alt`, `caption` を指定可能にする
  - [x] base pathに対応する
  - [x] `loading="lazy"` に対応する
  - [x] トップページ以外の後続ページでも再利用できる共通Componentとして実装する
  - [x] Markdown / MDX本文またはAstroページから利用できることを確認する

- [x] `18-2-home-page` — トップページを作成する
  - completed: 2026-07-09 13f1ee2

  - [x] designを生成する
  - [x] `/` を作成する
  - [x] `.raw/contents/home.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] キャッチコピー枠を作成する
  - [x] タイトルロゴ枠を作成する
  - [x] 最新リリースノート5件枠を作成する
  - [x] 簡単な説明枠を作成する
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `19-2-release-notes-page` — 更新履歴ページを作成する
  - completed: 2026-07-10 f7a9d42

  - [x] designを生成する
  - [x] `/release-notes` を作成する
  - [x] `.raw/contents/release-notes.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] 全リリースノートを表示する
  - [x] 更新日と全文を表示する
  - [x] 全文が空欄なら簡単説明を表示する
  - [x] 改行を反映する
  - [x] ページ内目次は表示しない
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `20-1-common-callout-component` — 共通Callout Componentを作成する
  - completed: 2026-07-11 c1b4ead

  - [x] Component designを作成する
  - [x] `Callout.astro` を作成する
  - [x] `note`, `tip`, `warning`, `danger`, `example`, `version` を扱えるようにする
  - [x] 色だけに依存せず、見出し・ラベル・アイコン等でも種別を識別できるようにする
  - [x] はじめにページ以外の後続ページでも再利用できる共通Componentとして実装する
  - [x] Markdown / MDX本文から利用できることを確認する

- [x] `20-2-introduction-page` — はじめにページを作成する
  - completed: 2026-07-11 1adfe53

  - [x] designを生成する
  - [x] `/introduction.mdx` を作成する
  - [x] `.raw/contents/introduction.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] ゲーム概要を再掲せず、ページの役割を示す短い導入文、必要なもの、基本用語、ゴールデンルール、読み始める導線を配置する
  - [x] ゴールデンルールを注意枠のCalloutで表示する
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `21-2-world-page` — ワールドガイドページを作成する
  - completed: 2026-07-12 c190310

  - [x] designを生成する
  - [x] `/world.mdx` を作成する
  - [x] `.raw/contents/world.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] 初期公開範囲の世界観本文、強大な敵、NPC紹介を配置する
  - [x] 共通のシンプルな人物アイコン、二つ名、名前、説明を表示する静的 `NpcCard` をこのタスクで作成する。二つ名がある場合はルビ付きの控えめな青緑寄りの文字色で名前の直前に続け、ない場合は名前から表示する
  - [x] NPCをExcel / JSON管理へ移行せず、MDX内の静的propsで `NpcCard` を配置する
  - [x] GM専用情報、シナリオ本文、キャンペーン本文は配置しない
  - [x] 必要に応じてImageBlockを配置する
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `22-2-character-making-page` — キャラクターメイキングページを作成する
  - completed: 2026-07-12 774dbf4

  - [x] designを生成する
  - [x] `/character-making.mdx` を作成する
  - [x] `.raw/contents/character-making.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] キャラクターメイキング手順の説明を配置する
  - [x] データ参照導線を配置する
  - [x] 自動計算、入力フォーム、保存機能は作らない
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `23-2-rules-page` — ルールトップページを作成する
  - completed: 2026-07-12 9494017

  - [x] initial design draftを作成しない。既存の共通designを参照する
  - [x] `/rules/index.mdx` を作成する
  - [x] `.raw/contents/rules.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] `/introduction` のゴールデンルールへの参照を配置する
  - [x] 判定、達成値、効果値、対抗判定を配置する
  - [x] 必要に応じてCalloutを配置する
  - [x] 完成画面のスクリーンショットを取得してVisual Reviewを行い、ユーザー承認済みの`docs/design/rules/`へdesign正本化する

- [x] `24-2-scenario-play-page` — シナリオ進行ルールページを作成する
  - completed: 2026-07-12 bee3be3

  - [x] initial design draftを作成せず、既存の共通designを参照する
  - [x] `/rules/scenario-play.mdx` を作成する
  - [x] `.raw/contents/scenario-play.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] シーン、情報収集、休息、シナリオ終了処理を配置する
  - [x] シナリオ本文、ハンドアウト本文、キャンペーン本文は配置しない
  - [x] 完成画面のスクリーンショットを取得してVisual Reviewを行い、ユーザー承認済みの`docs/design/scenario-play/`へdesign正本化する

- [x] `25-2-battle-page` — 戦闘ルールページを作成する
  - completed: 2026-07-12 0f2dc89

  - [x] designを生成する
  - [x] `/rules/battle.mdx` を作成する
  - [x] `.raw/contents/battle.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] 攻撃、リアクション、コンボ、掛け合い等を配置する
  - [x] 戦闘処理支援ツール、ダイスローラー、戦闘シミュレーターは作らない
  - [x] 必要に応じてCalloutやImageBlockを配置する
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `26-2-advancement-page` — 成長ページを作成する
  - completed: 2026-07-13 4a6f522

  - [x] initial design draftを作成しない。既存の共通designを参照する
  - [x] `/advancement.mdx` を作成する
  - [x] `.raw/contents/advancement.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] キャラクター成長に関する本文を配置する
  - [x] 必要に応じてCalloutを配置する
  - [x] 完成画面のスクリーンショットを取得し、既存の共通designとの整合を確認する。ユーザー承認済みのdesign fixではdesign正本を更新する

- [x] `27-1-skill-card-component` — SkillCard Componentを作成する
  - completed: 2026-07-13 5700062

  - [x] Component designを作成する
  - [x] `SkillCard.astro` を作成する
  - [x] 名称、最大レベル、タイミング、コスト、技能、制限、対象、射程、概要と効果を連結した本文を表示する
  - [x] カテゴリ、所属流儀または所属生き様はカード内に表示せず、表示ページとそのセクションで識別する
  - [x] 個別アンカーIDを付与できるようにする
  - [x] 通常のスキル表示だけでなく、凡例用データを渡して凡例としても表示できるようにする

- [x] `28-0-common-skills-data` — 共通スキル一覧ページ用データを整備する
  - completed: 2026-07-14 069f95f

  - [x] `docs/conversion/common-skills.md` に共通スキル一覧用のデータ変換仕様を策定する
  - [x] `Skill` 検証スキーマを策定する
  - [x] スキルExcelから共通スキルを生成する変換スクリプトを策定する
  - [x] 共通スキル一覧ページに必要なデータ取得処理を策定する
  - [x] 変換スクリプトと検証スキーマのテストを追加する
  - [x] 必須項目、ID重複、カテゴリ値、タイミング表記を検証する

- [x] `28-2-common-skills-page` — 共通スキル一覧ページを作成する
  - completed: 2026-07-15 via PR #45 / f904aa8

  - [x] designを生成する
  - [x] `/data/common-skills` ページを作成する
  - [x] `.raw/contents/common-skills.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] 共通スキル一覧データを表示する
  - [x] CardContainer / SkillCard の表示方針と整合させる
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `29-0-ryugi-index-data` — 流儀一覧ページ用データを整備する
  - completed: 2026-07-15 via PR #46 / 963118d

  - [x] `docs/conversion/ryugi-index.md` に流儀一覧用のデータ変換仕様を策定する
  - [x] `ryugi-list.xlsx` から、流儀一覧と流儀詳細ページで共用する非スキル情報を生成する
  - [x] `Ryugi` 検証スキーマを策定する
  - [x] 流儀Excelから流儀一覧データを生成する変換スクリプトを策定する
  - [x] 流儀一覧ページと後続の流儀詳細ページに必要なデータ取得処理を策定する
  - [x] 変換スクリプトと検証スキーマのテストを追加する
  - [x] 必須項目、ID重複、表示順を検証する

- [x] `29-2-ryugi-index-page` — 流儀一覧ページを作成する
  - completed: 2026-07-22 via PR #54 / `da8b5d7`

  - [x] designを生成する
  - [x] `/data/ryugi/index.astro` を作成する
  - [x] `.raw/contents/ryugi-index.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] ケンカヤの `RyugiDataSection` と、流儀データの4項目の説明を表示する
  - [x] 入力順の流儀名リンクと横に配置する `shortDescription` だけを一覧に表示する
  - [x] キャラクターメイキングと成長では、流儀の共通スキルボーナスを変換済み流儀データから表示する
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `30-0-ryugi-detail-data` — 流儀詳細ページ用の流儀スキルデータを整備する
  - completed: 2026-07-21 via PR #52 / 071a035

  - [x] `docs/conversion/ryugi-skills.md` に流儀スキルExcel用のデータ変換仕様を策定する
  - [x] `Ryugi` と `Skill` の関連検証スキーマを策定する
  - [x] 流儀スキルExcelから流儀スキルを変換し、`29-0-ryugi-index-data` の流儀情報と合わせて取得できる処理を策定する
  - [x] 変換スクリプトと検証スキーマのテストを追加する
  - [x] 所属流儀ID、スキルID、個別アンカーIDの整合性を検証する

- [x] `30-2-ryugi-detail-page` — 流儀詳細ページを作成する
  - completed: 2026-07-21 via PR #53 / be092df

  - [x] designを生成する
  - [x] `/data/ryugi/[ryugiId].astro` を作成する
  - [x] `.raw/contents/ryugi-detail.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
  - [x] 共通テンプレートから流儀詳細ページを静的生成する
  - [x] 流儀説明、基礎能力値、プライマリボーナス、共通スキルボーナス、流儀スキル一覧を表示する
  - [x] 個別流儀ごとのページファイルを複製しない
  - [x] 完成画面のスクリーンショットを取得し、design正本を更新する

- [x] `31-0-ikizama-index-data` — 生き様一覧ページ用データを整備する
  - completed: 2026-07-22 via PR #55 / dfaa60c

  - [x] `docs/conversion/ikizama-index.md` に生き様一覧用のデータ変換仕様を策定する
  - [x] `Ikizama` 検証スキーマを策定する
  - [x] 生き様Excelから生き様一覧データを生成する変換スクリプトを策定する
  - [x] 生き様一覧ページに必要なデータ取得処理を策定する
  - [x] 変換スクリプトと検証スキーマのテストを追加する
  - [x] 必須項目、ID重複、表示順を検証する

## Phase 4: 検索

- [x] `43-install-pagefind` — Pagefindを導入する
  - completed: 2026-07-19 via PR #48 / c98e6d3

  - [x] Pagefind package追加
  - [x] build後にindex生成できる
  - [x] `npm run build:search-index` 追加

- [x] `44-search-modal-ui` — 検索モーダルUIを作成する
  - completed: 2026-07-19 via PR #49 / b2149b5

  - [x] designを生成する
  - [x] `SearchButton.astro` 作成
  - [x] `SearchModal.astro` 作成
  - [x] 検索結果を同一画面内に表示する枠を作成
  - [x] ヘッダー右側に検索アイコンを表示する
  - [x] 検索アイコンからポップアップ表示する
  - [x] 検索中に背景本文が不用意にスクロールしないよう調整する
  - [x] Escまたは閉じる操作で検索UIを閉じられるようにする

- [x] `45-search-pagefind-integration` — Pagefind検索連携と検索メタデータを実装する
  - completed: 2026-07-20 via PR #50 / 75888fd

  - [x] 検索語入力でPagefind検索
  - [x] 検索結果をモーダル内に表示
  - [x] 結果クリックで該当ページまたはアンカーへ遷移
  - [x] ヘッダー、フッター、サイトメニュー、ページ内目次を検索対象から除外
  - [x] ページタイトル、セクション、種別ラベルを検索結果に表示
  - [x] データカード個別アンカーが検索結果から利用できることを確認する

- [x] `48-search-index-ci-deploy` — CIを更新して検索index生成込みでデプロイする
  - completed: 2026-07-20 via PR #51 / 6ecf322

  - [x] `.github/workflows/deploy.yml` を更新する
  - [x] `npm run check` を実行する
  - [x] `npm run build:public` 後に `npm run build:search-index` を実行する
  - [x] Pagefind生成物がGitHub Pagesへdeployされる成果物に含まれることを確認する
  - [x] 公開環境で検索UIがPagefind indexを参照できることを確認する
  - [x] GitHub Pagesサブパス配下で検索indexのパスが壊れないことを確認する
