import { characterSheetDictionary } from "../dictionary";
import styles from "./CharacterSheetLoadingOverlay.module.css";

type CharacterSheetLoadingOverlayProps = {
  isOpen: boolean;
};

/** Blocks the island while a root-level browser operation is in progress. */
export default function CharacterSheetLoadingOverlay({
  isOpen,
}: CharacterSheetLoadingOverlayProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-label={characterSheetDictionary.characterSheet.image.loading}
      className={styles.overlay}
      role="status"
    >
      <span aria-hidden="true" className={styles.indicator} />
      <span>{characterSheetDictionary.characterSheet.image.loading}</span>
    </div>
  );
}
