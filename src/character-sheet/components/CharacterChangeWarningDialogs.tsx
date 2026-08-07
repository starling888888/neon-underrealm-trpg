import { type ComponentProps, memo } from "react";

import SkillSelectionChangeConfirmDialog from "./dialogs/SkillSelectionChangeConfirmDialog";
import SpecialItemCategoryRemoveConfirmDialog from "./dialogs/SpecialItemCategoryRemoveConfirmDialog";

export type CharacterChangeWarningDialogsProps = {
  ikizama: ComponentProps<typeof SkillSelectionChangeConfirmDialog>;
  otherRyugiChange: ComponentProps<typeof SkillSelectionChangeConfirmDialog>;
  otherRyugiRemove: ComponentProps<typeof SkillSelectionChangeConfirmDialog>;
  primaryRyugi: ComponentProps<typeof SkillSelectionChangeConfirmDialog>;
  specialItemCategory: ComponentProps<
    typeof SpecialItemCategoryRemoveConfirmDialog
  >;
};

function CharacterChangeWarningDialogs({
  ikizama,
  otherRyugiChange,
  otherRyugiRemove,
  primaryRyugi,
  specialItemCategory,
}: CharacterChangeWarningDialogsProps) {
  return (
    <>
      <SkillSelectionChangeConfirmDialog {...primaryRyugi} />
      <SkillSelectionChangeConfirmDialog {...ikizama} />
      <SkillSelectionChangeConfirmDialog {...otherRyugiChange} />
      <SkillSelectionChangeConfirmDialog {...otherRyugiRemove} />
      <SpecialItemCategoryRemoveConfirmDialog {...specialItemCategory} />
    </>
  );
}

export default memo(CharacterChangeWarningDialogs);
