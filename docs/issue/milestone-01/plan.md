# milestone-01 計画と履歴

milestone-01は初回公開を完了している。現在の実装要件は `docs/requirements.md` と `docs/requirements/*.md`、初期スコープ外は `docs/out-of-scope.md` を正本とする。

`docs/issue/milestone-01/plan.md` はGate planではない。完了済みtaskの詳細はGitHub closed Issueに残し、このplanには `元issue名 — GitHub Issue #<number>` の形式だけを記録する。

## milestone-01の目的

- 静的ルールサイトをGitHub Pagesのサブパスで公開する。
- PLが遊ぶ判断と参加準備に必要なルール、世界観、キャラクターメイキング、データ、検索、更新履歴を提供する。
- Webキャラクターシート、Cloudflare Web Analytics、Google Spreadsheetのローカル同期を初期スコープに含める。

## 完了したクローズtask

- [x] `ex-07` — GitHub Issue #116

milestone-01はex-07のmergeによりクローズした。milestone-02の計画、issue、実装は次のmilestoneの計画としてユーザー指示後に開始する。

## 履歴の扱い

- 完了済みissueの最終契約・完了記録は同名のGitHub closed Issueへ残し、ローカルのissue fileは削除する。
- milestone planには、完了issueの名称とplain-textの `<slug> — GitHub Issue #<number>` だけを履歴として残す。詳細要件、完了条件、実装経緯は残さない。
- 完了したparent Gate planは `docs/issue/milestone-01/plans/` に置き、各完了Gateを名称とGitHub Issue番号だけに縮約する。
- GitHub Issueの作成・close・ローカルissue削除は、ユーザー承認または承認済みのpost-merge完了処理でだけ行う。

## 完了済み

## Phase 0: リポジトリ初期化

- [x] `01-docs-requirements` — 対応するローカルissueがarchiveに存在しなかったため、GitHub Issueは発行していない。
  - completed: 2026-07-03 `d4a6507`
  - [x] `docs/requirements.md` を配置
  - [x] `docs/out-of-scope.md` を配置
  - [x] 初期スコープ外項目を明示
- [x] `02-init-astro-project` — GitHub Issue #125
- [x] `03-gitignore-raw-policy` — GitHub Issue #126
- [x] `04-basic-project-docs` — GitHub Issue #127

## Phase 1: Astro基盤

- [x] `05-config-mdx` — GitHub Issue #128
- [x] `06-config-base-path` — GitHub Issue #129
- [x] `07-0-prepare-design-review` — GitHub Issue #130
- [x] `07-global-styles` — GitHub Issue #131
- [x] `08-seo-component` — GitHub Issue #132

## Phase 2: レイアウト・ナビゲーション

- [x] `09-base-layout` — GitHub Issue #133
- [x] `10-header-footer` — GitHub Issue #134
- [x] `11-site-menu` — GitHub Issue #135
- [x] `12-mobile-menu` — GitHub Issue #137
- [x] `12-1-site-menu-layout-copy` — GitHub Issue #136
- [x] `13-page-toc` — GitHub Issue #138
- [x] `14-mobile-page-toc` — GitHub Issue #139
- [x] `15-current-menu-highlight` — GitHub Issue #141
- [x] `15-1-menu-expand-current-ancestors-only` — GitHub Issue #140
- [x] `16-layout-screenshot-design-refresh` — GitHub Issue #142
- [x] `17-github-actions-deploy-basic` — GitHub Issue #143

## Phase 3: ページ作成

- [x] `18-0-release-notes-data` — GitHub Issue #145
- [x] `18-1-common-image-block-component` — GitHub Issue #146
- [x] `18-2-home-page` — GitHub Issue #147
- [x] `19-2-release-notes-page` — GitHub Issue #148
- [x] `20-1-common-callout-component` — GitHub Issue #149
- [x] `20-2-introduction-page` — GitHub Issue #150
- [x] `21-2-world-page` — GitHub Issue #151
- [x] `22-2-character-making-page` — GitHub Issue #144
- [x] `23-2-rules-page` — GitHub Issue #152
- [x] `24-2-scenario-play-page` — GitHub Issue #153
- [x] `25-2-battle-page` — GitHub Issue #154
- [x] `26-2-advancement-page` — GitHub Issue #155
- [x] `27-1-skill-card-component` — GitHub Issue #156
- [x] `28-0-common-skills-data` — GitHub Issue #158
- [x] `28-2-common-skills-page` — GitHub Issue #159
- [x] `29-0-ryugi-index-data` — GitHub Issue #160
- [x] `29-2-ryugi-index-page` — GitHub Issue #161
- [x] `30-0-ryugi-detail-data` — GitHub Issue #162
- [x] `30-2-ryugi-detail-page` — GitHub Issue #163
- [x] `31-0-ikizama-index-data` — GitHub Issue #164
- [x] `31-2-ikizama-index-page` — GitHub Issue #165
- [x] `32-0-ikizama-detail-data` — GitHub Issue #166
- [x] `32-2-ikizama-detail-page` — GitHub Issue #167
- [x] `33-2-items-index-page` — GitHub Issue #168
- [x] `34-0-items-data` — GitHub Issue #169
- [x] `34-1-item-card-components` — GitHub Issue #170
- [x] `27-2-data-index-page` — GitHub Issue #157
- [x] `34-2-items-pages` — GitHub Issue #171
- [x] `42-0-npc-data-normalization` — GitHub Issue #174
- [x] `40-2-404-page` — GitHub Issue #172
- [x] `ex-01-page-navigation-links` — GitHub Issue #79
- [x] `41-2-support-page` — GitHub Issue #173

## Phase 4: キャラクター作成

- [x] `ex-02-web-character-sheet` — GitHub Issue #113

## Phase 4: 検索

- [x] `43-install-pagefind` — GitHub Issue #175
- [x] `44-search-modal-ui` — GitHub Issue #176
- [x] `45-search-pagefind-integration` — GitHub Issue #177
- [x] `48-search-index-ci-deploy` — GitHub Issue #178

## Phase 5: 仕上げ・公開

- [x] `49-50-accessibility-responsive-pass` — GitHub Issue #179
- [x] `ex-03-hero-layout-stability` — GitHub Issue #184
- [x] `51-performance-pass` — GitHub Issue #181
- [x] `52-github-pages-base-check` — GitHub Issue #181
- [x] `ex-05-access-analytics` — GitHub Issue #114
- [x] `53-content-smoke-test` — GitHub Issue #181
- [x] `55-initial-release` — GitHub Issue #182
- [x] `56-ci-non-main-branches` — GitHub Issue #183
