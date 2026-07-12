# 23-2-rules-page

## 目的

`/rules` に、光都暗域〈ネオン・アンダーレルム〉TRPGの基本判定を説明するルールトップページを作成する。判定数、基準値、達成値、効果値、目標値、対抗判定を読み順に整理し、達成値と効果値は具体例を `example` Callout で示す。H1直後には、ルールページ用のhero画像を表示する。

## 背景

`docs/plan.md` の `23-2-rules-page` は、PL向け基本ルールを読む入口となるルールトップページを作るタスクである。ローカル作業入力 `.raw/contents/rules.md` は、ユーザー指定の資料優先順で作成・再レビュー済みであり、基本判定、11d10の具体例、ゴールデンルールへのフラグメントリンク、シナリオルール・戦闘ルールへの導線、hero画像生成プロンプトを含む。

参照する正本・資料:

- `docs/requirements/pages.md`
- `docs/requirements/components.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/rules.md`
- `.tmp/review/23-2-rules-page/contents-review-2.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/callout/notes.md`

ユーザー指示により、`/rules` 専用のinitial design draftは作成しない。既存の共通designを参照して実装し、実装後のVisual Reviewとdesign正本化が必要になった場合は、その時点でユーザー承認を受ける。

## 対象範囲

- `src/pages/rules/index.mdx` を作成し、`.raw/contents/rules.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに実装する。
- H1直後に `ImageBlock` で `/images/rules/hero.webp` を表示する。`.raw/contents/rules.md` 指定の意味のあるalt文、`loading="eager"`、captionなし、追加overlayなしを守る。
- 基本判定の手順として、判定数、通常の基準値5、10面体ダイス、達成値、効果値を表示する。得意技能の非戦闘技能では能力値だけを2倍にし、修正は2倍にしないことを説明する。
- 筋力10、脅迫は得意技能ではない、サイバネで判定数+1、11d10、達成値6・効果値5の本文例を `Callout type="example"`、title `判定の例` で表示する。Callout titleは見出し化しない。
- 目標値、対抗判定、同値時は受動側が勝つことを表示する。
- `InternalLink` を使い、生成HTMLで確認済みの `/introduction#h-f3926bd3` へゴールデンルール参照を置く。`/introduction` の同見出しを変更した場合は、build後に実際のフラグメントIDを再確認する。
- 末尾に `/rules/scenario-play` のシナリオルールと `/rules/battle` の戦闘ルールへの導線を置く。
- `.raw/contents/rules.md` のHTMLコメントに残る「`/rules` 専用initial design draftを作成・承認する」旧指示を、ユーザー指定に従い「専用initial design draftは作成せず、既存共通designを参照する」へ更新する。ページ実装より先に、contents指示とissueの方針を一致させる。
- 準備中に更新済みの `docs/requirements/pages.md` と `docs/plan.md` を維持する。`/rules` の端数処理要件は削除済みであり、23-2はinitial design draftを作成しない方針へ更新済みである。計画チェックボックスは人間レビュー後の指示があるまで完了にしない。
- 実装確認用のVisual testを追加または更新し、既存の共通design参照との整合性を確認する。新規のinitial design draftは作成しない。contents review完了後、ユーザー承認済みの現行実装を `docs/design/rules/` のdesign fix正本として記録する。

## 初期スコープ外

- 端数処理、小銭による達成値上昇、所持信用の説明を `/rules` に掲載しない。前者はユーザー指示によりページ対象外、後二者はシナリオ進行ルール側で扱う。
- 攻撃、リアクション、コンボ、掛け合い、ダメージ、気合、攻撃基準値の具体値を掲載しない。これらは `25-2-battle-page` の対象とする。
- シーン、情報収集の進行、休息、シナリオ終了処理を掲載しない。これらは `24-2-scenario-play-page` の対象とする。
- `/rules` 専用のinitial design draft、design画像生成、layout・Header・Footer・SiteMenu・PageToc・MobilePageTocの再設計を行わない。
- ダイスローラー、達成値・効果値の自動計算、成功率計算、戦闘処理支援、入力フォーム、保存機能を追加しない。
- 検索、パンくず、前後ナビゲーション、CMS、DB、認証、SSR、API、PWA、新規依存パッケージを追加しない。
- Google Driveへの書込みを行わない。

## 完了条件

