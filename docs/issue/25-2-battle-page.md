# 25-2-battle-page

## 目的

PL向けの戦闘ルールページ `/rules/battle` を作成し、ネオン・アンダーレルムTRPGの中核である攻撃、リアクション、攻撃基準値、コンボ、掛け合い、気絶と死亡、特別ルール、覚悟、バッドステータス、地形効果を、既存のルールサイトで順に読める形にする。

## 背景

`docs/plan.md` の `25-2-battle-page` は、攻撃、リアクション、コンボ、掛け合い等を配置する戦闘ルールページを求めている。contents入力 [.raw/contents/battle.md](/home/ryo/src/neon-underrealm-trpg/.raw/contents/battle.md) は、ユーザー指定のv1.0内部優先順（V1.5整理、ルールブック、無料GMブック、無料PL向けルールブック）に従って作成され、contents reviewerによる第2回レビューで追加指摘なしと確認済みである。

ユーザーは `public/images/battle/hero.webp` を配置済みであり、H1直後に表示する。ユーザー指示により、このページ固有のinitial design draftおよびdesign画像生成は行わない。既存の共通designを参照して実装し、実装後のVisual Reviewとdesign正本化はユーザー承認のもとで扱う。

関連する参照先は以下。

- `docs/requirements.md`
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md` の「戦闘ルール実装後、シナリオ終了後処理から死亡・覚悟の詳細へフラグメントリンクを置く」
- `.raw/contents/battle.md`
- `.raw/contents/scenario-play.md`
- `docs/design/rules/`
- `docs/design/scenario-play/`
- `docs/design/global-styles/`
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/mobile-page-toc/`
- `docs/design/callout/`

## 対象範囲

- `src/pages/rules/battle.mdx` を新規作成し、`.raw/contents/battle.md` のfrontmatter、本文、HTMLコメント指示をもとに実装する。
- H1直後に既存の`ImageBlock`で `/images/battle/hero.webp` を表示する。altは「長柄刀を振るう傷だらけの女性と、巨大なサイバネ義手で受け止める影の男が、火花を散らして対峙するイラスト。」とし、`loading="eager"`、captionなし、ページ側の追加overlayなしを守る。
- `MDXLayout`、`ImageBlock`、`Callout`、`InternalLink`、既存のSiteMenu、PageToc、MobilePageTocを利用する。Header、Footer、共通layoutを変更しない。
- 戦闘がマス目で位置と距離を管理すること、攻撃種別と対象、リアクション、戦闘に使える武器、ラウンド、イニシアチブ、手番と行動を配置する。
- V1.5適用後の攻撃基準値、気合、コンボ、掛け合いを配置する。牽制・渾身・通常リアクションとしての受けを復活させない。
- カウンターを、防御または回避に重ねない独立した特別リアクションとして説明し、通常ダメージ処理ではなくカウンター固有のダメージ処理後にコンボが終了することを明記する。
- `.raw/contents/battle.md` の指示どおり、3回攻撃のコンボ例と防御成功でコンボが終了する例を、それぞれ`example` Calloutで表示する。Callout titleは見出し化しない。
- 気絶と死亡、戦闘終了時の気合、暗器、装填、複数体攻撃、隠密、カバーリング、覚悟、バッドステータス、地形効果、飛行を配置する。クロスコンボは本文に掲載しない。
- `src/pages/rules/scenario-play.mdx` と `.raw/contents/scenario-play.md` の戦闘参照を、build後に確認した`気絶と死亡`および`覚悟`の実際のフラグメントIDを使う `/rules/battle#...` のリンクへ更新する。
- `src/pages/character-making.mdx` と `.raw/contents/character-making.md` に残るV1.5適用前の戦闘技能・リアクション・防御力説明を、戦闘ページの規則と整合させる。「受け」を通常リアクションとして掲載せず、防御・回避は筋力・敏捷・感覚、耐え・抵抗は肉体・精神のいずれかを選んで判定する説明へ更新する。防御力の算出も、ベース防御力へ筋力を重ねないV1.5の前提と一致させる。
- desktop / mobileのVisual Review用testを追加または更新する。実装後に撮影したactual screenshotを、ユーザー確認なしにdesign正本へコピーしない。

## 初期スコープ外

