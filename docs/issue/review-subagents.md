# review-subagents

## 目的

ローカル作業内でissueの妥当性確認とPRレビューを実施できるようにする。ゲーム固有要件、文書とスコープ、実装とCodex運用文書を、それぞれ専門のreviewer sub-agentが確認するworkflowを整備する。

## 背景

`gpt-5.6-terra` により従来5.5相当のタスクのクレジット消費が抑えられ、Proプラン契約により利用可能なクレジットにも余裕がある。このため、クレジット節約を目的にChatGPTへ切り出していたissue作成とPRレビューを、ローカルのCodex作業へ集約する。

このtaskは `docs/plan.md` 外の、ユーザーの明示指示による独立taskとして扱う。`docs/TODO.md` に直接対応する項目はない。

## 対象範囲

- `.codex/agents/*.toml`に、以下3役割のreviewer sub-agent定義を追加する。
  - issue reviewer: ローカルissueの整合性、要件の明確さ、ネオン・アンダーレルムTRPGの既存要求との適合を確認する。
  - document reviewer: PRに含まれる文書の整合性とcurrent issueからのスコープ逸脱を確認する。
  - technical reviewer: フロントエンドとAI Opsの専門観点から実装とCodex用Markdownを確認し、バグと保守性の問題を確認する。
- reviewer定義のmodel、reasoning設定、起動時のinput、担当範囲、出力形式、レビュー対象外、判定に迷う場合の停止条件を定義する。TOMLのfieldとmodel名は、実装時点のCodexで利用可能なschemaに照合する。
- issue reviewer、document reviewer、technical reviewerの出力本文はすべて日本語とする。既存`pr-review-draft`の出力formatを基礎に、レビュー結論、対象範囲・対象外、指摘事項、指摘なしとして確認した観点、判断不能・ユーザー確認事項を必須にする。
  - 各指摘事項には、重大度、対象ファイル・行、根拠、影響、推奨対応を記載する。
- `issue-first-development` を更新し、branch作成直後に`.tmp/review/<branch-name>/`を作成する手順を追加する。
- local repository modeでissue準備後にissue reviewerを起動するworkflowを追加する。
  - remote snapshot draft modeではreviewerを起動せず、ローカルファイルも作成しない。ユーザーがremote draftをローカルへ置き、`issue-first-development`を起動した時点でlocal repository modeとしてreviewする。remoteとローカルの同期・共有機構は実装しない。
  - issue reviewerは`.tmp/review/<branch-name>/issue-review-1.md`を出力する。指摘がない場合は、そのままユーザーレビューモードへ移行する。
  - 1回目に妥当な指摘がある場合はissueを自己修正し、`.tmp/review/<branch-name>/issue-review-2.md`を出力する。
  - 2回目のreview完了後は、指摘の有無にかかわらずユーザーレビューモードへ移行する。残る指摘または判断不能事項はユーザーへ明示する。
  - 解消済みのissue reviewer指摘は、レビュー履歴としてissueへ正本化しない。
  - ユーザーレビュー後のissue修正ではreviewerを再起動せず、ユーザーとの対話で改善する。
- ユーザーの明示指示によりcurrent issue外のGit管理ファイルを変更した場合、変更内容と指示に基づく旨を`.tmp/review/<branch-name>/`配下の専用記録ファイルへ追記するworkflowを追加する。
  - ユーザー指示、分類、変更対象、変更前後、current issueとの関係、関連commitまたはPRを記録する。
  - 要求または初期スコープ外SSoTを変更する場合は、変更元SSoTとcurrent issueを同じtaskで更新し、相互に矛盾させない。
  - 一時記録はPR作成時の説明のsourceとする。
- PR templateと`create-pr`を更新し、前記の専用記録ファイルをsourceとして、ユーザー明示指示によるcurrent issue外変更をPR descriptionへ記載する。
  - このPR description項目はdocument reviewerのレビュー対象外とする。
