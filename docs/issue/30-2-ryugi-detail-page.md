# 30-2-ryugi-detail-page

## 目的

変換済みの流儀データと流儀スキルデータから、各流儀の詳細を静的生成する
`/data/ryugi/[ryugiId]` を1つのAstroテンプレートとして実装する。

## 背景

`docs/plan.md` の `30-2-ryugi-detail-page` は、流儀名、説明、基礎能力値、プライマリボーナス、
副能力増加値、共通スキルボーナス、流儀スキル一覧を表示する詳細ページを求めている。

ユーザー編集済みの `.raw/contents/ryugi-detail.md` は、流儀ごとに固定本文やページファイルを
複製せず、`getRyugiDetail(ryugiId)` と変換済みJSONを表示元とする構成を指定している。個別流儀用の
hero画像も `public/images/data/ryugi/<ryugiId>_hero.webp` に提供されている。

contentsの「ページの責務」に残るhero非表示指示は、ユーザーがH1直後へ追加したhero表示指示と矛盾する。
本issueでは後者を採用し、個別流儀heroを表示する。実装時にcontentsの指示をこの方針へ統一する。

関連資料:

- `docs/requirements/pages.md` の FR-05
- `docs/requirements/architecture.md` の AC-14
- `docs/requirements/data-display.md` の FR-04-01、FR-04-04
- `docs/requirements/non-functional.md` の静的生成・画像要件
- `docs/conversion/ryugi-index.md`
- `docs/conversion/ryugi-skills.md`
- `.raw/contents/ryugi-detail.md`
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/skill-card/`

`docs/design/ryugi-detail/` は未作成である。UI実装前に
`design-image-generation` のinitial draft modeで同targetのdesign正本候補を作成し、ユーザーが
確認できる状態にする。

## 対象範囲

- `docs/design/ryugi-detail/` のdesign notesとdesktop / mobile design画像を、実装前提として作成・確認する
- `src/pages/data/ryugi/[ryugiId].astro` を追加し、流儀IDごとの静的ページを共通テンプレートから生成する
- `src/lib/data/ryugi-detail.ts` の `getRyugiDetail(ryugiId)` と既存の変換済みJSONを表示に利用する
- `.raw/contents/ryugi-detail.md` のfrontmatter、本文、HTMLコメント指示を実装へ反映する
- `.raw/contents/ryugi-detail.md` 内のhero表示方針を、個別流儀heroを表示する内容へ統一する
- `public/images/data/ryugi/<ryugiId>_hero.webp` を各流儀詳細ページのhero画像として利用する
- `ryugi.name`、`ryugi.description`、任意の `ryugi.note`、基礎能力値、体力／精神力増加値、
  共通スキルボーナスを表示する
- `ryugi.note` がある場合は既存の `Callout` へ `type` と `content` を渡し、ない場合はCalloutを出力しない
- `skills.bonus`、`skills.basic`、`skills.advanced` を、既存の `CardContainer` と `SkillCard` で表示する
- 空のカテゴリでは対応する見出しとカード一覧を表示しない。スキルカードの個別アンカーには生成済みの
  スキルIDを使い、カードへID・所属・区分を可視表示しない
- 流儀一覧、キャラクターメイキング、成長、共通スキルへの関連リンクを置く
- designに対する実装後のVisual Reviewを行い、このissueのVisual Review記録を更新する

## 初期スコープ外

- 流儀データ・流儀スキルデータのExcel変換、生成JSON、schema、取得層の変更
- 個別流儀ごとのページファイル複製、手書きの流儀・スキルデータ
- 流儀一覧ページ、サイドメニューへの流儀一覧追加、生き様詳細ページ
- 検索、絞り込み、ソート、ページネーション、詳細遷移、クライアント状態管理
- キャラクター作成ウィザード、能力値・ボーナスの自動計算、ダイスローラー、キャラクターシート
- 新しいUIライブラリ、DB、認証、SSR、CMS、APIサーバー
- Header、Footer、SiteMenu、PageToc、MobilePageToc、既存 `SkillCard` / `CardContainer` の再設計

## 完了条件

- [ ] `design-image-generation` initial draft modeで `docs/design/ryugi-detail/notes.md`、`design-desktop.png`、`design-mobile.png` を作成し、実装前の比較対象を記録している
- [ ] `/data/ryugi/[ryugiId]` が既存流儀IDごとに静的生成され、個別ページファイルを複製していない
- [ ] 各ページで、流儀名、説明、任意の補足、基礎能力値、プライマリボーナス、副能力増加値、共通スキルボーナス、流儀スキル一覧、関連リンクを表示する
- [ ] hero画像と代替テキストが、対象流儀を誤認させず、desktop / mobileで破綻なく表示される
- [ ] `ryugi.note` がある場合は既存 `Callout` のtypeと本文を反映し、ない場合は空のCalloutを表示しない
- [ ] スキルカードがカテゴリ・配列順を保ち、生成済みIDを個別アンカーへ用いる。空カテゴリの見出しや空一覧は表示しない
- [ ] 既存の `SkillCard` と `CardContainer` の表示契約、SiteMenu、PageToc、MobilePageTocを壊していない
- [ ] 実装後のVisual Reviewでdesignとの具体的な差分を確認し、必要な修正と結果をこのissueへ記録している
- [ ] 関連TODOを扱った場合は対応結果を記録し、扱わない関連TODOは未対応理由を記録している
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] `getRyugiDetail(ryugiId)` が存在する流儀とスキルデータだけを共通テンプレートへ渡している
- [ ] GitHub Pagesのサブパス配下で、関連リンク、画像、スキルカード個別アンカーが壊れない
- [ ] `ryugi.note` がある流儀では既存Calloutのtypeと本文を反映し、ない流儀では空のCalloutを表示しない
- [ ] 長い説明、複数行の共通スキルボーナス、長いスキル本文で横overflowや切り詰めがない
- [ ] desktopでは既存の3列 `CardContainer`、mobileでは既存の2列配置を維持する
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] サイドメニューの流儀リスト表示TODOは、一覧ページまたはナビゲーション補完タスクの責務として未対応のまま維持している
- [ ] 流儀の共通スキルボーナスを構造化するTODOは、現行の改行を含む表示文字列を使い、未対応のまま維持している
- [ ] `docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/skill-card/` と、作成する `docs/design/ryugi-detail/` に矛盾していない
- [ ] ユーザーの未コミットのhero画像とcontents修正を破壊していない

## 想定変更ファイル

- `.raw/contents/ryugi-detail.md`
- `public/images/data/ryugi/*.webp`
- `docs/design/ryugi-detail/notes.md`
- `docs/design/ryugi-detail/design-desktop.png`
- `docs/design/ryugi-detail/design-mobile.png`
- `src/pages/data/ryugi/[ryugiId].astro`
- `tests/visual/ryugi-detail.spec.ts`
- `docs/issue/30-2-ryugi-detail-page.md`

## レビュー観点

- `.raw/contents/ryugi-detail.md` のH1、hero、流儀データgrid、スキルカテゴリ見出しの指定が、要件と過不足なく対応しているか。hero表示方針を統一する判断が適切か
- hero画像を個別流儀ページへ置く方針、heroの代替テキスト、`loading`の扱いが適切か
- design画像作成をこのissueの実装前提として扱い、既存のlayout / PageToc / SkillCard正本を再設計しない範囲になっているか
- `skills.bonus`、`skills.basic`、`skills.advanced` の表示順と空カテゴリ非表示の条件がレビュー可能か
- 関連TODOを本issueで回収せず、流儀一覧・ナビゲーション・構造化データの後続作業へ残す判断が適切か

## 備考

- ローカルissue作成時点で `docs/design/ryugi-detail/` は存在しない。ユーザーによるdesign作成の明示指示があるまで、design画像は生成しない。
- 既存の `public/images/data/ikizama*` と `public/images/data/items*` の未追跡画像は本issueの対象外であり、変更しない。
- `docs/TODO.md` の「サイドメニューに流儀リストと生き様リストを表示する」は、流儀詳細ページのナビゲーション変更を求めるものではないため本issueでは扱わない。
- `docs/TODO.md` の「流儀の共通スキルボーナスを構造化データへ変換する」は、現在の表示用改行文字列を維持する後続タスクであり、本issueでは扱わない。
