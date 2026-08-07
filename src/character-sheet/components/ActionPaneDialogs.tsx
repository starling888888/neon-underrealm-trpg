import { memo, type RefObject, useCallback } from "react";

import { characterSheetDictionary } from "../dictionary";
import type { CharacterSheetErrorSummary } from "../logic/error-summary";
import type { ActionPaneDialogsState } from "../useActionPane";
import CharacterSheetCcfoliaCopyConfirmDialog from "./dialogs/CharacterSheetCcfoliaCopyConfirmDialog";
import CharacterSheetCcfoliaCopyNoticeDialog from "./dialogs/CharacterSheetCcfoliaCopyNoticeDialog";
import CharacterSheetErrorDialog from "./dialogs/CharacterSheetErrorDialog";
import CharacterSheetHelpDialog from "./dialogs/CharacterSheetHelpDialog";
import CharacterSheetJsonImportConfirmDialog from "./dialogs/CharacterSheetJsonImportConfirmDialog";
import CharacterSheetJsonImportErrorDialog from "./dialogs/CharacterSheetJsonImportErrorDialog";
import CharacterSheetResetConfirmDialog from "./dialogs/CharacterSheetResetConfirmDialog";

type ActionPaneDialogsProps = {
  errorSummary: CharacterSheetErrorSummary;
  isJsonImportErrorOpen: boolean;
  isJsonImportImageErrorOpen: boolean;
  isJsonImportPending: boolean;
  jsonImportErrorConfirmButtonRef: RefObject<HTMLButtonElement | null>;
  jsonImportReturnFocusRef: RefObject<HTMLButtonElement | null>;
  onJsonImportConfirmed: () => void;
  onJsonImportErrorClose: () => void;
  onJsonImportImageErrorClose: () => void;
  onJsonImportPendingClose: () => void;
  state: ActionPaneDialogsState;
};

function ActionPaneDialogs({
  errorSummary,
  isJsonImportErrorOpen,
  isJsonImportImageErrorOpen,
  isJsonImportPending,
  jsonImportErrorConfirmButtonRef,
  jsonImportReturnFocusRef,
  onJsonImportConfirmed,
  onJsonImportErrorClose,
  onJsonImportImageErrorClose,
  onJsonImportPendingClose,
  state,
}: ActionPaneDialogsProps) {
  const { actions, errors } = state;
  const { ccfolia } = characterSheetDictionary.characterSheet;
  const onCcfoliaCopyConfirmed = useCallback(() => {
    void actions.confirmCcfoliaCopy();
  }, [actions.confirmCcfoliaCopy]);

  return (
    <>
      <CharacterSheetJsonImportConfirmDialog
        isOpen={isJsonImportPending}
        onConfirm={onJsonImportConfirmed}
        onRequestClose={onJsonImportPendingClose}
        returnFocusRef={jsonImportReturnFocusRef}
      />
      <CharacterSheetHelpDialog
        isOpen={actions.isHelpOpen}
        onRequestClose={actions.closeHelp}
        returnFocusRef={actions.helpTriggerRef}
      />
      <CharacterSheetCcfoliaCopyConfirmDialog
        isOpen={actions.isCcfoliaCopyConfirmOpen}
        onConfirm={onCcfoliaCopyConfirmed}
        onRequestClose={actions.closeCcfoliaCopyConfirm}
        returnFocusRef={actions.ccfoliaCopyTriggerRef}
      />
      <CharacterSheetCcfoliaCopyNoticeDialog
        confirmButtonRef={actions.ccfoliaCopyNoticeConfirmButtonRef}
        dialogLabel={
          actions.ccfoliaCopyNotice === "success"
            ? ccfolia.successLabel
            : ccfolia.failureLabel
        }
        isOpen={actions.ccfoliaCopyNotice !== null}
        message={
          actions.ccfoliaCopyNotice === "success"
            ? ccfolia.success
            : ccfolia.failure
        }
        onRequestClose={actions.closeCcfoliaCopyNotice}
        returnFocusRef={actions.ccfoliaCopyTriggerRef}
      />
      <CharacterSheetResetConfirmDialog
        isOpen={actions.isResetConfirmOpen}
        onConfirm={actions.confirmReset}
        onRequestClose={actions.closeResetConfirm}
        returnFocusRef={actions.resetTriggerRef}
      />
      <CharacterSheetJsonImportErrorDialog
        confirmButtonRef={jsonImportErrorConfirmButtonRef}
        dialogLabel={
          characterSheetDictionary.characterSheet.jsonImport.errorLabel
        }
        isOpen={isJsonImportErrorOpen}
        message={characterSheetDictionary.characterSheet.jsonImport.error}
        onRequestClose={onJsonImportErrorClose}
        returnFocusRef={jsonImportReturnFocusRef}
      />
      <CharacterSheetJsonImportErrorDialog
        confirmButtonRef={jsonImportErrorConfirmButtonRef}
        dialogLabel={
          characterSheetDictionary.characterSheet.jsonImport.imageErrorLabel
        }
        isOpen={isJsonImportImageErrorOpen}
        message={characterSheetDictionary.characterSheet.jsonImport.imageError}
        onRequestClose={onJsonImportImageErrorClose}
        returnFocusRef={jsonImportReturnFocusRef}
      />
      <CharacterSheetErrorDialog
        closeButtonRef={errors.errorSummaryCloseButtonRef}
        errorSummary={errorSummary}
        isOpen={errors.isErrorSummaryOpen}
        onRequestClose={errors.closeErrorSummary}
        returnFocusRef={errors.errorSummaryTriggerRef}
      />
    </>
  );
}

export default memo(ActionPaneDialogs);
