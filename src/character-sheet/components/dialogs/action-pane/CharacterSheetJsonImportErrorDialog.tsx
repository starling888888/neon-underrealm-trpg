import { type RefObject, useId } from "react";

import { characterSheetDictionary } from "../../../dictionary";
import CharacterSheetButton from "../../_common/CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "../CharacterSheetDialog";

type Props = {
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  dialogLabel: string;
  isOpen: boolean;
  message: string;
  onRequestClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

/** Presents JSON input failures without changing the current character. */
export default function CharacterSheetJsonImportErrorDialog({
  confirmButtonRef,
  dialogLabel,
  isOpen,
  message,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const descriptionId = useId();

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={dialogLabel}
      initialFocusRef={confirmButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{message}</p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          onClick={onRequestClose}
          ref={confirmButtonRef}
          size="medium"
          variant="solid"
        >
          {characterSheetDictionary.general.confirm}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
