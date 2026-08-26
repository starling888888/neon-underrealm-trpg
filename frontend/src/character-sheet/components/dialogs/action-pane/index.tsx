import { memo, useCallback } from "react";

import type { ActionPaneDialogsState } from "../../../hooks/useActionPane";
import type { CharacterSheetErrorSummary } from "../../../logic/error-summary";
import CharacterSheetCcfoliaCopyConfirmDialog from "./CharacterSheetCcfoliaCopyConfirmDialog";
import CharacterSheetErrorDialog from "./CharacterSheetErrorDialog";
import CharacterSheetHelpDialog from "./CharacterSheetHelpDialog";
import CharacterSheetResetConfirmDialog from "./CharacterSheetResetConfirmDialog";

type ActionPaneDialogsProps = {
  errorSummary: CharacterSheetErrorSummary;
  state: ActionPaneDialogsState;
};

function ActionPaneDialogs({ errorSummary, state }: ActionPaneDialogsProps) {
  const { actions, errors } = state;
  const onCcfoliaCopyConfirmed = useCallback(() => {
    void actions.confirmCcfoliaCopy();
  }, [actions.confirmCcfoliaCopy]);

  return (
    <>
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
      <CharacterSheetResetConfirmDialog
        isOpen={actions.isResetConfirmOpen}
        onConfirm={actions.confirmReset}
        onRequestClose={actions.closeResetConfirm}
        returnFocusRef={actions.resetTriggerRef}
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
