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

流儀一覧では同じ流儀データ表示を凡例として使う予定である。そのため、詳細ページ内の流儀データセクションは
ページ固有の周辺要素から分離し、流儀IDをキーに必要な表示データを受け取るコンポーネントにする。

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
- 流儀データセクションを再利用可能なコンポーネントにする。見出しは `流儀データ` をdefaultとし、
  流儀IDをキーに、見出しと内部のプライマリボーナス、能力値、増加値、共通スキルボーナスを表示するために
  必要なデータを渡す。流儀一覧では同コンポーネントを凡例として利用できるよう、詳細ページ固有のhero、説明、
  流儀スキル一覧へ依存させない
- `.raw/contents/ryugi-detail.md` のfrontmatter、本文、HTMLコメント指示を実装へ反映する
- `.raw/contents/ryugi-detail.md` 内のhero表示方針を、個別流儀heroを表示する内容へ統一する
- `public/images/data/ryugi/<ryugiId>_hero.webp` を各流儀詳細ページのhero画像として利用する
- `ryugi.name`、`ryugi.description`、任意の `ryugi.note`、基礎能力値、体力／精神力増加値、
  共通スキルボーナスを表示する
- `ryugi.note` がある場合は既存の `Callout` へ `type` と `content` を渡し、ない場合はCalloutを出力しない
- `skills.bonus`、`skills.basic`、`skills.advanced` を、既存の `CardContainer` と `SkillCard` で表示する
- 空のカテゴリでは対応する見出しとカード一覧を表示しない。スキルカードの個別アンカーには生成済みの
  スキルIDを使い、カードへID・所属・区分を可視表示しない
- designに対する実装後のVisual Reviewを行い、このissueのVisual Review記録を更新する
- Visual Testはローカルの画面構造、responsive layout、横overflow、スクリーンショット取得だけを確認し、
  外部データの固有の文言、値、件数、本文内容へ依存するE2E期待値を追加しない

## 初期スコープ外

- 流儀データ・流儀スキルデータのExcel変換、生成JSON、schema、取得層の変更
- 個別流儀ごとのページファイル複製、手書きの流儀・スキルデータ
- 流儀一覧ページ、サイドメニューへの流儀一覧追加、生き様詳細ページ
- 検索、絞り込み、ソート、ページネーション、詳細遷移、クライアント状態管理
- キャラクター作成ウィザード、能力値・ボーナスの自動計算、ダイスローラー、キャラクターシート
- 新しいUIライブラリ、DB、認証、SSR、CMS、APIサーバー
- Header、Footer、SiteMenu、PageToc、MobilePageToc、`CardContainer` の再設計

## 完了条件

- [x] `design-image-generation` initial draft modeで `docs/design/ryugi-detail/notes.md`、`design-desktop.png`、`design-mobile.png` を作成し、実装前の比較対象を記録している
- [x] `/data/ryugi/[ryugiId]` が既存流儀IDごとに静的生成され、個別ページファイルを複製していない
- [x] 流儀データセクションが、default見出し `流儀データ` と流儀IDをキーに渡す表示データを受け取る
      再利用可能なコンポーネントになっており、詳細ページ固有のhero・説明・流儀スキル一覧へ依存していない
- [x] 各ページで、流儀名、説明、任意の補足、基礎能力値、プライマリボーナス、副能力増加値、共通スキルボーナス、流儀スキル一覧を表示する
- [x] hero画像と代替テキストが、対象流儀を誤認させず、desktop / mobileで破綻なく表示される
- [x] `ryugi.note` がある場合は既存 `Callout` のtypeと本文を反映し、ない場合は空のCalloutを表示しない
- [x] スキルカードがカテゴリ・配列順を保ち、生成済みIDを個別アンカーへ用いる。空カテゴリの見出しや空一覧は表示しない
- [x] 既存の `SkillCard` と `CardContainer` の表示契約、SiteMenu、PageToc、MobilePageTocを壊していない
- [x] 実装後のVisual Reviewでdesignとの具体的な差分を確認し、必要な修正と結果をこのissueへ記録している
- [x] 関連TODOを扱った場合は対応結果を記録し、扱わない関連TODOは未対応理由を記録している
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] `getRyugiDetail(ryugiId)` が存在する流儀とスキルデータだけを共通テンプレートへ渡している
- [x] 流儀データセクションへ渡すデータは流儀IDをキーに特定でき、流儀一覧で凡例として再利用する際にも
      見出しと内部データの表示に必要な値が不足しない