- [x] `src/pages/rules/index.mdx` に `MDXLayout`、title、description、`showPageToc: true` を設定している。
- [x] `.raw/contents/rules.md` の本文とHTMLコメント指示に従い、基本判定、達成値、効果値、目標値、対抗判定を表示している。
- [x] H1直後にhero画像を `ImageBlock` で表示し、指定のalt、`loading="eager"`、captionなし、追加overlayなしを確認している。
- [x] 11d10の例を `example` Calloutで表示し、出目、基準値、達成値6、効果値5が一貫している。
- [x] ゴールデンルールへのフラグメントリンク、シナリオルール・戦闘ルールへの導線を表示している。
- [x] 端数処理、小銭、所持信用、戦闘・シナリオ詳細を掲載していない。
- [x] `.raw/contents/rules.md` の旧design前提を、専用initial design draftを作成しない方針へ更新してからページ実装している。
- [x] `docs/requirements/pages.md` と `docs/plan.md` の端数処理・initial design draftの記載を、ユーザー承認済みの範囲へ修正している。計画チェックボックスは未完了のままである。
- [x] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている。
- [x] `/rules` 専用のinitial design draftを作成せず、既存共通designの参照だけを記録している。
- [x] hero画像を含む実装後のVisual Reviewを行い、ユーザー承認済みのdesign fix正本を `docs/design/rules/` へ記録している。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開で、hero画像を含むすべての内部リンク・フラグメントリンクが正しく動く。
- [x] build後の`/introduction`生成HTMLで、ゴールデンルールのIDが `h-f3926bd3` であることを確認している。
- [x] 見出し階層がH1から不自然に飛ばず、PageTocとMobilePageTocに必要なH2が現れる。
- [x] Calloutのtitleを見出し化せず、本文例として読める。
- [x] hero画像に意味のあるalt、2個のd10、オオサカの景観、人物と机上の緊張感があることを確認している。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] `docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/callout/`、`docs/design/rules/` と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/23-2-rules-page.md`
- `.raw/contents/rules.md`
- `docs/requirements/pages.md`
- `docs/plan.md`
- `src/pages/rules/index.mdx`
- `public/images/rules/hero.webp`
- `docs/design/rules/notes.md`
- `docs/design/rules/design-desktop.png`
- `docs/design/rules/design-mobile.png`
- `tests/visual/rules.spec.ts` または既存のVisual test
- 必要に応じてVisual Review用のtest設定

## レビュー観点

- ルールトップが、判定数から効果値までを初めて読むPLにも順に理解できる本文になっているか。
- 11d10のCallout例が、本文の基本判定説明を繰り返すだけでなく、数え方を具体化できているか。
- hero画像が、2個のd10、オオサカの景観、人物と机上の緊張感を示しつつ、本文より強くなりすぎていないか。
- ゴールデンルールへのフラグメントリンクが、GitHub Pagesのbase pathを含む実際の生成HTMLで正しく到達できるか。
- シナリオルール・戦闘ルールへの末尾導線が、未実装の詳細ページの内容をこのページへ混入させずに次の読み先を示せているか。
- `/rules` 専用のdesignラフを作らないというユーザー指定と、共通designを使う実装が両立しているか。
- initial design draftを省略しても、実装後のVisual Reviewは行い、design正本化を別途ユーザー承認へ分ける方針でよいか。
- `docs/requirements/pages.md` と `docs/plan.md` の端数処理・initial design draftの記載を、現在のユーザー指定へ更新してよいか。

## 備考

- 関連TODOは確認したが、23-2を直接対象とする未対応項目はない。`/support`、データページ、CI、NPC、design運用などの既存TODOはこのissueで扱わない。
- `docs/requirements/pages.md` と `docs/plan.md` は、準備中にユーザー承認済みの範囲へ更新した。`/rules` の端数処理を削除し、23-2はinitial design draftを作成せず、Visual Review後のdesign正本化をユーザー承認に分離する方針である。
- `.raw/contents/rules.md` のinitial design draftを必須とする旧指示は更新済みであり、専用initial draftを作らず既存共通designを参照する。
- `.raw/contents/rules.md` と `.tmp/review/23-2-rules-page/contents-review-2.md` はGit管理しないローカル作業入力・レビュー記録である。Google Driveへの同期は明示指示があるまで行わない。
- hero画像はユーザー提供の`public/images/rules/hero.webp`を表示する。画像右下のゲームロゴは意図したasset内要素として採用し、ページ側の追加overlayは行わない。ユーザー指定の「デザインラフは不要」はinitial draftだけを省略するものとして扱う。contents review後にユーザー承認を受け、現行実装を`docs/design/rules/`のdesign fix正本として記録する。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/callout/`
- reference desktop: 共通design targetのdesktop画像とnotes
- reference mobile: `docs/design/site-layout/design-mobile.png`、`docs/design/callout/design-mobile.png`
- notes: `/rules`専用initial design draftはユーザー指示により作成しない。hero画像は未提供のため、今回のVisual Review対象外とする。

### 成果物

- actual desktop: `test-results/visual/rules-desktop.png`
- actual mobile: `test-results/visual/rules-mobile.png`
- report: `tests/visual/rules.spec.ts`

### レビュー結果

| 領域         | 判定   | 差分                                                             | 対応                        |
| ------------ | ------ | ---------------------------------------------------------------- | --------------------------- |
| 本文・見出し | OK     | H2/H3の階層とPageTocが既存本文ページの構成に収まる。             | 不要                        |
| Callout      | OK     | `example`は既存の青灰色背景、左線、ラベル、記号マーカーを使う。  | 不要                        |
| desktop      | OK     | 本文、例、右PageToc、左SiteMenuに横overflowがない。              | 不要                        |
| mobile       | OK     | 例の本文とMobilePageTocが390px幅で折り返され、横overflowがない。 | 不要                        |
| hero画像     | 対象外 | 画像は未提供で、このPRでは表示していない。                       | 後続作業                    |
| design正本   | 対象外 | ユーザー指示により`docs/design/`を変更しない。                   | contents review完了後に判断 |

