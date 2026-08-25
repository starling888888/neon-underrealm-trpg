import { useEffect, useId, useRef, useState } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";
import styles from "./CharacterSheetSaveDialog.module.css";

type Props = {
  initialPcName: string;
  initialPublic: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onConfirm: (pcName: string, isPublic: boolean) => void;
  onRequestClose: () => void;
};

export default function CharacterSheetSaveDialog({
  initialPcName,
  initialPublic,
  isOpen,
  isSaving,
  onConfirm,
  onRequestClose,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [pcName, setPcName] = useState(initialPcName);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const { general, characterSheet } = characterSheetDictionary;
  const { save, visibility } = characterSheet.remotePersistence;

  useEffect(() => {
    if (!isOpen) return;
    setPcName(initialPcName);
    setIsPublic(initialPublic);
  }, [initialPcName, initialPublic, isOpen]);

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={save.label}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{save.description}</p>
        <label className={styles.field}>
          <span>{characterSheet.characterList.table.pcName}</span>
          <input
            disabled={isSaving}
            onChange={(event) => setPcName(event.target.value)}
            value={pcName}
          />
        </label>
        <label className={styles.check}>
          <input
            checked={isPublic}
            disabled={isSaving}
            onChange={(event) => setIsPublic(event.target.checked)}
            type="checkbox"
          />
          {visibility}
        </label>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          color="muted"
          disabled={isSaving}
          onClick={onRequestClose}
          ref={cancelButtonRef}
          size="medium"
        >
          {general.cancel}
        </CharacterSheetButton>
        <CharacterSheetButton
          disabled={isSaving || !pcName.trim()}
          onClick={() => onConfirm(pcName.trim(), isPublic)}
          size="medium"
          variant="outline"
        >
          {general.save}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
