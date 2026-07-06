# 12-mobile-menu

## 目的

スマホ幅で、Header左メニューボタンから開閉できるサイトメニューdrawerを実装する。

既存のPC版サイトメニュー構造をスマホ版でも再利用し、メニュー項目定義・階層表示・将来の現在ページハイライト・将来のデータ駆動メニュー追加で二重管理が発生しない構成にする。

このタスクでは、以下を達成する。

* Header左メニューボタンの開閉処理を実装する
* 既存 `SiteMenu.astro` をPC左サイド常設表示とスマホdrawer表示で共用する
* 既存 `SiteMenuItem.astro` をスマホdrawer内でも共用する
* 既存 `src/lib/site/menu.ts` の `siteMenuItems` を再利用する
* `768px` 未満のスマホ表示で、Header左ボタンからサイトメニューdrawerを開閉できるようにする
* drawer表示中は背景本文をスクロールさせない
* メニュー項目選択後にdrawerを閉じる
* Escキーでdrawerを閉じる
* drawer表示中のTab移動が背景本文へ抜けないよう、簡易focus trapを実装する
* drawerを閉じた後、Header左メニューボタンへフォーカスを戻す
* GitHub Pagesのサブパス公開でリンクが壊れない状態を維持する

## 背景

`docs/plan.md` のPhase 2では、`11-site-menu` の後続タスクとして `12-mobile-menu` が定義されている。

`11-site-menu` ではPC版の左サイトメニューを実装し、スマホ用の開閉メニューは後続の `12-mobile-menu` で扱う前提になっている。

`docs/requirements.md` では、PC幅では左サイドバーにサイトメニューを表示し、`768px` 未満ではサイトメニューを常設表示せず、Headerから開閉できるUIに切り替える方針が示されている。

現状、`src/components/layout/Header.astro` にはスマホ左メニューボタン相当の要素が存在するが、`disabled` 状態であり、drawer開閉処理は未実装である。

また、`src/components/layout/SiteMenu.astro`、`src/components/layout/SiteMenuItem.astro`、`src/lib/site/menu.ts` にはPC版サイトメニューの構造がすでに存在する。スマホ用に `MobileMenu.astro` を新規作成して別実装にすると、以下の問題が発生しやすい。

* PC版とスマホ版でメニュー項目が二重管理になる
* 後続 `15-current-menu-highlight` の実装対象が増える
* 後続の流儀・生き様リストのデータ駆動追加時に、PC / mobileで反映漏れが起きやすくなる
* 階層開閉処理やアクセシビリティ対応が重複する

そのため、このタスクでは `MobileMenu.astro` は新規作成せず、既存 `SiteMenu.astro` / `SiteMenuItem.astro` / `siteMenuItems` を共用する。

このタスクはUI / layout / componentタスクであるため、実装前に `design-image-generation` initial draft modeでスマホメニューdrawerのデザイン草案を作成し、人間レビュー可能な状態にする。

想定するdesign targetは以下。

* `docs/design/mobile-menu/`

想定するdesign成果物は以下。

* `docs/design/mobile-menu/notes.md`
* `docs/design/mobile-menu/design-mobile-closed.png`
* `docs/design/mobile-menu/design-mobile-open.png`

ローカル検証時点では `docs/design/mobile-menu/` は未作成である。実装前に `design-image-generation` initial draft modeを実行する。

関連参照。

* `docs/plan.md`
* `docs/requirements.md`
* `docs/out-of-scope.md`
* `docs/TODO.md`
* `docs/issue/11-site-menu.md`
* `docs/design/header-footer/`
* `docs/design/site-menu/`
* `docs/design/mobile-menu/`
* `.agents/skills/design-image-generation/SKILL.md`

## 対象範囲

このタスクで変更してよい範囲は以下。

* `docs/design/mobile-menu/notes.md`
* `docs/design/mobile-menu/design-mobile-closed.png`
* `docs/design/mobile-menu/design-mobile-open.png`
* `src/components/layout/Header.astro`
* `src/components/layout/SiteMenu.astro`
* `src/components/layout/SiteMenuItem.astro`
* `src/layouts/BaseLayout.astro`
* `src/lib/site/menu.ts`
* `src/scripts/disclosure.ts`
* 必要に応じて `src/scripts/mobile-menu.ts`
* 必要に応じて `docs/issue/12-mobile-menu.md`