- このページ固有のinitial design draft、`design-image-generation`、Heroの再生成・差し替え・追加overlay、画像最適化パイプラインを実施しない。
- ダイスローラー、ダメージ計算機、戦闘シミュレーター、コンボビルダー、行動順管理、状態管理、キャラクターシートを実装しない。
- GM向け裁定、エネミー運用、マップ作成、シナリオ本文、オンラインツール運用を掲載しない。
- 流儀、スキル、アイテムのデータ構造、Excel / JSON変換、個別データページを実装しない。
- Header、Footer、SiteMenu、PageToc、MobilePageToc、共通Calloutの再設計、検索、パンくず、前後ナビゲーションを実装しない。
- 新規npm package、CMS、DB、認証、SSR、API、PWAを追加しない。
- Google Driveへ書き込まない。`docs/plan.md` のチェックボックスを更新しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] `src/pages/rules/battle.mdx` に`MDXLayout`、title、description、`showPageToc: true`を設定している。
- [x] `.raw/contents/battle.md` の本文とHTMLコメント指示に従い、戦闘の全見出し・表・例を実装している。
- [x] H1直後に提供済みheroを`ImageBlock`で表示し、指定alt、`loading="eager"`、captionなし、追加overlayなしを守っている。
- [x] 戦闘がマス目で位置と距離を管理すること、攻撃種別と対象、リアクション、武器、ラウンド、イニシアチブ、手番を掲載している。
- [x] V1.5の攻撃基準値、気合、コンボ増加値、リアクション固定、掛け合いを掲載し、牽制・渾身・通常リアクションとしての受けを掲載していない。
- [x] カウンターが防御・回避に重ねられない独立した特別リアクションであり、カウンター固有のダメージ処理後にコンボを終えることを掲載している。
- [x] 3回攻撃のコンボ例と防御成功例を`example` Calloutで掲載し、Callout titleをPageTocへ混入させていない。
- [x] 気絶と死亡、戦闘終了時の処理、特別ルール、覚悟、バッドステータス、地形効果、飛行を掲載し、クロスコンボを掲載していない。
- [x] 戦闘中に使える武器が増えた場合に限り、攻撃ごとに使う武器を変更できることを掲載している。
- [x] `src/pages/rules/scenario-play.mdx` と `.raw/contents/scenario-play.md` の死亡・覚悟参照を、実際に生成された`/rules/battle#...`のフラグメントリンクへ更新している。
- [x] `src/pages/character-making.mdx` と `.raw/contents/character-making.md` の戦闘技能、リアクション、ベース防御力の説明をV1.5規則へ更新し、戦闘ページ本文と矛盾していない。
- [x] 初期design draftを作成せず、実装後のVisual Reviewを行う。design正本化はユーザー承認後にだけ行う。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] `/rules/battle`、`/rules`、`/rules/scenario-play`、`/advancement`、`/data`への内部リンクと、死亡・覚悟へのフラグメントリンクがGitHub Pagesのサブパス公開で壊れない。
- [x] build後の生成HTMLで、死亡・覚悟の実際のIDとシナリオ進行ルールからのリンク先を確認している。
- [x] desktop / mobileでHero、表、2つのCallout、本文に横overflowや可読性の低下がない。
- [x] Hero右下のasset内要素をページ側で重ねて表示せず、隠蔽もしていない。
- [x] PageTocとMobilePageTocに不要なCallout titleを見出しとして含めていない。
- [x] 既存ルート、SiteMenu、PageToc、MobilePageToc、共通Calloutを壊していない。
- [x] 不要な依存関係を追加していない。
- [x] 戦闘処理の自動化やGM向け本文を混入させていない。
- [x] 関連TODOを、このissueのフラグメントリンク更新として回収している。
- [x] `/character-making` の戦闘技能表と副能力値の防御力説明が、V1.5の戦闘ページ規則と矛盾していない。
- [x] `docs/design/rules/`、`docs/design/scenario-play/`、`docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/callout/`の既存制約と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/25-2-battle-page.md`
- `public/images/battle/hero.webp`
- `src/pages/rules/battle.mdx`
- `.raw/contents/battle.md`
- `src/pages/rules/scenario-play.mdx`
- `.raw/contents/scenario-play.md`
- `src/pages/character-making.mdx`
- `.raw/contents/character-making.md`
- `tests/visual/` 配下のbattle用Visual Review test
- 必要に応じてVisual Review用のtest設定

## レビュー観点

- PLがマス目戦闘の開始から攻撃、リアクション、コンボ、掛け合い、戦闘終了までを順に理解できるか。
- V1.5の攻撃基準値・リアクション・カウンター規則が、旧来の牽制、渾身、受けと混ざらずに表示されるか。
- 2つの`example` Calloutが、数値例を補助しつつ通常ルールの読み順を阻害しないか。
- 提供Heroが既存の本文幅、PageToc、MobilePageToc、Calloutと整合し、captionや追加overlayなしで表示されるか。
- initial design draftを作成しない指定と、実装後のVisual Reviewを行う方針が明確か。
- `docs/TODO.md` の死亡・覚悟へのフラグメントリンク更新を、このissueで回収してよいか。
- キャラクターメイキングの戦闘技能・リアクション・防御力説明をV1.5規則へ更新する範囲が、戦闘ページとの整合に必要な最小限になっているか。

## 備考

`.raw/contents/battle.md` はGit管理外のローカル作業入力であり、contents reviewの第2回結果は `.tmp/review/25-2-battle-page/` にある。Google Drive同期は `raw-to-drive-sync` の明示指示があるまで実行しない。

`public/images/battle/hero.webp` はユーザーが配置した未追跡assetである。issue準備では追加・変更・削除せず、実装後にユーザーがcommitを明示指示した場合だけ対象差分を確認してGitへ追加する。

ユーザー指示により、`design-image-generation` のinitial draftは不要とする。Visual Review screenshotは実装結果であり、design正本ではない。design正本化はユーザー承認後だけ行う。

ユーザーはissue review中に、キャラクターメイキングに残るV1.5適用前の説明をこのissueで整合させるよう明示した。このscope追加は、戦闘ページ本文と既存のPL向けキャラクター作成説明を同じ規則にそろえるための最小範囲とする。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/rules/`、`docs/design/scenario-play/`、`docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/callout/`
- reference desktop: `docs/design/rules/design-desktop.png`、既存共通designのdesktop画像とnotes
- reference mobile: `docs/design/rules/design-mobile.png`、`docs/design/site-layout/design-mobile.png`、既存共通designのmobile画像とnotes
- notes: ユーザー指示により、ページ固有のinitial design draftは作成していない。既存の本文幅、Hero、PageToc、MobilePageToc、Calloutの制約を比較対象とした。

