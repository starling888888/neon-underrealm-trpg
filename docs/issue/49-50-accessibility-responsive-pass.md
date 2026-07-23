# 49-50-accessibility-responsive-pass

## 目的

公開前の横断確認として、全サイトのアクセシビリティ最低基準と PC・タブレット・スマホのレスポンシブ表示を検証し、必要な修正を相互に矛盾させずに進める。

この issue は、検証、検証結果のユーザー報告、修正計画、修正実装を明確に分離する。検証結果を報告する前、およびユーザーが明示的に「修正開始」と指示する前には、ソースコード・テスト・design 正本を変更しない。

## 背景

`docs/plan.md` の `49-50-accessibility-responsive-pass` は、初回公開前にアクセシビリティと各基準幅の利用性を横断確認する仕上げタスクである。

主な参照先は以下とする。

- `docs/requirements/non-functional.md` の NFR-02（アクセシビリティ最低基準）および NFR-03（レスポンシブ基準幅）
- `docs/requirements/layout-navigation.md` の FR-01-01〜FR-01-05（Header、メニュー、ページ内目次、操作上の役割分離）
- `docs/requirements/assets-seo.md` の画像 `alt` 要件
- `docs/plan.md` の `49-50-accessibility-responsive-pass`
- `docs/TODO.md` の「表全体が初期表示で収まらない場合のレイアウト対策」および「1024px以上1360px未満で3レールlayoutの横overflowを解消する」
- `docs/issue/done/phase-5/50-2-layout-scroll-behavior.md`。そこで完了した Header と各レールのスクロール挙動は変更対象に決め打ちせず、回帰確認の対象とする。
- `docs/design/site-layout/`、`docs/design/header-footer/`、`docs/design/site-menu/`、`docs/design/mobile-menu/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/search-modal/`、各ページの既存 design target

上記の横断 layout / navigation に必要な design 画像は存在する。検証中に既存 design で判断できない UI 変更が必要と判明した場合は、実装へ進まず `design-image-generation` を別の前段作業として扱う。

## 対象範囲

### Phase A: 検証

- 静的な HTML・見出し・画像確認は、全公開 route を対象とする。各指摘を、共通 Component 由来、ページ実装由来、contents 由来に分類する。
- ソース、生成済み HTML、必要なブラウザ確認を用いて、画像の `alt`、アイコンリンクの accessible name、PC / mobile の現在ページリンクの `aria-current`、見出し階層、色だけに依存しない状態表示、タップ領域を確認する。
- Search UI、PC 版 SiteMenu の階層 disclosure、MobileMenu、MobilePageToc について、キーボードによる開閉、Esc による閉鎖、開いた際のフォーカス移動、閉じた際の起点への復帰、focus outline、`aria-expanded` / `aria-controls`、overlay 表示中の背景操作抑止を確認する。
- ブラウザ確認は layout / ページ種別ごとの代表 route と選定理由を記録し、`768px` と `1024px` の境界および直前幅、`1024px` 以上 `1360px` 未満、design 正本の `390px`、`820px`、`1440px` を含める。各幅で既存ページの表示、横 overflow、ナビゲーションの役割分離、Header のスクロール挙動を確認する。
- 関連 TODO の表レイアウトと 3 レール layout の横 overflow は、発生条件、影響 route・viewport、既存 design・要件との関係、修正候補を記録する。ただし、この phase では方針を確定せず、修正しない。
- PageToc / MobilePageToc の対象見出しが 0 件または 1 件の場合は、現行 design notes より `docs/requirements/layout-navigation.md` を検証基準とする。design notes の整合方法は、Phase B で本 issue に含めるか別作業へ分離するかを記録する。
- 確認手順、対象 route / viewport、結果、再現手順、重要度、根拠を `.tmp/review/49-50-accessibility-responsive-pass/validation-report.md` にまとめ、ユーザーへ報告して停止する。

### Phase B: 修正計画

- ユーザーが Phase A の結果を確認した後に、採用する修正項目、対象ファイル、影響する route / viewport / 操作状態、既存 design・要件・TODO との整合、検証方法、実施順を `.tmp/review/49-50-accessibility-responsive-pass/fix-plan.md` に修正計画としてまとめる。
- 修正計画では、同じ Component・CSS・操作状態を変更する項目をまとめて依存関係を明示し、ある修正が別のアクセシビリティ、レイアウト、スクロール挙動、検索・メニュー・目次の排他状態を壊さないことを確認する。
- contents 由来の指摘を採用する場合は、対象 slug、`.raw/contents/<slug>.md` と公開実装の整合方針、`contents-markdown-authoring` の適用、Drive 同期を明示指示まで行わないことを修正計画へ記録する。
- 修正計画はユーザーに報告し、報告した `fix-plan.md` の版を特定する。ユーザーが明示的に「修正開始」と指示するまで実装へ進まない。

