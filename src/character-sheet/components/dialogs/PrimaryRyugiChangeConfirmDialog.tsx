import { useId, useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";

type PrimaryRyugiChangeConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Confirms clearing selected primary skills before changing primary ryugi. */
export default function PrimaryRyugiChangeConfirmDialog({
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: PrimaryRyugiChangeConfirmDialogProps) {
  const { general } = characterSheetDictionary;
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabelledBy={titleId}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        headingId={titleId}
        onRequestClose={onRequestClose}
      >
        確認
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <p id={descriptionId}>
          変更すると、現在選択中のスキルが消去されます。本当によろしいですか？
        </p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <button onClick={onRequestClose} ref={cancelButtonRef} type="button">
          {general.cancel}
        </button>
        <button data-tone="primary" onClick={onConfirm} type="button">
          {general.change}
        </button>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
