# 完了済みTODO履歴

このファイルは、`docs/TODO.md` から退避した完了済みTODOの履歴を保持する。

`docs/TODO.md` は未対応TODOを中心に保つ。完了済みTODOを退避する場合は、削除ではなくこのファイルへ移す。

## 退避条件

- TODOが対応済みである
- 対応内容がmerge済み、またはユーザーが完了扱いを承認している
- 完了日、対応PRまたはcommit、元TODOのsourceが記録できる
- ユーザーがTODO整理またはpost-merge tracking更新を指示している

## 記録形式

```md
- [x] TODO title
  - completed: YYYY-MM-DD
  - PR: #N または commit: `<hash>`
  - source:
  - handling:
```

## 完了済み

- [x] ex-17: ex-16 Cloud Persistence残課題回収
  - completed: 2026-08-26 via PR #225 / PR #226 / `ex-17-cloud-persistence-followups`
  - source: `docs/TODO.md` のex-17 section、GitHub Issue #227
  - classification: ex-16 follow-up
  - handling result: Group 1〜4の仕様・実装・文書整合、Group 5のIssue / Gate archiveを完了した。main SHA `779b970f98a2e84c40dcb4095edb8f70f6e492b8` のGitHub Pages deployでPublic E2E job #98155364461がsuccessした。JSON import導線の削除後に確認するlocal draft / URL identity処理と、character sheetのdesign note / Visual Review / VRT更新だけはex-18へ移管した。

- [x] Astro Component contract testの基盤を導入する
  - completed: 2026-08-04 via PR #189 / `milestone-02-phase-01-todo-resolution`
  - source: `28-2-common-skills-page` の技術レビューにおけるユーザー指示
  - classification: test architecture follow-up
  - plan: なし。費用対効果を再評価してから必要なら計画化する。
  - handling result: `SkillCard`、6種のitem card、`NpcCard`、`Callout`へ固定propsを渡す9件のAstro Component contract testを追加し、Visual Testと責務を分離した。

- [x] 既存Node testをVitestへ段階的に移行する
  - completed: 2026-08-04 via PR #189 / `milestone-02-phase-01-todo-resolution`
  - source: `ex-02-4-sheet-profile` のテストアーキテクチャレビューにおけるユーザー指示
  - classification: test architecture follow-up
  - plan: なし。G4のreview対応とは分離し、Vitest導入後の既存test数・Node固有API・CI実行時間を確認してから独立taskを計画する。
  - handling result: `tests/node/`と`tests/contract/`をVitestへ全面移行し、Node test runnerと`node:assert/strict`を除去した。

- [x] 全スキルのsummary整備後に、`SkillCard`でsummaryを再表示する
  - completed: 2026-08-04 via PR #189 / `milestone-02-phase-01-todo-resolution`
  - source: `30-2-ryugi-detail-page` 実装後のユーザー指示
  - classification: data quality follow-up
  - plan: なし。全スキルのsummaryを確認できるデータ整備タスクを計画した時点で紐付ける。
  - handling result: ユーザー判断によりsummaryの再表示ではなく、スキル用summary列・保持・propsを削除した。再表示は行わない。

- [x] Pagefindが`-local`確認ページをindex化した場合も、検索Visual Testを安定して実行できるようにする
  - completed: 2026-08-04 via PR #189 / `milestone-02-phase-01-todo-resolution`
  - source: PR #66 のdocument review
  - classification: follow-up
  - plan: なし。milestone-01はクローズ中のため、後続milestoneで検索Visual Test安定化taskを計画してから紐づける。
  - handling result: `-local` routeでは`data-pagefind-body`を出力せず、Pagefind indexにfixture URLが含まれない検索E2Eを追加した。

