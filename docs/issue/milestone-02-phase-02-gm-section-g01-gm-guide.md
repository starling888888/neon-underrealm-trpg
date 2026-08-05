# milestone-02-phase-02-gm-section-g01-gm-guide

## 目的

初期作成PC向けセッションの準備と進行を説明するGMガイドを`/gm/`へ追加する。

まず、GMが公開済みのPL向けルールを参照しながら、今回予告からエンディングまでを進行できるように、`.raw/contents/gm.md`へ本文初稿を作成する。ユーザーがその内容を修正した後、明示指示を受けてMDXとメニューへ反映する。

## 背景

親issueのG1として、GMセクションの最初の完成済みページを作る。G2以降のエネミー情報やサンプルシナリオは未完成のため、メニューや本文から先取りしない。

本文では一般的なTRPG運用論で不足部分を補わない。現行PL向けルールと、歴史資料である`.raw/v1.0/無料配布_GMブック.md`の「GMのやり方」を照合し、本システム固有の用語・処理・判断を扱う。

参照正本:

- `docs/issue/milestone-02-phase-02-gm-section.md`
- `docs/issue/milestone-02-phase-02-gm-section/plan.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/TODO.md` の「ゲーム設計レビューの未解決高優先度・GM項目をトリアージする」
- `src/pages/rules/index.mdx`
- `src/pages/rules/scenario-play.mdx`
- `src/pages/rules/battle.mdx`
- `src/pages/character-making.mdx`
- `src/lib/site/menu.ts`
- `.raw/v1.0/無料配布_GMブック.md`

## Gate関係

- 親issue: `docs/issue/milestone-02-phase-02-gm-section.md`
- Gate plan: `docs/issue/milestone-02-phase-02-gm-section/plan.md`
- Gate: `G1: GMガイド`
- 親branch: `milestone-02-phase-02-gm-section`
- 子branch: `milestone-02-phase-02-gm-section-g01-gm-guide`

## 対象範囲

- `.raw/contents/gm.md`を作成する。frontmatter、HTMLコメントの`矛盾点`節、通常Markdownの本文を含める。
- 本文初稿は、このissue、現行PL向けMDX、`.raw/v1.0/無料配布_GMブック.md`を根拠にする。ユーザーによる手動修正を待ち、現在は`src/pages/gm/index.mdx`を作成しない。
- ユーザーによる手動修正後に明示指示を受けた場合だけ、`src/pages/gm/index.mdx`を追加し、`/gm/`にGMガイドを公開する。
- ユーザーが配置する`public/images/gm/hero.webp`を、既存の`ImageBlock`の利用規約に従ってGMガイドのheroとして表示する。assetが未配置の間は、代替画像やplaceholderを作成しない。
- 次の内容を、現行PL向けルールへ必要最小限の内部リンクを置きながら説明する。
  - GMの役割とセッション前準備
  - 今回予告、ハンドアウト、物語の縁
  - オープニング、ミドル、情報収集、中間戦闘、休息、クライマックス、エンディング
  - NPCと情報の提示
  - 判定を要求するタイミング、使用技能・目標値、PLによる別技能の提案
  - 判定失敗で進行を止めない考え方
  - ルール判断に迷った場合の裁定
  - シナリオ中の縁と覚悟、戦闘間の気合
- ユーザーだけが確定できる設定、固有名詞、演出、数値、裁定方針は、contents初稿中に非表示の`<!-- TODO(user): ... -->`コメントとして残す。
- 後続の明示実装指示後、`src/lib/site/menu.ts`、`src/components/layout/SiteMenu.astro`、`src/components/layout/SiteMenuItem.astro`と必要最小限のstyle・testを更新し、「はじめに」の直後に非リンクの「PLセクション」、「キャラクターシート」の直後に非リンクの「GMセクション」、GMガイドのリンク、GMセクションと「サポート」の間の区切り線を追加する。
- 非リンク見出しと区切り線は、偽のURLを持つリンクとして扱わない。既存のリンク項目、階層、現在地表示、アクセシビリティを維持したまま、必要最小限のmenu型と描画を追加する。
- G1完了時のGMセクションには、完成済みのGMガイドだけを表示する。

## 今回の作業境界

