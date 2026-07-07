# 16-layout-screenshot-design-refresh

## 目的

実装済みのレイアウト一式を、画面キャプチャベースのdesign正本へ更新する。

このタスクでは、`15-current-menu-highlight` までのレイアウト / ナビゲーション実装が完了している前提で、PC / タブレット / スマホ幅の代表スクリーンショットを取得し、現行実装の見た目をdesign正本として整理する。

主目的は **design正本の更新** であり、追加の機能実装は行わない。

具体的には以下を満たす。

* Header / Footer / SiteMenu / MobileMenu / PageToc / MobilePageToc / 現在ページハイライトを含む現行レイアウトを確認する
* PC、タブレット、スマホ幅の代表スクリーンショットを取得する
* 実装スクリーンショットをもとに、layout一式のdesign targetを更新する
* 既存designとの差分、実装側に寄せて正本化する理由、未解決事項、後続で調整すべきUI課題を記録する
* Visual Reviewの失敗を隠す目的でactual screenshotを直接design正本へコピーしない
* このタスクでは、追加のUI機能、ナビゲーション機能、検索機能、パンくず、前後ナビゲーション等は実装しない

## 背景

`docs/plan.md` の `16-layout-screenshot-design-refresh` は、Phase 2「レイアウト・ナビゲーション」の総仕上げとして、実装済みレイアウト一式を画面キャプチャベースのdesignへ更新するタスクである。

先行タスクでは以下が段階的に実装されている前提とする。

* `09-base-layout`: `BaseLayout.astro` / `ContentLayout.astro`
* `10-header-footer`: Header / Footer
* `11-site-menu`: PC左サイトメニュー
* `12-mobile-menu`: スマホ用サイトメニューdrawer
* `12-1-site-menu-layout-copy`: サイトメニュー文言・階層レイアウト調整
* `13-page-toc`: PC右ページ内目次
* `14-mobile-page-toc`: スマホ / タブレット幅のページ内目次
* `15-current-menu-highlight`: 現在ページハイライト

既存のdesign targetは、各Component / 各状態の初期draftとして作成されている。一方で、各タスク完了後の実装結果を横断的に確認した「完成状態のレイアウト正本」はまだ整理されていない。

このIssueでは、個別designを単に再生成するのではなく、現行実装のスクリーンショットを材料にして、実際に成立しているレイアウト一式をdesign正本へ反映する。

## ローカル検証サマリ

* mode: local repository mode
* branch: `16-layout-screenshot-design-refresh`
* issue: `docs/issue/done/phase-2/16-layout-screenshot-design-refresh.md`
* local validation date: 2026-07-07
* checked files:

  * `AGENTS.md`
  * `.agents/skills/issue-first-development/SKILL.md`
  * `.agents/skills/design-image-generation/SKILL.md`
  * `docs/plan.md`
  * `docs/TODO.md`
  * `docs/requirements.md`
  * `docs/out-of-scope.md`
  * `docs/issue/15-current-menu-highlight.md`
  * `docs/design/`
  * `tests/visual/README.md`
  * `tests/visual/capture.spec.ts`
  * `package.json`
  * `src/pages/`

### 検証結果

* `docs/plan.md` の `16-layout-screenshot-design-refresh` とbranch / issue名は一致している。
* `docs/plan.md` 上で `15-current-menu-highlight` は完了済みである。
* `docs/issue/15-current-menu-highlight.md` には、現在ページハイライト、`aria-current="page"`、親カテゴリ展開 / 強調、PC / mobile menu両方での確認結果が記録されている。
* `docs/design/current-menu-highlight/` は存在する。
* `docs/design/site-layout/` は未作成であり、このIssueで横断design targetとして作成する。
* 現在の `src/pages/` には `/`、`/mdx-test`、`/data`、`/data/items`、`/data/items/weapons` が存在する。
* `/release-notes` と `/404` は将来タスクで作成予定の未実装routeであり、このIssueでは新規作成しない。
* `tests/visual/capture.spec.ts` は現時点では単一URLのdesktop / mobile screenshot取得に限られる。
* `docs/TODO.md` には、既存 `docs/design/*/notes.md` を `design-image-generation` のnotes構造へ寄せるTODOと、現在地ハイライト目視確認用ダミーMDXページを本実装時に削除または置き換えるTODOがある。

### 実装前未検証