実装対象は以下。

* `design-image-generation` initial draft modeによるスマホdrawer design草案の作成
* 既存 `SiteMenu.astro` を、PC左サイド常設表示とスマホdrawer表示の両方で利用できるようにする
* 既存 `SiteMenuItem.astro` をスマホdrawer内でも再利用する
* 既存 `siteMenuItems` をスマホdrawerでも再利用する
* `Header.astro` のスマホ左メニューボタンをdrawer開閉トリガーとして有効化する
* Header左メニューボタンの `disabled` を解除する
* drawer開閉状態を制御する
* drawer表示中に背景本文のスクロールを抑止する
* drawer内をスクロール可能にする
* メニュー項目選択後にdrawerを閉じる
* Escキーでdrawerを閉じる
* drawerを閉じた後、Header左メニューボタンへフォーカスを戻す
* drawer表示中にTab / Shift+Tabのフォーカス移動をdrawer内に閉じる簡易focus trapを実装する
* `aria-expanded` / `aria-controls` / `aria-label` / `nav` landmarkなど、最低限のアクセシビリティ対応を行う
* `768px` 未満でスマホdrawerを利用できるようにする
* `768px` 以上ではスマホdrawerがPC左サイトメニューと競合しないようにする
* GitHub Pagesのサブパス公開で内部リンクが壊れないようにする
* 既存global styles / tokensの範囲内でCSSを実装する
* `docs/design/header-footer/` のmobile Header方針と整合させる
* `docs/design/site-menu/` のPCメニュー方針と整合させる

## 初期スコープ外

このタスクでは以下を実装しない。

* `MobileMenu.astro` の新規作成
* PC左サイトメニューの再設計
* `siteMenuItems` の大規模な再編成
* PC版とスマホ版でメニュー項目定義を分けること
* 現在ページハイライト
* `aria-current="page"` の本実装
* 親カテゴリの現在ページに応じた自動展開
* メニュー開閉状態の永続化
* ページ内目次
* スマホ用ページ内目次
* ページ内目次の現在位置ハイライト
* パンくずリスト
* ページ末尾の前後ナビゲーション
* 検索dialog本体
* 検索結果表示
* Header右側検索ボタンの有効化
* Pagefind導入
* 新規ページ骨組みの作成
* `/introduction`、`/world`、`/rules` など未作成ページの本文実装
* Excel変換処理
* JSON生成処理
* データカード表示
* 生成JSONやデータ取得層から流儀・生き様の子項目をサイドメニューへ追加すること
* GMガイド、シナリオ本文、キャンペーン本文
* キャラクターシート
* ダイスローラー
* 戦闘シミュレーター
* DB
* 認証
* SSR
* CMS
* APIサーバー
* 外部検索サービス
* 外部UIライブラリ追加
* 高度なアニメーション
* 過剰なネオン装飾、派手な発光演出
* アクセス解析
* PWA対応
* 多言語対応

初期スコープ外の判断は `docs/out-of-scope.md` に従う。

## 完了条件

