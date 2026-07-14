# TODO

このファイルは、現在のissueでは対応しないが、将来対応すべきレビュー指摘・改善候補を一時的に追跡するための一覧である。

このファイルは未対応TODOを中心に管理するactive TODOである。完了済みTODOを退避する場合は、削除せず `docs/TODO-done.md` へ移す。

TODOの退避は、対応内容がmerge済み、またはユーザーが完了扱いを承認した場合に限る。current issueで対応すべき修正をTODOへ逃がしてはならない。

PR merge後のTODO更新は `.agents/skills/post-merge-plan-update/SKILL.md` に従う。

`docs/TODO.md` は、`review-to-issue` workflowで以下のような項目を受ける。

- 現在のissue範囲を超える指摘
- 後続タスクで対応すべき改善
- 既存の `docs/plan.md` タスクに紐づく補足対応
- `docs/plan.md` に新しい計画項目を追加したうえで追跡すべき作業

TODO項目は、可能な限り `docs/plan.md` の計画項目へ紐づける。

---

## 未対応

- [ ] Astro Component contract testの基盤を導入する
  - source: `28-2-common-skills-page` の技術レビューにおけるユーザー指示
  - classification: test architecture follow-up
  - plan: なし。費用対効果を再評価してから必要なら計画化する。
  - handling plan: `SkillCard`、`NpcCard`などへ固定propsを渡し、文言、値、fallback、想定タグ、属性をComponent単位で確認できる基盤を検討する。Visual Testはfixture・外部データの内容へ依存させず、画面構造、responsive layout、overflow、ナビゲーション状態、スクリーンショットに限定する。

- [ ] 表全体が初期表示で収まらない場合のレイアウト対策を検討する
  - source: `26-2-advancement-page` のcontents review 3 とユーザー指示
  - classification: visual usability follow-up
  - plan: `docs/plan.md` の `50-responsive-pass`
  - handling plan: 成長ページの「生き様係数」表など、本文コンテナ内で横スクロールが必要になり初期表示で全列を確認できない表について、情報の分割、列・見出しの再構成、画面幅に応じた表示、スクロール誘導などを比較する。既存table layout・共通design・アクセシビリティへの影響を確認し、方針を決めてから実装する。

- [ ] `/support` のオンラインセッションサポートページを作成する
  - source: `20-2-introduction-page` のコンテンツ検討時のユーザー指示
  - classification: follow-up
  - plan: `docs/plan.md` の `41-2-support-page`
  - handling plan: 本作で多数のダイスを使用することからオンラインセッションを推奨し、オンラインセッションの準備と進め方を説明する。特定ツールを必須にせず、Webキャラクターシート、ダイスローラー、戦闘支援機能は作らない。

- [ ] 最初のページ作成タスクで、ローカルコンテンツ作成SKILLを実際に使って動作確認する
  - source: `local-content-authoring` issue 実装後のユーザー指示
  - classification: validation follow-up
  - plan: `docs/plan.md` の `28-2-common-skills-page`
  - handling plan: `.raw/contents/common-skills.md` を `contents-markdown-authoring` で作成または更新し、ユーザー指示、`src/pages/`、current issue、requirements、plan、out-of-scope、既存`.raw/contents/`、`.raw/v1.0/`の優先順の照合、差異時の停止、正本修正可否のユーザー確認、v1.0文体参照、成果物形式を実作業で確認する。Google Drive同期は、このTODOだけでは実行しない。

- [ ] main以外のbranch / PRでdeployなしCIを回せるようにする
  - source: `17-github-actions-deploy-basic` issue review
  - classification: follow-up
  - plan: `docs/plan.md` の `56-ci-non-main-branches`
  - handling plan: GitHub Pages deploy workflowとは分離し、main以外のbranch / pull requestで `npm ci`、`npm run check`、`npm run build`、必要なtestを実行するCIを整備する。deployは行わず、GitHub Pages環境を更新しない。docs-only更新、AGENTS / SKILL更新のみの場合の扱いもCI方針として明確化する。

- [ ] 各NPCの個別画像をpublic assetsへ配置する
  - source: `21-2-world-page` のcontents作成時のユーザー指示
  - classification: planned follow-up
  - plan: `docs/plan.md` の `42-0-npc-data-normalization`
  - handling plan: `public/assets/images/npc/` に各NPCの画像を配置し、`/world` の共通人物アイコンを個別画像へ置き換える。画像のaltと静的配信時のbase pathを確認する。

- [ ] NPCをExcelとJSONで管理する
  - source: `21-2-world-page` のcontents作成時のユーザー指示
  - classification: planned follow-up
  - plan: `docs/plan.md` の `42-0-npc-data-normalization`
  - handling plan: `.raw/data/npcs.xlsx` をローカル正本とし、変換仕様、`data/generated/npcs.json`、検証スキーマ、取得層を整備する。`/world` の静的 `NpcCard` を生成JSON参照へ移行し、Excel本体をCI/CDへ含めない。

