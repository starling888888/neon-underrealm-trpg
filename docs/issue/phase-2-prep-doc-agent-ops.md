# phase-2-prep-doc-agent-ops

## 目的

Phase 1完了後 / Phase 2開始前に、ドキュメント、agent向け指示、SKILL、tracking file、issue配置、テンプレート、PR作成運用、開発構造方針を整理し、以後の作業者およびagentが古い前提、長大ファイル、曖昧な参照点に誘導されない状態を作る。

このタスクの目的は、単なるPhase 1完了後の表記揺れ修正ではない。

主目的は以下の4つである。

1. Phase 2に向けたドキュメント整合性を担保する
2. Phase 2に向けた開発品質向上SKILLと運用を追加する
3. 長大ファイルによるagentのtoken浪費を防ぐため、参照単位ごとにファイルを分割する
4. 1ディレクトリ内に複数種類のファイルが混在して参照点が曖昧になる状態を避けるため、ディレクトリ構造を整理する

このタスクでは、`AGENTS.md`、`docs/requirements.md`、`docs/plan.md`、`docs/TODO.md`、`docs/agent-failure-log.md`、`.agents/skills/*`、`.github` 配下のテンプレートなど、agentが頻繁に参照するファイルと運用入口を整理する。

また、各変更は人間が意味のある範囲でレビューし、その後にcommitできるよう、Group単位で進める。

## 背景

Phase 1完了後、Phase 2へ進む前の段階で、以下のような実装・運用が進んでいる。

- MDX対応
- GitHub Pagesサブパス対応
- SEO / OGP Component
- Visual Review基盤
- 共通Layout、Header / Footer、SiteMenu、MobileMenu、PageToc、MobilePageToc、現在ページハイライト
- GitHub Actionsによる基本デプロイ
- issue-first workflow
- review-to-issue workflow
- post-merge-plan-update workflow
- agent failure log運用

一方で、現在のドキュメント群には以下の問題がある。

- 一部ドキュメントに「後続タスクで追加」「未実装」など、Phase 1完了状態およびPhase 2開始前の前提と一致しない表現が残っている
- `AGENTS.md` が最上位規約、詳細workflow、理由、補足、技術方針、将来拡張まで抱えて長大化している
- `docs/requirements.md` が要件、ページ仕様、実装方針、ディレクトリ構成、package scripts案を同居させて長大化している
- `docs/plan.md`、`docs/TODO.md`、`docs/agent-failure-log.md` に完了済み情報が残り続けると、agentが毎回読む情報量が増える
- 完了済みissueが `docs/issue/` 直下に残り続けると、現在作業対象と過去記録の参照点が曖昧になる
- `issue-first-development` SKILLにissue作成テンプレート本文が直接埋め込まれており、SKILLが長文化している
- ChatGPT / remote snapshot draft modeでissue draftを作成する際、SKILL内テンプレートを安定して参照できないことがある
- `issue-first-development` SKILL使用時に、GitHub Issueを勝手に発行してよいかが曖昧になりうる
- PR作成時に使う最小テンプレートと、PR作成指示で発火する専用SKILLがない
- PR作成時に、対応issueの完了条件・チェックポイントに未チェックが残っていても、安全に停止してユーザー確認する仕組みが明文化されていない
- `review-to-issue` でレビュー指摘を取り込む際、通常の実装品質レビューとagent failureを区別して記録する基準が不十分である
- 同種失敗3回以上の恒久対応候補について、ユーザーが手動で呼び出せる監査SKILLがない
- `scripts/` や `src/` 配下の分割方針がAGENTSや開発構造方針として明確化されていない
- agent専用ファイルが長文化しており、controlled Englishで短縮できる可能性がある

関連する要件、運用、調査結果は以下を参照する。

- `AGENTS.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/review-to-issue/SKILL.md`
- `.agents/skills/post-merge-plan-update/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/agent-failure-log.md`
- `docs/content-writing-guide.md`
- `docs/deployment.md`
- `.tmp/phase1-doc-consistency-report.md`

このタスクはUI、CSS、layout、page、Component実装を主目的としないため、新規design画像は不要である。

## 対象範囲

このタスクで変更してよい範囲は以下とする。

### issue定義

- `docs/issue/phase-2-prep-doc-agent-ops.md`

