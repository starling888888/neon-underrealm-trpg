# 31-2-ikizama-index-page

## 目的

変換済み生き様データと既存の生き様データ表示Componentを利用して、`/data/ikizama` の一覧ページを作成する。

生き様名、短い説明、専用アイテムの名称、能力値ポイント、副能力係数、生き様ボーナスを、ページ本文へ手書きで重複せず、既存の取得層と変換済みデータを参照して表示する。

## 背景

- `docs/plan.md` の `31-2-ikizama-index-page` は、生き様一覧ページ、各生き様詳細ページへの導線、design正本の作成を定めている。
- ユーザー編集済みの `.raw/contents/ikizama-index.md` は、このページの本文と可視構成における最優先正本である。H1、hero、導入、生き様データの見方、一覧の表示内容はcontentsに従う。
- `31-0-ikizama-index-data` と `32-0-ikizama-detail-data` により、`getIkizamaList()`、`getIkizamaDetail()`、`IkizamaDataSection`、`data/generated/ikizama.json`、`data/generated/ikizama-skills.json` が利用可能である。
- `docs/TODO.md` のサイドメニューへの生き様リスト表示は、contentsに従い本issueでは扱わない。

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

`docs/design/ikizama-index/` は未作成である。UI実装前に
`design-image-generation` のinitial draft modeでdesktop / mobileのdesign正本候補を作成し、人間レビューできる状態にする。

## 対象範囲

- `docs/design/ikizama-index/` のnotes、desktop design、mobile designを、実装前提として作成・確認する。
- `src/pages/data/ikizama/index.astro` を追加し、contentsのH1、hero、導入、`生き様データの見方`、`生き様一覧`を表示する。
- contentsの`showPageToc: true`に従い、PC PageTocとMobilePageTocを有効にする。目次は`生き様データの見方`と`生き様一覧`のH2だけを対象にし、`IkizamaDataSection`内のH3は既存の`excludeDetailHeadingsFromToc`を使って除外する。
- `public/images/data/ikizama_hero.webp` をH1直後のheroとして表示し、文字overlayやcaptionを追加しない。
- `getIkizamaDetail("burai")` または同等の既存取得層を用いて、`IkizamaDataSection` にブライのデータを渡し、`生き様データの見方`として表示する。contents本文の生き様ボーナス、能力値ポイント、副能力値係数の3項目説明を続けて表示する。
- 既存`IkizamaDataSection`を再利用し、必要な場合だけ一覧ページで使う見出し・目次制御のための最小限の拡張を行う。生き様詳細ページの表示構成、データgrid、スキルカードは変更しない。
- `getIkizamaList()`の入力順を維持して一覧を表示する。各行では`name`と`exclusiveItem.name`を、対応する`/data/ikizama/${ikizama.id}`へのリンクとし、`shortDescription`を表示する。生き様ID、専用アイテムID、別途の詳細導線文言は可視表示しない。
- designに対する実装後のVisual Reviewを行い、このissueへ結果を記録する。Visual Testは一覧の構造、導線、responsive layout、横overflow、スクリーンショット取得を確認し、生成データの固有の名称・件数・本文へ依存するE2E期待値を追加しない。

## 初期スコープ外

- 生き様・生き様スキル・アイテムのExcel変換、生成JSON、schema、取得層、ID規則の変更
- 生き様詳細ページの表示内容、個別ページファイル、手書きの生き様・スキルデータ
- 専用アイテムの実体、個別ItemCard、個別アイテムアンカー、アイテム種別固有のルール本文、アイテムページへの導線
- サイドメニューへの生き様リスト追加、Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- 検索、絞り込み、ソート、ページネーション、比較・計算UI、キャラクター作成ウィザード
- DB、認証、SSR、CMS、APIサーバー、新しいUIライブラリ
- `.raw/contents/ikizama-index.md`、Google Drive、`raw-google-drive.url`の変更・同期
- ユーザーの未追跡`.webp`を変更、stage、commitすること
- `docs/out-of-scope.md` が定める初期スコープ外の項目

