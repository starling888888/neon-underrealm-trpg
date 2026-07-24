import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
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
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });
  const presenterProps = useCharacterSheetFormPresenterProps(form);

  return <CharacterSheetFormPresenter {...presenterProps} />;
}
