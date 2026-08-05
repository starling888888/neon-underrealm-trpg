# milestone-02-phase-01-failure-log-audit

## 目的

active failure logを監査し、再発した失敗だけに軽量な恒久対応を置く。単発または再現性のないagent起因の記録は適切にno-actionへ移し、active logの可読性を回復する。

## 背景

`docs/agent-failure-log.md`には、カテゴリごとの発生数だけでは再発性を判定できないtest / command失敗と、完了根拠の不足を示す記録が混在している。

`docs/issue/milestone-02/plan.md`のPhase 1にある「`docs/agent-failure-log.md` の未反映項目を監査し、必要な恒久対応を計画する。」を、このissueの作業契約とする。

関連TODOは確認したが、failure log auditに対応する項目はない。

## 対象範囲

- `docs/agent-failure-log.md`のactive entryを、ユーザー承認済みの基準で分類する。
- `docs/agent-failure-log-done.md`と`docs/agent-failure-log-no-action.md`へ、原文・移動理由・移動日を保持してentryを移す。
- まず、`source: self`または非human review由来と確認できる`source: review`のうち、3回連続の再現条件を満たさないno-action候補をtitle、source、判定根拠とともに一覧化する。ユーザーが対象entryのno-action扱いを明示確認した後に移す。カテゴリ未記入の`source: self` entryは、active logでH3 titleの重複がない場合にno-action候補とする。`source: user`、`agent self-report`、human review由来か判定不能な`source: review`は機械移動の対象外とする。
- no-action移動は4カテゴリの恒久対応と`done`移動より先に行い、ユーザーのレビューと明示的なcommit指示を受けて専用commitにする。
- 次の4カテゴリへ、長文ではない最小の恒久対応を追加する。
  1. `test authoring discipline`
  2. `verification accuracy`
  3. `repeated Playwright environment failure`
  4. `validation command targeting`
- `verification accuracy`では、レビューと完了チェックの前に条件ごとの根拠を照合し、根拠不足なら完了扱いにせず停止してユーザー指示を待つ規約を追加する。
- test失敗とcommand失敗は、agent自身が観測した通常の失敗に限り、同一作業中に同一testまたは同一commandを3回以上連続で失敗した場合だけfailure logへ記録する規約へ変更する。カテゴリ件数は記録条件に使わない。ユーザー指摘、承認逸脱、workflow違反、scope drift、未検証完了はこの閾値の対象外とする。
- 各カテゴリでは、active occurrence count、代表的な対象task / file、リスク、具体的な変更先、軽量な対応案、`done`移動候補を提示して停止する。ユーザーがその具体案を明示承認した後だけ、該当カテゴリの恒久対応を編集する。
- 4カテゴリの対応と移動後、active failure logの行数を計測し、再現性のない単発失敗をさらに減らすための整理方針を検討してユーザーへ報告する。

## 初期スコープ外

- サイトのUI、アプリケーションコード、test実装、CI設定を変更しない。
- 新しいnpm packageを追加しない。
- failure logの原文を削除しない。
- ユーザーが指定していないカテゴリへ恒久対応を広げない。
- human review前にissue reviewerを起動しない。

## 完了条件

