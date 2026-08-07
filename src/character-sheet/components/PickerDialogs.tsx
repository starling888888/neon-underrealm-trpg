import { type ComponentProps, memo } from "react";

import ArmorPickerDialog from "./dialogs/ArmorPickerDialog";
import CyberneticsPickerDialog from "./dialogs/CyberneticsPickerDialog";
import DrugsPickerDialog from "./dialogs/DrugsPickerDialog";
import IkizamaSkillPickerDialog from "./dialogs/IkizamaSkillPickerDialog";
import NanomachinesPickerDialog from "./dialogs/NanomachinesPickerDialog";
import OmamoriPickerDialog from "./dialogs/OmamoriPickerDialog";
import OtherRyugiSkillPickerDialog from "./dialogs/OtherRyugiSkillPickerDialog";
import PrimarySkillPickerDialog from "./dialogs/PrimarySkillPickerDialog";
import WeaponPickerDialog from "./dialogs/WeaponPickerDialog";
import SkillPickerDialog from "./skills/SkillPickerDialog";

export type PickerDialogsProps = {
  armor: ComponentProps<typeof ArmorPickerDialog>;
  commonSkill: ComponentProps<typeof SkillPickerDialog>;
  cybernetics: ComponentProps<typeof CyberneticsPickerDialog>;
  drugs: ComponentProps<typeof DrugsPickerDialog>;
  ikizamaSkill: ComponentProps<typeof IkizamaSkillPickerDialog>;
  nanomachines: ComponentProps<typeof NanomachinesPickerDialog>;
  omamori: ComponentProps<typeof OmamoriPickerDialog>;
  otherRyugiSkill: ComponentProps<typeof OtherRyugiSkillPickerDialog>;
  primarySkill: ComponentProps<typeof PrimarySkillPickerDialog>;
  weapon: ComponentProps<typeof WeaponPickerDialog>;
};

function PickerDialogs({
  armor,
  commonSkill,
  cybernetics,
  drugs,
  ikizamaSkill,
  nanomachines,
  omamori,
  otherRyugiSkill,
  primarySkill,
  weapon,
}: PickerDialogsProps) {
  return (
    <>
      <PrimarySkillPickerDialog {...primarySkill} />
      <IkizamaSkillPickerDialog {...ikizamaSkill} />
      <SkillPickerDialog {...commonSkill} />
      <OtherRyugiSkillPickerDialog {...otherRyugiSkill} />
      <WeaponPickerDialog {...weapon} />
      <ArmorPickerDialog {...armor} />
      <OmamoriPickerDialog {...omamori} />
      <DrugsPickerDialog {...drugs} />
      <CyberneticsPickerDialog {...cybernetics} />
      <NanomachinesPickerDialog {...nanomachines} />
    </>
  );
}

export default memo(PickerDialogs);