### Phase C: 修正

- 承認済みの修正計画だけを実装し、該当する回帰確認、`npm run check`、`npm run build` を実行する。
- 修正実装中に新たな重大な不整合または design 判断不能事項が見つかった場合は、その項目を実装から分離してユーザーへ報告する。

### Phase D: 全 design 正本の更新

- Phase C の全修正と回帰確認が完了し、実装差分が理解・レビューされた後に、既存の全 `docs/design/<design-target>/` を対象として design 正本を更新する。
- 既存の desktop / mobile 正本は現行実装から再取得して更新し、tablet の正本画像を各 design target に新規追加する。tablet は標準状態だけでなく、既存 design target が定義する開閉・結果・非表示などの状態についても、必要な状態を記録する。
- 各 target の route、状態、desktop / tablet / mobile viewport、既存正本との差分、適用した要件・scope、canonicalization の根拠を `notes.md` に記録する。ページまたは layout 系 target は原則として desktop `1440px`、tablet `820px`、mobile `390px` を比較基準とする。
- design fix / canonicalization は `design-image-generation` の workflow に従い、実装 screenshot を直接 `docs/design/` へコピーせず、`npm run visual:capture` と `npm run visual:canonicalize` を使う。実行不能な target は代替手段で置き換えず、原因と必要な判断をユーザーへ報告する。
- 実装差分が既存 design、requirements、out-of-scope、または global style / layout direction と矛盾する target は、正本を更新して差分を隠さない。Phase C の修正へ戻すか、別の design 判断としてユーザーへ報告する。

## 初期スコープ外

- WCAG 完全準拠監査、支援技術ごとの完全な互換性保証、アクセシビリティ認証
- `50-1-vrt-css-regression-guards` の VRT 導入および CSS 回帰検知基盤
- 新規 UI 機能、検索機能の拡張、ナビゲーション構造・情報設計の再設計
- Header / Footer、SiteMenu、PageToc、MobilePageToc、Search UI の design を根拠なく再設計すること
- 既存 design で判断できない変更を design-image-generation なしに実装すること
- Visual Review の actual screenshot、`test-results/`、`playwright-report/`、`.tmp/` の成果物を design 正本として直接コピー・commit すること
- 初期スコープ外の機能、npm package、外部 UI ライブラリ、DB、認証、SSR、CMS、API サーバーの追加
- `docs/plan.md` のチェックボックス更新、関連 TODO の完了・退避。これらは人間レビュー後の別指示で扱う。

## 完了条件

- [ ] Phase A の確認対象、route / viewport、操作状態、確認結果、未確認事項が検証レポートに記録され、ユーザーへ報告されている。
- [ ] 検証レポートの報告前に、検証目的のソースコード・テスト・design 正本の変更を行っていない。
- [ ] Phase B の修正計画に、採用項目、対象ファイル、依存関係、競合回避、回帰確認、実施順、保留項目が記録され、ユーザーへ報告されている。
- [ ] Phase B の修正計画は `fix-plan.md` に保存され、Phase C の実装対象となる報告済み版を特定できる。
- [ ] Phase C は、ユーザーの明示的な「修正開始」指示後にのみ着手している。
- [ ] 承認済み修正後、NFR-02 の画像・リンク・キーボード・フォーカス・状態表現・タップ領域の対象項目と、NFR-03 の各基準幅で、計画した確認が通っている。
- [ ] Phase C の修正内容がレビューされ、全 design 正本を更新してよい差分であることを確認してから Phase D を実行している。
- [ ] 既存の全 `docs/design/<design-target>/` について、desktop / mobile 正本を更新し、tablet 正本を新規追加している。状態を持つ target は必要な tablet 状態も記録している。
- [ ] 各 design target の `notes.md` に route、状態、desktop / tablet / mobile viewport、既存正本との差分、canonicalization の根拠を記録している。
- [ ] design 正本の更新は `npm run visual:capture` と `npm run visual:canonicalize` による workflow で行い、actual screenshot を直接コピーしていない。
- [ ] 関連 TODO を扱った場合、対応結果または本 issue で保留する理由が記録されている。
- [ ] 既存 design を変更した場合、変更の必要性と design-image-generation の扱いが記録されている。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートと GitHub Pages のサブパス公開を回帰させていない。
- [ ] `1024px` 以上、`768px` 以上 `1024px` 未満、`768px` 未満で、意図しない横 overflow と操作不能な表示がない。
- [ ] ブラウザ確認は `768px` / `1024px` の境界と直前幅、`1024px` 以上 `1360px` 未満、design 正本の `390px` / `820px` / `1440px` を含み、代表 route の選定理由を記録している。
- [ ] mobile Header の下スクロール非表示・上スクロール再表示、メニュー・ページ内目次を開く際の表示維持を回帰させていない。
- [ ] SiteMenu、MobileMenu、PageToc、MobilePageToc、Search UI の役割と同時表示の制約を混同させていない。
- [ ] 画像の意味に応じた `alt`、アイコンリンクの accessible name、`aria-current`、見出し階層、色以外の状態表現、タップ領域を確認している。
- [ ] Search UI、PC 版 SiteMenu の階層 disclosure、MobileMenu、MobilePageToc のキーボード開閉、Esc 閉鎖、フォーカス移動・復帰、focus outline、関連 ARIA 属性、overlay 中の背景操作抑止を確認している。
- [ ] contents 由来の指摘を、`.raw/contents` と公開実装を整合させないまま修正していない。
- [ ] PageToc / MobilePageToc の 0 / 1 件表示を、`docs/requirements/layout-navigation.md` を基準として確認し、design notes との整合方針を記録している。
- [ ] 全 design target の canonicalization 対象、route、状態、desktop / tablet / mobile coverage を一覧化し、欠ける capture は原因とともに報告している。
- [ ] design 正本化前に、actual screenshot と既存正本の差分を確認し、requirements、out-of-scope、global style、layout direction との整合を確認している。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する `docs/TODO.md` と既存 `docs/design/` に矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

