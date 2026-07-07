# done issue archive

このディレクトリは、完了済みissueの履歴を保持する。

activeな `docs/issue/` 直下には、現在作業中または未完了のissueを置く。完了済みissueを移動する場合は、削除ではなくこの配下へ移す。

## 分類

- `phase-0/`: Phase 0に属する完了済みissue
- `phase-1/`: Phase 1に属する完了済みissue
- `phase-2/`: Phase 2に属する完了済みissue
- `cross-phase/`: plan番号に属さない横断整備issue、複数phaseにまたがる運用整備issue

## 移動条件

- issue本文の完了条件とチェックポイントがすべて確認済みである
- 対応PRがmerge済み、またはユーザーが完了扱いを明示している
- 現在作業中issueではない
- 移動先分類が判断できる
- 移動後に必要な内部リンク更新または過去記録注記を行う

未完了issue、現在作業中issue、完了条件・チェックポイントが未確認のissueは移動しない。
