# 15-1-menu-expand-current-ancestors-only

## 目的

サイトメニューの初期表示で、親カテゴリをデフォルト展開しないようにする。

現在はメニュー定義側の `defaultExpanded` により、「データ」「アイテム」「ルール」などが初期表示時から展開される。今後メニュー項目が増えた場合、初期表示時点で左サイトメニューやスマホdrawer内メニューが縦に長くなり、メニュースクロールが発生しやすくなる。

このissueでは、サイトメニューの初期展開条件を以下に整理する。

* 通常時は親カテゴリを閉じた状態で表示する
* 現在表示中のページが子項目または子孫ページに該当する場合のみ、その現在位置に至る親カテゴリをすべて展開する
* ユーザーによる手動開閉操作は維持する

## 背景

`15-current-menu-highlight` により、サイトメニューでは現在ページのリンクをハイライトし、現在ページを含む親カテゴリをancestor状態として扱えるようになった。

一方で、既存のメニュー定義には `defaultExpanded: true` が残っており、現在ページとは無関係なカテゴリも初期表示時から展開される。

これはメニュー項目が少ない現時点では大きな問題になりにくいが、今後データページ、流儀、生き様、スキル、アイテムなどが増えると、初期表示時点でメニューが長くなりすぎる。

特にPC左サイトメニューでは、本文とは別にメニュー自体のスクロールが必要になりやすく、スマホdrawerでも一覧性が落ちる。

## 対象範囲

このタスクで扱う。

* サイトメニューの初期展開条件の見直し
* `defaultExpanded` 前提の削除
* 現在ページが子項目または子孫ページの場合のみ、親カテゴリを自動展開する処理
* PC左サイトメニューでの初期展開状態
* スマホdrawer内サイトメニューでの初期展開状態
* `aria-expanded` と `hidden` の初期状態
* 現在ページ判定・ancestor判定との整合
* ユーザー操作による開閉挙動の維持
* 必要に応じたテスト更新

## 初期スコープ外

このタスクでは扱わない。

* サイトメニュー項目の追加
* サイトメニュー階層の再設計
* メニュー文言の変更
* 現在ページハイライトのデザイン変更
* ancestor表示のデザイン変更
* サイトメニューの開閉状態永続化
* localStorage / sessionStorage による開閉状態保存
* ページ内目次の現在見出しハイライト
* PageToc / MobilePageToc の挙動変更
* パンくずリスト
* ページ末尾の前後ナビゲーション
* 検索UI
* 生成JSONからサイトメニュー項目を自動生成する処理
* 流儀・生き様・スキル・アイテム詳細ページの本実装
* レイアウト全体のdesign refresh
* GitHub Actions deploy

## 要件

### 初期展開ルール

サイトメニューの初期展開は、現在ページとの関係だけで決定する。

* 現在ページが親カテゴリ自身の場合、その親カテゴリは自動展開しない
  * 例：`/data/` 表示時に「データ」はcurrentだが、子項目は初期展開しない
* 現在ページが子項目の場合、その親カテゴリを展開する
  * 例：`/data/items/` 表示時に「データ」は展開する
* 現在ページが孫項目の場合、現在ページまでの親カテゴリをすべて展開する
  * 例：`/data/items/weapons/` 表示時に「データ」「アイテム」を展開する
* 現在ページと無関係な親カテゴリは展開しない
  * 例：`/data/items/weapons/` 表示時に「ルール」は展開しない
* メニュー定義上の `defaultExpanded` による初期展開は使わない

### 手動開閉

初期表示後のユーザー操作は維持する。

* 展開済みの親カテゴリも、ユーザー操作で閉じられる
* 閉じている親カテゴリも、ユーザー操作で開ける
* PC左サイトメニューとスマホdrawer内サイトメニューで同じ方針を使う
* `aria-expanded` と `hidden` が実際の開閉状態と矛盾しない

## 完了条件

