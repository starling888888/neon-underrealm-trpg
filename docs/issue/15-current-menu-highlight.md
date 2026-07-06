# 15-current-menu-highlight

## 目的

サイトメニュー上で、現在表示しているページを視覚的に識別できるようにする。

このタスクでは、PC左サイトメニューとスマホdrawer内サイトメニューの両方で、現在ページに対応するリンクをハイライトし、該当リンクに `aria-current="page"` を設定できるようにする。

また、現在ページが子階層に属する場合は、親カテゴリを展開または強調し、閲覧者がサイト内の現在位置を把握できる状態にする。

## 背景

`docs/plan.md` の `15-current-menu-highlight` は、Phase 2 の「現在ページハイライトを実装する」タスクである。

既存のサイトメニューは、`src/lib/site/menu.ts` の `siteMenuItems` をもとに、`SiteMenu.astro` / `SiteMenuItem.astro` でPC左レールとスマホdrawerの両方に表示されている。

現状では、各リンクは `withBase(item.href)` を使ってhref化されているが、現在URLとの照合、active class、`aria-current="page"`、親カテゴリの現在位置表示はまだ持っていない。

このタスクでは、パンくずリストやページ末尾の前後ナビゲーションを追加せず、現在地表示はサイトメニュー内のハイライトで担保する。

また、ここで扱うのは「現在ページのサイトメニューハイライト」であり、「ページ内目次の現在見出しハイライト」ではない。スクロール位置に応じたPageToc active heading追跡は、このタスクでは扱わない。

前提として、`14-mobile-page-toc` は問題なく完了しているものとして扱う。

## 対象範囲

このタスクで扱う。

* サイトメニューの現在ページ判定
* 現在ページリンクの視覚的ハイライト
* 現在ページリンクへの `aria-current="page"` 設定
* 現在ページを含む親カテゴリの展開または強調
* PC左サイトメニューでの現在ページ表示
* スマホdrawer内サイトメニューでの現在ページ表示
* `Astro.url.pathname` または同等の現在パス取得
* GitHub Pagesサブパス公開時にも壊れない現在パス正規化
* 末尾スラッシュ有無を吸収するパス比較
* hash / query に影響されないパス比較
* メニュー定義に存在する通常ページのexact match判定
* メニュー定義に存在しない詳細ページで、最も近い親カテゴリを強調する処理
* 親カテゴリが現在ページ自身または現在ページの祖先である場合の表示状態
* `SiteMenu.astro`
* `SiteMenuItem.astro`
* `src/lib/site/menu.ts`
* 必要であれば、サイトメニュー用の小さなpath helper
* 必要であれば、既存CSS tokensに沿ったactive / ancestor表示CSS
* 必要であれば、`docs/design/current-menu-highlight/` のdesign initial draft作成前提の記録

## 初期スコープ外

このタスクでは扱わない。

* ページ内目次の現在見出しハイライト
* IntersectionObserverによるスクロール位置追跡
* PageTocのactive heading表示
* MobilePageTocの追加仕様
* サイトメニューの開閉状態永続化
* localStorage / sessionStorage によるメニュー状態保存
* クライアントサイドルーティング
* SPA化
* パンくずリスト
* ページ末尾の前後ナビゲーション
* 検索UI
* Pagefind導入
* 流儀・生き様の個別詳細ページをサイトメニューへ自動追加する処理
* 生成JSONからサイトメニュー項目を生成する処理
* Excel変換
* JSON変換パイプライン
* 新規ページ本文の作成
* 未作成ページの作成
* ルール本文の本格移植
* キャラクターシート
* ダイスローラー
* 戦闘シミュレーター
* DB
* 認証
* SSR
* CMS
* 外部UIライブラリの大規模導入
* 高度なアニメーション
* 派手な発光表現

## 完了条件