* `npm run check`
* `npm run build`
* local dev server / preview serverでの実画面表示
* PC / tablet / mobile幅の実スクリーンショット
* mobile menu open stateの実スクリーンショット
* mobile page toc open stateの実スクリーンショット
* design正本化に対する人間レビュー済み承認

## 対象範囲

このタスクで扱う。

* 実装済みレイアウト一式の画面キャプチャ取得
* PC幅の代表スクリーンショット取得
* タブレット幅の代表スクリーンショット取得
* スマホ幅の代表スクリーンショット取得
* 必要な画面 / 状態ごとに個別実行できるPlaywright screenshot testの追加
* Headerの表示確認
* Footerの表示確認
* PC版SiteMenuの表示確認
* MobileMenuのclosed / open状態確認
* PC版PageTocの表示確認
* MobilePageTocのclosed / open状態確認
* 現在ページハイライトの表示確認
* 現在ページハイライトとhover / focus / open stateが混同されないことの確認
* `aria-current="page"` または同等属性の確認
* 親カテゴリの展開または強調の確認
* 既存design targetとの差分整理
* design fix / canonicalize from implementationとしてのnotes更新
* 代表スクリーンショットをもとにしたdesign正本更新
* design正本と実装の差分記録
* 未解決事項の記録
* 後続で調整すべきUI課題の記録
* `npm run check`
* `npm run build`
* 必要な画面のscreenshot取得

## 初期スコープ外

このタスクでは扱わない。

* 新しい機能実装
* 未実装routeの新規作成
* Header / Footerの再設計
* SiteMenuの階層構造変更
* MobileMenuの開閉仕様変更
* PageTocの見出し抽出仕様変更
* MobilePageTocの開閉仕様変更
* 現在ページハイライトの追加実装または仕様変更
* IntersectionObserverによるactive heading追跡
* ページ内目次のスクロール連動現在位置ハイライト
* パンくずリスト
* ページ末尾の前後ナビゲーション
* 検索UI
* Pagefind導入
* ルール本文の本格移植
* 新規本文ページの大量作成
* トップページ本体の完成
* 更新履歴ページ本体の完成
* 404ページ本体の完成
* Excel / Spreadsheet連携
* JSON変換パイプライン
* データカード、一覧フィルタ、検索絞り込み
* キャラクターシート
* ダイスローラー
* 戦闘シミュレーター
* DB
* 認証
* SSR
* CMS
* 外部UIライブラリの大規模導入
* 高度なアニメーション
* 過剰なneon glow表現
* Playwright actual screenshotを、理由記録なしにそのままdesign正本としてコピーすること
* Visual Reviewの失敗を隠すためにdesign正本を実装へ寄せること

## 技術方針

### 基本方針

このIssueは、実装タスクではなく design refresh / design canonicalization タスクとして扱う。

実装済みのUIが、既存の初期draft designよりも正本として適切である場合に限り、実装スクリーンショットを材料にしてdesign正本を更新する。

ただし、actual screenshotそのものは一時artifactであり、無条件にdesign正本ではない。

正本化時には、少なくとも以下を記録する。

* どの実装スクリーンショットを元にしたか
* どのdesign targetを更新したか
* 既存designとの差分
* 差分を採用する理由
* 既存requirements / out-of-scope / global designと矛盾しないこと
* 未解決事項
* 後続Issueで扱うべきUI課題

### design target方針

このIssueでは、layout一式の横断確認用として以下の新規または更新design targetを想定する。

```txt
docs/design/site-layout/
```

期待するartifacts。

```txt
docs/design/site-layout/notes.md
docs/design/site-layout/design-desktop.png
docs/design/site-layout/design-tablet.png
docs/design/site-layout/design-mobile.png
docs/design/site-layout/design-mobile-menu-open.png
docs/design/site-layout/design-mobile-page-toc-open.png
```

`15-current-menu-highlight` のdesign targetが存在する場合は、以下も参照する。

```txt
docs/design/current-menu-highlight/
```

必要に応じて、既存個別targetのnotesへ「site-layout正本へ統合済み」または「最新layout正本は `docs/design/site-layout/` を参照」と記録する。

ただし、このIssueで既存の個別design画像をすべて置換する必要はない。更新対象を広げすぎると、design refreshではなく全design再設計になるため、原則として `site-layout` を横断正本として作成 / 更新する。

### 推奨viewport

代表viewportは以下を基本とする。

