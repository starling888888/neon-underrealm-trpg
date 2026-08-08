import { characterSheetDictionary } from "../../../dictionary";
import type { PrimarySkillGroups } from "../../../master-data/primary-skills";
import SkillPickerDialog from "./SkillPickerDialog";

type PrimarySkillPickerDialogProps = {
  groups: PrimarySkillGroups;
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (skillId: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  selectedSkillIds: readonly string[];
};

/** Adapts primary-ryugi candidate groups to the shared skill picker. */
export default function PrimarySkillPickerDialog({
  groups,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
  selectedSkillIds,
}: PrimarySkillPickerDialogProps) {
  const copy = characterSheetDictionary.characterSheet.skills;

  return (
    <SkillPickerDialog
      groups={[
        { heading: copy.initialCreation, id: "basic", skills: groups.basic },
        {
          heading: copy.level6OrAbove,
          id: "advanced",
          skills: groups.advanced,
        },
      ]}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onSelect={onSelect}
      returnFocusRef={returnFocusRef}
      selectedSkillIds={selectedSkillIds}
      selectionGuide={copy.selectionGuide}
      title={copy.choose}
    />
  );
}
