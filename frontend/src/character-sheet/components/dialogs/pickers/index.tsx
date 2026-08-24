import { type ComponentProps, memo } from "react";

import ArmorPickerDialog from "./ArmorPickerDialog";
import CyberneticsPickerDialog from "./CyberneticsPickerDialog";
import DrugsPickerDialog from "./DrugsPickerDialog";
import IkizamaSkillPickerDialog from "./IkizamaSkillPickerDialog";
import NanomachinesPickerDialog from "./NanomachinesPickerDialog";
import OmamoriPickerDialog from "./OmamoriPickerDialog";
import OtherRyugiSkillPickerDialog from "./OtherRyugiSkillPickerDialog";
import PrimarySkillPickerDialog from "./PrimarySkillPickerDialog";
import SkillPickerDialog from "./SkillPickerDialog";
import WeaponPickerDialog from "./WeaponPickerDialog";

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
