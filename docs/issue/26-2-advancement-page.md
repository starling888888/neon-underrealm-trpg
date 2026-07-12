# 26-2-advancement-page

## 目的

`/advancement` に、シナリオ終了後の経験点・信用、覚悟の累積、能力値を含むキャラクター成長を説明する静的な成長ページを追加する。

## 背景

`docs/plan.md` の `26-2-advancement-page` は、初期公開範囲のキャラクター成長ページである。ページ本文のローカル作業入力は `.raw/contents/advancement.md` に作成済みであり、現行キャラクターメイキングを各算出の正とする。

ユーザー提供の `public/images/advancement/hero.webp` は、三分割のhero画像である。H1直後に表示し、asset内の公式ゲームロゴは追加・隠蔽しない。

関連する参照先は以下。

- `docs/requirements/pages.md` の `/advancement`
- `docs/out-of-scope.md` のキャンペーン管理機能、キャラクターシート、ダイスローラー等の初期スコープ外
- `docs/design/site-layout/notes.md`、`docs/design/page-toc/notes.md`、`docs/design/mobile-page-toc/notes.md`、`docs/design/callout/notes.md` の既存共通design
- `.raw/contents/advancement.md`

`docs/TODO.md` に `26-2-advancement-page` を対象とする未対応項目はない。`20-2-introduction-page` のcontents skill動作確認TODOは完了済みページ向けであり、本issueでは扱わない。

## 対象範囲

- `src/pages/advancement.mdx` を追加し、`MDXLayout`、`ImageBlock`、`Callout`、`InternalLink`を既存方針で利用する。
- `.raw/contents/advancement.md` のfrontmatterと本文を公開ページへ反映する。HTMLコメントは、hero、Callout、リンク、見出し順、tableに関する公開表示指示だけを実装へ反映する。
- 優先資料、画像生成prompt、矛盾点、再生成禁止などのHTMLコメント内の作業記録は公開ページへ表示しない。
- H1直後に `public/images/advancement/hero.webp` を `ImageBlock` で表示する。
- 経験点・信用の獲得、覚悟の累積、流儀・生き様・共通スキルの成長、格による能力値成長、共通スキルボーナス、最大体力・最大精神力の再計算、アイテムと信用を静的に説明する。
- キャラクターロスト確認と縁の清算は `/rules/scenario-play` へのリンクだけを置き、本文を再掲しない。
- 格30での能力値成長を `example` の `Callout` で例示する。
- 既存の共通designを参照して実装し、page固有のinitial design draftや `docs/design/advancement/` は作成しない。

## 初期スコープ外

- 初期design画像の生成、新規design target、design画像の正本化
- キャンペーン進行、セッション履歴、PC成長履歴、覚悟累積、信用をWeb上で管理する機能
- キャラクターシート、入力フォーム、保存、自動計算、ダイスローラー、戦闘シミュレーター
- GM向け裁定、シナリオ本文、エネミー運用、検索、CMS、DB、認証、SSR、API
- Header、Footer、SiteMenu、PageToc、MobilePageToc、Callout、ImageBlockの再設計または仕様変更
- hero画像の再生成・加工、ロゴの追加または隠蔽

## 完了条件

- [x] `/advancement` が `src/pages/advancement.mdx` から静的に表示される。
- [x] `.raw/contents/advancement.md` の本文と公開表示に関するHTMLコメント指示だけを反映し、作業記録や成長ページの責務外の本文を混入させていない。
- [x] H1直後に提供heroを、指定alt、`loading="eager"`、captionなし、追加overlayなしで表示する。
- [x] キャラクターロスト確認と縁の清算を本文へ再掲せず、`/rules/scenario-play` へリンクしている。
- [x] 格、共通スキル上限、最大体力、最大精神力などの各算出が `src/pages/character-making.mdx` と一致する。
- [x] 格30の能力値成長を `example` Calloutで示し、Callout titleをページ内目次の見出しにしない。
- [x] 既存共通designとの整合を確認し、initial design draftまたは`docs/design/advancement/`を作成していない。
- [x] 完成画面のスクリーンショットで既存共通designとの整合を確認し、design正本を更新していない。
- [x] GitHub Pagesのサブパス公開で画像と内部リンクが壊れない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] desktop / mobileでhero、表、Callout、本文、PageToc / MobilePageTocに横overflowや可読性低下がない。
- [x] hero内の公式ゲームロゴをページ側で重ねて表示せず、隠蔽もしていない。
- [x] 既存ルート、Header、Footer、SiteMenu、PageToc、MobilePageToc、共通Componentを壊していない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の管理機能・自動計算・入力UIを実装していない。
- [x] 既存共通designと矛盾していない。新規のpage固有designは作成していない。
- [x] ユーザー提供の未追跡hero assetと、既存の未コミット `docs/agent-failure-log.md` の変更を破壊していない。