```txt
desktop: 1440x1200
tablet: 820x1180
mobile: 390x900
```

補足。

* desktopでは、Header / Footer / PC SiteMenu / PC PageToc / 現在ページハイライトを確認する
* tabletでは、`1024px` 未満のレイアウトとして、PC右PageTocが非表示になり、MobilePageTocが対象になることを確認する
* mobileでは、Header / MobileMenu / MobilePageToc / Footerが破綻しないことを確認する

### 推奨route

代表routeはローカル実装を確認して確定する。

候補。

```txt
/mdx-test
/data/items
/data/items/weapons
/
```

優先方針。

* 現在ページハイライトを確認するため、SiteMenu上で親子階層を持つrouteを1つ選ぶ
* PC PageToc / MobilePageTocを確認するため、見出し数が十分にある本文ページを1つ選ぶ
* 非表示制御確認として、現時点で実装済みの `/` を確認する
* `/release-notes` と `/404` は未実装routeであり、このIssueでは作成しない。後続タスクでページが実装された後に確認する対象として記録する
* `/data/items/weapons` は `15-current-menu-highlight` の目視確認用ダミーMDXページを含むため、このIssueでは代表routeとして使えるが、本実装時に削除または置き換えるTODOがあることを記録する
* データページが存在する場合は、データページでもレイアウトが破綻しないことを確認する

### スクリーンショット取得方針

このIssueでは、今後のVRT運用を見据えつつ、VRTを実施するのではなく、design正本化に必要な画面のスクリーンショットを取得する。

スクリーンショット取得は、既存の単一URL captureを大きく改造するのではなく、必要な画面 / 状態ごとに個別実行できるPlaywright testを追加する方針とする。

方針。

* 一つのtest caseですべてのroute / viewport / stateをまとめて実行しない
* desktop layout、tablet layout、mobile layout、mobile menu open、mobile page toc openなど、必要なスクリーンショットごとに独立したtest caseを用意する
* 必要なtest caseだけを `playwright test` のgrepやファイル指定で実行できるようにする
* host / base pathは設定ファイルに集約し、各test caseには個別pathだけを明記する
* Playwright標準の `use.baseURL` を使える場合は採用し、`page.goto("/data/items/weapons/")` のように相対pathで遷移する
* 共通設定は `playwright.config.ts` または `tests/visual/config.ts` に置く。既存構成との相性を見て、設定責務が分散しすぎないほうを選ぶ
* 実行対象の切り替えは、Playwright標準の `--grep`、test file指定、必要に応じて `--project` を使う
* `process.argv` を独自にparseして対象pathやviewportを切り替える仕組みは作らない
* 環境変数を使う場合も、都度URL全体を指定する運用ではなく、設定ファイルの既定値を上書きする最小用途に留める
* 後続VRTで再利用しやすい命名と出力pathにする
* `test-results/` と `playwright-report/` はactual artifactとして扱い、Git管理しない
* `docs/design/site-layout/` へ保存する画像は、design正本として採用するものだけに限る
* design正本画像は、コンテンツの全体像と縦方向の破綻有無を確認するため、原則としてPlaywrightのfullPage screenshotを採用する

基本コマンド例。

```sh
npm run dev
npm run visual:capture -- --grep "site layout desktop"
```

または、build後の状態を確認する場合。

```sh
npm run build
npm run preview
npm run visual:capture -- --grep "site layout desktop"
```

実装済みのVisual Review captureが単一URL前提で不足する場合は、このIssue内で必要なスクリーンショットだけを個別に撮れるtest file / test caseを追加する。

ただし、Visual Review基盤の大規模再設計、画像差分判定、全route一括VRT、CI組み込みはこのIssueでは扱わない。

### design正本化方針

以下のいずれかで対応する。

#### A. `docs/design/site-layout/` を新規作成する

layout一式の横断design targetが存在しない場合。

対象。

* `docs/design/site-layout/notes.md`
* `docs/design/site-layout/design-desktop.png`
* `docs/design/site-layout/design-tablet.png`
* `docs/design/site-layout/design-mobile.png`
* `docs/design/site-layout/design-mobile-menu-open.png`
* `docs/design/site-layout/design-mobile-page-toc-open.png`

#### B. `docs/design/site-layout/` を更新する

既に存在する場合。

対象。

* 既存notesのmodeを `design fix` または同等に更新
* 既存design画像との差分を記録
* 今回の実装スクリーンショット由来で正本化する理由を記録

