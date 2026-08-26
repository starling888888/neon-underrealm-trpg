import { useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";

const headingId = "character-sheet-fatal-error-heading";
const descriptionId = "character-sheet-fatal-error-description";

/** Blocks further editing after an error whose recovery path is a full reload. */
export default function CharacterSheetFatalErrorDialog() {
  const reloadButtonRef = useRef<HTMLButtonElement>(null);
  const { fatalError } = characterSheetDictionary.characterSheet;

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabelledBy={headingId}
      initialFocusRef={reloadButtonRef}
      isOpen
      onRequestClose={() => {}}
    >
      <CharacterSheetDialogHeader headingId={headingId}>
        {fatalError.heading}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{fatalError.description}</p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          onClick={() => window.location.reload()}
          ref={reloadButtonRef}
          size="medium"
          variant="solid"
        >
          {fatalError.reload}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