## 想定変更ファイル

- `src/pages/advancement.mdx`
- `public/images/advancement/hero.webp`
- `.raw/contents/advancement.md`（Git管理外のローカル作業入力）
- `tests/visual/advancement.spec.ts`
- `docs/issue/26-2-advancement-page.md`
- `docs/agent-failure-log.md`（既存の作業ログ変更。ページ実装そのものの範囲外）

## レビュー観点

- PL向け成長ページとして、経験点・信用・覚悟・成長・再計算の説明が過不足なく、キャラクターロスト確認と縁の清算を重複掲載していないか。
- 格と各算出が現行キャラクターメイキングと矛盾していないか。
- 格30の例が、格による能力値成長と同一能力値への配分制限を誤解なく示しているか。
- 三分割heroがH1直後にあり、asset内ロゴを含めて既存本文layoutと整合するか。
- user指示どおり新規design作成を行わず、既存共通design参照だけで十分か。
- 静的な説明ページの範囲を越え、管理・入力・自動計算機能を混入させていないか。

## 備考

- ユーザー指示により、initial design draftは作成しない。既存の共通designを参照する。`docs/plan.md` の当該記載もこの方針に更新し、`.tmp/review/26-2-advancement-page/user-directed-changes.md` に記録した。
- hero画像はユーザー提供の未追跡assetである。issue準備では追加・変更・削除せず、実装後にユーザーがcommitを明示指示した場合だけ対象差分を確認してGitへ追加する。
- `.tmp/hero-prompt.md` はhero生成時の作業記録であり、再生成には使わない。提供assetとpromptのロゴ有無の差は `.raw/contents/advancement.md` の`矛盾点`に記録済みで、提供assetを正とする。

## ビジュアルレビュー 1

### 参照したdesign

- `docs/design/site-layout/design-desktop.png`
- `docs/design/site-layout/design-mobile.png`
- `docs/design/callout/design-desktop.png`
- `docs/design/site-layout/notes.md`、`docs/design/page-toc/notes.md`、`docs/design/mobile-page-toc/notes.md`、`docs/design/callout/notes.md`

ユーザー指示により、新規のpage固有designおよびdesign正本の更新は行わない。

### 実測結果

- desktop: `test-results/visual/advancement-desktop.png`
- mobile: `test-results/visual/advancement-mobile.png`

| 観点                               | 結果                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| layout・spacing・typography・color | OK。既存のsite layoutと本文レイアウトに整合する。                                        |
| heroとCallout                      | OK。heroはH1直後に表示され、asset内ロゴを覆わない。Calloutは既存共通designに整合する。   |
| desktopのPageToc                   | OK。本文見出しとCallout titleを区別して表示する。                                        |
| mobileのMobilePageToc・overflow    | OK。目次の開閉ができ、表は本文コンテナ内で横スクロールし、ページ全体の横overflowはない。 |
| responsive・accessibility          | OK。desktop / mobileとも本文とリンクの可読性を保つ。                                     |

### 修正

- なし。実装結果と既存共通designの間に、issue範囲で修正すべき視覚的な差異は見つからなかった。

### 人間確認が必要な判断

- なし。

### designへの引き渡し

- なし。新規designまたはdesign正本の更新を行わない。

### 確認チェック

- [x] desktop / mobileの実測スクリーンショットを取得した。
- [x] site layout、PageToc / MobilePageToc、Calloutの既存designと比較した。
- [x] hero、表、Callout、本文に修正が必要な視覚的差異がないことを確認した。
- [x] design正本を作成・更新していない。
- [x] `npm run check` と `npm run build` が通ることを確認した。
