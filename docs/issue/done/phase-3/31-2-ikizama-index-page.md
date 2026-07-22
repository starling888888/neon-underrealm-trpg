# 31-2-ikizama-index-page

## 目的

変換済み生き様データと既存の生き様データ表示Componentを利用して、`/data/ikizama` の一覧ページを作成する。

生き様名、短い説明、専用アイテムの名称、能力値ポイント、副能力係数、生き様ボーナスを、ページ本文へ手書きで重複せず、既存の取得層と変換済みデータを参照して表示する。

## 背景

- `docs/plan.md` の `31-2-ikizama-index-page` は、生き様一覧ページ、各生き様詳細ページへの導線、design正本の作成を定めている。
- ユーザー編集済みの `.raw/contents/ikizama-index.md` は、このページの本文と可視構成における最優先正本である。H1、hero、導入、生き様データの見方、一覧の表示内容はcontentsに従う。
- `31-0-ikizama-index-data` と `32-0-ikizama-detail-data` により、`getIkizamaList()`、`getIkizamaDetail()`、`IkizamaDataSection`、`data/generated/ikizama.json`、`data/generated/ikizama-skills.json` が利用可能である。
- ユーザーのレビュー指示により、サイドメニュー、キャラクターメイキング、成長ルールで生き様リストデータを参照する表示も、このissueで扱う。

関連資料:

- `.raw/contents/ikizama-index.md`
- `docs/plan.md` の `31-2-ikizama-index-page`
- `docs/requirements/pages.md` の `/data/ikizama`
- `docs/conversion/ikizama-index.md`
- `docs/conversion/ikizama-skills.md`
- `docs/TODO.md` の流儀・生き様サイドメニュー追跡項目
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/ikizama-detail/`（`IkizamaDataSection`の既存表示制約のみ）
- `docs/out-of-scope.md`

`docs/design/ikizama-index/` は、ユーザー確認済みの実装スクリーンショットをdesign fix modeで正本化する。desktop / mobileともに、生き様詳細のSiteMenu子項目と専用アイテム種別ページへの導線を含む現行実装を比較基準とする。

## 対象範囲

- `docs/design/ikizama-index/` のnotes、desktop design、mobile designを、実装前提として作成・確認する。
- `src/pages/data/ikizama/index.astro` を追加し、contentsのH1、hero、導入、`生き様データの見方`、`生き様一覧`を表示する。
- contentsの`showPageToc: true`に従い、PC PageTocとMobilePageTocを有効にする。目次は`生き様データの見方`と`生き様一覧`のH2だけを対象にし、`IkizamaDataSection`内のH3は既存の`excludeDetailHeadingsFromToc`を使って除外する。
- `public/images/data/ikizama_hero.webp` をH1直後のheroとして表示し、文字overlayやcaptionを追加しない。
- `getIkizamaDetail("burai")` または同等の既存取得層を用いて、`IkizamaDataSection` にブライのデータを渡し、`生き様データの見方`として表示する。contents本文の生き様ボーナス、能力値ポイント、副能力値係数の3項目説明を続けて表示する。
- 既存`IkizamaDataSection`を再利用し、必要な場合だけ一覧ページで使う見出し・目次制御のための最小限の拡張を行う。生き様詳細ページの表示構成、データgrid、スキルカードは変更しない。
- `getIkizamaList()`の入力順を維持して一覧を表示する。各行では`name`を対応する`/data/ikizama/${ikizama.id}`へのリンク、`exclusiveItem.name`を対応する専用アイテム種別の詳細ページへのリンクとし、`shortDescription`を表示する。生き様ID、専用アイテムID、別途の詳細導線文言は可視表示しない。
- `src/lib/site/menu.ts` の生き様メニューを`getIkizamaList()`の入力順から展開し、各生き様名を`/data/ikizama/[ikizamaId]`への子リンクとする。Header、Footer、SiteMenuの情報設計や表示方式は再設計しない。
- `.raw/contents/character-making.md`と`.raw/contents/advancement.md`を確認し、既存のルール説明と計算式を保ったまま、キャラクターメイキングの専用アイテム対応と成長ルールの生き様係数表を`getIkizamaList()`から表示する。入力・自動計算・保存機能は追加しない。
- designに対する実装後のVisual Reviewを行い、このissueへ結果を記録する。Visual Testは一覧の構造、導線、responsive layout、横overflow、スクリーンショット取得を確認し、生成データの固有の名称・件数・本文へ依存するE2E期待値を追加しない。

## 初期スコープ外

- 生き様・生き様スキル・アイテムのExcel変換、生成JSON、schema、取得層、ID規則の変更
- 生き様詳細ページの表示内容、個別ページファイル、手書きの生き様・スキルデータ
- 専用アイテムの実体、個別ItemCard、個別アイテムアンカー、アイテム種別固有のルール本文
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- 検索、絞り込み、ソート、ページネーション、比較・計算UI、キャラクター作成ウィザード
- DB、認証、SSR、CMS、APIサーバー、新しいUIライブラリ
- `.raw/contents/ikizama-index.md`、Google Drive、`raw-google-drive.url`の変更・同期
- `public/images/data/ikizama_hero.webp`の変更・削除、またはユーザーの未追跡画像をstage・commitすること
- `docs/out-of-scope.md` が定める初期スコープ外の項目

## 完了条件

- [x] `docs/design/ikizama-index/notes.md`、desktop design、mobile designを作成・確認し、contentsと既存designの制約を記録している。
- [x] `/data/ikizama` が静的に生成され、contentsのH1、hero、導入、`生き様データの見方`、`生き様一覧`を表示する。
- [x] contentsの`showPageToc: true`に従い、PC PageTocとMobilePageTocを有効にし、`生き様データの見方`と`生き様一覧`のH2だけを目次へ表示する。
- [x] `生き様データの見方`でブライの`IkizamaDataSection`と、contentsにある3項目の説明を表示する。
- [x] 生き様一覧が`getIkizamaList()`の入力順を保ち、各生き様の名称を詳細ページ、専用アイテム名称を対応するアイテム種別の詳細ページへリンクし、`shortDescription`を対応付けて表示する。
- [x] 生き様ID、専用アイテムID、固定の生き様データ、別途の詳細導線文言を可視表示として追加していない。
- [x] サイドメニューの生き様リストを`getIkizamaList()`の入力順で展開し、各生き様詳細ページへリンクしている。
- [x] キャラクターメイキングの専用アイテム対応と成長ルールの生き様係数表を`getIkizamaList()`から表示している。
- [x] 実装後にVisual Reviewを行い、desktop / mobileの比較結果をこのissueへ記録している。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存の生き様詳細ルート、`IkizamaDataSection`、スキルカード表示を壊していない。
- [x] desktop / mobileでhero、凡例、一覧の長い説明が横overflowや不自然な切り詰めなく読める。
- [x] PageTocとMobilePageTocがH2の`生き様データの見方`、`生き様一覧`を表示し、`IkizamaDataSection`内のH3を重複表示しない。
- [x] `getIkizamaList()`の入力順と`shortDescription`を、ページ側で並べ替え・再編集していない。
- [x] サイドメニュー、キャラクターメイキング、成長ルールが生き様の名称・専用アイテム対応・係数を手書きで重複せず、`getIkizamaList()`の入力順と値を表示している。
- [x] `docs/design/site-layout/`、`docs/design/page-toc/`、新設する`docs/design/ikizama-index/`との関係を記録し、詳細ページ用designを一覧ページの正本として流用していない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md`のサイドメニュー追跡項目と矛盾していない。
- [x] ユーザーの未コミット変更を破壊、stage、commitしていない。

## 想定変更ファイル

- `docs/design/ikizama-index/notes.md`
- `docs/design/ikizama-index/design-desktop.png`
- `docs/design/ikizama-index/design-mobile.png`
- `src/pages/data/ikizama/index.astro`
- `src/components/data/IkizamaDataSection.astro`（一覧用の最小限の見出し・目次制御が必要な場合のみ）
- `src/components/character-making/IkizamaExclusiveItemTable.astro`
- `src/components/data/IkizamaCoefficientTable.astro`
- `tests/visual/` 配下の生き様一覧確認
- `src/lib/site/menu.ts`
- `src/pages/character-making.mdx`
- `src/pages/advancement.mdx`
- `docs/issue/31-2-ikizama-index-page.md`

## レビュー観点

- contentsのH1、hero、導入、ブライの生き様データ凡例、3項目説明、一覧の表示密度を、designと実装へ過不足なく反映できるか。
- 生き様一覧で名称、短い説明、専用アイテム導線だけを表示し、詳細ページの情報を重複させない方針が妥当か。
- 専用アイテム名称を対応する専用アイテム種別ページへのリンクにするcontents指示を、利用者に分かりやすい形で表現できるか。
- `IkizamaDataSection`を一覧の凡例に再利用しても、詳細ページ、PageToc、既存designの制約を壊さないか。
- サイドメニューの生き様リストを`getIkizamaList()`の入力順で展開しても、SiteMenuの情報設計や表示方式を再設計していないか。
- reviewed implementation screenshotをdesign正本化しても、global layoutと初期スコープを逸脱していないか。