- [x] GitHub Pagesのサブパス配下で、画像とスキルカード個別アンカーが壊れない
- [x] `ryugi.note` がある流儀では既存Calloutのtypeと本文を反映し、ない流儀では空のCalloutを表示しない
- [x] Visual Test対象のdesktop `1440px`、tablet `820px`、mobile `390px`で、長い説明、複数行の共通スキルボーナス、長いスキル本文に横overflowや切り詰めがない。`1024px`以上`1360px`未満の既存3レールlayoutの横overflowは後続TODOとして残す
- [x] desktopでは既存の3列 `CardContainer`、mobileでは既存の2列配置を維持する
- [x] Visual Testは外部データの固有内容へ依存せず、画面構造、responsive layout、横overflow、
      スクリーンショット取得だけを確認する
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] サイドメニューの流儀リスト表示TODOは、一覧ページまたはナビゲーション補完タスクの責務として未対応のまま維持している
- [x] 流儀の共通スキルボーナスを構造化するTODOは、現行の改行を含む表示文字列を使い、未対応のまま維持している
- [x] `docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/skill-card/` と、作成する `docs/design/ryugi-detail/` に矛盾していない
- [x] ユーザーの未コミットのhero画像とcontents修正を破壊していない

## 想定変更ファイル

- `.raw/contents/ryugi-detail.md`
- `public/images/data/ryugi/*.webp`
- `docs/design/ryugi-detail/notes.md`
- `docs/design/ryugi-detail/design-desktop.png`
- `docs/design/ryugi-detail/design-mobile.png`
- `src/pages/data/ryugi/[ryugiId].astro`
- `src/components/data/RyugiDataSection.astro`
- `src/components/data/SkillCard.astro`
- `tests/visual/ryugi-detail.spec.ts`
- `docs/requirements/pages.md`
- `docs/issue/done/phase-3/30-2-ryugi-detail-page.md`

## レビュー観点

- `.raw/contents/ryugi-detail.md` のH1、hero、流儀データgrid、スキルカテゴリ見出しの指定が、要件と過不足なく対応しているか。hero表示方針を統一する判断が適切か
- hero画像を個別流儀ページへ置く方針、流儀名から導く汎用の代替テキスト、`loading`の扱いが適切か
- design画像作成をこのissueの実装前提として扱い、既存のlayout / PageToc / SkillCard正本を再設計しない範囲になっているか
- `skills.bonus`、`skills.basic`、`skills.advanced` の表示順と空カテゴリ非表示の条件がレビュー可能か
- 関連TODOを本issueで回収せず、流儀一覧・ナビゲーション・構造化データの後続作業へ残す判断が適切か

## 備考