- [x] キャラクターシートの派生logicからマスタID解決を分離する
  - completed: 2026-08-04 via PR #189 / `milestone-02-phase-01-todo-resolution`
  - source: ChatGPT review draft (`.tmp/chatgpt-review.md`) のG7 review
  - classification: architecture follow-up
  - plan: G24とは別の設計・実装taskとして扱う。
  - handling result: `logic/`は解決済み`BuildSources`を入力にし、ID解決を`master-data/build.ts`へ分離した。未知IDの扱いは既存persistence / import境界に維持した。

- [x] 既存 `docs/design/*/notes.md` を `design-image-generation` のnotes構造へ寄せる
  - completed: 2026-08-04 via user decision / `milestone-02-phase-01-todo-resolution` G7
  - source: `design-image-generation` skill 追加時の整合確認
  - classification: canceled follow-up
  - plan: なし
  - handling result: 既存design notesを全件正規化する費用対効果が低いため、対応しない方針を明記した。必要なdesign notesは個別のUI taskでのみ整備する。

- [x] サイトメニュー順序変更を既存designへ一括反映する
  - completed: 2026-08-04 via user decision / `milestone-02-phase-01-todo-resolution` G7
  - source: `24-2-scenario-play-page` 準備中のユーザー指示
  - classification: completed follow-up
  - plan: なし
  - handling result: 最新canonical screenshotを取得する現行方針により、旧design artifactを一括更新する必要は解消済みとする。

- [x] GitHub Actionsで全件VRTを定期実行または公開直後に実行する
  - completed: 2026-08-04 via user decision / `milestone-02-phase-01-todo-resolution` G7
  - source: 2026-07-23のユーザー指示
  - classification: canceled follow-up
  - plan: なし
  - handling result: 費用対効果が低いため対応しない。UI変更時は対象targetに限定したVRTを実行し、全件比較はGitHub Actionsへ追加しない。

- [x] CharacterSheet Presenter props custom hookを、Presenterのmemo化と同時に参照安定化する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `ex-02-4-sheet-profile` 実装中のユーザー指示
  - classification: React performance architecture follow-up
  - plan: `GitHub Issue #106: ex-02-31-sheet-integration`
  - handling result: G31で`useCharacterSheetFormPresenterProps`を含むPresenter / section propsの派生ViewModelとcallbackを、実際にmemo化するprops境界で参照安定化し、無関係なUI state更新で対象propsが不要に変わらないことをhook / Component testで確認した。

- [x] main以外のbranch / PRでdeployなしCIを回せるようにする
  - completed: 2026-07-31 via PR #74 / `8559f4c`
  - source: `17-github-actions-deploy-basic` issue review
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `56-ci-non-main-branches`
  - handling result: GitHub Pages deploy workflowとは分離し、main以外のbranch / pull requestで `npm ci`、`npm run check`、`npm run build`、必要なtestを実行するCIを整備した。deployは行わず、GitHub Pages環境を更新しない。docs-only更新、AGENTS / SKILL更新のみの場合の扱いもCI方針として明確化した。

- [x] G22で専用アイテムカテゴリframeへカテゴリ削除buttonを追加する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `.tmp/review/ex-02-18-sheet-omamori/human-review-1.md` / `ex-02-18-sheet-omamori` のレビュー指摘 1
  - classification: follow-up
  - plan: `GitHub Issue #96: ex-02-22-sheet-special-items-integration`
  - handling plan: G18で追加する非折りたたみのカテゴリframeへ、カテゴリ削除buttonの表示・操作・focus復帰を追加する。G22で行う既定表示、カテゴリ単位の追加・削除、警告表示と整合させ、現在の生き様に対応する既定カテゴリは削除できない契約を適用する。

- [x] G24着手前にキャラクターシート可変行のRHF操作境界を`useFieldArray`契約へ整合する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `.tmp/chatgpt-review.md` / `レビュー指摘 1`
  - classification: follow-up
  - plan: `GitHub Issue #98: ex-02-24-sheet-persistence`
  - handling result: G16で全可変行の追加・削除・移動・置換を`useFieldArray`へ統一し、row IDと`reset`後のuncontrolled input同期を固定した。G24はこの契約に従って復元する。

