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

### Phase D: VRT baseline への design 正本移行

- Phase C の全修正と回帰確認が完了し、実装差分が理解・レビューされた後に、既存の全 `docs/design/<design-target>/` を対象として行う。
- `docs/design/<design-target>/` は `notes.md` だけを保持する。比較画像はPlaywright標準の `toHaveScreenshot()` baseline snapshotへ移行する。
- 各 targetのroute、状態、desktop `1440px` / tablet `820px` / mobile `390px` viewport、VRT test名、baseline名、既存正本との差分と移行根拠を `notes.md` に記録する。状態を持つtargetはtablet状態も扱う。
- 通常のVRT実行は比較だけを行う。baselineの初回作成・更新は、差分を報告した上でユーザーが明示指示した場合だけ `--update-snapshots` で行う。
- non-VRTのstyle tileなどは `/-local/` の専用pageを作成してVRT対象へ移す。実装と同じCSSを使い、未使用styleのデグレも検出対象にする。
- 実装差分が既存design、requirements、out-of-scope、またはglobal style / layout directionと矛盾するtargetは、baselineを更新して差分を隠さない。Phase Cの修正へ戻すか、別のdesign判断としてユーザーへ報告する。

## 初期スコープ外

- WCAG 完全準拠監査、支援技術ごとの完全な互換性保証、アクセシビリティ認証
- ユーザーの明示指示なしのVRT baseline作成・更新
- 新規 UI 機能、検索機能の拡張、ナビゲーション構造・情報設計の再設計
- Header / Footer、SiteMenu、PageToc、MobilePageToc、Search UI の design を根拠なく再設計すること
- 既存 design で判断できない変更を design-image-generation なしに実装すること
- Visual Review の actual screenshot、`test-results/`、`playwright-report/`、`.tmp/` の成果物を design 正本として直接コピー・commit すること
- 初期スコープ外の機能、npm package、外部 UI ライブラリ、DB、認証、SSR、CMS、API サーバーの追加
- `docs/plan.md` のチェックボックス更新、関連 TODO の完了・退避。これらは人間レビュー後の別指示で扱う。

## 完了条件

- [x] Phase A の確認対象、route / viewport、操作状態、確認結果、未確認事項が検証レポートに記録され、ユーザーへ報告されている。
- [x] 検証レポートの報告前に、検証目的のソースコード・テスト・design 正本の変更を行っていない。
- [x] Phase B の修正計画に、採用項目、対象ファイル、依存関係、競合回避、回帰確認、実施順、保留項目が記録され、ユーザーへ報告されている。
- [x] Phase B の修正計画は `fix-plan.md` に保存され、Phase C の実装対象となる報告済み版を特定できる。
- [x] Phase C は、ユーザーの明示的な「修正開始」指示後にのみ着手している。
- [x] 承認済み修正後、NFR-02 の画像・リンク・キーボード・フォーカス・状態表現・タップ領域の対象項目と、NFR-03 の各基準幅で、計画した確認が通っている。
- [ ] Phase C の修正内容がレビューされ、全 design 正本を更新してよい差分であることを確認してから Phase D を実行している。
- [ ] 各 design targetの比較画像をPlaywright標準VRT baseline snapshotへ移し、`docs/design/<design-target>/` を `notes.md` 専用にしている。
- [ ] 各 design targetの `notes.md` にroute、状態、desktop / tablet / mobile viewport、VRT test名、baseline名、既存正本との差分と移行根拠を記録している。
- [ ] VRT baselineの初回作成・更新はユーザーの明示指示がある場合だけ `--update-snapshots` で行い、通常実行で更新していない。
- [x] 関連 TODO を扱った場合、対応結果または本 issue で保留する理由が記録されている。
- [ ] 既存 design を変更した場合、変更の必要性と design-image-generation の扱いが記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートと GitHub Pages のサブパス公開を回帰させていない。
- [x] `1280px` 以上、`768px` 以上 `1280px` 未満、`768px` 未満で、意図しない横 overflow と操作不能な表示がない。
- [x] ブラウザ確認は `768px` / `1280px` の境界と直前幅、`1280px` 以上 `1360px` 未満、design 正本の `390px` / `820px` / `1440px` を含み、代表 route の選定理由を記録している。
- [x] mobile Header の下スクロール非表示・上スクロール再表示、メニュー・ページ内目次を開く際の表示維持を回帰させていない。
- [x] SiteMenu、MobileMenu、PageToc、MobilePageToc、Search UI の役割と同時表示の制約を混同させていない。
- [x] 画像の意味に応じた `alt`、アイコンリンクの accessible name、`aria-current`、見出し階層、色以外の状態表現、タップ領域を確認している。
- [x] Search UI、PC 版 SiteMenu の階層 disclosure、MobileMenu、MobilePageToc のキーボード開閉、Esc 閉鎖、フォーカス移動・復帰、focus outline、関連 ARIA 属性、overlay 中の背景操作抑止を確認している。
- [x] contents 由来の指摘を、`.raw/contents` と公開実装を整合させないまま修正していない。
- [x] PageToc / MobilePageToc の 0 / 1 件表示を、`docs/requirements/layout-navigation.md` を基準として確認し、design notes との整合方針を記録している。
- [ ] 全 design target のVRT移行対象、route、状態、desktop / tablet / mobile coverageを一覧化し、欠けるbaselineは原因とともに報告している。
- [ ] VRT baseline更新前に、既存正本との差分を確認し、requirements、out-of-scope、global style、layout directionとの整合を確認している。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [ ] 関連する `docs/TODO.md` と既存 `docs/design/` に矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