- ローカルissue作成時点で `docs/design/ryugi-detail/` は存在しない。ユーザーによるdesign作成の明示指示があるまで、design画像は生成しない。
- 既存の `public/images/data/ikizama*` と `public/images/data/items*` の未追跡画像は本issueの対象外であり、変更しない。
- `docs/TODO.md` の「サイドメニューに流儀リストと生き様リストを表示する」は、流儀詳細ページのナビゲーション変更を求めるものではないため本issueでは扱わない。
- `docs/TODO.md` の「流儀の共通スキルボーナスを構造化データへ変換する」は、現在の表示用改行文字列を維持する後続タスクであり、本issueでは扱わない。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/ryugi-detail/`
- reference desktop: `docs/design/ryugi-detail/design-desktop.png`
- reference mobile: `docs/design/ryugi-detail/design-mobile.png`
- notes: ケンカヤの実画面を比較対象にし、既存Header、SiteMenu、PageToc、MobilePageTocは再設計せず現行layoutを利用した。

### 成果物

- actual desktop: `test-results/visual/ryugi-detail-desktop.png`
- actual mobile: `test-results/visual/ryugi-detail-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                                                                                             | 対応                     |
| --------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| レイアウト            | OK   | desktopはプライマリ、基礎能力値、副能力増加値の3列と、その下の共通スキルボーナスを維持している                                   | 不要                     |
| 余白                  | OK   | 実データの説明文と共通スキルボーナスの説明によりdesign draftより縦長                                                             | 実データ量による許容差分 |
| タイポグラフィ        | OK   | 能力値と増加値は太字の黒、既存`SkillCard`の文字組みを維持している                                                                | 不要                     |
| 色                    | OK   | 既存の青緑accentとCalloutのwarning色を使用している                                                                               | 不要                     |
| 配置・整列            | OK   | 共通スキルボーナスはdesktopで下段全幅、mobileで副能力増加値の横にある                                                            | 不要                     |
| レスポンシブ          | OK   | mobileはプライマリ／基礎能力値、副能力増加値／共通スキルボーナスの2列2行                                                         | 不要                     |
| overflow / scroll     | OK   | Visual Test対象のdesktop `1440px`、mobile `390px`でdocument横overflowなし。`1024px`以上`1360px`未満の既存3レールlayoutは後続TODO | 不要                     |
| 既存デザインとの整合  | OK   | Header・左右レールの実装差は今回のpage scope外であり、既存layoutをそのまま利用している                                           | 不要                     |
| 既存Componentとの整合 | OK   | `Callout`、`CardContainer`、`SkillCard`を既存契約のまま利用している                                                              | 不要                     |
| accessibility basics  | OK   | heroのalt、構造化した見出し、画像のeager loadingを確認した                                                                       | 不要                     |

### 自己修正した項目

- [x] designのgrid構成に合わせて、流儀データをdesktop 3列＋下段全幅、mobile 2列2行に実装した

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [x] 実装スクリーンショットをdesign fix modeで正本化した

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

- 既存`SkillCard`では、名称の折返しを避けるため、`最大LV`を名称行の右側ではなく、名称行の下にある独立した行へ表示する。
- 流儀データsectionのgrid切替を`CardContainer`と揃え、`1024px`未満では2列にする。
- `1024px`以上`1360px`未満で発生する既存の3レールlayoutの横overflowは、本issueでは修正しない。
- 関連ページリンクはコンテンツ指示にないため削除し、heroのaltはケンカヤ固有の説明を使わず、流儀名から導く汎用表現にする。

### 判定

- source: human
- classification: valid / follow-up
- local validation: ケンカヤの`1720px`、`1440px`、`820px`、`390px`のcaptureとCSSを確認した。本文幅はdesktopで最大`46rem`のため、`1720px`でもカード幅は広がらず、メタ情報のflex折返しは画面幅だけでは解消しない。`820px`では流儀データgridが3列のままで密度が高い。`1280px`ではdocument横overflowが`80px`あり、原因は`TocPageLayout`の既存3レール最小幅である。

### 対応方針

- `SkillCard`は名称行を可変幅のまま維持し、`最大LV`だけを名称行の下の独立行へ移す。名称が折り返しても最大LVの位置を安定させる。
- `RyugiDataSection`の2列breakpointを、既存`CardContainer`の`max-width: 63.999rem`と揃える。
- 既存layoutの`1024px`以上`1360px`未満における横overflowは、`50-responsive-pass`のTODOとして扱う。
- 関連ページリンクはFR-05、contents、ページ実装から削除する。heroのaltは`${ryugi.name}のイメージ`とする。

### 対応完了チェックリスト

- [x] `SkillCard`の`最大LV`を名称行の下の独立行へ表示する
- [x] `RyugiDataSection`を`1024px`未満で2列にする
- [x] 関連ページリンクを削除し、heroのaltを流儀名由来の汎用表現にする
- [x] `SkillCard`、流儀詳細のdesktop / tablet / mobileで最大LV、grid、横overflowをVisual Testで確認する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### 成果物

