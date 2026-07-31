# NN-slug

## 最優先のデザイン入力

Gate子issueがUI、CSS、layout、page、Componentを扱う場合は、この節をtitleの直後に残す。

- 実装時に、対象の`.tmp/design/<design-target>/`配下にある承認済みdesign画像を遵守する。
- ユーザーの最新指示は画像デザインを上書きする。
- 画像デザインを遵守した実装を基準に、ユーザー指示を受けて微調整を行う。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、画像デザインの代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

このタスクで達成する目的を書く。

## 背景

このタスクが必要になった理由を書く。

関連する要件がある場合は、以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/issue/milestone-<NN>/plan.md`
- `docs/TODO.md` に関連項目がある場合は該当TODO
- UI、CSS、layout、page、Componentタスクで該当する場合は `docs/design/<design-target>/`
- design intent / VRT参照情報の作成が必要な場合は `.agents/skills/design-image-generation/SKILL.md`

## Gate関係（Gate作成またはGate分割を明示指示された場合のみ）

通常issueではこの節を削除する。Gateを使う場合、親issueでは専用Gate planへの参照だけを記録し、Gate一覧はここに書かない。

- 親issue: `なし（このissueが親issue）` または `docs/issue/NN-slug.md`
- Gate plan: `docs/issue/NN-slug/plan.md`
- Gate: 親issueでは `なし`。子issueでは `G1: Gate名` のように1件だけ記録する。

子issueは、この節と選択したGate briefだけで、新しいsessionから実装準備を開始できなければならない。

`docs/issue/milestone-<NN>/plan.md` はmilestoneの計画・履歴専用pathであり、このGate関係のplanではない。通常issueのGate一覧をmilestone planへ書かない。

## 対象範囲

このタスクで変更してよい範囲を書く。

例：

- `astro.config.mjs`
- `src/lib/utils/paths.ts`
- `docs/deployment.md`

## 初期スコープ外

このタスクで実装してはいけないことを書く。

例：

- 検索機能を実装しない
- UIデザインを作り込まない
- Excel変換処理を作らない
- キャラクターシート機能を作らない
- アクセス解析を追加しない
- DB、認証、SSR、CMSを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] 条件1
- [ ] 条件2
- [ ] 条件3
- [ ] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている
- [ ] UI系タスクの場合は、参照するdesign targetとVRT baselineの扱いが記録されている
- [ ] design notesの作成またはVRT baseline更新が必要な場合は、`design-image-generation` の実行を前提条件として記録している
- [ ] `npm run build` が通る
- [ ] 必要に応じて `npm run check` が通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない
- [ ] 関連する `docs/design/` と矛盾していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `path/to/file`
- `path/to/file`

## レビュー観点

人間レビュー時に確認してほしい観点を書く。

UI、CSS、layout、page、Componentタスクでは、該当する `docs/design/<design-target>/` に対して確認してほしい観点を書く。

関連TODOを扱う場合は、TODOをこのissueで回収してよいか確認してほしい観点を書く。

design notesの作成またはVRT baseline更新が必要な場合は、`design-image-generation` に切り出す前提条件が正しいか確認してほしい観点を書く。

## 備考

必要な補足を書く。