* [x] `siteMenuItems` から `defaultExpanded` 依存がなくなっている
* [x] 初期表示時、現在ページと無関係な親カテゴリは展開されない
* [x] 現在ページが子項目の場合、その親カテゴリが初期展開される
* [x] 現在ページが孫項目以下の場合、現在ページに至るすべての親カテゴリが初期展開される
* [x] 現在ページが親カテゴリ自身の場合、その親カテゴリの子項目は初期展開されない
* [x] PC左サイトメニューで期待通りの初期展開状態になる
* [x] スマホdrawer内サイトメニューで期待通りの初期展開状態になる
* [x] ユーザーによる手動開閉操作が維持されている
* [x] `aria-expanded` と `hidden` の初期値が展開状態と一致している
* [x] `aria-current="page"` の付与条件は `15-current-menu-highlight` から退行していない
* [x] current / ancestor の視覚表示は `15-current-menu-highlight` から退行していない
* [x] GitHub Pagesサブパス公開時の現在パス判定が壊れていない
* [x] 末尾スラッシュ、query、hashの扱いが退行していない
* [x] `npm test` が通る
* [x] `npm run check` が通る
* [x] `npm run build` が通る

## チェックポイント

* [x] `defaultExpanded` を単に false にするだけでなく、不要な型・データ定義も整理している
* [x] `isCurrent` の親カテゴリ自身を展開条件に含めていない
* [x] `isAncestor` の意味が「現在ページを含む親カテゴリ」として維持されている
* [x] 詳細ページなど、メニューに直接リンクがないページでも最も近い親カテゴリだけが展開される
* [x] 現在ページと無関係な複数カテゴリが初期展開されない
* [x] PC左サイトメニューとスマホdrawer内サイトメニューで分岐実装を増やしていない
* [x] disclosure制御のクライアントスクリプトと初期HTML状態が矛盾していない
* [x] メニュー項目追加時に、初期表示が縦に肥大化しにくい構造になっている
* [x] 開閉状態の永続化をこのissueで追加していない
* [x] レイアウト全体の調整をこのissueに混ぜていない
* [x] design refreshをこのissueに混ぜていない

## 想定変更ファイル

* `src/lib/site/menu.ts`
* `src/components/layout/SiteMenuItem.astro`
* `tests/node/site-menu-current.test.ts`
* 必要に応じて `docs/issue/done/phase-2/15-1-menu-expand-current-ancestors-only.md`

## 実装メモ

現状の `SiteMenuItem.astro` では、初期展開状態が概ね以下の条件で決まっている。

```ts
const isExpanded = Boolean(item.defaultExpanded || isCurrent || isAncestor);
```

このissueでは、`isCurrent` の親カテゴリ自身を初期展開条件から外し、現在ページを含む親カテゴリを表す `isAncestor` を初期展開条件の中心にする。

`src/lib/site/menu.ts` の `SiteMenuItem` 型と `siteMenuItems` には `defaultExpanded` が残っている。実装時は、単に値を `false` にするのではなく、型・データ定義・初期展開判定の契約を整理する。

## design参照

このissueはサイトメニューの挙動変更であり、見た目の新規デザイン変更は行わない。

既存design target:

* `docs/design/site-menu/`
* `docs/design/mobile-menu/`
* `docs/design/current-menu-highlight/`

参照design:

* `docs/design/site-menu/notes.md`
* `docs/design/current-menu-highlight/notes.md`
* `docs/design/current-menu-highlight/design-desktop.png`
* `docs/design/current-menu-highlight/design-mobile.png`
* `docs/design/mobile-menu/notes.md`
* `docs/design/mobile-menu/design-mobile-open.png`

`docs/design/current-menu-highlight/notes.md` では、現在ページを含む親カテゴリが初期表示で展開されていることを実装比較点としている。このissueでは、その方針を「現在ページに至るancestorのみ初期展開する」に絞り、無関係な `defaultExpanded` による展開をなくす。

新規design画像は不要と判断する。理由は、active / ancestor の見た目は `15-current-menu-highlight` の既存designを維持し、このissueでは初期展開条件だけを調整するため。

## 関連TODO

`docs/TODO.md` を確認した。

このissueに直接取り込むTODOはない。

以下は関連するが、このissueでは扱わない。

* `現在地ハイライト目視確認用のダミーMDXページを、本実装時に削除または置き換える`
  * 理由: このissueではサイトメニューの初期展開条件のみを扱い、データページ本実装やダミーMDXの削除・置換は該当するページ実装タスクで扱う。

## レビュー観点