- [ ] 生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する
  - source: `11-site-menu` 実装中のユーザー判断
  - classification: follow-up
  - plan: `docs/plan.md` の `29-0-ryugi-index-data` / `31-0-ikizama-index-data` 後に、必要なら `29-2-ryugi-index-page` / `31-2-ikizama-index-page` または別のナビゲーション補完タスクで扱う
  - handling plan: 現時点では生成JSONが存在しないため `11-site-menu` では実装しない。`data/generated/ryugi.json` / `data/generated/ikizama.json` と `src/lib/data/ryugi.ts` / `src/lib/data/ikizama.ts` が整った後、手書き固定ではなく生成JSONまたはデータ取得層から流儀・生き様の項目を取得し、サイドメニューへ表示する。

- [ ] `/data/common-skills` のページ作成を計画項目として追跡する
  - source: `.tmp/11-review.md` / PR #14 review draft
  - classification: follow-up
  - plan: `docs/plan.md` の `28-2-common-skills-page`
  - handling plan: `requirements.md` とサイドメニューに `/data/common-skills` が追加済みのため、データ表示UIフェーズで共通スキル一覧ページを作成し、スキル一覧Componentまたは同等の表示方針に接続する。

- [ ] キャラクターシートの永続スキル参照でID変更を検出してエラーにする
  - source: `28-0-common-skills-data` 実装中のユーザー指示
  - classification: out-of-scope follow-up
  - plan: `docs/out-of-scope.md` のWebキャラクターシート・DB利用を扱う将来タスク。現時点で対応する `docs/plan.md` 項目はない。
  - handling plan: キャラクターシート機能がDBなどへスキルIDと取得レベルを保存する前に、Excel入力順による自動採番で同一スキルのIDが変わったことを検出してエラーにする方式を設計する。比較に使う不変キーまたは移行マッピング、既存保存データとの照合時点、エラー表示、移行手順を決定し、ID変更を黙って保存データへ適用しない。

- [ ] Footerからクレジット導線を出すか将来検討する
  - source: `phase-2-prep-doc-agent-ops` Group 12
  - classification: low-priority follow-up
  - plan: 初期実装の必須タスクには紐づけない。クレジット情報が増え、Footerからの常設導線が必要になった時点で独立タスクとして計画する
  - handling plan: 初期実装ではFooterをコピーライト、GitHub、X、Discordに絞る。クレジット本文はトップページや将来の専用ページで扱い、Footer導線は必要性が明確になってから追加する。

- [ ] 既存 `docs/design/*/notes.md` を `design-image-generation` のnotes構造へ寄せる
  - source: `design-image-generation` skill 追加時の整合確認
  - classification: follow-up
  - plan: `docs/plan.md` のdesign / Visual Review / UI実装関連タスクに紐づける。適切な既存planがない場合は、design運用整理タスクを追加する
  - handling plan: 既存design targetごとに、mode / target / referenced SSoT / existing design constraints / out of scope / comparison points / generation source / open questions を必要範囲で追記する。既存design画像そのものは、このTODOだけでは変更しない

- [ ] サイトメニュー順序変更を既存designへ一括反映する
  - source: `24-2-scenario-play-page` 準備中のユーザー指示
  - classification: design follow-up
  - plan: `docs/plan.md` のdesign / Visual Review / UI実装関連タスクに紐づける。適切な一括design更新タスクを定めてから実施する
  - handling plan: `ルール`を`データ`の上に置く現行メニュー順序を、関連する既存design画像・notesへまとめて反映する。個別ページ作成中に部分的なdesign更新は行わない。

- [ ] 現在地ハイライト目視確認用のダミーMDXページ`/data/items`と`/data/items/weapons`を、本実装時に削除または置き換える
  - source: `15-current-menu-highlight` 実装中の目視確認用追加
  - classification: follow-up
  - plan: `docs/plan.md` の該当するデータページ実装タスクで扱う
  - handling plan: `src/pages/data/items/index.mdx`と`src/pages/data/items/weapons.mdx`は現在地ハイライトの目視確認用ダミーである。`/data/items`と`/data/items/weapons`の本実装時に削除するか、正式なページ実装へ置き換える。

- [ ] VRT実装時に、mobile layout / MobilePageToc のCSS回帰検知を追加する
  - source: `.tmp/16-review.md` / PR #21 review
  - classification: follow-up
  - plan: `docs/plan.md` の `50-1-vrt-css-regression-guards`
  - handling plan: 現在の `tests/visual/*` はdesign正本化用スクリーンショット取得として扱い、このIssueではCSS回帰検知を実装しない。将来VRTを導入する際、少なくとも390px mobile幅での意図しない横スクロール、MobilePageToc sticky headingの背景透過、TOC非表示対象ページでのPageToc / MobilePageToc非表示を自動検知する。

- [ ] ゲーム画像生成のbase promptを改訂し、利用方針を決定する
  - source: `21-2-world-page` のPR #35 reviewとユーザー指示
  - classification: follow-up
  - plan: `docs/plan.md` の `54-1-game-image-generation-policy`
  - handling plan: `docs/image-generation/base-prompt.md`は現時点ではsampleとして維持する。将来taskで、公式ロゴ、in-world signage、overlay typography、画像固有promptの役割分担、生成前の承認事項、base promptの改訂方針を決定する。

<!--
例:

- [ ] TODO title
  - source: `.tmp/pr-N-review.md`
  - classification: follow-up / out-of-scope
  - plan: `docs/plan.md` の該当項目
  - handling plan: 将来どのタスクでどう扱うか
-->