## 備考

- `.raw/contents/ikizama-index.md` はGit管理外のローカル作業入力である。Drive同期はこのissueの範囲に含めない。
- `public/images/data/ikizama_hero.webp` はcommit `75fa730` でGit管理済みである。本issueでは表示に利用するが、変更・削除対象には含めない。
- `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、一覧ページの実装だけで完了にはしない。
- ユーザーのレビュー指示により、サイドメニューと既存ルールページの生き様データ表示は後続issueへ分離せず、このissueで扱う。
- 実装開始前に、ユーザーがこのissue内容を明示承認する。Git commit / push はこのissue準備では実行しない。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/ikizama-index/`
- reference desktop: `docs/design/ikizama-index/design-desktop.png`
- reference mobile: `docs/design/ikizama-index/design-mobile.png`
- notes: H1、hero、ブライの`IkizamaDataSection`、3項目説明、名称・短い説明・専用アイテムの一覧、H2だけの目次を比較した。

### 成果物

- actual desktop: `test-results/visual/ikizama-index-desktop.png`
- actual mobile: `test-results/visual/ikizama-index-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分 | 対応                                             |
| --------------------- | ---- | ---- | ------------------------------------------------ |
| レイアウト            | OK   | なし | 3レールとmobile本文幅を維持                      |
| 余白                  | OK   | なし | designの情報密度を維持                           |
| タイポグラフィ        | OK   | なし | H1、H2、一覧リンクの階層を維持                   |
| 色                    | OK   | なし | 青緑accentをリンクと短いmarkerに限定             |
| 配置・整列            | OK   | なし | desktopの3情報列、mobileの専用アイテム配置を維持 |
| レスポンシブ          | OK   | なし | 390px幅でデータgridと一覧が読める                |
| overflow / scroll     | OK   | なし | Visual Testで横overflowなしを確認                |
| 既存デザインとの整合  | OK   | なし | SiteMenu、PageToc、heroの役割を維持              |
| 既存Componentとの整合 | OK   | なし | `IkizamaDataSection`を再利用                     |
| accessibility basics  | OK   | なし | 見出し、リンク、table scopeを確認                |

### 自己修正した項目

- なし。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [x] PRレビュー指摘 3 への対応として、実装スクリーンショットをdesign正本化した。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- 生き様一覧の専用アイテム名が、生き様詳細ページではなく対応する専用アイテム種別の詳細ページへリンクしていない。

### 判定

- source: human
- classification: valid
- local validation: 現在の`src/pages/data/ikizama/index.astro`は専用アイテム名にも生き様詳細URLを設定している。一方、`docs/conversion/ikizama-skills.md`と`IKIZAMA_EXCLUSIVE_ITEM_TYPES`は、専用アイテム種別ごとの詳細URLを定義している。ユーザーはcontentsの「専用アイテムは詳細ページへのリンク」を、対応する専用アイテムの詳細リンクとして明確化した。

### 対応方針

- `exclusiveItem.id`を`IKIZAMA_EXCLUSIVE_ITEM_TYPES`で対応するアイテム種別詳細URLへ解決し、`withBase()`を経由して専用アイテム名へ設定する。生き様名のリンク、表示順、可視テキスト、一覧の表示構成は変えない。

### 対応完了チェックリスト

- [x] 専用アイテム名を対応するアイテム種別の詳細ページへリンクする
- [x] 生き様名の詳細ページリンクと一覧の表示構成を維持する
- [x] GitHub Pagesのサブパス配下のリンクをVisual Testで確認する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- サイトメニュー、キャラクターメイキング、成長ルールが、生き様リストデータをもとに展開されていない。

### 判定

- source: human
- classification: valid
- local validation: `src/lib/site/menu.ts`の生き様には子項目がなく、キャラクターメイキングの専用アイテム対応と成長ルールの生き様係数表は固定記述である。ユーザーはこれらを後続issueへ分離せず、`31-2-ikizama-index-page`で解決するよう明示した。

### 対応方針

- `getIkizamaList()`を共通の参照元とし、既存の流儀メニューと同じ方針で生き様の子項目を追加する。キャラクターメイキングでは専用アイテム対応、成長ルールでは生き様係数表だけを変換済みデータから描画し、既存のルール説明と計算式は変更しない。

### 対応完了チェックリスト

- [x] サイトメニューの生き様を入力順の子項目として展開する
- [x] キャラクターメイキングの専用アイテム対応を変換済みデータから表示する
- [x] 成長ルールの生き様係数表を変換済みデータから表示する
- [x] desktop / mobileでメニューと表の表示を確認する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/ikizama-index/`、`docs/design/site-menu/`、`docs/design/character-making/`、`docs/design/advancement/`
- reference desktop: 各targetの`design-desktop.png`
- reference mobile: `ikizama-index`、`character-making`、`advancement`の`design-mobile.png`
- notes: 既存の3レールlayout、最大3階層のSiteMenu、本文tableの密度と横overflow制約を比較した。