#### C. 個別targetへ最小追記する

必要な場合に限り、以下の既存targetのnotesへ参照関係を追記する。

`site-layout` 正本化後のnotes更新は、ユーザーの明示的な指示により、このIssueの対象範囲として扱う。

* `docs/design/base-layout/`
* `docs/design/header-footer/`
* `docs/design/site-menu/`
* `docs/design/mobile-menu/`
* `docs/design/page-toc/`
* `docs/design/mobile-page-toc/`
* `docs/design/current-menu-highlight/` が存在する場合

ただし、個別targetの画像を一斉置換することは原則避ける。

## design参照

このIssueで参照する既存design target。

```txt
docs/design/global-styles/
docs/design/base-layout/
docs/design/header-footer/
docs/design/site-menu/
docs/design/mobile-menu/
docs/design/page-toc/
docs/design/mobile-page-toc/
```

`15-current-menu-highlight` 完了後に存在する場合は、以下も参照する。

```txt
docs/design/current-menu-highlight/
```

このIssueで作成または更新する想定design target。

```txt
docs/design/site-layout/
```

期待する `notes.md` 構造。

```md
# site-layout

## Mode

- design fix

## Target

- page / component:
- route:
- viewport:
- states:

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `.agents/skills/visual-implementation-review/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/issue/done/phase-2/16-layout-screenshot-design-refresh.md`
- `docs/design/global-styles/`
- `docs/design/base-layout/`
- `docs/design/header-footer/`
- `docs/design/site-menu/`
- `docs/design/mobile-menu/`
- `docs/design/page-toc/`
- `docs/design/mobile-page-toc/`
- `docs/design/current-menu-highlight/` when available

## Design direction

- visual direction:
- layout direction:
- typography direction:
- color / accent usage:

## Existing design constraints

-

## Out of scope

-

## Comparison points for implementation

-

## Generation source

- generator or capture source:
- source branch / commit when applicable:
- route when applicable:
- viewport:
- prompt summary or capture notes:

## Differences from previous design references

-

## Canonicalization rationale

-

## Open questions

-
```

## 完了条件

* [x] local branchが `16-layout-screenshot-design-refresh` である
* [x] `docs/issue/done/phase-2/16-layout-screenshot-design-refresh.md` が作成または検証されている
* [x] `15-current-menu-highlight` が完了済みであることをローカルで確認した
* [x] `docs/TODO.md` にこのIssueへ直接取り込むべき未対応項目がないことを確認した
* [x] 既存design targetを確認した
* [x] `docs/design/current-menu-highlight/` が存在する場合は参照した
* [x] 代表routeを決定した
* [x] `/release-notes` と `/404` は未実装routeとして、このIssueでは確認対象外であることを記録した
* [x] `docs/TODO.md` の現在地ハイライト目視確認用ダミーMDXページTODOとの関係を記録した
* [x] 必要な画面 / 状態ごとに個別実行できるPlaywright screenshot testを追加した
* [x] host / base pathは設定ファイルに集約し、test case側は個別pathだけを明記している
* [x] Playwright標準の `use.baseURL`、`--grep`、test file指定、必要に応じた `--project` を優先している
* [x] `process.argv` の独自parseで対象pathやviewportを切り替える仕組みにしていない
* [x] desktop `1440x1200` のスクリーンショットを取得した
* [x] tablet `820x1180` のスクリーンショットを取得した
* [x] mobile `390x900` のスクリーンショットを取得した
* [x] mobile menu open stateのスクリーンショットを取得した
* [x] mobile page toc open stateのスクリーンショットを取得した
* [x] design正本画像はfullPage screenshotとして作成され、コンテンツ全体像を確認できる
* [x] Headerが既存design方針と矛盾していない
* [x] Footerが既存design方針と矛盾していない
* [x] PC SiteMenuが既存design方針と矛盾していない
* [x] MobileMenuが既存design方針と矛盾していない
* [x] PC PageTocが既存design方針と矛盾していない
* [x] MobilePageTocが既存design方針と矛盾していない
* [x] 現在ページハイライトがSiteMenu上で視覚的に識別できる
* [x] 現在ページハイライトがhover / focus / disclosure open stateと混同されない
* [x] 現在ページに `aria-current="page"` または同等の属性がある
* [x] 現在ページに対応する親カテゴリが展開または強調されている
* [x] `/` で不要なPageToc / MobilePageTocが表示されない
* [x] `/release-notes` と `/404` のPageToc / MobilePageToc非表示確認は、該当ページ実装後の後続確認として記録した
* [x] `1024px` 未満でPC右PageTocが常設表示されない
* [x] mobile幅でPC左SiteMenuが常設表示されない
* [x] mobile幅でMobileMenuとMobilePageTocが視覚的に混同されない
* [x] mobile / tablet幅でH1とMobilePageToc triggerが上部にsticky表示され、スクロール後も目次が画面外へ消えない
* [x] ページ全体に意図しない横スクロールが発生していない
* [x] tap target / focus outlineが破綻していない
* [x] `docs/design/site-layout/notes.md` を作成または更新した
* [x] `docs/design/site-layout/design-desktop.png` を作成または更新した
* [x] `docs/design/site-layout/design-tablet.png` を作成または更新した
* [x] `docs/design/site-layout/design-mobile.png` を作成または更新した
* [x] `docs/design/site-layout/design-mobile-menu-open.png` を作成または更新した
* [x] `docs/design/site-layout/design-mobile-page-toc-open.png` を作成または更新した
* [x] 既存designとの差分を `notes.md` に記録した
* [x] 正本化理由を `notes.md` に記録した
* [x] 未解決事項を `notes.md` に記録した
* [x] 後続で調整すべきUI課題を `notes.md` またはIssue備考へ記録した
* [x] ユーザーの明示的な指示により、既存個別design notesへ `site-layout` 正本化後の扱いを記録した
* [x] 追加の機能実装を行っていない
* [x] Visual Review失敗を隠す目的でdesign正本を更新していない
* [x] `npm run check` が成功する
* [x] `npm run build` が成功する