* [ ] 現在表示中のページに対応するサイトメニューリンクが、PC左サイトメニューで視覚的に識別できる
* [ ] 現在表示中のページに対応するサイトメニューリンクが、スマホdrawer内サイトメニューで視覚的に識別できる
* [ ] exact matchするリンクには `aria-current="page"` が設定されている
* [ ] exact matchしない詳細ページでは、存在しないリンクに `aria-current="page"` を付けず、最も近い親カテゴリだけをancestor状態として強調できる
* [ ] 現在ページを含む親カテゴリは、初期表示時に展開または強調される
* [ ] 既存の手動開閉操作は維持され、現在ページ親カテゴリであってもユーザー操作による開閉が破綻しない
* [ ] パス比較はGitHub Pagesのサブパス公開に依存して壊れない
* [ ] パス比較は末尾スラッシュ、query、hashの影響を受けない
* [ ] ハイライトは色だけに依存せず、背景・左線・font weight・border等の複数要素で識別できる
* [ ] hover / focus 表示と現在ページハイライトが混同されない
* [ ] `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、このissueでは未対応のまま扱う
* [ ] UI系タスクとして、参照するdesign targetとdesign画像の扱いが記録されている
* [ ] design画像作成が必要な場合は、`design-image-generation` initial draft mode の実行を前提条件として記録している
* [ ] `npm run build` が通る
* [ ] `npm run check` が通る

## チェックポイント

* [ ] 既存ルートが壊れていない
* [ ] PC左サイトメニューとスマホdrawer内サイトメニューで同じ現在ページ判定を使っている
* [ ] `SiteMenu.astro` / `SiteMenuItem.astro` の責務が過剰に膨らんでいない
* [ ] `siteMenuItems` の手書きメニュー定義を不必要に複雑化していない
* [ ] `withBase()` 済みhrefと現在パスを直接比較して、サブパス公開時に壊れる実装になっていない
* [ ] `aria-current="page"` を親カテゴリやancestorに誤設定していない
* [ ] 親カテゴリの強調が、現在ページそのもののハイライトより強くなりすぎていない
* [ ] hover / focus / active / ancestor のCSSが互いに衝突していない
* [ ] disclosureの `aria-expanded` と `hidden` の初期状態が、現在ページ親カテゴリの展開状態と矛盾していない
* [ ] PageTocの現在位置ハイライトを実装していない
* [ ] パンくずリスト、前後ナビゲーション、検索UIを追加していない
* [ ] 不要な依存関係を追加していない
* [ ] 初期スコープ外の機能を実装していない
* [ ] 関連する `docs/TODO.md` 項目と矛盾していない
* [ ] 関連する `docs/design/` と矛盾していない
* [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `src/components/layout/SiteMenu.astro`
* `src/components/layout/SiteMenuItem.astro`
* `src/lib/site/menu.ts`
* `src/lib/utils/paths.ts`
* `src/styles/tokens.css`
* `docs/issue/15-current-menu-highlight.md`
* `docs/design/current-menu-highlight/notes.md`
* `docs/design/current-menu-highlight/design-desktop.png`
* `docs/design/current-menu-highlight/design-mobile.png`

必要に応じて、現在パス判定を `paths.ts` に入れず、以下のような専用helperへ切り出してもよい。

* `src/lib/site/current-menu.ts`
* `src/lib/site/menu-current.ts`

## レビュー観点

* 現在ページそのもののハイライトと、親カテゴリのancestor強調が見分けられるか
* PC左サイトメニューとスマホdrawerで同じ情報設計になっているか
* 現在ページハイライトがhover / focusに見えないか
* 親カテゴリの自動展開が、既存の開閉UIと矛盾していないか
* `aria-current="page"` の付与対象がexact matchリンクだけになっているか
* 詳細ページなど、メニューに直接リンクがないページでの扱いが妥当か
* サブパス公開時のパス比較が安全か
* `docs/TODO.md` の生成JSON由来メニュー拡張を、このissueに混入させていないか
* `design-image-generation` を前段作業として切り出す必要があるか

## 備考

このissueでは、`14-mobile-page-toc` が問題なく完了している前提で、サイトメニューの現在ページハイライトに集中する。

`docs/TODO.md` には「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」という未対応項目があるが、これは生成JSON / データ取得層が整った後の後続作業であり、このissueでは扱わない。

`docs/design/site-menu/notes.md` では、後続の `15-current-menu-highlight` で現在地表示を追加できる余地を残しつつ、既存site-menu designでは現在ページハイライトを完成状態として描かない方針になっている。

そのため、実装前に `docs/design/current-menu-highlight/` を作成し、PC左サイトメニューとスマホdrawer内サイトメニューにおける現在ページ状態をdesign initial draftとして確認することが望ましい。

## ローカル検証サマリ

* mode: local repository mode
* branch: `15-current-menu-highlight`
* issue: `docs/issue/15-current-menu-highlight.md`
* local validation date: 2026-07-07
* checked files:

  * `AGENTS.md`
  * `.agents/skills/issue-first-development/SKILL.md`
  * `docs/plan.md`
  * `docs/requirements.md`
  * `docs/out-of-scope.md`
  * `docs/TODO.md`
  * `docs/design/site-menu/notes.md`
  * `src/components/layout/SiteMenu.astro`
  * `src/components/layout/SiteMenuItem.astro`
  * `src/lib/site/menu.ts`
  * `src/lib/utils/paths.ts`
  * `src/scripts/disclosure.ts`

### 検証結果

* `docs/plan.md` の `15-current-menu-highlight` とbranch / issue名は一致している。
* `docs/requirements.md` の FR-01-04 サイトメニュー現在地ハイライトとissue目的は一致している。
* `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、このissueでは未対応の後続作業として扱う。
* `docs/design/site-menu/notes.md` は現在ページハイライトを後続 `15-current-menu-highlight` で扱う前提になっている。
* `docs/design/current-menu-highlight/` は未作成のため、実装開始前に `design-image-generation` initial draft mode でdesign画像を作成する前提が必要である。
* `SiteMenu.astro` / `SiteMenuItem.astro` / `siteMenuItems` / `withBase()` の現状は、issueの背景・対象範囲と矛盾していない。