* 親カテゴリ自身がcurrentのとき、その子項目を初期展開しない方針でよいか
* メニューに直接リンクがない詳細ページで、最も近い親カテゴリをancestorとして初期展開する方針でよいか
* PC左サイトメニューとスマホdrawer内サイトメニューで同じ初期展開ルールを使う方針でよいか
* 新規design画像を作らず、`current-menu-highlight` / `site-menu` / `mobile-menu` の既存design参照で実装へ進んでよいか
* `defaultExpanded` を型・データ定義から削除する範囲をこのissueに含めてよいか

## ローカル検証

mode: local repository mode

2026-07-07 にローカルリポジトリで確認した。

* branch: `15-1-menu-expand-current-ancestors-only`
* issue file: `docs/issue/done/phase-2/15-1-menu-expand-current-ancestors-only.md`
* plan task: `docs/plan.md` に `15-1-menu-expand-current-ancestors-only` を未完了タスクとして追加する
* `docs/TODO.md`: 直接このissueで回収するTODOはなし
* design target: `docs/design/site-menu/`, `docs/design/mobile-menu/`, `docs/design/current-menu-highlight/` が存在する
* relevant implementation files:
  * `src/lib/site/menu.ts`
  * `src/components/layout/SiteMenuItem.astro`
  * `tests/node/site-menu-current.test.ts`

ローカルコード上の確認結果:

* `src/lib/site/menu.ts` の `SiteMenuItem` 型に `defaultExpanded?: boolean` が存在する
* `siteMenuItems` では `データ`、`アイテム`、`ルール` に `defaultExpanded: true` が存在する
* `src/components/layout/SiteMenuItem.astro` では `item.defaultExpanded || isCurrent || isAncestor` で初期展開状態を決めている
* `tests/node/site-menu-current.test.ts` には current / ancestor 判定の既存テストがあるが、初期展開条件そのもののテストはまだない

検証コマンド:

* `git status --short`
* `git branch --show-current`
* `git branch --list 15-1-menu-expand-current-ancestors-only`
* `rg --files docs .agents`
* `rg -n "15-1|15|defaultExpanded|isAncestor|isCurrent|siteMenuItems|SiteMenuItem" docs src tests -S`
* `sed -n` / `nl -ba` による関連ファイル確認

実装前準備時点で未実行だった検証:

* `npm test`
* `npm run check`
* `npm run build`

これらは実装後に実行済み。結果は後段の「実装結果」に記録する。

## 実装結果

2026-07-07 に実装した。

変更内容:

* `src/lib/site/menu.ts`
  * `SiteMenuItem` 型から `defaultExpanded` を削除した
  * `siteMenuItems` から `defaultExpanded: true` を削除した
  * 初期展開判定用の `getSiteMenuItemInitialExpanded()` を追加し、`ancestor` のみを初期展開対象にした
* `src/components/layout/SiteMenuItem.astro`
  * 初期展開状態を `item.defaultExpanded || isCurrent || isAncestor` から `getSiteMenuItemInitialExpanded()` に変更した
* `tests/node/site-menu-current.test.ts`
  * 親カテゴリ自身がcurrentの場合は展開しないこと
  * 子項目・孫項目・詳細ページではancestorが展開されること
  * 無関係な親カテゴリが展開されないこと

検証結果:

* `npm test`: 成功
* `npm run check`: 成功
* `npm run build`: 成功
* 生成HTML確認:
  * `/data/`: `データ` はcurrentだが子項目は初期展開されない
  * `/data/items/`: `データ` は初期展開され、currentの `アイテム` 配下は初期展開されない
  * `/data/items/weapons/`: `データ` と `アイテム` が初期展開され、無関係な `ルール` は閉じる
* Playwright確認:
  * desktop `/data/items/weapons/`: `データ` と `アイテム` は `aria-expanded="true"` かつ対象listは表示、`ルール` は `aria-expanded="false"` かつ `hidden`
  * desktop手動開閉: `データ` toggle clickで `aria-expanded="false"` かつ対象listが `hidden` になる
  * mobile drawer `/data/items/weapons/`: `データ` と `アイテム` は展開、`ルール` は閉じる

検証中の補足:

* 最初のPlaywright確認コマンドはシェル引用誤りで失敗したため、`.tmp/check-menu-expansion.mjs` に検証スクリプトを置いて再実行した
* PlaywrightのChromium起動は通常sandbox内で失敗したため、同じ検証スクリプトを権限付きで再実行した

## 備考

このissueは実装前準備としてローカル検証した後、ユーザー承認により2026-07-07に実装を開始した。
