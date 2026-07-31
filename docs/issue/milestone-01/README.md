# milestone-01 archive

このディレクトリは、milestone-01の計画と完了済みissueの履歴を保持する。

activeな `docs/issue/` 直下には、現在作業中または未完了のissueを置く。milestone-01で完了したissueは削除せず `done/` 配下へ移す。

## 分類

- `done/phase-X/`: 元のPhaseに属する完了済みissue
- `done/cross-phase/`: 複数Phaseにまたがる運用整備issueと特別task
- `plan.md`: milestone-01の計画・履歴。Gate planではない。

## 移動条件

- issue本文の完了条件とチェックポイントがすべて確認済みである
- 対応PRがmerge済み、またはユーザーが完了扱いを明示している
- 現在作業中issueではない
- 移動先分類が判断できる
- 移動後に必要な内部リンク更新または過去記録注記を行う

Gate専用の子issueは、移動前に親issueの `docs/issue/<parent-issue>/plan.md` へ、後続Gateに必要な詳細要件・確定判断・引継ぎだけを戻す。完了済み親Gate planと子issue archiveは、同じ `done/` 配下へ集約する。

未完了issue、現在作業中issue、完了条件・チェックポイントが未確認のissueは移動しない。

## チェック更新

実装中は、完了条件・チェックポイントを実際に確認した時点でissue本文にチェックを入れる。

PR作成時に未チェックが残る場合は、既に確認済みの根拠がある項目だけチェックできる。PR作成のためだけに未確認項目を完了扱いしない。

post-merge-plan-update時は、最新issueまたは過去のactive issueに未チェックが残っていても、merge後の `main`、検証結果、PR記録、またはユーザー確認により完了が確認できる場合はチェックを入れてよい。確認できない項目が残るissueはdoneへ移動しない。