### 対応完了チェックリスト

- [x] desktop screenshotを取得した
- [x] mobile screenshotを取得した
- [x] 共通design参照とactualを比較した
- [x] hero画像を今回のレビュー対象外として記録した
- [x] design正本を変更していない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- `[中] .raw/contents/rules.md のhero未提供・非表示指示が、H1直後にheroを表示する現行実装、current issue、ユーザー提供assetと矛盾している。`

### 判定

- source: local-pr-review / contents-review
- classification: valid
- local validation: 取り込み時点では、`.raw/contents/rules.md` の実装指示とH1直後のHTMLコメントに画像が未提供で表示しないと残っていた。一方、`src/pages/rules/index.mdx` は `public/images/rules/hero.webp` をH1直後へ表示し、Visual testとdesktop・mobileスクリーンショットでalt、`loading="eager"`、captionなしを確認済みだった。ユーザー承認後にcontentsを現行実装へ更新した。
- user confirmation: hero右下に焼き込まれたゲームロゴは、ユーザー提供assetの意図した要素として採用する。生成プロンプトとcontents補足もこの方針へ更新した。

### 対応方針

- `.raw/contents/rules.md` のheroに関する実装指示とH1直後のHTMLコメントを、提供済みassetを表示する現状へ更新した。
- ロゴ入りassetを意図して採用することをcontentsのagent-facing補足へ記録した。
- ユーザー承認により、現行実装のスクリーンショットを `docs/design/rules/` のdesign fix正本へ記録した。画像の差し替えやページの新たなUI変更は行わない。

### 対応完了チェックリスト

- [x] contentsのhero指示とH1直後のHTMLコメントを現行実装へ一致させる
- [x] ロゴ入りassetを採用する意図を確認し、contents補足へ記録する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- `[中] hero画像の保留方針と、目的・備考に残る表示必須／旧指示の記述が矛盾している。`対象範囲`、`完了条件`、`ビジュアルレビュー 1`は「画像未提供のためこのPRでは対象外」としている一方、`目的`はH1直後への表示を現在の必須要件としており、`備考`はinitial design draftの旧指示がrawに残ると記していた。

### 判定

- source: local-pr-review
- classification: valid
- local validation: ユーザーはhero画像を今回の実装・レビュー対象外とし、`docs/design/`の変更もcontents review完了後まで保留するよう指示した。`対象範囲`、`完了条件`、`レビュー観点`、`ビジュアルレビュー 1`はこの方針と一致するが、`目的`と`備考`には保留前の表現が残る。`.raw/contents/rules.md`のinitial design draft指示はすでに更新済みであり、備考の「残る」は現状と一致しない。

### 対応方針

- hero画像が未提供であるため今回のPRでは表示しないことを、`目的`にも明記する。
- `備考`の旧initial design draft指示に関する記述を、更新済みの現状に合わせる。
- 上記は文書整合性のみの修正として扱い、hero画像、`docs/design/`、ページ実装の範囲は広げない。

### 対応完了チェックリスト

- [x] `目的`と`備考`を、hero画像表示と更新済みcontents指示の現状へ一致させる
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/callout/`
- reference desktop: 共通design targetのdesktop画像とnotes
- reference mobile: `docs/design/site-layout/design-mobile.png`、`docs/design/callout/design-mobile.png`
- notes: hero画像をH1直後へ追加した。ユーザー指示により`docs/design/`の正本は更新しない。

### 成果物

- actual desktop: `test-results/visual/rules-desktop.png`
- actual mobile: `test-results/visual/rules-mobile.png`
- report: `tests/visual/rules.spec.ts`

### レビュー結果

| 領域         | 判定   | 差分                                                                                   | 対応 |
| ------------ | ------ | -------------------------------------------------------------------------------------- | ---- |
| hero画像     | OK     | desktop・mobileともに本文幅へ収まり、意味のあるalt、`eager`、captionなしで表示される。 | 不要 |
| 本文・見出し | OK     | hero追加後もH2/H3、PageToc、Callout、末尾導線の読み順を維持する。                      | 不要 |
| desktop      | OK     | hero、本文、例、右PageToc、左SiteMenuに横overflowがない。                              | 不要 |
| mobile       | OK     | hero、例の本文、MobilePageTocが390px幅で折り返され、横overflowがない。                 | 不要 |
| design正本   | 対象外 | ユーザー指示により`docs/design/`を変更しない。                                         | 不要 |

### 対応完了チェックリスト

- [x] desktop screenshotを取得した
- [x] mobile screenshotを取得した
- [x] 共通design参照とactualを比較した
- [x] hero画像の表示・alt・loading・captionを確認した
- [x] design正本を変更していない
- [x] `npm run check` が通る
- [x] `npm run build` が通る