- actual desktop: `test-results/visual/ryugi-detail-desktop.png`
- actual tablet: `test-results/visual/ryugi-detail-tablet.png`
- actual mobile: `test-results/visual/ryugi-detail-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域              | 判定 | 結果                                                                                    |
| ----------------- | ---- | --------------------------------------------------------------------------------------- |
| 最大LV            | OK   | 名称の折返しに影響されない独立行として、名称下に表示する                                |
| 流儀データgrid    | OK   | desktopは3列＋下段全幅、`1024px`未満のtablet / mobileは2列2行                           |
| overflow / scroll | OK   | Visual Testのdesktop `1440px`、tablet `820px`、mobile `390px`でdocument横overflowがない |
| コンテンツ        | OK   | 関連ページリンクを削除し、hero altを流儀名由来の汎用表現へ変更した                      |

### design-image-generation への引き継ぎ候補

- [x] `最大LV`の配置変更をdesign fix modeでcanonical designへ反映した

## レビュー指摘 2

### 指摘事項

- `RyugiDataSection`の見出しIDが固定値のため、流儀一覧で複数の流儀データセクションを再利用すると重複IDになる。ただし、流儀一覧ではこのコンポーネントを複数配置しない方針のため、本issueでの対応は不要とする。
- `docs/design/ryugi-detail/notes.md`に、heroの代替テキストを画像内容と流儀名の両方で説明すると読める記述が残っており、流儀名由来の汎用表現とする現在の方針に一致しない。
- `1024px`以上`1360px`未満の既存3レールlayoutの横overflowを後続TODOとしている一方で、issueのチェックポイントとビジュアルレビュー1に、対象幅を限定しない横overflowなしの記録が残っていた。

### 判定

- source: local PR review
- classification: not applicable / valid / follow-up
- local validation: `RyugiDataSection.astro`の4つの`h3`が固定IDであることと、流儀一覧では複数の流儀データセクションを表示しない方針を確認した。あわせて、`notes.md`のhero alt記述、`1280px`で既存layoutに`80px`のdocument横overflowがあることと`50-responsive-pass`のTODOを確認した。

### 対応方針

- 流儀一覧で複数の流儀データセクションを表示しないため、見出しIDの変更と複数配置の確認は行わない。
- design notesのhero alt記述を、流儀名由来の汎用表現だけを求める内容へ統一する。
- 横overflowについてのissue記録をVisual Testで確認済みの幅へ限定し、既存3レールlayoutの後続TODOは維持する。layout実装自体は本issueでは変更しない。

### 対応完了チェックリスト

- [x] 流儀一覧では複数の流儀データセクションを表示しない方針を確認し、見出しIDの変更は不要と判断する
- [x] design notesのhero alt記述を現在の汎用alt方針と一致させる
- [x] 横overflowのissue記録を確認済みviewportへ限定し、既存layoutの後続TODOを明記する
- [x] Markdown formatterとMarkdown checkが通る

## レビュー指摘 3

### 指摘事項

- 全スキル分のsummaryが未完成のため、共有`SkillCard`ではsummaryを表示しない。summaryデータは再表示に備えて保持する。

### 判定

- source: human
- classification: valid / data quality follow-up
- local validation: `SkillCard`が共通スキル一覧、流儀詳細、凡例、ローカル確認ページで共有され、summaryをそのまま表示していることを確認した。

### 対応方針

- summary要素とsummary直後の余白スタイルを削除し、効果本文だけを表示する。
- 要件を一時非表示方針へ更新し、全スキル分のsummary整備後に再表示するTODOを追加する。
- ユーザーが明示したdesign fixにより、`docs/design/skill-card/`、`docs/design/common-skills/`、`docs/design/ryugi-detail/`の正本画像をsummary非表示後の実装へ更新する。

### 対応完了チェックリスト

- [x] `SkillCard`でsummaryを表示しない
- [x] summaryを再表示するためのTODOを追加する
- [x] 外部データの固有内容に依存せず、summary要素が表示されないことをVisual Testで確認する
- [x] ユーザー承認により、SkillCard、共通スキル、流儀詳細のdesign正本をsummary非表示後の実装へ更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