- PR作成後と、Codexへ既存PR branchへのpushを指示した後に、local PR review workflowを実行する。
  - ユーザーがCodex外で実行したpushの検知・追従は対象外とする。
  - PR作成直後は、PR base commitからcurrent head commitまでの全差分をreview対象として、document reviewerとtechnical reviewerを起動する。
  - push後は、前回の`.tmp/review/<branch-name>/pr-review-N.md`に記録したreview対象commitの次から、現在のhead commitまでの全commitをレビュー対象とする。
  - 差分がある場合、document reviewerとtechnical reviewerは`.tmp/review/<branch-name>/document-review-N.md`および`technical-review-N.md`を出力する。
  - 各PR review cycleは`.tmp/review/<branch-name>/pr-review-N.md`に、review対象範囲、review対象head commit、利用したremote PR情報、関連する2つのreview出力を記録する。次回の比較範囲は、このcommit hashを基準にする。
  - リモートPRのmetadata、diff、discussionをレビュー対象とし、reviewerのskill定義とagent定義はローカル作業ツリーのものを使う。ローカル定義が`main`未反映またはレビュー対象に含まれていても、レビューを停止しない。
  - 検証済みでcurrent issueに属する指摘は`review-to-issue`でissueへ正本化する。scope外または後続対応の指摘は、既存のrouting規則に従う。
  - `review-to-issue`の反映後に停止し、ユーザー確認前に実装へ進まない。
- `review-to-issue`を更新し、local reviewer出力のsource、検証、正本化、停止条件を既存のreview intake規則と矛盾なく扱う。
- `post-merge-plan-update`を更新し、正本化済みであることを確認した後に`.tmp/review/<merged-branch>/`を中身ごと削除する。
  - `.tmp/`全体や他branchの一時ファイルは削除しない。
- 追加・変更したskillやreviewer定義への入口を、必要な`.agents/skills/README.md`、`AGENTS.md`、関連ruleへ更新する。

## 初期スコープ外

- 静的サイトのページ、UI、CSS、ゲームルール本文、生成JSONを変更しない。
- 新しいnpm package、外部review service、CI/CD job、GitHub Actionsを追加しない。
- GitHub上のPRやIssueを自動作成、merge、push、tag、releaseしない。
- `.tmp/`をGit管理しない。また、`.tmp/review/<branch-name>/`以外の一時ファイルをmerge後cleanupで削除しない。
- reviewer指摘を未検証のままcurrent issue、`docs/TODO.md`、`docs/plan.md`、`docs/agent-failure-log.md`へ反映しない。
- ユーザー承認後のissue修正に対して、自動でreviewerを再実行しない。
- remoteとローカルのissue draft、review記録、branch状態を同期または自動検知する仕組みを実装しない。
- ユーザーがCodex外で実行したpushを自動検知または自動レビューしない。
- AIモデルの選択、料金、利用枠を自動管理する機能を追加しない。

## 完了条件

- [x] `.codex/agents/*.toml`に3役割のreviewer sub-agentが定義され、model、責務、参照SSoT、出力、停止条件、対象外が明確である。
- [x] すべてのreviewer出力が日本語であり、レビュー結論、対象範囲・対象外、根拠を含む指摘事項、指摘なしの確認観点、判断不能事項を確認できる形式である。
- [x] `issue-first-development`がbranch作成後に`.tmp/review/<branch-name>/`を作成し、local repository modeでissue reviewerを最大2回実行する。
- [x] remote snapshot draft modeではreviewerやローカル一時ファイルを作成せず、ユーザーがローカルに置いたdraftのissue-first実行時だけreviewerを起動する。
- [x] 1回目に指摘がない場合、または2回目のreview完了後にユーザーレビューモードへ移行し、解消済み指摘の恒久的な履歴を要求しない。
- [x] ユーザーレビュー後はissue reviewerを再実行せず、ユーザーとの対話によるissue更新へ移る。
- [x] ユーザー明示指示によるcurrent issue外変更が、必要なSSoT、current issue、`.tmp/review/<branch-name>/`の専用記録へ必要な粒度で記録される。
- [x] PR templateと`create-pr`が、専用記録をsourceとするcurrent issue外変更のPR description項目を扱う。
- [x] document reviewerが、前記PR description項目をレビュー対象外として扱う。
- [x] Codexへ既存PR branchへのpushを指示した場合だけ、前回の`pr-review-N.md`に記録したcommit以降の全commitを対象としてdocument reviewerとtechnical reviewerを起動する。
- [x] PR作成直後はPR base commitからcurrent head commitまでをレビューし、Codex外でのpushを検知・レビューしないことが明記されている。
- [x] `pr-review-N.md`が各PR review cycleのcommit基準とremote PR情報を保持し、同一commit範囲を重複レビューしない。
- [x] リモートPRをレビュー対象にし、ローカルのagent・skill定義が`main`未反映またはレビュー対象でも停止しない。
- [x] local reviewerの検証済み指摘が`review-to-issue`を通じてissueへ正本化され、取り込み後にユーザー確認待ちで停止する。
- [x] `post-merge-plan-update`が、正本化を確認してから対象branchの`.tmp/review/`ディレクトリだけを削除する。
- [x] 関連TODOを扱わない理由が記録されている。
- [x] `git diff --check`が通る。
- [x] Markdown formatterと`npm run check:md`が通る。

