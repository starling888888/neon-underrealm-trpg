import { characterSheetDictionary } from "../../../dictionary";
import type { OtherRyugiSkillGroups } from "../../../master-data/other-ryugi-skills";
import SkillPickerDialog from "./SkillPickerDialog";

type OtherRyugiSkillPickerDialogProps = {
  groups: OtherRyugiSkillGroups;
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (skillId: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  selectedSkillIds: readonly string[];
};

/** Adapts other-ryugi candidate groups to the shared skill picker. */
export default function OtherRyugiSkillPickerDialog({
  groups,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
  selectedSkillIds,
}: OtherRyugiSkillPickerDialogProps) {
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
      title={copy.chooseOtherRyugi}
    />
  );
}