今回ユーザーが明示許可した作業は、`.raw/contents/gm.md`の初稿作成だけである。MDX、site menu、heroの表示、test、Visual Reviewは、ユーザーが内容を修正して実装を明示指示するまで変更しない。

## 初期スコープ外

- G2以降のエネミー、ボス、三下・徒党、キャンペーンフック、サンプルシナリオのページ・メニュー・リンク
- 機龍、悪魔ボス、外道スキルの入力、変換、schema、表示Component
- CSS、layout、共通Component、メニューComponentの再設計。非リンク見出しと区切り線を表現するための最小限のmenu型・描画・style変更は許可する。
- 新規のdesign notes、design画像、VRT baselineの作成または更新
- hero以外の画像作成、heroの代替asset、画像最適化パイプライン
- PL向けルール本文の変更、ルール自体の追加・改定
- 一般的なTRPG論で本システム固有の未確定事項を補うこと
- ダイスローラー、シナリオ作成ツール、CMS、DB、認証、SSR、投稿機能

## 完了条件

- [ ] `/gm/`が初期作成PC向けの完成済みGMガイドとして表示される。
- [ ] ユーザー配置済みの`/images/gm/hero.webp`をheroとして表示する。
- [ ] セッション準備からエンディングまでの流れ、GM裁定、PL提案の扱いを説明している。
- [ ] 現行PL向けルールを全文再掲せず、必要なページへ内部リンクしている。
- [ ] `.raw/v1.0/無料配布_GMブック.md`と現行PL向けルールの差異を、歴史資料だけを根拠に現行ルールへ戻す形で採用していない。
- [ ] ユーザーだけが確定できる箇所に`TODO(user)`コメントを残している。
- [ ] サイトメニューにPL/GMの区分見出し、GMガイド、GMセクション後の区切り線があり、未完成のGM項目を表示していない。
- [ ] 既存の`docs/design/site-layout/notes.md`と`docs/design/site-menu/notes.md`のlayout・メニュー制約を維持し、新規design notesを作成していない。
- [ ] desktop、tablet、mobileの対象route・menu状態を実画面で確認している。
- [ ] 対象test、`npm run check`、`npm run build`が通る。

## チェックポイント

- [ ] 既存ルート、既存のPL向けメニュー、GitHub Pagesのサブパス公開を壊していない。
- [ ] GMガイドだけが完成済みGM項目として表示される。
- [ ] サイトメニューは最大3階層を維持する。
- [ ] 既存layoutと共通Componentを再設計していない。
- [ ] 不要なnpm dependencyを追加していない。
- [ ] `docs/TODO.md`のGMレビュー・トリアージ項目を本Gateで完了扱いにしていない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/milestone-02-phase-02-gm-section-g01-gm-guide.md`
- `docs/issue/milestone-02-phase-02-gm-section/plan.md`（G1の着手状態）
- `.raw/contents/gm.md`（今回作成するGit非管理の手動編集用初稿）

ユーザーによる手動修正後の明示実装指示時だけ変更する候補:

- `src/pages/gm/index.mdx`
- `src/lib/site/menu.ts`
- `src/components/layout/SiteMenu.astro`
- `src/components/layout/SiteMenuItem.astro`
- 必要最小限のGMガイド・サイトメニューtest

ユーザーが別途配置するasset:

- `public/images/gm/hero.webp`

## レビュー観点

- 本文が一般的なTRPG論ではなく、本システムのシーン構造、縁、覚悟、気合、判定、GM裁定へ一貫しているか。
- 現行PL向けルールと矛盾または暗黙の変更をしていないか。
- ユーザーが書くべき内容を、見える仮文ではなく`TODO(user)`コメントとして残せているか。
- GMガイド以外の未完成項目をメニューや本文に表示していないか。
- 既存のsite menu / layout designを変更せず、親issueの区分見出しと区切り線を満たせているか。

## 備考

- ユーザー指示により、本文初稿は`.raw/contents/gm.md`へ作成してユーザーが直接修正する。Git管理のMDXは、修正済みcontentsを受けた明示指示後に作成する。
- ユーザー指示により、新規design notesは作成しない。既存の`site-layout`と`site-menu`を参照し、MDX本文と最小限のメニュー定義だけを変更する。
- G2の入力はG1完了後に提供される。本Gateでは待機・推測・代替実装をしない。
