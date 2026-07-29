import { useId, useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import { formatDisplayValue } from "../../format-display-value";
import type { CyberneticCandidateGroup } from "../../master-data/cybernetics";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./CyberneticsPickerDialog.module.css";

type Props = {
  groups: readonly CyberneticCandidateGroup[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

export default function CyberneticsPickerDialog({
  groups,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: Props) {
  const copy = characterSheetDictionary.characterSheet.cybernetics;
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <CharacterSheetDialog
      ariaLabelledBy={titleId}
      className={styles.dialog}
      initialFocusRef={closeButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        closeButtonRef={closeButtonRef}
        headingId={titleId}
        onRequestClose={onRequestClose}
      >
        {copy.choose}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <div className={styles.content}>
          <p className={styles.selectionGuide}>
            <strong>{copy.pickerGuide}</strong>
          </p>
          {groups.map((group) => (
            <section className={styles.group} key={group.id}>
              <h3>{group.label}</h3>
              <div className={styles.headerRow}>
                <span>{copy.headers.name}</span>
                <span>{copy.headers.credit}</span>
                <span>{copy.headers.implantPoints}</span>
              </div>
              {group.candidates.map((cybernetic) => (
                <div className={styles.candidate} key={cybernetic.id}>
                  <div className={styles.firstLine}>
                    <button
                      onClick={() => onSelect(cybernetic.id)}
                      type="button"
                    >
                      {cybernetic.name}
                    </button>
                    <span>{formatDisplayValue(cybernetic.credit)}</span>
                    <span>{cybernetic.implantPoints}</span>
                  </div>
                  <p>
                    <strong>効果：</strong>
                    {cybernetic.effect}
                  </p>
                </div>
              ))}
            </section>
          ))}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
