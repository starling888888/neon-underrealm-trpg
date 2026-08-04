# TODO

このファイルは、現在のissueでは対応しないが、将来対応すべきレビュー指摘・改善候補を一時的に追跡するための一覧である。

このファイルは未対応TODOを中心に管理するactive TODOである。完了済みTODOを退避する場合は、削除せず `docs/TODO-done.md` へ移す。

TODOの退避は、対応内容がmerge済み、またはユーザーが完了扱いを承認した場合に限る。current issueで対応すべき修正をTODOへ逃がしてはならない。

PR merge後のTODO更新は `.agents/skills/post-merge-plan-update/SKILL.md` に従う。

`docs/TODO.md` は、`review-to-issue` workflowで以下のような項目を受ける。

- 現在のissue範囲を超える指摘
- 後続タスクで対応すべき改善
- 対象milestoneの `docs/issue/milestone-<NN>/plan.md` タスクに紐づく補足対応
- 対象milestoneの `docs/issue/milestone-<NN>/plan.md` に新しい計画項目を追加したうえで追跡すべき作業

TODO項目は、可能な限り対象milestoneの `docs/issue/milestone-<NN>/plan.md` の未完了計画項目へ紐づける。クローズ済みmilestoneの完了taskには紐づけず、後続milestoneで計画化する。

---

## 未対応

- [ ] ゲーム設計レビューの未解決高優先度・GM項目をトリアージする
  - source: PR #187の文書レビュー
  - classification: follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 2（GMセクション）。
  - handling plan: GMセクションを作成してから、`docs/game-design/2026-08-02_game-review.md`の未解決項目を、対応しない判断、FAQ候補、公開ルールの個別issue、GM-01/GM-02を含むPhase 2へ分類する。Phase 1ではトリアージ、FAQ、ルール実装を行わない。

- [ ] キャラクターシートの候補行を選択可能に見せるデザインを検討する
  - source: `.tmp/review/ex-02-31-sheet-integration/contents-review-1.md` とユーザー判断
  - classification: visual usability follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 3。キャラクターシートのdesign改訂を対象とする独立taskを計画してから実装する。
  - handling plan: skill・item候補dialogで、候補名または行全体が選択可能であること、選択済み・非選択・選択不可の状態を視覚だけで区別できる表現を検討する。既存designと操作導線への影響を確認し、方針を承認してから実装する。

- [ ] 覚悟から縁へ戻す効果の表現を整理する
  - source: `ex-02-web-character-sheet` の要件レビューに対するユーザー回答
  - classification: rule wording follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 3。ルール文言整理の独立taskを計画してから実装する。
  - handling plan: `src/pages/rules/battle.mdx`の「入れ替えができなくなる」と、スキル効果の「覚悟を縁に戻す」を、覚悟を解除する効果は許可する意図が明確になる表現へ整理する。生成JSONのスキル本文を変更する場合は、対応する生成元から更新する。

- [ ] JSONのスキーマバージョン差異との互換性を担保する
  - source: `ex-02-web-character-sheet` の要件レビューに対するユーザー回答
  - classification: future data compatibility follow-up
  - plan: なし。複数のJSON形式を継続して扱う必要が明確になるまで計画化しない。
  - handling plan: 2026-08-04のユーザー判断により当面保留する。現在はスキーマバージョンを保存・比較せず、正常に処理できないJSONを一律エラーにする。将来、バージョン番号、受け入れ可能な旧形式、移行処理、エラー表示、テストfixtureを定義して互換性を担保する。

- [ ] Astro Component contract testの基盤を導入する
  - source: `28-2-common-skills-page` の技術レビューにおけるユーザー指示
  - classification: test architecture follow-up
  - plan: なし。費用対効果を再評価してから必要なら計画化する。
  - handling plan: `SkillCard`、`NpcCard`などへ固定propsを渡し、文言、値、fallback、想定タグ、属性をComponent単位で確認できる基盤を検討する。Visual Testはfixture・外部データの内容へ依存させず、画面構造、responsive layout、overflow、ナビゲーション状態、スクリーンショットに限定する。

- [ ] 既存Node testをVitestへ段階的に移行する
  - source: `ex-02-4-sheet-profile` のテストアーキテクチャレビューにおけるユーザー指示
  - classification: test architecture follow-up
  - plan: なし。G4のreview対応とは分離し、Vitest導入後の既存test数・Node固有API・CI実行時間を確認してから独立taskを計画する。
  - handling plan: 現在の`node --import tsx --test`で動く純粋logic / schema testをVitestの`describe` / `it` / `expect`へ段階的に移す。Component / hook testと同じrunner・coverage・watch設定に統一する一方、移行中はNode testとVitest testを混在させ、各対象の実行結果とCI scriptを確認してから旧scriptを廃止する。E2Eの責務は最終smokeのまま変更しない。

