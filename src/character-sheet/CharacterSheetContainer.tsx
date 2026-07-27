import { useId } from "react";

import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./components/dialogs/CharacterSheetDialog";
import DialogDemoTrigger from "./components/dialogs/DialogDemoTrigger";
import { characterSheetDictionary } from "./dictionary";
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
  const imageErrorTitleId = useId();
  const imageErrorDescriptionId = useId();
  const presenterProps = useCharacterSheetFormPresenterProps(rootState.form, {
    characterImage: rootState.characterImage,
    isImageProcessing: rootState.isImageProcessing,
    onCharacterImageSelected: rootState.onCharacterImageSelected,
    onCharacterImageSelectionStarted:
      rootState.onCharacterImageSelectionStarted,
  });
  const { image: imageCopy } = characterSheetDictionary.characterSheet;
  const imageErrorMessage =
    rootState.imageError === null
      ? ""
      : rootState.imageError.code === "invalid-type"
        ? imageCopy.errors.invalidType
        : rootState.imageError.code === "file-too-large"
          ? imageCopy.errors.fileTooLarge
          : rootState.imageError.code === "decode"
            ? imageCopy.errors.decode
            : rootState.imageError.code === "restore"
              ? imageCopy.errors.restore
              : imageCopy.errors.storage;

  return (
    <>
      <div
        aria-busy={rootState.isImageProcessing}
        inert={rootState.isImageProcessing || undefined}
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
        <CharacterSheetDialog
          ariaDescribedBy={imageErrorDescriptionId}
          ariaLabelledBy={imageErrorTitleId}
          initialFocusRef={rootState.imageErrorCloseButtonRef}
          isOpen={rootState.imageError !== null}
          onRequestClose={() => rootState.setImageError(null)}
          returnFocusRef={rootState.imageReturnFocusRef}
        >
          <CharacterSheetDialogHeader headingId={imageErrorTitleId}>
            {imageCopy.errorTitle}
          </CharacterSheetDialogHeader>
          <CharacterSheetDialogContent>
            <p id={imageErrorDescriptionId}>{imageErrorMessage}</p>
          </CharacterSheetDialogContent>
          <CharacterSheetDialogActions>
            <button
              data-tone="primary"
              onClick={() => rootState.setImageError(null)}
              ref={rootState.imageErrorCloseButtonRef}
              type="button"
            >
              {characterSheetDictionary.general.close}
            </button>
          </CharacterSheetDialogActions>
        </CharacterSheetDialog>
      </div>
      <CharacterSheetLoadingOverlay isOpen={rootState.isImageProcessing} />
    </>
  );
}