- [x] G24 / G27着手前にスキルLvの未確定入力、最大Lv超過、復元・JSON入力値の扱いをrequirements / schema契約として確定する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `.tmp/chatgpt-review.md` / G13 レビュー指摘 2、レビュー指摘 3、G15 レビュー指摘 1・4
  - classification: requirements and schema follow-up
  - plan: `GitHub Issue #98: ex-02-24-sheet-persistence`、`GitHub Issue #101: ex-02-27-sheet-json-import`
  - handling result: G16で未確定入力・最大Lv超過を値保持と局所errorへ統一し、G24で構造・identityだけを拒否してゲーム上の不整合値を復元する契約をrequirements / schemaへ反映した。G27は同じrestore adapterを利用する。

- [x] G16で生き様bonusを含む全スキルの最大Lv制約を定義する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `.tmp/chatgpt-review.md` / G13 レビュー指摘 3
  - classification: follow-up
  - plan: `GitHub Issue #89: ex-02-16-sheet-experience-consistency`
  - handling result: G16で通常skillと生き様bonusの最大Lv違反を値保持・局所errorとして統一し、経験点集計と保存・復元の契約へ適用した。

- [x] G31でlocator-only Visual Review scenarioの実行経路を分離する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `.tmp/chatgpt-review.md` / G13 レビュー指摘 3
  - classification: follow-up
  - plan: `GitHub Issue #106: ex-02-31-sheet-integration`
  - handling result: character-sheet専用scenario helperでfull-page、section locator、dialog locatorを分離した。通常VRTはlocator stateを該当locatorのcanonical snapshotとして比較し、full-page baselineを要求しない。全358 targetの再生成・比較を確認した。

- [x] G31のコンテンツレビューでtooltip indicatorの上下揃えに違和感があれば、共通`FormulaTooltip`の配置を再調整する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: `ex-02-11-sheet-noncombat` のレビュー指摘 6に対するユーザーのpreview確認
  - classification: visual usability follow-up
  - plan: `GitHub Issue #106: ex-02-31-sheet-integration`
  - handling result: G31のコンテンツレビューで再調整を要する違和感は指摘されなかったため、共通`FormulaTooltip`は変更しない。

- [x] G31でキャラクターシート全体のVisual Reviewを完了する
  - completed: 2026-07-31 via PR #69 / `ex-02-web-character-sheet`
  - source: G11 Gate Tech Reviewに対するユーザー判断
  - classification: visual review follow-up
  - plan: `GitHub Issue #106: ex-02-31-sheet-integration`
  - handling result: canonical screenshotを入力にdesktop / tabletとmobileのコンテンツレビューを実施した。固定actionの本文重なり、mobileの情報密度、入力順、破壊的操作の色、icon-only操作はユーザー判断で非対応とした。候補行の選択可能性だけを次のTODOへ後続化した。

- [x] G17着手時にCharacterSheetContainerのdialog orchestrationをhookへ分離する要否を判断する
  - completed: 2026-07-29 via user-directed Gate close
  - source: `.tmp/chatgpt-review.md` / G15 レビュー指摘 2
  - classification: resolved architecture decision
  - plan: `GitHub Issue #90: ex-02-17-sheet-weapons-armor`
  - handling: 既存のpicker、確認dialog、pending action、focus復帰を列挙した。武器・防具で増える候補dialogは既存Containerの状態とrefで扱い、共通hookへ移しても責務が単純化しないためroot orchestration hookは導入しない。

- [x] React Islandの導入を検討する
  - completed: 2026-07-24 via user direction / adopted for `ex-02-web-character-sheet`
  - source: ユーザー指示
  - classification: resolved architecture decision
  - plan: `GitHub Issue #82: ex-02-1-sheet-runtime`
  - handling plan: キャラクターシートに限定したReact Islandを採用し、サイト全体をSPA化しない。導入と実装の詳細はG1の子issueで扱う。

