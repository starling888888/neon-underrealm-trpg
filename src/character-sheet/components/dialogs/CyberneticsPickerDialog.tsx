import { useId, useRef } from "react";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../lib/utils/display-value";
import { characterSheetDictionary } from "../../dictionary";
import type { CyberneticCandidateGroup } from "../../master-data/cybernetics";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./CyberneticsPickerDialog.module.css";
import PickerTableHeader from "./PickerTableHeader";

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
              <PickerTableHeader
                cells={[
                  { content: copy.headers.name },
                  { content: copy.headers.credit },
                  { content: copy.headers.implantPoints },
                ]}
                className={styles.headerRow}
              />
              {group.candidates.map((cybernetic) => (
                <div className={styles.candidate} key={cybernetic.id}>
                  <div className={styles.firstLine}>
                    <button
                      className={styles.candidateName}
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
                    {formatDisplayText(cybernetic.effect)}
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
