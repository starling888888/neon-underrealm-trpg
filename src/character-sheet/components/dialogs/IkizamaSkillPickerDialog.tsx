import { characterSheetDictionary } from "../../dictionary";
import type { IkizamaSkillGroups } from "../../master-data/ikizama-skills";
import SkillPickerDialog from "../skills/SkillPickerDialog";

type IkizamaSkillPickerDialogProps = {
  groups: IkizamaSkillGroups;
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (skillId: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Adapts ikizama candidate groups to the shared skill picker. */
export default function IkizamaSkillPickerDialog({
  groups,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: IkizamaSkillPickerDialogProps) {
  const copy = characterSheetDictionary.characterSheet.skills;

  return (
    <SkillPickerDialog
      groups={[
        { heading: copy.initialCreation, id: "basic", skills: groups.basic },
        {
          heading: copy.level4OrAbove,
          id: "advanced",
          skills: groups.advanced,
        },
      ]}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onSelect={onSelect}
      returnFocusRef={returnFocusRef}
      selectedSkillIds={[]}
      selectionGuide={copy.selectionGuide}
      title={copy.chooseIkizama}
    />
  );
}
