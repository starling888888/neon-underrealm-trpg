import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./components/dialogs/CharacterSheetDialog";
import DialogDemoTrigger from "./components/dialogs/DialogDemoTrigger";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "./form-values";
import { characterSheetFormSchema } from "./schemas/character-sheet-form";

/**
 * React Island root and orchestration boundary for the character sheet.
 *
 * It owns form state and cross-cutting UI state. Form layout belongs to the
 * presenter; dialogs that need root-level coordination are added as direct
 * siblings of that presenter in later Gates.
 */
export default function CharacterSheetContainer() {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const confirmationTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationTitleId = useId();
  const confirmationDescriptionId = useId();
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });
  const presenterProps = useCharacterSheetFormPresenterProps(form);

  return (
    <>
      <DialogDemoTrigger
        onOpen={() => setIsConfirmationOpen(true)}
        triggerRef={confirmationTriggerRef}
      />
      <CharacterSheetFormPresenter {...presenterProps} />
      <CharacterSheetDialog
        ariaDescribedBy={confirmationDescriptionId}
        ariaLabelledBy={confirmationTitleId}
        initialFocusRef={cancelButtonRef}
        isOpen={isConfirmationOpen}
        onRequestClose={() => setIsConfirmationOpen(false)}
        returnFocusRef={confirmationTriggerRef}
      >
        <CharacterSheetDialogHeader headingId={confirmationTitleId}>
          確認
        </CharacterSheetDialogHeader>
        <CharacterSheetDialogContent>
          <p id={confirmationDescriptionId}>
            この操作は確認用です。キャラクターシートの内容は変更されません。
          </p>
        </CharacterSheetDialogContent>
        <CharacterSheetDialogActions>
          <button
            onClick={() => setIsConfirmationOpen(false)}
            ref={cancelButtonRef}
            type="button"
          >
            キャンセル
          </button>
          <button
            data-tone="primary"
            onClick={() => setIsConfirmationOpen(false)}
            type="button"
          >
            OK
          </button>
        </CharacterSheetDialogActions>
      </CharacterSheetDialog>
    </>
  );
}
