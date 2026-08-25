import type { RemoteCharacterPersistenceDialogProps } from "../../hooks/useRemoteCharacterPersistence";
import CharacterSheetCharacterListDialog from "./CharacterSheetCharacterListDialog";
import CharacterSheetCopySaveDialog from "./CharacterSheetCopySaveDialog";
import CharacterSheetDeleteDialog from "./CharacterSheetDeleteDialog";
import CharacterSheetSaveDialog from "./CharacterSheetSaveDialog";

/** Renders the remote persistence dialog set from one feature-level contract. */
export default function CharacterSheetRemotePersistenceDialogs({
  characterList,
  copySave,
  delete: deleteProps,
  save,
}: RemoteCharacterPersistenceDialogProps) {
  return (
    <>
      <CharacterSheetCharacterListDialog {...characterList} />
      {save.isOpen ? <CharacterSheetSaveDialog {...save} /> : null}
      {copySave.isOpen ? <CharacterSheetCopySaveDialog {...copySave} /> : null}
      {deleteProps.isOpen ? (
        <CharacterSheetDeleteDialog {...deleteProps} />
      ) : null}
    </>
  );
}
