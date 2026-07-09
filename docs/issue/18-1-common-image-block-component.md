# 18-1-common-image-block-component

## 目的

共通画像Component `ImageBlock.astro` を作成し、ユーザー提供の画像をトップページに仮配置して表示確認できる状態にする。

このタスクでは、以下を満たす。

- `src`, `alt`, `caption` を指定できる
- GitHub Pages等のサブパス公開でも画像パスが壊れない
- `loading="lazy"` に対応する
- ユーザー提供のタイトルロゴ画像をトップページに仮配置して表示確認できる
- Markdown / MDX本文またはAstroページから利用できる
- トップページ以外の後続ページでも再利用できる共通Componentとして扱える

## 背景

`docs/plan.md` の `18-1-common-image-block-component` を実施する。

Phase 3ではトップページ、更新履歴ページ、ワールドガイド、キャラクターメイキングなどのページ作成へ進む。これらのうち、トップページではタイトルロゴ枠、後続ページではキービジュアル、ワールドガイド用イラスト、ルール説明用図解などの画像表示が必要になる。

`docs/requirements/assets-seo.md` では、Markdown / MDXページ内で画像を表示できること、画像を静的アセットとして管理すること、base pathを考慮して参照すること、`alt` と必要に応じた `caption` を扱うこと、可能な範囲で lazy loading を適用することが要件として定義されている。

`ImageBlock` は画像表示だけを担当する小さな共通Componentであり、このIssueでは新規design targetやdesign画像を追加しない。見た目の作り込みやトップページhero設計は後続の `18-2-home-page` で扱う。このIssueでは、既存の本文幅・base path・アクセシビリティ方針に沿って、画像が破綻なく表示されることを確認する。

関連TODO:

- `docs/TODO.md` に、このタスクへ直接回収すべき未対応TODOは見当たらない。

関連design target:

- 新規作成なし
- 既存整合参照:
  - `docs/design/global-styles/notes.md`
  - `docs/design/base-layout/notes.md`
  - 必要に応じて `docs/design/site-layout/`

design-image-generation前提条件:

- なし
- `ImageBlock` は画像を表示するだけのComponentであるため、このIssueでは `docs/design/image-block/` を作成しない。

## 対象範囲

このタスクで扱う。

- `src/components/_common/ImageBlock.astro` の作成
- 画像URLのbase path対応
- `src/lib/utils/paths.ts` の既存 `withBase` helper利用
- `src`, `alt`, `caption` propsの定義
- `loading` propsの定義
- `loading` 未指定時の既定値を `lazy` にする
- 装飾目的画像向けに空 `alt` を許容する
- captionがある場合のみ `<figcaption>` を表示する
- captionがない場合も画像単体の表示が破綻しない構造にする
- ユーザー提供画像 `public/top_logo.webp` または `public/top_logo.png` をトップページに仮配置する
- トップページ仮配置で `ImageBlock` のAstroページ利用を確認する
- MDX本文から import して利用できることの確認
- PC / mobile幅で画像が本文幅をはみ出さないことの確認
- `npm run check`
- `npm run build`

実装方針の初期案:

- Component配置は `src/components/_common/ImageBlock.astro` とする。
- 画像Componentは、特定ページ専用ではなく本文内で再利用される小さな共通Componentとして扱う。
- 画像表示は原則として `<figure>` / `<img>` / optional `<figcaption>` で構成する。
- `src` はComponent内で `withBase(src)` を通して扱う。
- `src` が外部URL、protocol-relative URL、hash、空文字列である場合の扱いは既存 `withBase` helperに従う。
- 高度な画像最適化やレスポンシブ画像生成は行わない。
- トップページへの配置は表示確認用の仮置きとし、hero layoutやページデザインの確定は `18-2-home-page` に残す。

## 初期スコープ外

このIssueでは以下を扱わない。

- `docs/design/image-block/` の作成
- `docs/design/image-block/design-desktop.png` の作成
- `docs/design/image-block/design-mobile.png` の作成
- トップページ `/` の本実装
- トップページhero / キャッチコピー枠の設計
- 更新履歴ページの作成
- ワールドガイド等の本文ページ作成
- 画像ファイルの生成
- タイトルロゴ画像の生成、加工、再デザイン
- 画像の自動リサイズ
- 複数解像度画像の生成
- `srcset` / `sizes` を用いた高度なレスポンシブ画像生成
- CDN連携
- 画像最適化パイプラインの追加
- Astro Image integration等の新規画像最適化依存関係追加
- OGP画像生成
- 個別ページOGP画像設定
- 画像アップロードUI
- CMS
- DB
- 認証
- SSR
- API server
- PWA
- 検索UI
- ダイスローラー
- キャラクターシート機能
- 戦闘シミュレーター
- GMガイド、シナリオ、NPC、エネミー用画像ページ
- `docs/plan.md` のチェック更新
- GitHub Issue作成
- PR作成
- commit / push

## 完了条件

