import { memo, type RefObject, useCallback } from "react";

import { characterSheetDictionary } from "../../../dictionary";
import type { ActionPaneDialogsState } from "../../../hooks/useActionPane";
import type { CharacterSheetErrorSummary } from "../../../logic/error-summary";
import CharacterSheetCcfoliaCopyConfirmDialog from "./CharacterSheetCcfoliaCopyConfirmDialog";
import CharacterSheetCcfoliaCopyNoticeDialog from "./CharacterSheetCcfoliaCopyNoticeDialog";
import CharacterSheetErrorDialog from "./CharacterSheetErrorDialog";
import CharacterSheetHelpDialog from "./CharacterSheetHelpDialog";
import CharacterSheetJsonImportConfirmDialog from "./CharacterSheetJsonImportConfirmDialog";
import CharacterSheetJsonImportErrorDialog from "./CharacterSheetJsonImportErrorDialog";
import CharacterSheetResetConfirmDialog from "./CharacterSheetResetConfirmDialog";

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