### 成果物

- actual desktop: `test-results/visual/ikizama-index-desktop.png`、`test-results/visual/character-making-desktop.png`、`test-results/visual/advancement-desktop.png`
- actual mobile: `test-results/visual/ikizama-index-mobile.png`、`test-results/visual/character-making-mobile.png`、`test-results/visual/advancement-mobile.png`
- actual tablet: `test-results/visual/character-making-tablet.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分 | 対応                                                     |
| --------------------- | ---- | ---- | -------------------------------------------------------- |
| レイアウト            | OK   | なし | 3レールと本文幅を維持                                    |
| 余白                  | OK   | なし | 既存tableの余白を維持                                    |
| タイポグラフィ        | OK   | なし | 既存のtable見出し・本文階層を維持                        |
| 色                    | OK   | なし | 既存の青緑linkとneutral tableを維持                      |
| 配置・整列            | OK   | なし | 生き様の第3階層とtable列を既存方針で表示                 |
| レスポンシブ          | OK   | なし | mobile / tabletで既存の積み上げとtable表示を維持         |
| overflow / scroll     | OK   | なし | Visual Testで画面全体の横overflowなしを確認              |
| 既存デザインとの整合  | OK   | なし | SiteMenuの最大3階層と各ページdesignのtable制約に従う     |
| 既存Componentとの整合 | OK   | なし | 既存のMDX table表示を保つ小さなデータ表示Componentを追加 |
| accessibility basics  | OK   | なし | tableの`scope`、リンク、見出し構造を確認                 |

### 自己修正した項目

- なし。

### 人間判断が必要な差分

- なし。専用アイテム種別のリンク先は現時点で未実装だが、ユーザー判断によりこのissueでは許容する。

### design-image-generation への引き継ぎ候補

- [x] 実装スクリーンショットをdesign正本化する必要はない。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 3

### 指摘事項

- `docs/design/ikizama-index/`が、承認済みの生き様詳細子メニューと専用アイテム種別ページへの導線を対象外としており、current issueおよび実装と矛盾している。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `docs/design/ikizama-index/notes.md`は、生き様詳細のSiteMenu項目追加とアイテム種別ページへの導線を対象外とする。一方、ユーザー承認済みのcurrent issueは、`getIkizamaList()`による生き様子メニューと専用アイテム種別URLを対象範囲に含めている。実装とVisual Review 2もこの方針で確認済みである。

### 対応方針

- `design-image-generation` のdesign fix modeで、`ikizama-index`のnotesとdesktop / mobile designを現在の承認済みscopeへ整合させる。current issueの古い背景・レビュー観点も、design正本を更新した後に同じ方針へ整理する。

### 対応完了チェックリスト

- [x] `docs/design/ikizama-index/notes.md`を承認済みscopeへ更新する
- [x] desktop / mobile designを生き様子メニューと専用アイテム種別導線へ整合させる
- [x] current issueの古い背景・レビュー観点を整合させる
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 4

### 指摘事項

- `docs/design/ikizama-index/notes.md`のOpen questionsが、design fixで正本化済みのmobile配置をinitial draft確認後の未確定事項として残している。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `notes.md`はdesign fix mode、current issueはレビュー指摘 3 でdesktop / mobileの正本化完了を記録している。一方、Open questionsは「initial draftの確認後」としており、現在の正本化状態と一致しない。

### 対応方針

- mobileの専用アイテム名称の配置は現行正本として採用済みであることをnotesへ記録し、initial draftを前提とする未解決事項を閉じる。UI・リンク・画像は変更しない。

### 対応完了チェックリスト

- [x] `docs/design/ikizama-index/notes.md`のOpen questionsを正本化後の状態へ更新する
- [x] `npm run check:md` が通る