## チェックポイント

* [x] `git status --short --branch` を確認した
* [x] `git branch --show-current` を確認した
* [x] `docs/plan.md` の `16-layout-screenshot-design-refresh` と整合している
* [x] `docs/out-of-scope.md` と矛盾するUIをdesignへ描き込んでいない
* [x] `docs/design/global-styles/` の白寄り背景、暗めHeader、青緑accent、過剰neon禁止方針を維持している
* [x] Header / Footer / SiteMenu / MobileMenu / PageToc / MobilePageToc / 現在ページハイライトが1つのサイトとして一貫して見える
* [x] SiteMenuとPageTocの役割差が維持されている
* [x] MobileMenuとMobilePageTocの役割差が維持されている
* [x] 現在ページハイライトが強すぎて本文閲覧を邪魔していない
* [x] 現在ページハイライトが弱すぎて現在位置が分からない状態になっていない
* [x] 親カテゴリの展開 / 強調が過剰ではない
* [x] PC / tablet / mobileでHeader高さ、本文余白、サイド領域が破綻していない
* [x] mobile menu open中に本文側UIが操作対象に見えすぎない
* [x] mobile page toc open中にsite menu drawerのように見えない
* [x] 実装済みの `/` で空のTOC枠や「目次なし」表示が出ていない
* [x] 未実装の `/release-notes` / `/404` を、このIssueで新規作成していない
* [x] 必要なスクリーンショットだけを個別に取得できるtest case構成になっている
* [x] 一つのtest caseですべてのroute / viewport / stateをまとめて実行する構成にしていない
* [x] URL全体を都度指定する運用を前提にしていない
* [x] `test-results/`、`playwright-report/`、`.tmp/` のactual artifactをGit管理対象にしていない
* [x] design正本として保存する画像だけが `docs/design/site-layout/` に置かれている
* [x] local onlyの一時スクリーンショットを誤ってcommit対象にしていない
* [x] design正本化に人間判断が必要な差分を隠していない

## 想定変更ファイル

* `docs/issue/done/phase-2/16-layout-screenshot-design-refresh.md`
* `docs/design/site-layout/notes.md`
* `docs/design/site-layout/design-desktop.png`
* `docs/design/site-layout/design-tablet.png`
* `docs/design/site-layout/design-mobile.png`
* `docs/design/site-layout/design-mobile-menu-open.png`
* `docs/design/site-layout/design-mobile-page-toc-open.png`

必要に応じて以下。

* `docs/design/base-layout/notes.md`
* `docs/design/header-footer/notes.md`
* `docs/design/site-menu/notes.md`
* `docs/design/mobile-menu/notes.md`
* `docs/design/page-toc/notes.md`
* `docs/design/mobile-page-toc/notes.md`
* `docs/design/current-menu-highlight/notes.md`

