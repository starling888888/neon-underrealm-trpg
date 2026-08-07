# milestone-02-phase-02-gm-section-g01-gm-guide

## 目的

GMセクションの開始ページとして、`/gm/`に短い案内を掲載する。

掲載する本文は、次の1文だけとする。

> 現在、鋭意作成中です。サンプルシナリオをお楽しみください。

詳細なGMガイドは本Gateで作成せず、`docs/TODO.md`で後続taskとして追跡する。

## 背景

ユーザー指示により、当初予定していた初期作成PC向けセッションの進行ガイドは作成しない。G6で最初のサンプルシナリオが公開される初回公開時に、読者へそのシナリオを案内する最小限のGM開始ページとする。

G2以降のエネミー情報、キャンペーンフック、サンプルシナリオは未完成の間、G1のメニューまたは本文から先取りしない。

## Gate関係

- 親issue: `docs/issue/milestone-02-phase-02-gm-section.md`
- Gate plan: `docs/issue/milestone-02-phase-02-gm-section/plan.md`
- Gate: `G1: GMセクション開始の案内`
- 親branch: `milestone-02-phase-02-gm-section`
- 子branch: `milestone-02-phase-02-gm-section-g01-gm-guide`

## 対象範囲

- `.raw/contents/gm.md`を、frontmatterとHTMLコメントの`矛盾点`節を含む手動編集用の初稿として更新する。
- ユーザーによるcontents確認後の明示実装指示時だけ、`src/pages/gm/index.mdx`へ同じ1文を掲載する。
- 後続の明示実装指示時だけ、`src/lib/site/menu.ts`、`src/components/layout/SiteMenu.astro`、`src/components/layout/SiteMenuItem.astro`と必要最小限のstyle・testを更新する。
  - 「はじめに」の直後に非リンクの「PLセクション」を追加する。
  - 「キャラクター成長」の直後に非リンクの「GMセクション」とGMガイドへのリンクを追加する。
  - GMガイドの後ろに区切り線を追加し、その下に「キャラクターシート」、続けて「サポート」を置く。
  - 非リンク見出しと区切り線を、偽のURLを持つリンクとして扱わない。
- G1完了時のGMセクションには、完成済みのGM開始ページだけを表示する。
- ユーザーが配置した`public/images/gm/hero.webp`を、既存の`ImageBlock`と共通画像寸法を用いて`/gm/`の本文先頭へ掲載する。

## 今回の作業境界

ユーザーの明示実装指示により、`.raw/contents/gm.md`の短い案内文を`/gm/`へ反映し、site menuと必要最小限のtestを更新する。ユーザーが追加したhero画像は、既存のページ画像構造に沿って掲載する。Visual Reviewは既存designと対象VRTの範囲で実施するが、新規design notesやVRT baselineは作成・更新しない。

## 初期スコープ外

- GMの役割、セッション準備、ハンドアウト、シーン進行、NPC、判定、縁、覚悟、気合、裁定などを説明する詳細なGMガイド本文
- G2以降のエネミー、ボス、三下・徒党、キャンペーンフック、サンプルシナリオのページ・メニュー・リンク
- hero画像の作成、placeholder、画像最適化
- CSS、layout、共通Component、メニューComponentの再設計。非リンク見出しと区切り線を表現する最小限のmenu型・描画・style変更は、後続実装時に限り許可する。
- 新規のdesign notes、design画像、VRT baselineの作成または更新
- PL向けルール本文の変更、ルール自体の追加・改定
- ダイスローラー、シナリオ作成ツール、CMS、DB、認証、SSR、投稿機能

## 完了条件

- [x] `/gm/`に「現在、鋭意作成中です。サンプルシナリオをお楽しみください。」だけが掲載される。
- [x] G1完了時のGMセクションには、未完成のGM項目を表示していない。
- [x] サイトメニューにPL/GMの区分見出し、GMガイド、GMセクション後の区切り線がある。
- [x] 詳細なGMガイド作成が`docs/TODO.md`で後続taskとして追跡されている。
- [x] 新規design notes、design画像、VRT baselineを作成または更新していない。
- [ ] desktop、tablet、mobileの対象route・menu状態を実画面で確認している。
- [x] 対象test、`npm run check`、`npm run build`が通る。

## チェックポイント

- [x] 既存ルート、既存のPL向けメニュー、GitHub Pagesのサブパス公開を壊していない。
- [x] サイトメニューは最大3階層を維持する。
- [x] 未完成ページ、準備中ページ、ダミーリンクを追加していない。
- [x] 不要なnpm dependencyを追加していない。
- [x] `docs/TODO.md`のGMレビュー・トリアージ項目を本Gateで完了扱いにしていない。
- [x] 初期スコープ外の機能を実装していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/milestone-02-phase-02-gm-section-g01-gm-guide.md`
- `docs/issue/milestone-02-phase-02-gm-section.md`
- `docs/issue/milestone-02-phase-02-gm-section/plan.md`
- `docs/TODO.md`
- `.raw/contents/gm.md`（Git非管理の手動編集用contents）

ユーザーによるcontents確認後の明示実装指示時だけ変更する候補:

- `src/pages/gm/index.mdx`
- `src/lib/site/menu.ts`
- `src/components/layout/SiteMenu.astro`
- `src/components/layout/SiteMenuItem.astro`
- 必要最小限のGM開始ページ・サイトメニューtest

## レビュー観点

- 公開本文が指定された1文だけであり、詳細なGMガイドや一般的なTRPG論を混ぜていないか。
- 詳細なGMガイド作成が後続TODOへ明確に移されているか。
- G1以外の未完成GM項目をメニューや本文に表示していないか。
- 既存のsite menu / layoutを再設計せず、親issueの区分見出しと区切り線を満たせているか。

## ビジュアルレビュー

- 既存の`@site-menu`（desktop / tablet / mobile）と`@site-layout @mobile-menu-open`を対象限定で実行した。actual screenshotは出力され、メニューの表示状態を確認できたが、対応するcanonical snapshotがリポジトリにないため、比較は失敗した。
- `/gm/`のdesktop / tablet / mobileおよびmobile menu openには、既存VRT target・locator screenshotがない。新規target・baselineは本Gateのスコープ外である。
- よって、実画面確認の完了条件は未確認のままとし、baselineまたはcapture基盤を別途整備するまでG1を完了扱いにしない。

## ビジュアルレビュー 2

### VRT対象

- `@vrt @site-menu`: default / desktop / tablet / mobile
- `@vrt @site-layout`: default / desktop / tablet / mobile、mobile-menu-open / mobile、mobile-page-toc-open / mobile

### レビュー結果

- `npm run visual:capture -- --grep '@vrt.*@site-menu(?:\s|$)'`: 3件成功
- `npm run visual:capture -- --grep '@vrt.*@site-layout(?:\s|$)'`: 5件成功
- captureは一時snapshotの作成だけを確認する。既存scenarioに`/gm/`のlocator screenshotはなく、canonical comparisonも実施していないため、G1の実画面確認完了条件は未チェックのままとする。

## 備考

- 「サンプルシナリオをお楽しみください。」は、G6完了後の初回公開時に読者を案内する本文である。G1単独ではサンプルシナリオへのリンクを追加しない。
- ユーザー指示により、新規design notesは作成しない。
