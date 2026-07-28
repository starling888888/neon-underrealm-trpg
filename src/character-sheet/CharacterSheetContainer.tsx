import { useRef, useState } from "react";

import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import CharacterImageErrorDialog from "./components/dialogs/CharacterImageErrorDialog";
import PrimaryRyugiChangeConfirmDialog from "./components/dialogs/PrimaryRyugiChangeConfirmDialog";
import PrimarySkillPickerDialog from "./components/dialogs/PrimarySkillPickerDialog";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import useCharacterSheetRootState from "./useCharacterSheetRootState";

/**
 * React Island root and orchestration boundary for the character sheet.
 *
 * It owns form state and cross-cutting UI state. Form layout belongs to the
 * presenter; dialogs that need root-level coordination are added as direct
 * siblings of that presenter in later Gates.
 */
export default function CharacterSheetContainer() {
  const rootState = useCharacterSheetRootState();
  const [primarySkillPickerRowId, setPrimarySkillPickerRowId] = useState<
    string | null
  >(null);
  const [isPrimaryRyugiChangeConfirmOpen, setIsPrimaryRyugiChangeConfirmOpen] =
    useState(false);
  const primarySkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const primaryRyugiChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const pendingPrimaryRyugiChangeRef = useRef<(() => void) | null>(null);
  const presenterProps = useCharacterSheetFormPresenterProps(
    rootState.form,
    {
      characterImage: rootState.characterImage,
      isRootOperationInProgress: rootState.isRootOperationInProgress,
      onCharacterImageCleared: rootState.onCharacterImageCleared,
      onCharacterImageSelected: rootState.onCharacterImageSelected,
      onCharacterImageOperationStarted:
        rootState.onCharacterImageOperationStarted,
    },
    {
      onPrimaryRyugiChangeRequested: (primaryRyugiId, trigger, applyChange) => {
        const currentPrimaryRyugiId = rootState.form.getValues(
          "build.primaryRyugiId",
        );
        const hasSelectedSkill = rootState.form
          .getValues("primarySkills.rows")
          .some((row) => row.skillId !== null);

        if (primaryRyugiId === currentPrimaryRyugiId || !hasSelectedSkill) {
          applyChange();
          return;
        }

        primaryRyugiChangeTriggerRef.current = trigger;
        pendingPrimaryRyugiChangeRef.current = applyChange;
        setIsPrimaryRyugiChangeConfirmOpen(true);
      },
      onPrimarySkillPickerRequested: (rowId, trigger) => {
        primarySkillPickerTriggerRef.current = trigger;
        setPrimarySkillPickerRowId(rowId);
      },
    },
  );

  function closePrimarySkillPicker(): void {
    setPrimarySkillPickerRowId(null);
  }

  function confirmPrimaryRyugiChange(): void {
    presenterProps.primarySkillsSection.onSelectionClear();
    pendingPrimaryRyugiChangeRef.current?.();
    pendingPrimaryRyugiChangeRef.current = null;
    setIsPrimaryRyugiChangeConfirmOpen(false);
  }

  function closePrimaryRyugiChangeConfirm(): void {
    pendingPrimaryRyugiChangeRef.current = null;
    setIsPrimaryRyugiChangeConfirmOpen(false);
  }
  return (
    <>
      <div
        aria-busy={rootState.isRootOperationInProgress}
        inert={rootState.isRootOperationInProgress || undefined}
      >
        <CharacterSheetFormPresenter {...presenterProps} />
        <CharacterImageErrorDialog
          closeButtonRef={rootState.imageErrorCloseButtonRef}
          errorCode={rootState.imageError?.code ?? null}
          onRequestClose={() => rootState.setImageError(null)}
          returnFocusRef={rootState.imageReturnFocusRef}
        />
        <PrimarySkillPickerDialog
          groups={presenterProps.primarySkillsSection.candidateGroups}
          isOpen={primarySkillPickerRowId !== null}
          onRequestClose={closePrimarySkillPicker}
          onSelect={(skillId) => {
            if (primarySkillPickerRowId !== null) {
              presenterProps.primarySkillsSection.onSelect(
                primarySkillPickerRowId,
                skillId,
              );
            }
            closePrimarySkillPicker();
          }}
          returnFocusRef={primarySkillPickerTriggerRef}
        />
        <PrimaryRyugiChangeConfirmDialog
          isOpen={isPrimaryRyugiChangeConfirmOpen}
          onConfirm={confirmPrimaryRyugiChange}
          onRequestClose={closePrimaryRyugiChangeConfirm}
          returnFocusRef={primaryRyugiChangeTriggerRef}
        />
      </div>
      <CharacterSheetLoadingOverlay
        isOpen={rootState.isRootOperationInProgress}
        label={rootState.rootOperation?.label ?? ""}
      />
    </>
  );
}