### GitHubテンプレート

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/issue-first-development.md`

### AGENTS / agent rules / skills

- `AGENTS.md`
- `.agents/skills/README.md`
- `.agents/rules/README.md`
- `.agents/rules/core-rules-rationale.md`
- `.agents/rules/git-operations.md`
- `.agents/rules/data-management.md`
- `.agents/rules/mcp-context7.md`
- `.agents/rules/work-report.md`
- `.agents/rules/file-structure.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/create-pr/SKILL.md`
- `.agents/skills/review-to-issue/SKILL.md`
- `.agents/skills/post-merge-plan-update/SKILL.md`
- `.agents/skills/failure-log-audit/SKILL.md`
- その他、`.agents/skills/*/SKILL.md` のうちcontrolled English化の対象となるagent専用ファイル

### requirements / docs構造

- `docs/requirements.md`
- `docs/requirements/overview.md`
- `docs/requirements/architecture.md`
- `docs/requirements/non-functional.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/search.md`
- `docs/requirements/data-display.md`
- `docs/requirements/data-id-policy.md`
- `docs/requirements/release-notes.md`
- `docs/requirements/assets-seo.md`
- `docs/requirements/components.md`
- `docs/development-structure.md`

### tracking / done / failure-log

- `docs/plan.md`
- `docs/plan-done.md` または同等の完了履歴ファイル
- `docs/TODO.md`
- `docs/TODO-done.md` または同等の完了履歴ファイル
- `docs/agent-failure-log.md`
- `docs/agent-failure-log-done.md` または同等の完了履歴ファイル
- `docs/issue/`
- `docs/issue/done/phase-0/`
- `docs/issue/done/phase-1/`
- `docs/issue/done/phase-2/`
- `docs/issue/done/cross-phase/`

### Phase 1完了状態 / Phase 2開始前の整合対象

- `README.md`
- `docs/deployment.md`
- `docs/TODO.md`
- `docs/content-writing-guide.md`
- `docs/requirements.md`
- `docs/requirements/*`
- `docs/plan.md`
- `docs/issue/12-mobile-menu.md`
- `docs/issue/17-github-actions-deploy-basic.md`

### 実ファイル構造

- `scripts/`
- `src/components/`
- `src/lib/`
- `src/scripts/`
- import path
- 必要に応じたテスト

## 初期スコープ外

このタスクでは以下を行わない。

- サイト機能の新規実装をしない
- UI / CSS / layout / page / Componentの見た目変更を主目的にしない
- 新規ページを作成しない
- design画像を作成または更新しない
- Visual Review screenshotを取得しない
- GitHub Actions workflowを変更しない
- Pagefind導入、検索UI、検索index生成を実装しない
- Excel変換処理、JSONスキーマ、データ取得層を新規実装しない
- 生成JSONを作成または手編集しない
- DB、認証、SSR、CMS、APIサーバー、キャラクターシート、ダイスローラー、戦闘シミュレーター等の初期スコープ外項目を追加しない
- `docs/plan.md` の完了チェック状態を勝手に変更しない
- 完了条件・チェックポイントの未チェック項目を、移動のために完了扱いへ変更しない
- 未完了issueを `docs/issue/done/` へ移動しない
- 対応未完了failureを完了扱いしない
- ユーザー確認前にfailure-logをdone側へ退避しない
- failure-logに記録された失敗への恒久対応を、このタスク内でユーザー承認なしに実装しない
- 新規failure-log監査SKILLの承認後対応フェーズを、このタスク内で自動実行しない
- `issue-first-development` SKILL使用時に、ユーザーの明示指示なしでGitHub Issueを作成しない
- ユーザーの明示指示なしにPRを作成しない
- PR作成SKILL追加後も、未チェック項目がある状態でユーザー承認なしにPRを作成しない
- PR作成SKILLでmerge、tag、releaseを実行しない
- AGENTS.md短縮のために安全制約を削除しない
- 最重要停止条件をAGENTS.md本体から外部ファイルへ追い出さない
- user-facing docs、requirements、TRPG game rule text、game terminologyをtoken削減目的で英語化しない
- 日本語固有概念をtoken削減目的で一般英語へ置換しない
- 実ファイル移動と挙動変更を同一変更に混ぜない
- 不要な依存関係を追加しない
- ユーザーの未コミット変更を破壊しない

## 完了条件

- [ ] このissueが、目的、背景、対象範囲、初期スコープ外、完了条件、チェックポイント、Group単位の作業順を含む形で確定している
- [x] `.github/pull_request_template.md` が作成されている
- [x] PRタイトルフォーマットがissue単位branch運用と矛盾していない
- [x] PRタイトルはissue slugのみを原則としている
- [x] PRタイトルにcommit type、Group番号、issue slugの言い換え説明を必須としていない
- [x] PR本文がissue本文の再掲ではなく、関連issueへの導線中心になっている
- [x] PR本文にRelated issue、Summary、Review focus、Review handlingのみを置く方針になっている
- [x] PR本文にChanged areas、Group completion、Checks、Unchecked / Not verified、Scope guardを置かない方針になっている
- [x] review-to-issueとfailure-log運用への接続がPRテンプレートに記載されている
- [x] `.github/ISSUE_TEMPLATE/issue-first-development.md` が作成されている
- [x] 既存のissue作成テンプレート本文が `issue-first-development` SKILLから外部化されている
- [x] `issue-first-development` SKILLが `.github/ISSUE_TEMPLATE/issue-first-development.md` を参照する運用に変更されている
- [x] ChatGPT / remote snapshot draft modeでは、完成版issue本文をチャットに出力する方針が明記されている
- [x] local repository modeでは、`docs/issue/<issue-slug>.md` をローカルファイルとして作成する方針が明記されている
- [x] `issue-first-development` SKILL使用時に、ユーザーの明示指示なしでGitHub Issueを発行してはならないことが明記されている
- [x] ChatGPT / remote snapshot draft modeでは、GitHub Issueもrepository fileも作成済みと主張しない方針が明記されている
- [x] local repository modeでも、GitHub Issue作成は明示指示がある場合に限ることが明記されている
- [x] テンプレート参照失敗時に、推測でテンプレートを再構成しない方針が明記されている
- [x] `.agents/skills/create-pr/SKILL.md` が作成されている
- [x] `.agents/skills/README.md` にPR作成SKILLの使用条件が追加されている
- [x] PR作成指示で `create-pr` SKILLが発火することが明記されている
- [x] PR作成はGitHubへの書き込み操作であり、ユーザーの明示的なPR作成指示がある場合にのみ実行することが明記されている
- [x] PRレビュー指示とは発火条件が分離されている
- [x] `create-pr` SKILLが `.github/pull_request_template.md` を使用してPR本文を作ることが明記されている
- [x] `create-pr` SKILLで、PR titleはissue slugのみを原則とすることが明記されている
- [x] `create-pr` SKILLで、PR本文にChanged areas、Group completion、Checks、Unchecked / Not verified、Scope guardを追加しないことが明記されている
- [x] `create-pr` SKILLで、対応するissueファイルの完了条件・チェックポイントを確認することが明記されている
- [x] 未チェック項目が残っている場合、PR作成前にユーザー承認を得ることが明記されている
- [x] ユーザー承認なしに、未チェック項目ありのPRを作らないことが明記されている
- [x] PR作成後の報告項目が明記されている
- [x] `create-pr` SKILLがmerge、tag、release、review-to-issue処理を行わないことが明記されている
- [x] `AGENTS.md` が最上位規約と参照ルーターとして短縮されている
- [x] `AGENTS.md` の最重要ルールが理由なし箇条書きになっている
- [x] 最重要ルールの理由が `.agents/rules/core-rules-rationale.md` へ分離されている
- [x] `AGENTS.md` に可変的な個別issue、plan、TODO、作業依存関係を置かない方針が明記されている
- [x] `AGENTS.md` を更新してよい場合と、更新すべきでない場合が明記されている
- [x] SKILL一覧と使用条件が `.agents/skills/README.md` に分離されている
- [x] rules一覧と参照場面が `.agents/rules/README.md` に分離されている
- [x] `.agents/rules/` と `.agents/skills/` の役割分担が明確になっている
- [x] `.agents/rules/*` はagent-facing fileとしてcontrolled English化の対象に含めてよいことが明確になっている
- [x] `AGENTS.md` にしかなかった内容が削除されず、適切な `.agents/rules/`、`.agents/skills/`、またはdocsへ転記されている
- [x] `AGENTS.md` から詳細へ辿れるが、詳細を常時読む要求になっていない
- [x] `docs/requirements.md` が要件索引として短縮されている
- [x] 詳細要件が `docs/requirements/` 配下へ作業時の参照単位で分割されている
- [x] requirements分割が章番号ベースではなく、作業種別ごとの参照単位になっている
- [x] `docs/requirements.md` に要件ファイル一覧と参照場面が記載されている
- [x] `docs/requirements.md` に作業種別ごとの参照先が記載されている
- [x] 推奨ディレクトリ構成、`.gitignore`、package scripts案が要件本文から分離されている
- [x] 開発構造方針が `docs/development-structure.md` に整理されている
- [x] `scripts/` のプログラム単位分割方針が明記されている
- [x] `scripts/<program>/main.ts` と `scripts/<program>/lib.ts` の責務分離が明記されている
- [x] `lib.ts` 長大化時に対象プログラム配下の `lib/` ディレクトリへ分割する方針が明記されている
- [x] 複数プログラムから参照するモジュールを `scripts/_common/` に置く方針が明記されている
- [x] `src/components`、`src/lib`、`src/scripts` も目的ごとにディレクトリを切る方針が明記されている
- [x] `scripts/`、`src/components/`、`src/lib/`、`src/scripts/` が開発構造方針に沿って整理されている
- [x] `docs/plan.md`、`docs/TODO.md`、`docs/agent-failure-log.md` を未実行・未対応中心にする方針が定義されている
- [x] plan / TODO / failure-log の完了済み退避先が定義されている
- [x] `post-merge-plan-update` に、merge後のplan / TODO / issue完了移動ルールが追加されている
- [x] issue移動時のphase判定、cross-phase判定、対象外ファイル、移動条件が明確になっている
- [x] phaseに属する完了済みissueと、phaseに閉じない横断整備issueの退避先が分離されている
- [x] `docs/issue/done/phase-N/` と `docs/issue/done/cross-phase/` の使い分けが明記されている
- [x] 移動したissueへの既存内部リンク更新方針が明記されている
- [x] 移動前パスを参照する記述が残る場合の過去記録注記方針が明記されている
- [ ] `docs/agent-failure-log.md` の記録対象、source種別、同種失敗3回以上時の通知ルールが明確化されている
- [ ] `review-to-issue` に、レビュー指摘取り込み時のfailure-log記録運用が追加されている
- [ ] 通常の実装レビュー指摘と、agent failure logへ記録すべき手順逸脱・判断ミス・検証不足・未承認作業などの区別が説明されている
- [ ] failure-logへ記録する際、sourceを `user` / `self` / `review` などで残す方針が明記されている
- [ ] ユーザーが手動で呼び出せる `failure-log-audit` SKILLが追加されている
- [ ] `failure-log-audit` SKILLに、3回以上発生した失敗カテゴリの特定、課題整理、対応挿入先と対応案の報告、ユーザー承認後に対応する停止点が定義されている
- [ ] `failure-log-audit` SKILL追加後も、恒久対応そのものはユーザー承認前に実行しない運用になっている
- [x] failure-logのdone退避が、対応完了、ユーザー確認、コミット指示直前に行われる運用として定義されている
- [ ] agent専用ファイルについて、controlled Englishで短縮可能な既存SKILL / rulesが確認されている
- [ ] controlled English化した場合でも、停止条件、承認条件、禁止事項、workflow発火条件が弱体化していない
- [ ] PRレビューが来た場合、controlled English化によって指示遵守性が落ちていないことを確認する観点がissueに明記されている
- [ ] 現在すべての完了条件・チェックポイントがチェック済みの完了済みissueが、定義されたルールに従って `docs/issue/done/phase-X/` または `docs/issue/done/cross-phase/` へ移動されている
- [ ] `phase-2-prep-doc-agent-ops` は、完了後に `docs/issue/done/cross-phase/` へ移動する対象として扱われている
- [ ] 未完了issue、現在作業中issue、移動条件を満たさないissueがdone側へ移動されていない
- [ ] Phase 1完了状態およびPhase 2開始前の前提と正式ドキュメントの齟齬が整理されている
- [ ] `README.md` の実装済み / 後続予定の記述がPhase 1完了状態およびPhase 2開始前の前提と一致している
- [ ] `README.md` に `npm test` の説明が追加され、Visual Review用Playwright captureとは別責務であることが分かる
- [ ] `docs/deployment.md` のOGP関連記述が、共通OGP画像対応済み / 個別OGP画像生成は初期スコープ外、という現状と一致している
- [ ] `docs/TODO.md` の旧plan ID参照が、現行 `docs/plan.md` のタスクIDへ修正されている
- [ ] `docs/TODO.md` にFooterクレジット導線の将来検討TODOが低優先度として追加されている
- [ ] `docs/content-writing-guide.md` の凡例Component例が、凡例専用Componentを作らない方針と一致している
- [ ] `docs/content-writing-guide.md` のページ配置・ルーティング表現が、現行 `docs/plan.md` Phase 3を参照する形になっている
- [ ] `docs/requirements.md` および分割後の `docs/requirements/*` の技術スタック記述が、採用済み / 後続予定の区別を持っている
- [ ] `docs/requirements/*` と `docs/plan.md` から、Footerおよび `18-2-home-page` の必須クレジット枠扱いが外れている
- [ ] `docs/issue/12-mobile-menu.md` の旧plan ID参照に、過去記録であること、現在は旧IDであることが注記されている
- [ ] `docs/issue/17-github-actions-deploy-basic.md` のdeploy確認記録が、merge後確認済みとして読み取れる
- [ ] 関連TODOを扱った結果または未対応理由が記録されている
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] このタスクがUI実装タスクではないことが維持されている
- [ ] 新規design画像を要求していない
- [ ] Visual Review screenshotを取得していない
- [ ] GitHub Actions workflowを変更していない
- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開方針と矛盾していない
- [ ] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装済みまたは実装予定として誤記していない
- [ ] `docs/TODO.md` の項目が現行 `docs/plan.md` と矛盾していない
- [ ] `docs/design/` の正本と矛盾する記述を増やしていない
- [x] `docs/plan.md` の完了チェック状態を変更していない
- [x] `issue-first-development` SKILL使用時に、ユーザーの明示指示なしでGitHub Issueを発行する運用になっていない
- [x] PR作成とPRレビューのSKILL責務が混ざっていない
- [x] ユーザーの明示指示なしにPRを作成する運用になっていない
- [x] 未チェック項目が残ったissueで、ユーザー承認なしにPRを作成する運用になっていない
- [x] `.github/pull_request_template.md` と `.github/ISSUE_TEMPLATE/issue-first-development.md` の役割が混ざっていない
- [x] PRテンプレートが最小導線になっている
- [x] PRテンプレートにChanged areas、Group completion、Checks、Unchecked / Not verified、Scope guardを含めていない
- [x] `issue-first-development` SKILLが、テンプレート本文を直接抱え込む構造に戻っていない
- [x] `AGENTS.md` の最重要停止条件を外部ファイルに追い出していない
- [x] `AGENTS.md` が単なるリンク集になっていない
- [x] `AGENTS.md` が作業ごとに更新される可変リンク集になっていない
- [x] `.agents/skills/README.md` にSKILL一覧と使用条件がある
- [x] `.agents/rules/README.md` にrules一覧と参照場面がある
- [x] `.agents/skills/` と `.agents/rules/` の役割が混ざっていない
- [x] `.agents/rules/*` をcontrolled English化対象から誤って除外していない
- [x] TRPG本文・用語・利用者向け説明をcontrolled English化対象に含めていない
- [x] AGENTSから削った制約の参照先が明記されている
- [x] AGENTSにしかなかった安全制約を削除していない
- [x] 分離後に全ファイルを常時読む運用になっていない
- [x] `docs/requirements.md` が単なるリンク集にならず、文書の位置づけと参照ルールを保持している
- [x] requirements分割により同一要件が複数ファイルへ重複していない
- [x] `docs/out-of-scope.md` との役割分担が明確である
- [x] `docs/conversion/*` との役割分担が明確である
- [x] 推奨ディレクトリ構成やpackage scripts案を要件本文に残していない
- [x] ページごとの過剰な細分化をしていない
- [x] 作業種別ごとに読むべきファイルが判断できる
- [x] agentのtoken消費削減という目的に反して、全ファイル常時参照を要求していない
- [x] `docs/development-structure.md` を正本として参照できる
- [x] `.agents/rules/file-structure.md` が重複しすぎず、参照方針として機能している
- [x] scripts分割方針が今後の実装者にとって明確である
- [x] 実ファイル移動と挙動変更が混ざっていない
- [x] `_common/` に安易に集約しすぎていない
- [x] import path修正が妥当である
- [x] active側に何を残すかが明確である
- [x] done側に何を送るかが明確である
- [x] 完了済み履歴を消さない構造になっている
- [x] `docs/issue/done/phase-N/` と `docs/issue/done/cross-phase/` の分類が曖昧でない
- [x] phaseに属さない横断整備issueを `phase-N/` に押し込まない方針になっている
- [x] issue移動後の内部リンク更新方針が明記されている
- [x] 移動前パスを残す場合の過去記録注記方針が明記されている
- [x] failure-logの退避条件がplan/TODOと混ざっていない
- [ ] failure-log運用変更は、通常のレビュー指摘をすべてfailure扱いする内容になっていない
- [ ] review-to-issueの停止地点を壊していない
- [ ] 新規failure-log監査SKILLは、報告と方針合意で停止し、承認なしに恒久対応を実装しない
- [ ] controlled English化により、指示遵守性が落ちていない
- [ ] controlled English化で日本語固有概念の意味がズレていない
- [ ] user-facing docs、requirements、TRPG game rule text、game terminologyを英語化していない
- [ ] issue移動は完了済みissueに限定されている
- [ ] 完了済みissue移動とissue本文の大幅編集を同一変更に混ぜていない
- [ ] ユーザーの未コミット変更を破壊していない
- [ ] `docs/agent-failure-log.md` で同種失敗が3回以上積み重なっていないか確認している

## 想定変更ファイル

- `docs/issue/phase-2-prep-doc-agent-ops.md`

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/issue-first-development.md`

- `AGENTS.md`
- `.agents/skills/README.md`
- `.agents/rules/README.md`
- `.agents/rules/core-rules-rationale.md`
- `.agents/rules/git-operations.md`
- `.agents/rules/data-management.md`
- `.agents/rules/mcp-context7.md`
- `.agents/rules/work-report.md`
- `.agents/rules/file-structure.md`

- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/create-pr/SKILL.md`
- `.agents/skills/review-to-issue/SKILL.md`
- `.agents/skills/post-merge-plan-update/SKILL.md`
- `.agents/skills/failure-log-audit/SKILL.md`
- `.agents/skills/*/SKILL.md`

- `docs/requirements.md`
- `docs/requirements/overview.md`
- `docs/requirements/architecture.md`
- `docs/requirements/non-functional.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/search.md`
- `docs/requirements/data-display.md`
- `docs/requirements/data-id-policy.md`
- `docs/requirements/release-notes.md`
- `docs/requirements/assets-seo.md`
- `docs/requirements/components.md`
- `docs/development-structure.md`

- `docs/plan.md`
- `docs/plan-done.md`
- `docs/TODO.md`
- `docs/TODO-done.md`
- `docs/agent-failure-log.md`
- `docs/agent-failure-log-done.md`
- `docs/issue/done/phase-0/`
- `docs/issue/done/phase-1/`
- `docs/issue/done/phase-2/`
- `docs/issue/done/cross-phase/`

- `README.md`
- `docs/deployment.md`
- `docs/content-writing-guide.md`
- `docs/issue/12-mobile-menu.md`
- `docs/issue/17-github-actions-deploy-basic.md`

- `scripts/`
- `src/components/`
- `src/lib/`
- `src/scripts/`

## レビュー観点

このissueは変更範囲が広いため、レビューでは以下を確認する。

### 全体

- タスク目的が広がりすぎていないか
- Phase 2開始前の整備タスクとして妥当か
- Group単位が人間レビュー可能な粒度になっているか
- Groupごとにcommitできる単位になっているか
- このissue内で扱うべき内容と、別issueへ分けるべき内容が混ざっていないか
- `phase-2-prep-doc-agent-ops` という名前が、plan番号に属さない横断整備タスクとして適切か

### `.github` テンプレート

- PRテンプレートがissue-first workflowと矛盾していないか
- PRタイトルをissue slugのみとする方針でよいか
- PR本文がissue本文の再掲ではなく、関連issueへの導線中心になっているか
- PR本文がRelated issue、Summary、Review focus、Review handlingだけの最小構成になっているか
- PR本文からChanged areas、Group completion、Checks、Unchecked / Not verified、Scope guardが外れているか
- issue作成テンプレートを `.github/ISSUE_TEMPLATE/issue-first-development.md` に外部化する方針でよいか
- `issue-first-development` SKILL使用時に、ユーザーの明示指示なしでGitHub Issueを発行しないことが明確か

### issue-first-development

- `issue-first-development` SKILLからissue本文テンプレートを外部化する方針でよいか
- local repository modeとChatGPT / remote snapshot draft modeの出力先の違いが明確か
- ChatGPT / remote snapshot draft modeでは、転記可能なissue本文をチャットに出力する方針でよいか
- local repository modeでは、`docs/issue/<issue-slug>.md` をローカルファイルとして作成する方針でよいか
- `issue-first-development` SKILL使用時に、ユーザーの明示指示なしでGitHub Issueを作成しない方針が明確か
- 「issueを作って」がGitHub Issue発行と誤読されないか
- テンプレート参照失敗時に推測でテンプレートを再構成しない運用になっているか

### create-pr

- PR作成SKILLとPRレビューSKILLの責務が混ざっていないか
- PR作成はGitHubへの書き込み操作であり、ユーザーの明示的なPR作成指示がある場合にのみ実行することが明記されているか
- `.github/pull_request_template.md` を正しく使う設計になっているか
- PR本文を最小テンプレートから逸脱して増やさない方針になっているか
- 対応するissueファイルの完了条件・チェックポイント未チェック時に安全に停止するか
- 未チェック項目ありでPRを作る場合に、ユーザー承認が必須になっているか
- PR title方針がissue単位branch運用と矛盾していないか
- PR本文がissue本文の再掲ではなく、レビュー導線中心になっているか
- merge、tag、releaseを行わないことが明確か

### AGENTS / rules / skills

- `AGENTS.md` を最上位規約と参照ルーターにする方針でよいか
- 最重要ルールを理由なし箇条書きにする方針でよいか
- 最重要ルールの理由を `.agents/rules/core-rules-rationale.md` へ分離する方針でよいか
- SKILL一覧を `AGENTS.md` ではなく `.agents/skills/README.md` に置く方針でよいか
- rules一覧を `.agents/rules/README.md` に置く方針でよいか
- `.agents/rules/*` がcontrolled English化対象から誤って外れていないか
- 作業ごとに `AGENTS.md` を更新しない構造になっているか
- `AGENTS.md` にしかない内容を削除せず移設する方針が明確か
- `.agents/rules/` と `.agents/skills/` の責務分離が妥当か

### requirements

- `docs/requirements.md` を索引化する方針でよいか
- `docs/requirements/` 配下の分割単位が妥当か
- 分割が章番号ベースではなく、作業時の参照単位になっているか
- `docs/development-structure.md` を新設して開発構造方針を分離する方針でよいか
- `docs/out-of-scope.md`、`docs/conversion/*` との役割分担が明確か

### active / done

- `docs/plan.md`、`docs/TODO.md`、`docs/agent-failure-log.md` を未実行・未対応中心にする方針でよいか
- 完了済み情報を削除ではなくdone側へ退避する方針でよいか
- plan / TODOの退避を `post-merge-plan-update` に寄せる方針でよいか
- failure-logの退避を `failure-log-audit` 側に寄せる方針でよいか
- 完了済みissueの移動先を `docs/issue/done/phase-N/` および `docs/issue/done/cross-phase/` とする方針でよいか
- `docs/issue/done/phase-N/` と `docs/issue/done/cross-phase/` の分類ルールが妥当か
- phase判定の粒度が妥当か
- issue移動に伴う内部リンク更新方針が十分か

### failure-log / review-to-issue

- review-to-issueでfailure-log対象指摘を記録する方針でよいか
- 通常レビュー指摘とagent failureの区別が明確か
- source種別を `user` / `self` / `review` とする粒度で十分か
- 同種失敗3回以上時の通知ルールが維持されているか
- `failure-log-audit` SKILLの停止点が適切か
- 恒久対応をユーザー承認前に実行しない運用になっているか

### scripts / src構造

- `scripts/` をプログラム単位でディレクトリ分割する方針でよいか
- `main.ts` / `lib.ts` の責務分離が妥当か
- `lib.ts` 長大化時に `lib/` へ分割する方針でよいか
- 複数プログラムから参照する共通処理を `_common/` に置く方針でよいか
- `src/components`、`src/lib`、`src/scripts` の目的別ディレクトリ分割方針が妥当か
- 実ファイル移動と挙動変更を分ける方針になっているか

### controlled English

- `.agents/` 配下のagent専用ファイルをcontrolled English化する方針でよいか
- `.agents/rules/*` をagent-facing fileとしてcontrolled English化対象に含めてよいことが明確か
- 英語化対象をagent専用ファイルに限定できているか
- user-facing docs、requirements、TRPG game rule text、game terminologyを英語化しない方針でよいか
- 日本語固有語を無理に翻訳しない方針でよいか
- PRレビューが来た場合、指示遵守性が落ちていないことを確認する観点が明記されているか

### Phase 1完了状態 / Phase 2開始前の整合

- `.tmp/phase1-doc-consistency-report.md` のユーザー追記方針と、このissueの対象範囲が一致しているか
- `docs/TODO.md` の旧plan ID置換先が妥当か
- Footerクレジット導線を初期実装から外し、将来TODOへ送る扱いでよいか
- トップページ `18-2-home-page` からクレジット枠を外す判断でよいか
- `docs/issue/17-github-actions-deploy-basic.md` のmerge後確認済み表現が事実関係として問題ないか
- `docs/plan.md` の完了チェックを変更しない方針でよいか
- 完了済みissueの判定を「すべての完了条件・チェックポイントがチェック済み」とする方針でよいか
- `docs/issue/done/phase-N/` へ移動する対象issueのphase範囲を、Phase 0からPhase 1完了分まで含めるか、Phase 2開始前に必要な範囲へ限定するか
- plan番号に属さない横断整備issueを `docs/issue/done/cross-phase/` へ移動する方針でよいか

## 備考

このタスクは `docs/plan.md` の既存番号に直接存在しない、Phase 1完了後 / Phase 2開始前の補助ドキュメント整合・開発品質向上・参照構造整理タスクとして扱う。

branch名は、`docs/plan.md` の既存番号に直接紐づかないPhase 2準備タスクとして、`phase-2-prep-doc-agent-ops` とする。

issueファイル名は以下とする。

```text
docs/issue/phase-2-prep-doc-agent-ops.md
```

このタスクは、実装コード変更、UI変更、GitHub Actions workflow変更、Visual Review取得を主目的としない。

ただし、`scripts/`、`src/components/`、`src/lib`、`src/scripts` については、Group 6でファイル分割方針に沿って整理する。挙動変更を伴わない範囲のファイル移動・import path修正に限定する。

`.tmp/phase1-doc-consistency-report.md` のうち、`docs/issue/16-layout-screenshot-design-refresh.md` への追加整理は、ユーザー追記で「対応しない」とされたため、このタスクでは扱わない。

AGENTS.md短縮は安全制約を削除する作業ではない。最重要ルールはAGENTS.md本体に残し、理由、背景、詳細手順、補足だけを `.agents/rules/` または `.agents/skills/` へ移す。

`docs/requirements.md` 分割は、要件削除ではない。要件本文を作業時の参照単位で移設し、`docs/requirements.md` は索引として機能させる。

controlled English化は、agent-facing fileを短く明確にするために実施する。ただし、意味変更、停止条件の弱体化、安全制約の削除、TRPG本文・用語・利用者向け説明の英語化をしてはならない。

`.agents/rules/*` はagent-facing fileとしてcontrolled English化の対象に含めてよい。一方、TRPG本文、ゲーム用語、利用者向け説明はcontrolled English化の対象外とする。

`issue-first-development` SKILLを使う場合、ユーザーの明示指示なしにGitHub Issueを発行してはならない。

GitHub Issueを作成してよいのは、ユーザーが明示的に以下のように依頼した場合のみとする。

- GitHub Issueを作って
- GitHub上にissueを発行して
- `gh issue create` して
- この内容でGitHub Issueを作成して

PR作成は、ユーザーが明示的にPR作成を指示した場合のみ行う。

PR作成時は `.github/pull_request_template.md` を使用し、対応する `docs/issue/<issue-slug>.md` の完了条件・チェックポイントを確認する。未チェック項目が残っている場合は、PR作成前に停止し、ユーザーにこのまま作成してよいか確認する。

完了済みissueの移動先は、issueの性質に応じて以下を使い分ける。

- `docs/issue/done/phase-N/`
  - `docs/plan.md` のPhase Nに属する完了済みissue
  - plan番号またはphase内作業と直接対応するもの
- `docs/issue/done/cross-phase/`
  - 特定phaseに閉じない完了済みissue
  - phase境界の整理、AGENTS / SKILL / repo運用、docs構造整理など

`phase-2-prep-doc-agent-ops` は `docs/plan.md` のPhase 2実装タスクではなく、Phase 2以降へ進むための横断整備タスクであるため、完了後は以下へ移動する。

```text
docs/issue/done/cross-phase/phase-2-prep-doc-agent-ops.md
```

## Group単位の作業順

このタスクは変更範囲が広いため、すべてを一度に実装しない。

人間が意味のある範囲でレビューし、その後にcommitできるよう、以下のGroup単位で作業する。

各Groupの完了時点で停止し、変更内容、変更ファイル、未対応事項、検証結果を報告する。ユーザーがレビューし、コミット指示を出すまで次Groupへ進まない。

### Group 0: issue定義の確定

#### 目的

このタスク全体の目的、対象範囲、初期スコープ外、完了条件、作業グループを確定する。

#### 主な変更対象

- `docs/issue/phase-2-prep-doc-agent-ops.md`

#### 含める内容

- Phase 2に向けたドキュメント整合性担保
- Phase 2に向けた開発品質向上SKILL追加
- agentのtoken浪費を防ぐためのファイル分割
- 参照点を明確化するためのディレクトリ分割
- `.github` テンプレート整備方針
- `issue-first-development` テンプレート外部化方針
- `issue-first-development` SKILL使用時のGitHub Issue発行禁止方針
- PRテンプレート作成方針
- PR作成SKILL追加方針
- AGENTS.mdルーティング化方針
- requirements索引化方針
- active / done分離方針
- `docs/issue/done/phase-N/` と `docs/issue/done/cross-phase/` の分類方針
- review-to-issue / failure-log / post-merge-plan-updateの運用整理
- controlled English化方針
- レビュー・コミット単位

#### このグループでやらないこと

- `AGENTS.md` の実修正
- `docs/requirements.md` の実分割
- SKILL追加
- `.github` テンプレート作成
- issue移動
- plan / TODO / failure-log の退避

#### レビュー観点

- タスク目的が広がりすぎていないか
- 作業グループの順序が妥当か
- 各グループが人間レビュー可能な粒度か
- このissue内で扱うべき内容と、別issueへ分けるべき内容が混ざっていないか

#### 推奨コミット

```text
docs: define phase 2 preparation issue
```

### Group 1: 参照先インフラの作成

#### 目的

`AGENTS.md` を短縮する前に、移設先となる安定した参照先を作る。

#### 主な変更対象

- `.agents/skills/README.md`
- `.agents/rules/README.md`
- `.agents/rules/core-rules-rationale.md`
- `.agents/rules/git-operations.md`
- `.agents/rules/data-management.md`
- `.agents/rules/mcp-context7.md`
- `.agents/rules/work-report.md`
- `.agents/rules/file-structure.md`
- `docs/development-structure.md`

#### 含める内容

- `.agents/skills/` と `.agents/rules/` の役割分担
- 既存SKILL一覧と使用条件
- 常設ルール一覧と参照場面
- 最重要ルールの理由
- Git / gh / 破壊的操作方針
- `.raw` / `.tmp` / generated dataの扱い
- MCP / Context7利用方針
- 作業後報告形式
- ファイル分割方針
- scripts / src/components / src/lib / src/scripts の分割方針

#### このグループでやらないこと

- `AGENTS.md` の大幅短縮
- `.github` テンプレート作成
- PR作成SKILL追加
- 既存コードの移動
- `docs/requirements.md` の分割
- SKILL本体の大幅変更

#### レビュー観点

- 移設先の分類が妥当か
- `.agents/rules/` と `.agents/skills/` が混ざっていないか
- `AGENTS.md` にしかなかった制約が削除されず移設されているか
- 新しいREADMEが「常時読むファイル」ではなく「入口」になっているか

#### 推奨コミット

```text
docs: add agent rules and skill indexes
```

### Group 2: issue / PRテンプレートとPR作成SKILLの整備

#### 目的

issue-first workflowで使うissueテンプレートとPRテンプレートを `.github` 配下に分離し、ユーザーのPR作成指示で発火するPR作成SKILLを追加する。

#### 主な変更対象

- `.github/ISSUE_TEMPLATE/issue-first-development.md`
- `.github/pull_request_template.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/create-pr/SKILL.md`
- `.agents/skills/README.md`
- `.agents/rules/git-operations.md`

#### 含める内容

##### issue-first-developmentのissueテンプレート外部化

- `issue-first-development` SKILLからissue本文テンプレートを外部化する
- `.github/ISSUE_TEMPLATE/issue-first-development.md` を作成する
- `issue-first-development` SKILLはテンプレート本文を直接持たず、`.github/ISSUE_TEMPLATE/issue-first-development.md` を参照する
- ChatGPT / remote snapshot draft modeでは、転記可能な完成版issue本文をチャットに出力する
- local repository modeでは、`docs/issue/<issue-slug>.md` をローカルファイルとして作成する
- テンプレート参照失敗時は推測で再構成せず、安全に停止または未確認扱いにする

##### issue-first-development SKILL使用時のGitHub Issue発行禁止

- `issue-first-development` SKILL使用時に、ユーザーの明示指示なしにGitHub Issueを発行してはならないことを明記する
- ChatGPT / remote snapshot draft modeでは、GitHub Issueもrepository fileも作成済みと主張しない
- local repository modeでも、ユーザーの明示指示なしにGitHub Issueを作成しない
- GitHub Issue作成は、ユーザーが明示的に `GitHub Issueを作って`、`GitHub上にissueを発行して`、`gh issue createして` などと依頼した場合に限る

##### PRテンプレート作成

- `.github/pull_request_template.md` を作成する
- PRタイトルはissue slugのみを原則とする
- PR本文はissue本文の再掲ではなく、関連issueへの導線中心にする
- PR本文に以下のみを含める
  - Related issue
  - Summary
  - Review focus
  - Review handling
- PR本文に以下を含めない
  - Changed areas
  - Group completion
  - Checks
  - Unchecked / Not verified
  - Scope guard
- review-to-issueとfailure-log運用への接続を記載する

##### PR作成SKILL追加

- `.agents/skills/create-pr/SKILL.md` を作成する
- PR作成はGitHubへの書き込み操作であるため、ユーザーの明示的なPR作成指示がある場合にのみ実行する
- ユーザーのPR作成指示で発火する
- PRレビュー指示、PRコメント整理、review-to-issue指示とは発火条件を分離する
- `.github/pull_request_template.md` を使ってPR本文を作る
- PR本文にChanged areas、Group completion、Checks、Unchecked / Not verified、Scope guardを追加しない
- 対応する `docs/issue/<issue-slug>.md` の完了条件とチェックポイントを確認する
- 未チェック項目が残っている場合はPR作成前に停止し、ユーザーにこのまま作成してよいか承認を求める
- ユーザー承認なしに未チェック項目ありのPRを作らない
- PR作成後にPR URL、base branch、head branch、関連issue、未チェック項目の有無、確認結果、未確認事項を報告する
- merge、tag、release、review-to-issue処理を行わない

#### PRタイトルフォーマット

PRタイトルは、原則としてissue slugのみとする。

```text
<issue-slug>
```

例：

```text
phase-2-prep-doc-agent-ops
site-layout-base
github-actions-deploy-basic
```

PRタイトルに以下を必須にしない。

- `docs:` / `feat:` / `refactor:` などのcommit type
- `group N`
- issue slugの言い換え説明

変更種別はcommit messageで表現する。

レビュー観点や補足説明はPR本文に書く。

#### PR本文テンプレート案

```md
## Related issue

- `docs/issue/<issue-slug>.md`

## Summary

-

## Review focus

-

## Review handling

- Review comments that change task scope should be routed through `review-to-issue`.
- Agent failure findings should be recorded in `docs/agent-failure-log.md` when applicable.
```

#### このグループでやらないこと

- GitHub Issueを発行しない
- PRを作成しない
- PRをmergeしない
- tagを作らない
- releaseを作らない
- issue本文の意味を変更しない
- issue-first workflowの停止条件を弱めない
- PR作成SKILLでreview-to-issueを実行しない
- PRテンプレートにChanged areas、Group completion、Checks、Unchecked / Not verified、Scope guardを追加しない
- 未チェック項目を勝手にチェックしない
- 未チェック項目ありでPRを作ることを自動許可しない

#### レビュー観点

- issueテンプレート外部化により、`issue-first-development` SKILLが短くなっているか
- テンプレート外部化によって、issue作成時の必須セクションが欠落していないか
- ChatGPT / remote snapshot draft modeとlocal repository modeの出力先の違いが明確か
- `issue-first-development` SKILL使用時に、GitHub Issueを勝手に発行しないことが明確か
- ChatGPT / remote snapshot draft modeで、GitHub Issueまたはrepository fileを作成済みと誤認させないか
- local repository modeでも、ユーザーの明示指示なしにGitHub Issueを作らない運用になっているか
- PRテンプレートがissue-first workflowと矛盾していないか
- PRタイトルをissue slugのみとする方針でよいか
- PR本文がissue本文の再掲ではなく、関連issueへの導線中心になっているか
- PR本文が最小構成になっているか
- PR作成SKILLとPRレビューSKILLの責務が混ざっていないか
- PR作成指示でのみ `create-pr` SKILLが発火するか
- issueファイルの完了条件・チェックポイント未チェック時に安全に停止するか
- 未チェック項目ありでPRを作る場合に、ユーザー承認が必須になっているか
- merge、tag、releaseを行わないことが明確か

#### 推奨コミット

```text
docs: add issue and pull request templates
docs: add create-pr skill
```

必要に応じて、このGroupは2 commitに分けてよい。

### Group 3: AGENTS.mdのルーティング化

#### 目的

`AGENTS.md` を、最上位規約と参照ルーターに短縮する。

#### 主な変更対象

- `AGENTS.md`

#### 含める内容

- リポジトリの目的
- 理由なし箇条書きの最重要ルール
- 参照優先順位
- `.agents/skills/README.md` への導線
- `.agents/rules/README.md` への導線
- `.github/ISSUE_TEMPLATE/issue-first-development.md` への導線
- `.github/pull_request_template.md` への導線
- 作業種別ごとの参照方針
- 「参照先は常時読むものではなく、該当作業時に読む」方針
- `AGENTS.md` を更新してよい場合 / 更新すべきでない場合

#### このグループでやらないこと

- 新規SKILL追加
- `.github` テンプレート作成
- failure-log運用変更
- requirements分割
- scriptsやsrcの実ファイル移動

#### レビュー観点

- 最重要停止条件が `AGENTS.md` 本体に残っているか
- 理由や詳細手順だけが分離されているか
- `AGENTS.md` が単なるリンク集になっていないか
- 作業ごとに `AGENTS.md` を更新しなくてよい構造になっているか
- agentが作業開始時に守るべきことを `AGENTS.md` 単体で判断できるか
- GitHub Issue発行禁止、PR作成明示指示必須などの安全制約が失われていないか

#### 推奨コミット

```text
docs: simplify AGENTS into routing guide
```

### Group 4: requirements索引化と詳細要件分割

#### 目的

`docs/requirements.md` を要件索引にし、詳細要件を作業時の参照単位で分割する。

#### 主な変更対象

- `docs/requirements.md`
- `docs/requirements/overview.md`
- `docs/requirements/architecture.md`
- `docs/requirements/non-functional.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/search.md`
- `docs/requirements/data-display.md`
- `docs/requirements/data-id-policy.md`
- `docs/requirements/release-notes.md`
- `docs/requirements/assets-seo.md`
- `docs/requirements/components.md`

#### 含める内容

- `docs/requirements.md` の索引化
- 要件参照時の優先順位
- 要件ファイル一覧
- 作業種別ごとの参照先
- 詳細要件の `docs/requirements/` 配下への移設
- `docs/out-of-scope.md` との役割分担
- `docs/conversion/*` との役割分担

#### このグループでやらないこと

- 要件内容の大幅な意味変更
- 実装方針の追加
- `docs/plan.md` のチェック更新
- codeやscriptsの移動

#### レビュー観点

- 要件が削除されず適切な分割先へ移っているか
- 章番号ベースではなく、作業時の参照単位で分割されているか
- `docs/requirements.md` が索引として機能しているか
- `docs/out-of-scope.md` や `docs/conversion/*` と重複しすぎていないか
- agentが全要件ファイルを常時読む運用になっていないか

#### 推奨コミット

```text
docs: split requirements by reference area
```

### Group 5: 開発構造方針の分離

#### 目的

要件本文に混ざっている開発構造・実装運用情報を分離する。

#### 主な変更対象

- `docs/development-structure.md`
- `.agents/rules/file-structure.md`
- `docs/requirements.md`
- `docs/requirements/architecture.md`

#### 含める内容

- 推奨ディレクトリ構成
- `.gitignore` 方針
- package scripts案
- `scripts/` のプログラム単位分割方針
- `main.ts` / `lib.ts` の責務分離
- `lib.ts` 長大化時の `lib/` 分割
- 複数プログラム共通処理の `_common/` 配置方針
- `src/components` / `src/lib` / `src/scripts` の目的別ディレクトリ分割方針

#### このグループでやらないこと

- 実際のscripts移動
- 実際のsrc配下ファイル移動
- package scriptの変更
- GitHub Actions変更

#### レビュー観点

- 要件と開発構造方針が分離されているか
- `docs/development-structure.md` を正本として参照できるか
- `.agents/rules/file-structure.md` が重複しすぎず、参照方針として機能しているか
- scripts分割方針が今後の実装者にとって明確か

#### 推奨コミット

```text
docs: extract development structure policy
```

### Group 6: 実ファイル構造の整理

#### 目的

`scripts/`、`src/components/`、`src/lib/`、`src/scripts/` を、定義した分割方針に沿って整理する。

#### 主な変更対象

- `scripts/`
- `src/components/`
- `src/lib/`
- `src/scripts/`
- import path
- 必要に応じてテスト

#### 含める内容

- `scripts/` のプログラム単位ディレクトリ化
- 各プログラムの `main.ts` / `lib.ts` 分離
- `lib.ts` が長い場合の `lib/` 分割
- 複数プログラム共通処理の `_common/` 配置
- `src/components` の目的別ディレクトリ整理
- `src/lib` の目的別ディレクトリ整理
- `src/scripts` が存在する場合の整理方針適用
- import path修正

#### このグループでやらないこと

- 挙動変更
- 新機能追加
- 不要な共通化
- 大規模な実装改善
- package追加

#### レビュー観点

- ファイル移動と挙動変更が混ざっていないか
- import path修正が妥当か
- `_common/` に安易に集約しすぎていないか
- 移動後もテスト・buildが通るか
- renameとしてレビュー可能な差分になっているか

#### 推奨コミット

```text
refactor: organize scripts and source directories
```

### Group 7: active / done 分離方針の整備

#### 目的

agentが読む常用ファイルを未実行・未対応中心にし、完了済み情報を退避するためのドキュメント構造を整える。

#### 主な変更対象

- `docs/plan.md`
- `docs/TODO.md`
- `docs/agent-failure-log.md`
- `docs/plan-done.md` または同等の完了履歴ファイル
- `docs/TODO-done.md` または同等の完了履歴ファイル
- `docs/agent-failure-log-done.md` または同等の完了履歴ファイル
- `docs/issue/done/`

#### 含める内容

- `docs/plan.md` は未完了・進行対象中心にする方針
- `docs/TODO.md` は未対応TODO中心にする方針
- `docs/agent-failure-log.md` は未対応・未確認failure中心にする方針
- 完了済み情報の退避先定義
- 完了済み情報を削除ではなく履歴として残す方針
- active / done の移動条件

#### このグループでやらないこと

- post-merge-plan-updateの実装変更
- review-to-issueの変更
- failure-log監査SKILL追加
- 実際の大量移動

#### レビュー観点

- active側に何を残すかが明確か
- done側に何を送るかが明確か
- 完了済み履歴を消さない構造になっているか
- failure-logの退避条件がplan/TODOと混ざっていないか

#### 推奨コミット

```text
docs: define active and done tracking files
```

### Group 8: post-merge-plan-updateの更新

#### 目的

PR merge後のtracking update時に、完了済みplan / TODO / issueをdone側へ移動する運用を明記する。

#### 主な変更対象

- `.agents/skills/post-merge-plan-update/SKILL.md`
- `docs/plan.md`
- `docs/TODO.md`

#### 含める内容

- merge後に完了済みplan項目をdone側へ送る方針
- merge後に完了済みTODOをdone側へ送る方針
- issue完了時に `docs/issue/done/phase-N/` または `docs/issue/done/cross-phase/` へ移動する方針
- phase判定
- cross-phase判定
- 移動対象外ファイル
- 移動条件
- 移動したissueへの既存内部リンク更新
- 移動前パスを参照する記述が残る場合の注記方針
- `docs/plan.md` の完了チェックを勝手に変更しない既存方針との整合

#### このグループでやらないこと

- failure-log完了退避
- review-to-issue変更
- 完了済みissueの実移動
- plan / TODOの大量整理

#### レビュー観点

- merge後workflowの範囲に収まっているか
- plan / TODO / issueの移動条件が明確か
- 未完了issueをdoneへ送らない条件があるか
- phase判定が曖昧でないか
- cross-phase判定が曖昧でないか
- issue移動後の内部リンク更新方針が明確か

#### 推奨コミット

```text
docs: update post-merge tracking workflow
```

### Group 9: review-to-issueとfailure-log記録運用の更新

#### 目的

レビュー指摘のうち、agent failureに該当するものを `docs/agent-failure-log.md` へ記録する運用を明確にする。

#### 主な変更対象

- `.agents/skills/review-to-issue/SKILL.md`
- `docs/agent-failure-log.md`
- `.agents/rules/core-rules-rationale.md`

#### 含める内容

- review-to-issue時にfailure-log対象指摘を確認する方針
- failure-log対象の基準
- 通常の実装品質レビューとagent failureの区別
- source種別
  - `user`
  - `self`
  - `review`
- 同種失敗3回以上時の通知ルール維持
- review-to-issueの停止地点を壊さない方針

#### このグループでやらないこと

- failure-log監査SKILL追加
- 恒久対応実装
- failure-log完了退避
- 通常レビュー指摘の全failure扱い

#### レビュー観点

- failure-log対象範囲が広すぎないか
- 通常の実装レビュー指摘と手順・判断ミスが区別されているか
- source種別の粒度が十分か
- review-to-issueの停止地点が維持されているか

#### 推奨コミット

```text
docs: clarify review failure logging
```

### Group 10: failure-log-audit SKILLの追加

#### 目的

同種失敗が3回以上発生した場合に、ユーザーが手動で呼び出せる監査SKILLを追加する。

#### 主な変更対象

- `.agents/skills/failure-log-audit/SKILL.md`
- `.agents/skills/README.md`
- `docs/agent-failure-log.md`
- `docs/agent-failure-log-done.md`

#### 含める内容

- failure-log監査の目的
- 同種失敗3回以上の検出
- 失敗カテゴリの特定
- 課題整理
- 対応を入れるべき場所の提示
- 対応案の提示
- ユーザーとの方針議論
- ユーザー承認後にのみ恒久対応を入れる停止点
- 対応完了後、ユーザー確認とコミット指示が出た直前にdone側へ移動する方針

#### このグループでやらないこと

- 恒久対応そのものの実装
- ユーザー承認前のrules / SKILL更新
- failure-logを勝手に完了扱いすること

#### レビュー観点

- SKILLが報告と方針合意で停止するか
- 承認なしに恒久対応へ進まないか
- failure-log退避タイミングが適切か
- post-merge-plan-updateと責務が混ざっていないか

#### 推奨コミット

```text
docs: add failure log audit skill
```

### Group 11: 完了済みissueの移動

#### 目的

すべての完了条件・チェックポイントがチェック済みの完了済みissueを、issueの性質に応じて `docs/issue/done/phase-N/` または `docs/issue/done/cross-phase/` へ移動する。

#### 主な変更対象

- `docs/issue/*.md`
- `docs/issue/done/phase-0/`
- `docs/issue/done/phase-1/`
- `docs/issue/done/phase-2/`
- `docs/issue/done/cross-phase/`
- 内部リンクを持つdocs

#### 含める内容

- 完了済みissueの判定
- 移動対象一覧の提示
- phase判定
- cross-phase判定
- `docs/issue/done/phase-N/` への移動
- `docs/issue/done/cross-phase/` への移動
- 移動したissueへの既存内部リンク更新
- 移動前パスを参照する記述が残る場合、過去記録として有効な理由を注記する

#### このグループでやらないこと

- 未完了issueの移動
- チェック未完了項目を移動目的で完了扱いすること
- `docs/plan.md` の完了チェック変更
- issue本文の大幅編集

#### レビュー観点

- 移動対象が本当に完了済みか
- phase判定が妥当か
- cross-phase判定が妥当か
- 未完了issueが混ざっていないか
- ファイル移動以外の変更が混ざっていないか
- 内部リンク更新が漏れていないか

#### 推奨コミット

```text
docs: move completed issues to done
```

### Group 12: Phase 1完了状態 / Phase 2開始前のドキュメント整合

#### 目的

Phase 1完了状態およびPhase 2開始前の前提と、正式ドキュメントの齟齬を解消する。

#### 主な変更対象

- `README.md`
- `docs/deployment.md`
- `docs/TODO.md`
- `docs/content-writing-guide.md`
- `docs/requirements.md`
- `docs/requirements/*`
- `docs/plan.md`
- `docs/issue/12-mobile-menu.md`
- `docs/issue/17-github-actions-deploy-basic.md`

#### 含める内容

- MDX / base path / SEO / 基本デプロイの実装済み状態整理
- データ表示Component / 検索の後続状態整理
- `npm test` とVisual Review用Playwright captureの責務分離
- deploymentのOGP記述整理
- TODOの旧plan ID参照修正
- content-writing-guideの凡例Component方針修正
- routing確定に関する古い表現修正
- requirementsの採用済み / 後続予定技術整理
- Footerクレジット導線要件の整理
- `12-mobile-menu` の旧plan ID注記
- `17-github-actions-deploy-basic` のmerge後確認済み整理

#### このグループでやらないこと

- UI / CSS / layout / Component実装
- GitHub Actions workflow変更
- Visual Review screenshot取得
- Pagefind実装
- Excel変換実装
- failure-log恒久対応
- issue移動

#### レビュー観点

- 実装済み / 後続予定 / 初期スコープ外が正しく分かれているか
- Phase 1完了状態およびPhase 2開始前の前提と矛盾していないか
- requirements分割後の参照先と矛盾していないか
- 古いplan IDや古い前提が残っていないか

#### 推奨コミット

```text
docs: align phase 1 completion documentation
```

### Group 13: agent専用ファイルのcontrolled English化

#### 目的

`.agents/` 配下のagent専用ファイルについて、token削減と指示明確化のため、controlled Englishで短く記述できるものをリライトする。

このGroupは、文章表現の圧縮を目的とする。

ただし、指示内容、停止条件、安全制約、承認条件、workflowの発火条件を弱めてはならない。

#### 主な変更対象

- `.agents/skills/*/SKILL.md`
- `.agents/skills/README.md`
- `.agents/rules/*.md`
- `.agents/rules/README.md`

#### 含める内容

- 既存SKILLが長文化している場合、controlled Englishで短縮可能か確認する
- controlled English化しても意味が変わらないSKILLはリライトする
- 長い説明文を、短い命令文・箇条書き・明確な停止条件へ整理する
- `.agents/rules/*` はagent-facing fileとしてcontrolled English化対象に含める
- 日本語のプロジェクト固有語は無理に翻訳しない
- user-facing docs、requirements、TRPG game rule text、game terminologyは英語化しない
- 必要に応じて、変更前後でtoken量の削減見込みを確認する
- PRレビューが来た場合、変更によって指示遵守性が落ちていないことを確認する観点をissueに明記する

#### controlled English化の対象

controlled English化してよい対象は、原則としてagentだけが読むファイルに限定する。

対象例：

- `.agents/skills/*/SKILL.md`
- `.agents/skills/README.md`
- `.agents/rules/*.md`
- `.agents/rules/README.md`

対象外：

- `docs/requirements.md`
- `docs/requirements/*`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/out-of-scope.md`
- TRPG本文
- ゲーム用語定義の正本
- ユーザー向けドキュメント

#### 翻訳しない語

以下のようなプロジェクト固有語は、無理に英訳しない。

- 流儀
- 生き様
- 覚悟
- 縁
- 外道
- 格
- 仕事人
- オオサカ副都

必要な場合は、日本語語彙をそのまま使い、補足だけ英語で短く書く。

#### このグループでやらないこと

- 指示内容の意味変更
- 停止条件の削除
- 承認条件の緩和
- workflow発火条件の変更
- commit / push / PR禁止などの安全制約の弱体化
- 日本語のユーザー向けdocsの英語化
- TRPG本文・要件定義・ルール本文の英語化
- token削減のために固有用語を一般英語へ置換すること

#### レビュー観点

- controlled English化によりtoken削減または指示明確化が見込めるか
- 元のSKILLにあった停止点が維持されているか
- 元のSKILLにあった承認条件が維持されているか
- 元のSKILLにあった禁止事項が維持されているか
- workflowの発火条件が曖昧になっていないか
- 日本語固有概念を翻訳したことで意味がズレていないか
- PRレビューが来た場合、変更によって指示遵守性が落ちていないことを確認しているか
- 短縮のために安全制約を削っていないか
- `.agents/skills/` と `.agents/rules/` の役割分担が維持されているか

#### PRレビュー時の追加確認

このGroupに対するPRレビューが来た場合、通常の誤字・構成レビューだけでなく、以下を必ず確認する。

- 変更前後で、agentが守るべき禁止事項が欠落していない
- 変更前後で、ユーザー承認が必要な停止点が欠落していない
- 変更前後で、実装開始条件が緩くなっていない
- 変更前後で、review-to-issueやfailure-log-auditなどのworkflow停止地点が壊れていない
- 変更前後で、指示の発火条件が曖昧になっていない
- 変更前後で、agentが「任意」と誤読できる表現に変わっていない

#### 推奨コミット

```text
docs: rewrite agent-only instructions in controlled English
```

### Group 14: 最終整合・検証

#### 目的

全体の参照整合性、リンク、check/buildを確認する。

#### 主な変更対象

- 必要に応じてリンク修正
- 必要に応じて軽微な表記修正

#### 含める内容

- 参照リンクの確認
- 古い参照先の修正
- `docs/TODO.md` の関連TODO処理結果または未対応理由記録
- `npm run check`
- `npm run build`

#### このグループでやらないこと

- 新規方針追加
- 大規模移動
- 新規SKILL追加
- 要件再分割

#### レビュー観点

- check/buildが通っているか
- リンク切れがないか
- このタスクで扱ったTODOの結果または未対応理由が残っているか
- 作業範囲外の変更が混ざっていないか

#### 推奨コミット

```text
chore: validate phase 2 preparation docs
```

## グルーピング上の禁止事項

- 複数Groupをまとめて実装しない
- `.github` テンプレート作成とGitHub Issue / PR作成を混同しない
- `AGENTS.md` の短縮と移設先作成を同一commitに混ぜない
- requirements分割とPhase 1完了状態 / Phase 2開始前の整合修正を同一commitに混ぜない
- 実ファイル移動と挙動変更を同一commitに混ぜない
- failure-log監査SKILL追加と恒久対応実装を同一commitに混ぜない
- 完了済みissue移動とissue本文の大幅編集を同一commitに混ぜない
- controlled English化とSKILLの意味変更を同一commitに混ぜない
- check/buildのためだけに無関係な修正を混ぜない

## レビュー停止ルール

各Groupの完了時に、agentは以下を報告して停止する。

```md
## Group N 作業結果

- 実施した内容
- 変更したファイル
- 実行したコマンド
- 成功した確認
- 失敗または未確認の項目
- 次Groupへ進む前にレビューしてほしい点

## Git操作

- commit: 未実行
- push: 未実行
```

ユーザーがレビューし、コミット指示を出すまで次Groupへ進まない。

## Local Validation Summary

- mode: local repository mode
- branch: `phase-2-prep-doc-agent-ops`
- issue file: `docs/issue/phase-2-prep-doc-agent-ops.md`
- validation date: 2026-07-07

### Locally verified

- `git status --short` showed only this issue file as an added file before validation.
- `git branch --show-current` was `main` before branch creation.
- No existing local `phase-2-prep-doc-agent-ops` branch was found before branch creation.
- The local branch `phase-2-prep-doc-agent-ops` was created.
- `docs/issue/phase-2-prep-doc-agent-ops.md` exists locally.
- `docs/TODO.md`, `docs/plan.md`, `docs/requirements.md`, `docs/out-of-scope.md`, `docs/agent-failure-log.md`, and relevant existing issue files exist locally.
- `.tmp/phase1-doc-consistency-report.md` exists locally and includes the Phase 1 / Phase 2 documentation consistency findings referenced by this issue.
- Current local `.agents/skills/*/SKILL.md` files exist for issue-first, review-to-issue, post-merge, PR review draft, design image generation, and visual implementation review workflows.
- Current local `.github/workflows/deploy.yml` exists.
- Current local `scripts/`, `src/components/`, `src/lib/`, and `src/scripts/` files exist and match the broad structure this issue proposes to reorganize.
- This task is not a UI, CSS, layout, page, or Component implementation task, so no new design target or design image is required during issue-first preparation.

### Locally absent during issue-first preparation and expected to be created or defined by this issue

- `.github/PULL_REQUEST_TEMPLATE.md` does not exist yet.
- `.agents/skills/failure-log-audit/SKILL.md` does not exist yet.
- `docs/requirements/` does not exist yet.
- `docs/plan-done.md`, `docs/TODO-done.md`, and `docs/agent-failure-log-done.md` do not exist yet.
- `docs/issue/done/` does not exist yet.

### Not verified during issue-first preparation

- `npm run check` was not run.
- `npm run build` was not run.
- Completion status of every historical issue file was not exhaustively classified.
- No GitHub Issue, PR, remote branch, tag, release, commit, or push was created.