- [x] 流儀の共通スキルボーナスを構造化データへ変換する
  - completed: 2026-07-24 via user direction / not adopted
  - source: `29-0-ryugi-index-data` の変換仕様レビュー中のユーザー指示
  - classification: canceled current issue prerequisite
  - plan: `GitHub Issue #113: ex-02-web-character-sheet`
  - handling plan: 表示用データを維持し、構造化データ、文字列解析、自動算出を追加しない方針へ変更した。

- [x] 1024px以上1360px未満で3レールlayoutの横overflowを解消する
  - completed: 2026-07-23 via PR #68 / `49-50-accessibility-responsive-pass`
  - source: `30-2-ryugi-detail-page` のレビュー指摘 1
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `49-50-accessibility-responsive-pass`
  - handling plan: 3レールを1280px以上に限定し、768px以上1280px未満では左SiteMenuとMobilePageTocを使う2レールへ切り替えた。代表routeの境界幅で横overflowとナビゲーション表示を回帰確認した。

- [x] `/support` のオンラインセッションサポートページを作成する
  - completed: 2026-07-23 via PR #67 / `41-2-support-page`
  - source: `20-2-introduction-page` のコンテンツ検討時のユーザー指示
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `41-2-support-page`
  - handling plan: 本作で多数のダイスを使用することからオンラインセッションを推奨し、オンラインセッションの準備と進め方を説明する。特定ツールを必須にせず、サポートページ内にダイスローラー、戦闘支援機能は作らない。

- [x] 現在地ハイライト目視確認用のダミーMDXページ`/data/items`と`/data/items/weapons`を、本実装時に削除または置き換える
  - completed: 2026-07-23 via PR #64 / `34-2-items-pages`
  - source: `15-current-menu-highlight` 実装中の目視確認用追加
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `34-2-items-pages`
  - handling plan: `src/pages/data/items/index.mdx`と`src/pages/data/items/weapons.mdx`を、アイテムトップページと武器一覧ページの正式実装へ置き換えた。

- [x] NPC画像をpublic assetsへ配置し、個別画像がないIDはfallback表示する
  - completed: 2026-07-22 via PR #59 / `42-0-npc-data-normalization`
  - source: `21-2-world-page` のcontents作成時のユーザー指示
  - classification: planned follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `42-0-npc-data-normalization`
  - handling plan: `public/images/npc/` にNPC画像を配置し、`/world` の共通人物アイコンを個別画像へ置き換える。同IDの個別`.webp`がない場合は`no_image.webp`を表示する。画像のaltと静的配信時のbase pathを確認する。

- [x] NPCをExcelとJSONで管理する
  - completed: 2026-07-22 via PR #59 / `42-0-npc-data-normalization`
  - source: `21-2-world-page` のcontents作成時のユーザー指示
  - classification: planned follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `42-0-npc-data-normalization`
  - handling plan: `.raw/data/npcs.xlsx` をローカル正本とし、変換仕様、`data/generated/npcs.json`、検証スキーマ、取得層を整備する。`/world` の静的 `NpcCard` を生成JSON参照へ移行し、Excel本体をCI/CDへ含めない。

- [x] キャラクターメイキングと成長で、流儀の共通スキルボーナスを変換済みデータから表示する
  - completed: 2026-07-22 via PR #54 / `29-2-ryugi-index-page`
  - source: `29-0-ryugi-index-data` のissueレビュー中のユーザー指示
  - classification: planned task scope supplement
  - plan: `docs/issue/milestone-01/plan.md` の `29-2-ryugi-index-page`
  - handling: `29-0-ryugi-index-data` が `.raw/data/ryugi-list.xlsx` から生成する流儀データを、キャラクターメイキングと成長で参照して表示する。`/data/ryugi` はcontentsに従い、ケンカヤの代表データと4項目の説明、流儀名リンクと `shortDescription` の一覧を表示し、全流儀の共通スキルボーナス表は置かない。手書き固定値や別のデータ入力は使わない。

