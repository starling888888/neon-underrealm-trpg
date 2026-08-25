import { useEffect, useId, useRef, useState } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";
import styles from "./CharacterSheetSaveDialog.module.css";

type Props = {
  isOpen: boolean;
  isSaving: boolean;
  onConfirm: (pcName: string, plName: string, isPublic: boolean) => void;
  onRequestClose: () => void;
};

export default function CharacterSheetCopySaveDialog({
  isOpen,
  isSaving,
  onConfirm,
  onRequestClose,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [pcName, setPcName] = useState("");
  const [plName, setPlName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { general, characterSheet } = characterSheetDictionary;
  const { copySave, visibility } = characterSheet.remotePersistence;

  useEffect(() => {
    if (!isOpen) return;
    setPcName("");
    setPlName("");
    setIsPublic(false);
  }, [isOpen]);

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={copySave.label}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{copySave.description}</p>
        <p className={styles.muted}>{copySave.imageNotice}</p>
        <label className={styles.field}>
          <span>{characterSheet.characterList.table.pcName}</span>
          <input
            disabled={isSaving}
            onChange={(event) => setPcName(event.target.value)}
            value={pcName}
          />
        </label>
        <label className={styles.field}>
          <span>{characterSheet.characterList.table.plName}</span>
          <input
            disabled={isSaving}
            onChange={(event) => setPlName(event.target.value)}
            value={plName}
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
          color="warning"
          disabled={isSaving || !pcName.trim()}
          onClick={() => onConfirm(pcName.trim(), plName.trim(), isPublic)}
          size="medium"
          variant="outline"
        >
          {general.save}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