必要なスクリーンショットを個別取得するtest file / test caseを追加する場合のみ以下。

* `tests/visual/README.md`
* `tests/visual/**/*.ts`
* `package.json`
* `playwright.config.ts`

ただし、既存captureの大規模改造、全route一括VRT、画像差分判定、CI組み込みはこのIssueでは扱わない。

## レビュー観点

* `docs/design/site-layout/` をlayout一式の横断design targetとして新設 / 更新する方針でよいか
* 既存個別targetの画像を一斉置換せず、`site-layout` に完成状態の横断正本を置く方針でよいか
* desktop viewportを `1440x1200` とする方針でよいか
* tablet viewportを `820x1180` とする方針でよいか
* mobile viewportを `390x900` とする方針でよいか
* 代表routeは、親子階層とTOCを両方確認できる本文ページを優先する方針でよいか
* 未実装の `/release-notes` と `/404` をこのIssueでは作成せず、確認対象外として記録する方針でよいか
* 非表示確認として現時点で実装済みの `/` を含める方針でよいか
* `/data/items/weapons` を代表routeとして使う場合、目視確認用ダミーMDXページTODOとの関係が明確か
* mobile menu open stateとmobile page toc open stateを別画像として残す方針でよいか
* 現在ページハイライトをsite-layout正本に含める方針でよいか
* 現在ページハイライトの強さが、アクセント方針に対して過剰でないか
* 実装スクリーンショットをdesign正本化する理由が十分に記録されているか
* 既存初期draftとの差分を後続課題として残すべきか、今回正本化してよいか
* 追加のUI実装を行わないスコープで十分か
* 必要なスクリーンショットごとに個別実行できるtest file / test caseを追加する方針でよいか
* host / base pathを設定ファイルへ集約し、test caseには個別pathだけを書く方針でよいか
* Playwright標準の `use.baseURL`、`--grep`、test file指定を使い、`process.argv` 独自parseを避ける方針でよいか

## 備考

このIssueは、Phase 2で積み上げたレイアウト / ナビゲーションの実装状態を、今後のVisual Reviewや後続ページ作成の基準にするためのdesign refreshである。

したがって、見た目の違和感を見つけても、即座にUI実装で直すのではなく、以下に分類する。

1. design正本として採用してよい差分
2. 軽微なnotes記録で済む差分
3. 後続Issueで調整すべきUI課題
4. 現Issueでは扱わないout-of-scope項目

このIssueでやるべきことは、実装を増やすことではなく、現在の完成状態を正しく記録し、以後の比較基準を整えることである。

## レビュー指摘 1

### 指摘事項

- PR本文では `npm run check`、`npm run build`、site-layout系のvisual captureが完了済みとして記録されているが、Issue本文の完了条件とチェックポイントが未チェックのまま残っている。
- `MobilePageToc.astro` のsticky heading補正は局所的で許容範囲だが、負marginとpaddingでsticky背景領域を調整している意図が後から読み取りにくい。

### 判定

- source: human
- classification: valid
- local validation: `.tmp/16-review.md` を確認した。ローカルの `docs/issue/done/phase-2/16-layout-screenshot-design-refresh.md` では完了条件とチェックポイントのチェックボックスが未反映であることを確認した。`src/components/layout/MobilePageToc.astro` ではsticky headingに `background: var(--color-surface)`、上padding、同量の負margin、TOC triggerの微調整が入っており、レビュー指摘の対象箇所が現行実装に存在することを確認した。

### 対応方針

- 実施済みの検証と正本化作業に対応するIssue完了条件・チェックポイントだけをチェック済みに更新する。`docs/plan.md` の `16-layout-screenshot-design-refresh` は人間レビュー後の完了更新対象なので、このレビュー対応ではチェック済みにしない。
- `MobilePageToc.astro` のsticky heading補正箇所へ、上端まで白背景で覆いつつ通常表示時のH1位置を崩しにくくする意図を短いCSSコメントで記録する。現時点ではcustom property化などの追加抽象化は行わない。

### 対応完了チェックリスト

- [x] Issue完了条件とチェックポイントへ、実施済み項目を反映する
- [x] `MobilePageToc.astro` のsticky heading補正意図をCSSコメントで記録する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