* [x] `docs/design/mobile-menu/notes.md` が作成されている
* [x] `docs/design/mobile-menu/design-mobile-closed.png` または同等のclosed state design画像が作成されている
* [x] `docs/design/mobile-menu/design-mobile-open.png` または同等のopen state design画像が作成されている
* [x] design targetが `mobile-menu` として記録されている
* [x] design draftが人間レビュー可能な状態になっている
* [x] designに検索dialog、ページ内目次、現在ページハイライト、パンくず、前後ナビゲーションなど後続タスク・初期スコープ外の機能を描き込んでいない
* [x] `MobileMenu.astro` を新規作成していない
* [x] 既存 `SiteMenu.astro` をPC左サイド常設表示とスマホdrawer表示の両方で利用している
* [x] 既存 `SiteMenuItem.astro` をスマホdrawer内でも再利用している
* [x] `src/lib/site/menu.ts` の `siteMenuItems` をPC / mobile双方で再利用している
* [x] スマホ用メニュー項目を別定義で二重管理していない
* [x] `Header.astro` のスマホ左メニューボタンがdisabledではなく、drawer開閉トリガーとして機能する
* [x] スマホ幅でdrawerを開ける
* [x] スマホ幅でdrawerを閉じられる
* [x] drawer内に明示的な閉じる操作がある
* [x] Header左メニューボタンでdrawerの開閉状態を切り替えられる
* [x] メニュー項目を選択した後、drawerが閉じる
* [x] Escキーでdrawerを閉じられる
* [x] drawer表示中、背景本文がスクロールされない
* [x] drawer自体はメニュー項目が長い場合に縦スクロールできる
* [x] drawerを閉じた後、Header左メニューボタンへフォーカスが戻る
* [x] drawer表示中、Tab / Shift+Tab のフォーカス移動がdrawer内に収まる
* [x] drawerを開いたとき、フォーカスがdrawer内の閉じるボタンまたは最初の操作可能要素へ移る
* [x] 開閉ボタンに `aria-expanded` が設定され、開閉状態と同期する
* [x] 開閉ボタンに `aria-controls` が設定され、対象drawer領域と対応している
* [x] スマホ用drawer内のサイトメニューは `nav` 要素または同等のランドマークを持つ
* [x] スマホ用drawer内のサイトメニューに適切な `aria-label` が設定されている
* [x] drawer内のリンクはGitHub Pagesのサブパス公開で壊れない
* [x] `768px` 未満ではPC左サイドの常設表示が出ない
* [x] `768px` 以上ではスマホdrawerがPC左サイトメニューと競合しない
* [x] `768px` 以上でdrawerが開いた状態のまま残らない、または表示上競合しない
* [x] タップ対象が小さすぎない
* [x] focus表示が色だけに依存しすぎていない
* [x] 既存PC版 `SiteMenu.astro` の階層開閉が壊れていない
* [x] 既存PC版 `SiteMenuItem.astro` の表示が壊れていない
* [x] 検索button / 検索dialogを実装していない
* [x] 現在ページハイライトを実装していない
* [x] `aria-current="page"` を本実装していない
* [x] PageTocを実装していない
* [x] パンくずリスト、前後ナビゲーションを実装していない
* [x] 生成JSONやデータ取得層から流儀・生き様のメニュー項目を追加していない
* [x] 不要な依存関係を追加していない
* [x] `npm run build` が通る
* [x] 必要に応じて `npm run check` が通る

## チェックポイント