### 実装前未検証

* `npm run check`
* `npm run build`
* actual UI screenshots
* 実装後のPC左サイトメニュー / スマホdrawerでの現在ページ表示

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/current-menu-highlight/`
- reference desktop: `docs/design/current-menu-highlight/design-desktop.png`
- reference mobile: `docs/design/current-menu-highlight/design-mobile.png`
- notes: `docs/design/current-menu-highlight/notes.md`

### 成果物

- actual desktop: `test-results/visual/actual-desktop.png`
- actual mobile: `test-results/visual/actual-mobile.png`
- actual mobile drawer open: `test-results/visual/actual-mobile-menu-open.png`
- report: Playwright output

### レビュー結果

| 領域 | 判定 | 差分 | 対応 |
|---|---|---|---|
| レイアウト | OK | 既存レイアウト内でサイトメニューの構造は維持されている | 修正なし |
| 余白 | OK | active背景による高さや横幅の崩れは見られない | 修正なし |
| タイポグラフィ | OK | current linkは文字色とweightで通常リンクより識別できる | 修正なし |
| 色 | OK | 外枠・左線なしで、薄い青緑背景と文字色に留まっている | 修正なし |
| 配置・整列 | OK | disclosure indicatorの右端配置とリンクのインデントは維持されている | 修正なし |
| レスポンシブ | OK | PC左サイトメニューとスマホdrawer内サイトメニューの両方で `/data/items/weapons/` のcurrent / ancestor表示を確認した | 修正なし |
| overflow / scroll | OK | current表示追加による横スクロールや文字溢れは見られない | 修正なし |
| 既存デザインとの整合 | OK | `site-menu` / `mobile-menu` の既存構造と矛盾していない | 修正なし |
| 既存Componentとの整合 | OK | `SiteMenu.astro` / `SiteMenuItem.astro` の共用構造を維持している | 修正なし |
| accessibility basics | OK | exact matchするcurrent linkに `aria-current="page"` が付く | 修正なし |

### 自己修正した項目

- [x] なし

### 人間判断が必要な差分

- なし。目視確認用ダミーMDXとして `/data`、`/data/items`、`/data/items/weapons` を追加し、design参照の代表ルート `/data/items/weapons/` で `データ > アイテム > 武器` のancestor / current組み合わせを確認した。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
