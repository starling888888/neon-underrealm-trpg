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

- [ ] 覚悟から縁へ戻す効果の表現を整理する
  - source: `ex-02-web-character-sheet` の要件レビューに対するユーザー回答
  - classification: rule wording follow-up
  - plan: なし。ルール文言の整理が必要になった時点で独立taskを計画する。
  - handling plan: `src/pages/rules/battle.mdx`の「入れ替えができなくなる」と、スキル効果の「覚悟を縁に戻す」を、覚悟を解除する効果は許可する意図が明確になる表現へ整理する。生成JSONのスキル本文を変更する場合は、対応する生成元から更新する。

- [ ] JSONのスキーマバージョン差異との互換性を担保する
  - source: `ex-02-web-character-sheet` の要件レビューに対するユーザー回答
  - classification: future data compatibility follow-up
  - plan: なし。複数のJSON形式を継続して扱う必要が明確になった時点で独立taskを計画する。
  - handling plan: 現在はスキーマバージョンを保存・比較せず、正常に処理できないJSONを一律エラーにする。将来、バージョン番号、受け入れ可能な旧形式、移行処理、エラー表示、テストfixtureを定義して互換性を担保する。

- [ ] Astro Component contract testの基盤を導入する
  - source: `28-2-common-skills-page` の技術レビューにおけるユーザー指示
  - classification: test architecture follow-up
  - plan: なし。費用対効果を再評価してから必要なら計画化する。
  - handling plan: `SkillCard`、`NpcCard`などへ固定propsを渡し、文言、値、fallback、想定タグ、属性をComponent単位で確認できる基盤を検討する。Visual Testはfixture・外部データの内容へ依存させず、画面構造、responsive layout、overflow、ナビゲーション状態、スクリーンショットに限定する。

- [ ] 全スキルのsummary整備後に、`SkillCard`でsummaryを再表示する
  - source: `30-2-ryugi-detail-page` 実装後のユーザー指示
  - classification: data quality follow-up
  - plan: なし。全スキルのsummaryを確認できるデータ整備タスクを計画した時点で紐付ける。
  - handling plan: 現行の生成JSONと`SkillCard` propsではsummaryを保持するが、全スキル分の内容が完成するまでカードに表示しない。再表示時はデータ完成範囲、`docs/requirements/data-display.md`、`docs/design/skill-card/`、各スキル一覧・詳細ページのVisual Reviewを確認する。

- [ ] 表全体が初期表示で収まらない場合のレイアウト対策を検討する
  - source: `26-2-advancement-page` のcontents review 3 とユーザー指示
  - classification: visual usability follow-up
  - plan: なし。`49-50-accessibility-responsive-pass`では再現せず保留としたため、必要性が再確認された時点で独立taskを計画する。
  - handling plan: 成長ページの「生き様係数」表など、本文コンテナ内で横スクロールが必要になり初期表示で全列を確認できない表について、情報の分割、列・見出しの再構成、画面幅に応じた表示、スクロール誘導などを比較する。既存table layout・共通design・アクセシビリティへの影響を確認し、方針を決めてから実装する。

- [ ] main以外のbranch / PRでdeployなしCIを回せるようにする
  - source: `17-github-actions-deploy-basic` issue review
  - classification: follow-up
  - plan: `docs/plan.md` の `56-ci-non-main-branches`
  - handling plan: GitHub Pages deploy workflowとは分離し、main以外のbranch / pull requestで `npm ci`、`npm run check`、`npm run build`、必要なtestを実行するCIを整備する。deployは行わず、GitHub Pages環境を更新しない。docs-only更新、AGENTS / SKILL更新のみの場合の扱いもCI方針として明確化する。

- [ ] Pagefindが`-local`確認ページをindex化した場合も、検索Visual Testを安定して実行できるようにする
  - source: PR #66 のdocument review
  - classification: follow-up
  - plan: `docs/plan.md` の `53-content-smoke-test`
  - handling plan: `-local/data-cards`をPagefind indexから除外するか、検索Visual Testのlocatorを公開対象の検索結果へ限定する。GitHub Pagesのsubpath検索と公開ページの検索結果が壊れないことを確認してから、Visual Capture全体をgreenにする。

- [ ] キャラクターシートの永続スキル参照でID変更を検出してエラーにする
  - source: `28-0-common-skills-data` 実装中のユーザー指示
  - classification: future data compatibility follow-up
  - plan: `ex-02-web-character-sheet` の初期範囲外。永続保存を追加する場合は、別taskを計画する。
  - handling plan: キャラクターシート機能がDBなどへスキルIDと取得レベルを保存する前に、名称、所属、区分、タイミングなどID入力値の変更で同一スキルのIDが変わったことを検出してエラーにする方式を設計する。比較に使う不変キーまたは移行マッピング、既存保存データとの照合時点、エラー表示、移行手順を決定し、ID変更を黙って保存データへ適用しない。

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

- [ ] GitHub Actionsで全件VRTを定期実行または公開直後に実行する
  - source: 2026-07-23のユーザー指示
  - classification: CI / visual regression follow-up
  - plan: なし。CIと公開workflowの責務を整理するtaskを追加してから紐付ける。
  - handling plan: buildとPagefind index作成後に全`@vrt` targetを比較できるGitHub Actions workflowを整備する。定期実行と公開直後実行のどちらか、または両方を選び、GitHub Pages公開時の実行順序、失敗時の通知、snapshot更新の扱いを定義する。PR前のローカル確認は、UI変更時だけ変更targetに限定する。

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