* [x] 既存ルート `/` が壊れていない
* [x] 既存 `Header.astro` と視覚的に競合していない
* [x] 既存 `Footer.astro` と視覚的に競合していない
* [x] 既存PC版 `SiteMenu.astro` の表示が壊れていない
* [x] 既存PC版 `SiteMenu.astro` の階層開閉が壊れていない
* [x] 既存 `SiteMenuItem.astro` のPC表示が壊れていない
* [x] `src/lib/site/menu.ts` のmenu dataをPC / mobile双方で再利用できている
* [x] GitHub Pagesのサブパス公開に影響しない
* [x] `withBase()` または既存の内部リンク方針に従っている
* [x] drawer開閉処理が検索dialogやPageTocの将来実装と過剰に結合していない
* [x] Headerの右側検索ボタンには検索dialog本体を実装していない
* [x] 現在ページハイライトは後続 `15-current-menu-highlight` に残っている
* [x] `docs/TODO.md` の未対応項目と矛盾していない
* [x] `docs/design/header-footer/` のmobile Header方針と矛盾していない
* [x] `docs/design/site-menu/` のmenu data再利用方針と矛盾していない
* [x] `docs/design/mobile-menu/` のdesign draftと矛盾していない
* [x] 初期スコープ外の機能を実装していない
* [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `docs/design/mobile-menu/notes.md`
* `docs/design/mobile-menu/design-mobile-closed.png`
* `docs/design/mobile-menu/design-mobile-open.png`
* `src/components/layout/Header.astro`
* `src/components/layout/SiteMenu.astro`
* `src/components/layout/SiteMenuItem.astro`
* `src/layouts/BaseLayout.astro`
* `src/lib/site/menu.ts`
* `src/scripts/disclosure.ts`
* 必要に応じて `src/scripts/mobile-menu.ts`
* 必要に応じて `docs/issue/12-mobile-menu.md`

## レビュー観点

* 既存 `SiteMenu.astro` / `SiteMenuItem.astro` をPC / mobileで共用する方針で問題ないか
* `MobileMenu.astro` を新規作成しない判断で問題ないか
* drawer表示のために `SiteMenu.astro` へprops、class、variant相当の指定を追加する設計でよいか
* `SiteMenu.astro` 側に表示モードを持たせるか、外側wrapperでPC / mobileの表示差分を制御するか
* drawerの開閉処理を `Header.astro` 側に寄せるか、独立scriptに切り出すか
* `src/scripts/disclosure.ts` とdrawer開閉scriptを分けるか、統合するか
* drawer表示中に背景本文スクロールを止める方針で問題ないか
* drawer自体をスクロール対象にする方針で問題ないか
* 簡易focus trapをこのissueの必須完了条件に含めてよいか
* Esc closeをこのissueの必須完了条件に含めてよいか
* close後のfocus復帰をこのissueの必須完了条件に含めてよいか
* 検索button / 検索dialogに踏み込まず、左メニューdrawer開閉だけに限定できているか
* 現在ページハイライトを後続 `15-current-menu-highlight` に残せているか
* `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」をこのissueでは扱わない判断でよいか
* design-image-generation initial draft modeの成果物として、closed state / open state の2枚を要求する粒度でよいか

## 備考

このタスクでは、`MobileMenu.astro` は新規作成しない。

PC版とスマホ版でメニューComponentや項目定義を分岐させると、後続の現在ページハイライト、流儀・生き様のデータ連携、メニュー項目追加時に二重管理が発生するためである。

このissueでは、既存 `SiteMenu.astro` / `SiteMenuItem.astro` / `siteMenuItems` を共用し、表示モードとdrawer開閉制御だけを追加する。

drawer表示中は、背景本文のスクロールを抑止する。スマホメニュー自体が縦に長くなるため、スクロール対象はdrawer内に限定する。

focus trapは、drawer表示中にTab / Shift+Tabでフォーカスが背後本文へ抜けないようにするための最低限のキーボード操作対応として扱う。実装上は、開いた時点でdrawer内の閉じるボタンまたは最初のリンクへフォーカスを移し、Tab移動をdrawer内で循環させ、閉じた後にHeader左メニューボタンへフォーカスを戻す。

検索button / 検索dialogはこのissueでは扱わない。Header右側検索ボタンが存在する場合でも、本タスクでは左メニューdrawer開閉に限定する。

現在ページハイライトは後続 `15-current-menu-highlight` に残す。`aria-current="page"` の本実装もこのissueでは扱わない。

`docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、`28-sample-generated-data` / `29-data-access-layer` 後に扱う前提とする。このissueでは既存メニュー項目のスマホ表示・開閉導線のみを扱い、メニュー内容そのものをデータ駆動で拡張しない。

このタスクはUI / layout / componentタスクであるため、実装前に `docs/design/mobile-menu/` のdesign draftを作成し、人間レビューを受ける。design draftが未レビューの場合、それを最終デザインのsource of truthとして扱わない。

## ローカル検証結果

このissue draftはremote snapshot draftを元に、local repository modeで検証した。

検証結果:

* branch `12-mobile-menu` を作成済み
* issue file `docs/issue/12-mobile-menu.md` をローカルで確認済み
* `docs/plan.md` の `12-mobile-menu` 未完了タスクと一致
* `docs/requirements.md` のスマホ版サイトメニュー、`768px` 未満のHeader開閉UI、キーボード操作方針と一致
* `docs/out-of-scope.md` の検索、ページ内目次、パンくず、前後ナビゲーション、高度な機能の初期スコープ外方針と矛盾しない
* `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、このIssueでは扱わず後続に残す方針で妥当
* `docs/design/header-footer/notes.md` と `docs/design/site-menu/notes.md` を確認済み
* `docs/design/mobile-menu/` は未作成
* `src/components/layout/Header.astro` にスマホ左メニューボタン相当のdisabled buttonが存在することを確認済み
* `src/components/layout/SiteMenu.astro` / `SiteMenuItem.astro` / `src/lib/site/menu.ts` / `src/scripts/disclosure.ts` が存在することを確認済み
* `npm run check` / `npm run build` は未実行

`docs/design/mobile-menu/` は未作成のため、実装開始前に `design-image-generation` initial draft modeで以下を作成し、人間レビューを受ける。

* `docs/design/mobile-menu/notes.md`
* `docs/design/mobile-menu/design-mobile-closed.png`
* `docs/design/mobile-menu/design-mobile-open.png`