### 成果物

- actual desktop: `test-results/visual/battle-desktop.png`
- actual mobile: `test-results/visual/battle-mobile.png`
- report: `tests/visual/battle.spec.ts`

### レビュー結果

| 領域                  | 判定 | 差分                                                                          | 対応 |
| --------------------- | ---- | ----------------------------------------------------------------------------- | ---- |
| レイアウト            | OK   | 既存の3カラム本文layout内に収まる。                                           | 不要 |
| 余白                  | OK   | Hero、見出し、表、Calloutの間隔は既存本文ページと整合する。                   | 不要 |
| タイポグラフィ        | OK   | H2/H3、本文、表の読み順を維持する。                                           | 不要 |
| 色                    | OK   | Heroの色彩を本文UIへ広げず、既存Calloutを利用する。                           | 不要 |
| 配置・整列            | OK   | H1直後のHero、本文幅、desktop PageTocの配置を確認した。                       | 不要 |
| レスポンシブ          | OK   | 390px mobileでHero、表、Callout、MobilePageTocを確認した。                    | 不要 |
| overflow / scroll     | OK   | battle、scenario-play、character-makingの7件のVisual testで横overflowがない。 | 不要 |
| 既存デザインとの整合  | OK   | 既存共通designの本文ページ制約と矛盾しない。                                  | 不要 |
| 既存Componentとの整合 | OK   | `ImageBlock`、`Callout`、`InternalLink`を既存仕様のまま利用する。             | 不要 |
| accessibility basics  | OK   | Heroのalt、Callout titleの非見出し化、MobilePageTocの操作を確認した。         | 不要 |

### 自己修正した項目

- [x] battle用Visual testのCallout locatorを個別Calloutに絞った。
- [x] PageToc postprocess済みのbuild後previewをcapture対象にした。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