- [x] 流儀スキル変換仕様のファイル名を計画と要件で統一する
  - completed: 2026-07-21 via PR #52 / `30-0-ryugi-detail-data`
  - source: PR #46の`pr-review-1.md`
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `30-0-ryugi-detail-data`
  - handling: `30-0-ryugi-detail-data`で正本名を`docs/conversion/ryugi-skills.md`に決定し、`docs/requirements/architecture.md`と関連変換仕様を同名へ統一した。

- [x] 最初のページ作成タスクで、ローカルコンテンツ作成SKILLを実際に使って動作確認する
  - completed: 2026-07-15 via PR #45 / `28-2-common-skills-page`
  - source: `local-content-authoring` issue 実装後のユーザー指示
  - classification: validation follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `28-2-common-skills-page`
  - handling: `contents-markdown-authoring`で`.raw/contents/common-skills.md`のfrontmatter、本文、HTMLコメントを確認・更新し、CardContainer方針との矛盾を解消した。Google Drive同期はこのTODOの実装範囲に含めなかった。

- [x] `/data/common-skills` のページ作成を計画項目として追跡する
  - completed: 2026-07-15 via PR #45 / `28-2-common-skills-page`
  - source: `.tmp/11-review.md` / PR #14 review draft
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `28-2-common-skills-page`
  - handling: `/data/common-skills`を生成JSONのカテゴリ順で表示するページとして実装し、CardContainerとSkillCardへ接続した。

- [x] 現在地ハイライト目視確認用のダミーMDXページ`/data/index.mdx`を、本実装時に削除または置き換える
  - completed: 2026-07-13 via PR #42 / `27-2-data-index-page`
  - source: `15-current-menu-highlight` 実装中の目視確認用追加
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `27-2-data-index-page`
  - handling: `src/pages/data/index.mdx`をデータトップページの本実装へ置き換えた。

- [x] 戦闘ルール実装後、シナリオ終了後処理から死亡・覚悟の詳細へフラグメントリンクを置く
  - completed: 2026-07-12 via PR #39 / `25-2-battle-page`
  - source: `24-2-scenario-play-page` のユーザー指示
  - classification: cross-page follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `25-2-battle-page`
  - handling: 戦闘ルールの「気絶と死亡」「覚悟」のbuild後フラグメントIDを確認し、`src/pages/rules/scenario-play.mdx` と `.raw/contents/scenario-play.md` の参照を対応するインラインリンクへ更新した。

- [x] 既存MarkdownドキュメントのstyleをGoogle Markdown Style Guideに沿って統一する
  - completed: 2026-07-08 via `todo-md-style-unification` / main direct commit
  - source: `.tmp/追加要望.md` 01
  - classification: follow-up
  - plan: 関連planなし。ユーザーの明示指示により、plan作成なしの独立タスクとして扱った。
  - handling: Google Markdown Style Guideを基準に、既存Markdownドキュメントのunordered list markerを `-` に統一した。本文内容、要件、planチェック状態、Markdown以外のファイルは変更していない。

- [x] サイトメニューの表示文言と階層レイアウトを調整する
  - completed: 2026-07-06 via PR #16 / `12-1-site-menu-layout-copy`
  - source: `12-mobile-menu` 実装後のユーザー指摘
  - classification: follow-up
  - plan: `docs/issue/milestone-01/plan.md` の `12-1-site-menu-layout-copy`
  - handling: `サイトメニュー` という表示文言を削除または別文言へ変更し、子項目開閉トグルを項目右端へ移動した。トグル用の左スペースでリンク群が右に寄りすぎないよう、PC左サイトメニューとスマホdrawer内メニューの両方で全体を左寄せに調整した。

- [x] `Seo.astro` を共通Layoutへ組み込む
  - completed: 2026-07-05 via PR #11 / `09-base-layout`
  - source: `08-seo-component` 実装後の確認 / `レビュー指摘 1`
  - handling: `BaseLayout.astro` の `<head>` 内で `Seo.astro` を利用し、Layout props経由で `title` / `description` / `og:*` を渡せるようにした。
