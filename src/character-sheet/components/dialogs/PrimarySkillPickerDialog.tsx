import { type CSSProperties, useId, useRef } from "react";

import type { Skill } from "../../../lib/types/skill";
import { characterSheetDictionary } from "../../dictionary";
import type { PrimarySkillGroups } from "../../master-data/primary-skills";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./PrimarySkillPickerDialog.module.css";

type PrimarySkillPickerDialogProps = {
  groups: PrimarySkillGroups;
  isOpen: boolean;
  maximumSkillNameLength: number;
  onRequestClose: () => void;
  onSelect: (skillId: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

function CandidateRow({
  onSelect,
  skill,
}: {
  onSelect: (skillId: string) => void;
  skill: Skill;
}) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <button
      className={styles.candidate}
      onClick={() => onSelect(skill.id)}
      type="button"
    >
      <span className={styles.firstLine}>
        <span className={styles.name}>{skill.name}</span>
        <span>
          {copy.maximumLevel}: {skill.maxLevel}
        </span>
        <span>
          {copy.cost}: {skill.cost ?? "-"}
        </span>
        <span>
          {copy.proficiency}: {skill.proficiency ?? "-"}
        </span>
        <span>
          {copy.usageRestriction}: {skill.usageRestriction ?? "-"}
        </span>
        <span>
          {copy.target}: {skill.target ?? "-"}
        </span>
        <span>
          {copy.range}: {skill.range ?? "-"}
        </span>
        <span>
          {copy.acquisitionRestriction}: {skill.acquisitionRestriction ?? "-"}
        </span>
      </span>
      <span className={styles.effect}>
        <strong>{copy.effect}</strong>
        {skill.effect}
      </span>
    </button>
  );
}

function CandidateGroup({
  heading,
  onSelect,
  skills,
}: {
  heading: string;
  onSelect: (skillId: string) => void;
  skills: readonly Skill[];
}) {
  if (skills.length === 0) return null;

  return (
    <section className={styles.group}>
      <h3>{heading}</h3>
      {skills.map((skill) => (
        <CandidateRow key={skill.id} onSelect={onSelect} skill={skill} />
      ))}
    </section>
  );
}

/** Controlled candidate picker for a single primary-skill row. */
export default function PrimarySkillPickerDialog({
  groups,
  isOpen,
  maximumSkillNameLength,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: PrimarySkillPickerDialogProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const nameWidthStyle = {
    "--primary-skill-name-width": `${maximumSkillNameLength}em`,
  } as CSSProperties;

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
        {characterSheetDictionary.characterSheet.skills.choose}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <div className={styles.content} style={nameWidthStyle}>
          <CandidateGroup
            heading="初期作成"
            onSelect={onSelect}
            skills={groups.basic}
          />
          <CandidateGroup
            heading="Lv6以上"
            onSelect={onSelect}
            skills={groups.advanced}
          />
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