## 完了条件

- [ ] `docs/design/ikizama-index/notes.md`、desktop design、mobile designを作成・確認し、contentsと既存designの制約を記録している。
- [ ] `/data/ikizama` が静的に生成され、contentsのH1、hero、導入、`生き様データの見方`、`生き様一覧`を表示する。
- [ ] contentsの`showPageToc: true`に従い、PC PageTocとMobilePageTocを有効にし、`生き様データの見方`と`生き様一覧`のH2だけを目次へ表示する。
- [ ] `生き様データの見方`でブライの`IkizamaDataSection`と、contentsにある3項目の説明を表示する。
- [ ] 生き様一覧が`getIkizamaList()`の入力順を保ち、各生き様の名称リンク、`shortDescription`、専用アイテム名称リンクを対応付けて表示する。
- [ ] 生き様ID、専用アイテムID、固定の生き様データ、別途の詳細導線文言を可視表示として追加していない。
- [ ] サイドメニューの生き様リスト追加を実装せず、関連TODOを未完了のまま維持する理由を記録している。
- [ ] 実装後にVisual Reviewを行い、desktop / mobileの比較結果をこのissueへ記録している。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存の生き様詳細ルート、`IkizamaDataSection`、スキルカード表示を壊していない。
- [ ] 生き様一覧と詳細ページへのリンクがGitHub Pagesのサブパス配下で壊れない。
- [ ] desktop / mobileでhero、凡例、一覧の長い説明が横overflowや不自然な切り詰めなく読める。
- [ ] PageTocとMobilePageTocがH2の`生き様データの見方`、`生き様一覧`を表示し、`IkizamaDataSection`内のH3を重複表示しない。
- [ ] `getIkizamaList()`の入力順と`shortDescription`を、ページ側で並べ替え・再編集していない。
- [ ] `docs/design/site-layout/`、`docs/design/page-toc/`、新設する`docs/design/ikizama-index/`との関係を記録し、詳細ページ用designを一覧ページの正本として流用していない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md`のサイドメニュー追跡項目と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊、stage、commitしていない。

## 想定変更ファイル

- `docs/design/ikizama-index/notes.md`
- `docs/design/ikizama-index/design-desktop.png`
- `docs/design/ikizama-index/design-mobile.png`
- `src/pages/data/ikizama/index.astro`
- `src/components/data/IkizamaDataSection.astro`（一覧用の最小限の見出し・目次制御が必要な場合のみ）
- `tests/visual/` 配下の生き様一覧確認
- `docs/issue/31-2-ikizama-index-page.md`

## レビュー観点

- contentsのH1、hero、導入、ブライの生き様データ凡例、3項目説明、一覧の表示密度を、designと実装へ過不足なく反映できるか。
- 生き様一覧で名称、短い説明、専用アイテム導線だけを表示し、詳細ページの情報を重複させない方針が妥当か。
- 専用アイテム名称を各生き様詳細ページへのリンクにするcontents指示を、利用者に分かりやすい形で表現できるか。
- `IkizamaDataSection`を一覧の凡例に再利用しても、詳細ページ、PageToc、既存designの制約を壊さないか。
- サイドメニューの生き様リスト追加を、このissueの対象外として残すことが妥当か。
- design画像作成を実装前の別前提として扱う範囲が妥当か。

## 備考

- `.raw/contents/ikizama-index.md` はGit管理外のローカル作業入力である。Drive同期はこのissueの範囲に含めない。
- `public/images/data/ikizama_hero.webp` はユーザーの未追跡画像である。本issueでは表示に利用するが、変更・削除・commit対象には含めない。
- `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、一覧ページの実装だけで完了にはしない。
- 実装開始前に、ユーザーがこのissue内容を明示承認する。Git commit / push はこのissue準備では実行しない。