Phase A では Git 管理ファイルを変更しない。検証レポートは `.tmp/review/49-50-accessibility-responsive-pass/validation-report.md` に置く。Phase B の修正計画は `.tmp/review/49-50-accessibility-responsive-pass/fix-plan.md` に置く。

Phase B / C で変更するファイルは、Phase A の結果と修正計画で限定する。候補は以下だが、すべてを変更対象にはしない。

- `src/components/layout/` 配下の Header、SiteMenu、MobileSiteMenuDrawer、PageToc、MobilePageToc
- `src/components/search/` 配下の検索 UI
- `src/components/_common/` および各ページ・データ Component の画像、リンク、見出し構造
- `src/layouts/`、`src/styles/`、`src/scripts/` の必要最小限の関連ファイル
- `tests/visual/` または `tests/node/` の必要最小限の既存確認
- `docs/issue/49-50-accessibility-responsive-pass.md` の完了条件・チェックポイント

Phase Dでは、全 `docs/design/<design-target>/` の既存正本画像をPlaywright標準VRT baseline snapshotへ移し、`notes.md` をVRT参照へ更新する。tablet baselineは各targetの状態に応じた明確なsnapshot名で追加する。

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

- VRT baseline移行はこのissueのPhase Dで扱う。baselineの初回作成・更新は、Phase Cの差分をレビューした後の明示指示まで実行しない。
- ユーザー指示により、`50-1-vrt-css-regression-guards` は本issueのPhase Dへ統合した。`docs/plan.md` に独立taskは残さず、Phase DでVRTのroute・状態・3 viewport baseline、横overflow・MobilePageToc・TOC非表示の回帰検知を扱う。
- 検証・修正計画・修正実装の各段階で、未確認事項とユーザー判断が必要な項目を混在させずに報告する。
- Phase A の完了報告は本 issue の実装承認ではない。Phase B の修正計画を確認した後、ユーザーが「修正開始」と明示した場合にだけ Phase C へ進む。
- ユーザー指示により、Phase Cの完了・レビュー後にはPhase Dで全design正本をPlaywright標準VRT baselineへ移行する。Phase DはVisual Reviewのactual screenshotをそのまま正本化する工程ではなく、既存正本との差分とSSoT整合を確認した上で、ユーザーの明示指示時だけbaselineを更新する。

## レビュー指摘 1

レビュー元: local PR review（PR #68、`2b594125c0d8281d4646232048ba3d1fc611d461..414ef05443e10f0ced1466ca41bc8036f87b0967`）

### [中] Header/Footer design notes が現行実装と一致しない

- 判定: valid
- 根拠: `docs/design/header-footer/notes.md` は、廃止済みのタイトルロゴ用テキストfallbackと、削除済みの黒文字比較ロゴassetを現行stateとして記録している。
- 影響: 後続のdesign作業・レビューが、実在しないassetまたは実装されないfallbackを制約として誤認する。
- 対応方針: Phase Dのnotes-only移行で、現存するWebPロゴだけを現行stateとして記録し、比較assetの記述は削除理由または代替の比較根拠へ置き換える。Phase D開始前にこの一点だけを更新する場合は、別途ユーザーの明示指示を得る。

### 判断保留: Phase D と `50-1-vrt-css-regression-guards` の責務境界

- 判定: doubtful（ユーザー判断待ち）
- 根拠: `docs/plan.md` の50-1にもVRT導入・viewport/route定義・CSS回帰検知がある。一方、ユーザーは本issueのPhase Dで全design正本をPlaywright標準VRTへ移行する方針を明示している。
- 方針: ユーザー指示を優先して自動的なrouting変更は行わない。Phase D開始前に、49-50にPhase Dを残して50-1を再定義するか、50-1へ移して49-50から参照するかを決定する。

### 対応完了チェックリスト

- [x] Phase Dと50-1の責務分担をユーザー確認のうえで明文化する。
- [x] `header-footer` のnotesを現行WebP実装と整合させる、またはPhase Dのnotes-only移行で置き換える。
- [ ] 対応後に必要なVRT・`npm run check`・`npm run build`を実行する。
