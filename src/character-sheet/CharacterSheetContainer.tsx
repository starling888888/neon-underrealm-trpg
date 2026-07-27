import { useId } from "react";

import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import CharacterImageErrorDialog from "./components/dialogs/CharacterImageErrorDialog";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./components/dialogs/CharacterSheetDialog";
import DialogDemoTrigger from "./components/dialogs/DialogDemoTrigger";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import useCharacterSheetRootState from "./useCharacterSheetRootState";

/**
 * React Island root and orchestration boundary for the character sheet.
 *
 * It owns form state and cross-cutting UI state. Form layout belongs to the
 * presenter; dialogs that need root-level coordination are added as direct
 * siblings of that presenter in later Gates.
 */
export default function CharacterSheetContainer() {
  const rootState = useCharacterSheetRootState();
  const confirmationTitleId = useId();
  const confirmationDescriptionId = useId();
  const presenterProps = useCharacterSheetFormPresenterProps(rootState.form, {
    characterImage: rootState.characterImage,
    isRootOperationInProgress: rootState.isRootOperationInProgress,
    onCharacterImageCleared: rootState.onCharacterImageCleared,
    onCharacterImageSelected: rootState.onCharacterImageSelected,
    onCharacterImageOperationStarted:
      rootState.onCharacterImageOperationStarted,
  });
  return (
    <>
      <div
        aria-busy={rootState.isRootOperationInProgress}
        inert={rootState.isRootOperationInProgress || undefined}
      >
        <DialogDemoTrigger
          onOpen={() => rootState.setIsConfirmationOpen(true)}
          triggerRef={rootState.confirmationTriggerRef}
        />
        <CharacterSheetFormPresenter {...presenterProps} />
        <CharacterSheetDialog
          ariaDescribedBy={confirmationDescriptionId}
          ariaLabelledBy={confirmationTitleId}
          initialFocusRef={rootState.confirmationCancelButtonRef}
          isOpen={rootState.isConfirmationOpen}
          onRequestClose={() => rootState.setIsConfirmationOpen(false)}
          returnFocusRef={rootState.confirmationTriggerRef}
        >
          <CharacterSheetDialogHeader headingId={confirmationTitleId}>
            確認
          </CharacterSheetDialogHeader>
          <CharacterSheetDialogContent>
            <p id={confirmationDescriptionId}>
              この操作は確認用です。キャラクターシートの内容は変更されません。
            </p>
          </CharacterSheetDialogContent>
          <CharacterSheetDialogActions>
            <button
              onClick={() => rootState.setIsConfirmationOpen(false)}
              ref={rootState.confirmationCancelButtonRef}
              type="button"
            >
              キャンセル
            </button>
            <button
              data-tone="primary"
              onClick={() => rootState.setIsConfirmationOpen(false)}
              type="button"
            >
              OK
            </button>
          </CharacterSheetDialogActions>
        </CharacterSheetDialog>
        <CharacterImageErrorDialog
          closeButtonRef={rootState.imageErrorCloseButtonRef}
          errorCode={rootState.imageError?.code ?? null}
          onRequestClose={() => rootState.setImageError(null)}
          returnFocusRef={rootState.imageReturnFocusRef}
        />
      </div>
      <CharacterSheetLoadingOverlay
        isOpen={rootState.isRootOperationInProgress}
        label={rootState.rootOperation?.label ?? ""}
      />
    </>
  );
}