## チェックポイント

- [x] reviewerの要件・判断基準が`AGENTS.md`、current issue、`docs/requirements.md`、`docs/out-of-scope.md`、`docs/plan.md`、`docs/TODO.md`の優先順位と矛盾していない。
- [x] remote snapshot draftをローカル検証済み事実として扱わない。
- [x] reviewerの起動が、既存の明示承認、commit、push、PR作成、mergeの安全制約を緩めていない。
- [x] reviewerが判断できない指摘を、自動で要求変更やscope拡大として扱わない。
- [x] ユーザー明示指示によるcurrent issue外変更で、必要なSSoT、current issue、PR description用一時記録が矛盾していない。
- [x] `.tmp/review/<branch-name>/`の一時出力と、issue・TODO・plan・failure logの正本を混同していない。
- [x] 差分reviewの比較基準が前回の`pr-review-N.md`のcommit hashであり、同一commit範囲を重複レビューしない。
- [x] 既存ルート、GitHub Pagesのサブパス公開、サイトbuildに影響する実装を追加していない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `.codex/agents/issue-reviewer.toml`
- `.codex/agents/document-reviewer.toml`
- `.codex/agents/technical-reviewer.toml`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/pr-review-draft/SKILL.md`
- `.agents/skills/review-to-issue/SKILL.md`
- `.agents/skills/create-pr/SKILL.md`
- `.agents/skills/post-merge-plan-update/SKILL.md`
- `.agents/skills/README.md`
- `.agents/rules/data-management.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `docs/requirements.md`、`docs/out-of-scope.md`など、ユーザー明示指示で変更対象になった既存SSoT

既存`pr-review-draft`のremote PR reviewとoutput formatを拡張し、local reviewer起動と`review-to-issue`へのhandoffを扱う。不要な重複skillは追加しない。

## レビュー観点

- issue reviewer、document reviewer、technical reviewerの責務分割が明確で、同じ指摘を不必要に重複しないか。
- reviewer出力が日本語で、ユーザーがレビュー根拠と判定を確認できる粒度か。
- issue準備段階の最大2回の自己修正loop、remote draftをローカルに置いた後だけreviewする境界、ユーザーレビュー後に再レビューしない停止条件が明確か。
- current issue外変更の記録について、必要なSSoTとcurrent issueを正本とし、一時記録をPR description作成用に限定できているか。
- Codexへ指示したpushだけを契機に、前回の`pr-review-N.md`のcommit hash以降を累積レビューする基準が明確か。
- remote PRを対象に、ローカルのagent・skill定義を用いることが実用上十分か。
- `review-to-issue`へ渡すのが検証済みの必要情報だけになっているか。
- merge後cleanupの対象が`.tmp/review/<branch-name>/`に限定され、他の一時ファイルを失わないか。
- 既存`pr-review-draft`を拡張しても、remote PR review draftとしての位置づけと停止条件が失われないか。

## 備考

- UI、CSS、layout、page、Component taskではないため、design targetおよび`design-image-generation`の前提条件はない。
- `.tmp/`は共有成果物ではない。永続的に必要な情報だけをissue、TODO、plan、failure log、PR descriptionへ反映し、merge後に対象branchのreview一時ディレクトリを削除する。
- non-interactive `codex exec`によるcustom subagent smoke testは、app-serverのsubagent threadを作成できず起動確認に使えなかった。TOML schema、local model catalog、strict-config読み込み、Markdown検査は確認済みである。interactive Codex clientでのcustom subagent起動は、このissueの次回実運用で確認する。
- 実装開始には、このissueへの明示承認が必要である。