Phase A では Git 管理ファイルを変更しない。検証レポートは `.tmp/review/49-50-accessibility-responsive-pass/validation-report.md` に置く。Phase B の修正計画は `.tmp/review/49-50-accessibility-responsive-pass/fix-plan.md` に置く。

Phase B / C で変更するファイルは、Phase A の結果と修正計画で限定する。候補は以下だが、すべてを変更対象にはしない。

- `src/components/layout/` 配下の Header、SiteMenu、MobileSiteMenuDrawer、PageToc、MobilePageToc
- `src/components/search/` 配下の検索 UI
- `src/components/_common/` および各ページ・データ Component の画像、リンク、見出し構造
- `src/layouts/`、`src/styles/`、`src/scripts/` の必要最小限の関連ファイル
- `tests/visual/` または `tests/node/` の必要最小限の既存確認
- `docs/issue/49-50-accessibility-responsive-pass.md` の完了条件・チェックポイント

Phase D では、全 `docs/design/<design-target>/` の既存正本画像と `notes.md` を更新対象に含める。tablet 正本は各 target の状態に応じて `design-tablet.png` または状態を示す明確なファイル名で新規追加する。

## レビュー観点

- Phase A の対象範囲と検証レポートの粒度が、実装判断に必要十分か。
- 検証レポートの報告と、修正計画・修正開始の停止点が明確で、ユーザーが各段階を判断できるか。
- 全公開 route の静的確認と、基準幅・境界幅を含む代表 route のブラウザ確認が、検証完了の判断に十分か。
- 3 基準幅、検索、サイトメニュー、ページ内目次、Header の組合せ状態を修正計画で相互に破綻なく扱えるか。
- 関連 TODO の表レイアウト対策と 3 レール横 overflow を、この issue で修正まで扱うべきか、それとも検証・計画のみで別 task に分けるべきか。
- contents 由来の修正を、`.raw/contents` と公開実装の同時整合としてこの issue で扱うか、contents 作業として分離するか。
- PageToc / MobilePageToc の古い design notes を requirements へ整合させる変更を、本 issue で扱うか別作業へ分離するか。
- 既存 design で判断できない修正を、design-image-generation の前段作業へ適切に切り出せているか。
- 全 design target の tablet 正本について、route・状態・viewport を記録したうえで、desktop / mobile と同じ差分基準で正本化できるか。

## 備考

- `50-1-vrt-css-regression-guards` は別計画項目のため、この issue で VRT 基盤を追加しない。必要なブラウザ確認は手動または既存の Visual Test に限定する。
- 検証・修正計画・修正実装の各段階で、未確認事項とユーザー判断が必要な項目を混在させずに報告する。
- Phase A の完了報告は本 issue の実装承認ではない。Phase B の修正計画を確認した後、ユーザーが「修正開始」と明示した場合にだけ Phase C へ進む。
- ユーザー指示により、Phase C の完了・レビュー後には Phase D で全 design 正本を更新する。Phase D は Visual Reviewのactual screenshotをそのまま正本化する工程ではなく、既存正本との差分と SSoT 整合を確認した上での design fix / canonicalization とする。
