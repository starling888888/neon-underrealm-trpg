import styles from "./CharacterSheetLoadingOverlay.module.css";

type CharacterSheetLoadingOverlayProps = {
  isOpen: boolean;
  label: string;
};

/** Blocks the island while a root-level browser operation is in progress. */
export default function CharacterSheetLoadingOverlay({
  isOpen,
  label,
}: CharacterSheetLoadingOverlayProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-label={label}
      className={styles.overlay}
      role="status"
    >
      <span aria-hidden="true" className={styles.indicator} />
      <span>{label}</span>
    </div>
  );
}
