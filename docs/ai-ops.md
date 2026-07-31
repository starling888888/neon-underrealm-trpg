# AI Ops方針

この文書は、Codexを含むagentがこのrepositoryで作業する時の文書体系と責務を案内する。最上位の強制規約は `AGENTS.md` を正本とする。

## 正本の役割

- `AGENTS.md`: 安全制約、停止条件、Git操作、作業開始・完了時の最上位ルール。
- `.agents/skills/*/SKILL.md`: issue-first、design、Visual Review、PR、post-mergeなどの定型workflow。
- `.agents/rules/*.md`: workflowに共通する持続的な規約と理由。
- `.codex/agents/*.toml`: reviewerの対象範囲と出力契約。agentの実行設定を変更する場合は、明示されたtask scopeに含める。
- `docs/issue/<issue-slug>.md`: 承認済みtaskの実装契約。
- `docs/issue/milestone-01/plan.md`: milestone-01の計画・履歴。Gate planではない。

## 作業の境界

implementation taskは、ユーザーがissueを明示承認した後だけ開始する。Gateの一覧と耐久的な引継ぎは `docs/issue/<parent-issue>/plan.md` に置き、通常issueやmilestone planへGate一覧を混在させない。

レビュー出力、比較メモ、外部snapshotは `.tmp/` に置く一時入力である。確認済みの要件、判断、後続対応だけをissue、TODO、requirements、milestone planへ反映する。

ユーザーが承認していないcommit、push、PR、release、scope拡張を行わない。現行実装と文書が矛盾する場合は、現在taskの指示と上位規約に従い、必要な正本を同じtaskで整合させる。