- [ ] active entryの分類基準と移動対象を、ユーザー承認済みの基準で一覧化した。
- [x] no-action候補一覧を提示し、対象entryのno-action扱いについてユーザーの明示確認を得た。
- [x] 単発または再現条件を満たさないno-action対象entryのうち、明示確認済みentryだけを4カテゴリの恒久対応より先に移し、原文・disposition・移動日を保持した。
- [x] no-action移動を、ユーザーのレビューと明示的なcommit指示を受けた専用commitにした。
- [x] `test authoring discipline`の具体案をユーザーが明示承認した後に恒久対応と記録整理を行い、実装後にユーザーがhandled扱いを明示確認した。
- [x] `verification accuracy`の具体案をユーザーが明示承認した後に恒久対応と記録整理を行い、実装後にユーザーがhandled扱いを明示確認した。
- [x] `repeated Playwright environment failure`の具体案をユーザーが明示承認した後に恒久対応と記録整理を行い、実装後にユーザーがhandled扱いを明示確認した。Chromium sandbox起動失敗4件はno-actionへ移した。
- [x] `validation command targeting`の具体案をユーザーが明示承認した後に恒久対応と記録整理を行い、実装後にユーザーがhandled扱いを明示確認した。3件はno-actionへ移した。
- [x] 各カテゴリは、原文・恒久対応先・移動日を保持して対応済みentryを`done`へ、またはユーザー判断により`no-action`へ移した。
- [x] 各カテゴリの`done`または`no-action`移動は、ユーザーの明示的なcommit指示を受けた同じカテゴリcommitへ含めた。
- [ ] 4カテゴリの対応・移動後にactive failure logの行数を計測し、単発失敗を減らす次の整理方針を報告した。
- [ ] `npm run format:md` と `npm run check:md` が通る。

## チェックポイント

- [x] test / command失敗は、カテゴリの合計件数ではなく、同一testまたは同一commandの連続失敗回数で分類した。
- [x] 4カテゴリごとのactive occurrence countと代表的な対象task / fileを、no-action移動前に報告した。
- [ ] 3回連続の閾値を、agent自身が観測した通常のtest / command失敗だけに適用した。
- [x] sourceが`self`または非human review由来と確認できる`review`で、再現条件を満たさないentryをno-action候補として確認した。
- [x] `source: user`、`agent self-report`、human review由来か判定不能な`source: review`を、機械的なno-action移動の対象から除外した。カテゴリ未記入の`source: self` entryはH3 titleの重複を確認して分類した。
- [ ] 根拠照合規約は、既存の強い規約を重複させず短く追加した。
- [ ] 1カテゴリごとに、具体的な対応案と移動候補をユーザーへ提示し、編集前の明示承認と実装後のhandled確認を得た。
- [ ] 1カテゴリごとに、ユーザーが明示指示した場合だけ承認済みの変更を独立したcommitにした。
- [ ] failure logのentryを削除せず、doneまたはno-actionへ追跡可能な形で移した。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/agent-failure-log.md`
- `docs/agent-failure-log-done.md`
- `docs/agent-failure-log-no-action.md`
- `AGENTS.md`、`.agents/skills/*/SKILL.md`、`.agents/rules/*.md`のうち、各カテゴリの軽量な恒久対応に必要な最小限のファイル

## レビュー観点

- 「同一testまたは同一commandの3回以上連続失敗」という記録基準が、test / Playwright環境 / command選択の各カテゴリに正しく適用されるか。
- no-action候補の固定条件と除外対象が、current active entryへ安全に適用できるか。
- 単発entryの`no-action`移動が、4カテゴリの恒久対応と`done`移動より先に完了する契約になっているか。
- `verification accuracy`の根拠照合・停止規約が、必要十分で長文化していないか。
- 各カテゴリで、具体案の編集前承認、実装後のユーザーによるhandled確認、明示的なcommit指示を分けられているか。
- issue reviewerは、このhuman reviewでの指示後に起動すること。

## 備考

- Gate作成またはGate分割は行わない。このissue単体を実装契約とする。
- issue reviewerは、ユーザーがこのissueをhuman reviewした後に明示指示した場合だけ実行する。
- no-action対象は、ユーザーが明示したsource / 再現条件に一致するentryだけとする。カテゴリ未記入の`source: self` entryはactive logでH3 titleが重複しない場合に対象とする。`source: review`のhuman review由来を機械判定できない場合は、移動せずユーザー判断を待つ。
- 4カテゴリのentryを`done`または`no-action`へ移す範囲は、no-action移動の結果を前提にカテゴリごとの具体案で確定する。
- Chromium sandbox起動失敗は、カテゴリの恒久対応後も`done`ではなく`no-action`へ移す。
- `validation command targeting`は、カテゴリ1で反映した同一commandの3回連続失敗基準を適用し、追加の恒久指示を置かず`no-action`へ移す。