- [ ] 全スキルのsummary整備後に、`SkillCard`でsummaryを再表示する
  - source: `30-2-ryugi-detail-page` 実装後のユーザー指示
  - classification: data quality follow-up
  - plan: なし。全スキルのsummaryを確認できるデータ整備タスクを計画した時点で紐付ける。
  - handling plan: 現行の生成JSONと`SkillCard` propsではsummaryを保持するが、全スキル分の内容が完成するまでカードに表示しない。再表示時はデータ完成範囲、`docs/requirements/data-display.md`、`docs/design/skill-card/`、各スキル一覧・詳細ページのVisual Reviewを確認する。

- [ ] 表全体が初期表示で収まらない場合のレイアウト対策を検討する
  - source: `26-2-advancement-page` のcontents review 3 とユーザー指示
  - classification: visual usability follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 3。情報設計とresponsive表示を検討する独立taskを計画してから実装する。
  - handling plan: 成長ページの「生き様係数」表など、本文コンテナ内で横スクロールが必要になり初期表示で全列を確認できない表について、情報の分割、列・見出しの再構成、画面幅に応じた表示、スクロール誘導などを比較する。既存table layout・共通design・アクセシビリティへの影響を確認し、方針を決めてから実装する。

- [ ] Pagefindが`-local`確認ページをindex化した場合も、検索Visual Testを安定して実行できるようにする
  - source: PR #66 のdocument review
  - classification: follow-up
  - plan: なし。milestone-01はクローズ中のため、後続milestoneで検索Visual Test安定化taskを計画してから紐づける。
  - handling plan: `-local/data-cards`をPagefind indexから除外するか、検索Visual Testのlocatorを公開対象の検索結果へ限定する。GitHub Pagesのsubpath検索と公開ページの検索結果が壊れないことを確認してから、Visual Capture全体をgreenにする。

- [ ] キャラクターシートの永続スキル参照でID変更を検出してエラーにする
  - source: `28-0-common-skills-data` 実装中のユーザー指示
  - classification: future data compatibility follow-up
  - plan: なし。永続保存を追加する必要が明確になるまで計画化しない。
  - handling plan: 2026-08-04のユーザー判断により当面保留する。キャラクターシート機能がDBなどへスキルIDと取得レベルを保存する前に、名称、所属、区分、タイミングなどID入力値の変更で同一スキルのIDが変わったことを検出してエラーにする方式を設計する。比較に使う不変キーまたは移行マッピング、既存保存データとの照合時点、エラー表示、移行手順を決定し、ID変更を黙って保存データへ適用しない。

- [ ] キャラクターシートの派生logicからマスタID解決を分離する
  - source: ChatGPT review draft (`.tmp/chatgpt-review.md`) のG7 review
  - classification: architecture follow-up
  - plan: G24とは別の設計・実装taskとして扱う。
  - handling plan: `logic/`はマスタIDではなく、`master-data/`またはPresenter adapterが解決した選択中流儀・生き様のview modelを入力として受ける。未知IDの検出・復元時の除外・エラーはpersistence / import境界で明示し、未選択と同じ`undefined`として派生logicへ渡さない。G24は既存`logic/`を変更せず、read-only master-data adapterを入力にした復元境界だけを実装する。この分離taskではfixtureを使うlogic testへ更新する。

- [ ] Footerからクレジット導線を出すか将来検討する
  - source: `phase-2-prep-doc-agent-ops` Group 12
  - classification: low-priority follow-up
  - plan: なし。Footerからの常設導線が必要になるまで計画化しない。
  - handling plan: 2026-08-04のユーザー判断により当面保留する。初期実装ではFooterをコピーライト、GitHub、X、Discordに絞る。クレジット本文はトップページや将来の専用ページで扱い、Footer導線は必要性が明確になってから追加する。

<!--
例:

- [ ] TODO title
  - source: `.tmp/pr-N-review.md`
  - classification: follow-up / out-of-scope
  - plan: 対象milestoneの `docs/issue/milestone-<NN>/plan.md` の該当項目
  - handling plan: 将来どのタスクでどう扱うか
-->