- [x] `src/components/_common/ImageBlock.astro` が作成されている
- [x] `src` propで画像を指定できる
- [x] `alt` propで画像の代替テキストを指定できる
- [x] 空 `alt` を指定できる
- [x] `caption` prop指定時のみキャプションが表示される
- [x] `caption` 未指定時に不要な空要素が出ない
- [x] `loading` propを指定できる
- [x] `loading` 未指定時は `lazy` として扱われる
- [x] 画像パスがbase path対応になっている
- [x] ユーザー提供画像 `public/top_logo.webp` または `public/top_logo.png` をトップページに仮配置して表示確認している
- [x] トップページ仮配置が `18-2-home-page` の本実装範囲を先取りしていない
- [x] 画像が本文幅を超えてページ全体の横スクロールを発生させない
- [x] PC / mobile幅でComponent表示が破綻しない
- [x] Markdown / MDX本文から利用できることを確認している
- [x] Astroページから利用できることを確認している
- [x] トップページ以外の後続ページでも再利用できるComponent APIになっている
- [x] 関連TODOを扱っていない理由が記録されている
- [x] 新規design targetやdesign画像を追加しない判断が記録されている
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] `docs/design/global-styles/` の白寄り背景、暗めグレー、青緑accent、実務的密度の方向性を壊していない
- [x] `docs/design/base-layout/` / `docs/design/site-layout/` の本文幅・左右レール前提を壊していない
- [x] 画像表示がランディングページ風の過剰なhero表現へ寄っていない
- [x] 高度な画像最適化をこのIssueへ混ぜていない
- [x] title logo対応を、このComponentの汎用性を壊す専用実装にしていない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/18-1-common-image-block-component.md`
- `src/components/_common/ImageBlock.astro`
- `src/pages/index.astro`

必要に応じて変更する可能性があるファイル:

- `src/pages/mdx-test.mdx`
  - MDX本文からの利用確認が必要な場合のみ。
  - 不要であれば変更しない。
- `src/lib/utils/paths.ts`
  - 既存 `withBase` helperで不足がある場合のみ。
  - 不要であれば変更しない。
- `src/styles/prose.css`
  - `ImageBlock` ではなくMarkdown標準画像の最低限表示に関わる必要が明確な場合のみ。
  - 不要であれば変更しない。

## レビュー観点

人間レビュー時に確認してほしい観点。

- `ImageBlock` の責務が、画像表示の共通Componentとして十分に狭いか
- トップページ仮配置が、後続の `18-2-home-page` のhero設計を先取りしすぎていないか
- `src`, `alt`, `caption`, `loading` だけで初期実装として足りるか
- `variant`、`class`、`width`、`height` 等の追加propsが必要か、それとも早すぎる拡張か
- `caption` の見た目がルールサイト本文の密度と合っているか
- mobile幅で画像とcaptionが読みやすいか
- base path対応が既存 `withBase` 方針と一致しているか
- `loading="lazy"` を既定値にする方針でよいか
- 装飾目的画像の空 `alt` 許容がアクセシビリティ要件と矛盾していないか
- 高度な画像最適化をこのIssueで扱わない判断でよいか
- 新規 `docs/design/image-block/` を作らない判断でよいか

## 備考

ローカル検証済み事項:

- 現在の作業branch: `18-1-common-image-block-component`
- local issue file: `docs/issue/18-1-common-image-block-component.md`
- `docs/plan.md` に `18-1-common-image-block-component` が存在する
- `docs/TODO.md` に、このIssueへ直接回収すべき未対応TODOは見当たらない
- `public/title_logo.webp` と `public/title_logo.png` が存在する
- `public/top_logo.webp` と `public/top_logo.png` が存在する
- `src/components/_common/` が存在する
- `src/lib/utils/paths.ts` に `withBase` helperが存在する
- `src/pages/index.astro` が存在し、トップページ仮配置の確認先として利用できる
- `docs/design/image-block/` は存在しないが、ユーザー指示によりこのIssueでは追加しない

実装後の検証結果:

- `npm run format` 成功
- `npm run check` 成功
- `npm run build` 成功
- `http://127.0.0.1:4321/neon-underrealm-trpg/` でトップページ仮配置表示を確認
- `http://127.0.0.1:4321/neon-underrealm-trpg/mdx-test/` でMDX本文からの利用を確認
- Playwrightで desktop `1280x900` / mobile `390x900` の画像読み込み、base path、`loading="lazy"`、画像幅を確認
- MDX desktopのdocument全体には既存の右ページ内目次レール由来の横幅超過があるが、`ImageBlock` の画像要素はfigure幅およびviewportを超えていないことを確認
- 表示確認スクリーンショット:
  - `test-results/visual/home-desktop-image-block.png`
  - `test-results/visual/home-mobile-image-block.png`
  - `test-results/visual/mdx-desktop-image-block.png`
  - `test-results/visual/mdx-mobile-image-block.png`
  - `test-results/visual/mdx-image-desktop-decoded.png`
  - `test-results/visual/mdx-image-mobile-decoded.png`

このIssueは、remote snapshot draftをローカル検証済みのissue契約へ更新したものである。
