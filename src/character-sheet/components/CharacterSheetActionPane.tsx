import { Menu, X } from "lucide-react";
import type { RefObject } from "react";

import { characterSheetDictionary } from "../dictionary";
import styles from "./CharacterSheetActionPane.module.css";
import CharacterSheetButton from "./CharacterSheetButton";

type CharacterSheetActionPaneProps = {
  isMenuOpen: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
  onMenuToggle: () => void;
};

const menuId = "character-sheet-actions-menu";

/**
 * Presents mock character-sheet actions without coupling them to future
 * export, import, clipboard, reset, help, or error-aggregation behaviour.
 */
export default function CharacterSheetActionPane({
  isMenuOpen,
  menuTriggerRef,
  onMenuToggle,
}: CharacterSheetActionPaneProps) {
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <section aria-label={actions.regionLabel} className={styles.root}>
      <div className={styles.desktopHeader}>
        <h1 className={styles.heading}>{actions.title}</h1>
        <div className={styles.desktopActions}>
          <CharacterSheetButton size="medium">
            {actions.help}
          </CharacterSheetButton>
          <CharacterSheetButton size="medium">
            {actions.export}
          </CharacterSheetButton>
          <CharacterSheetButton size="medium">
            {actions.import}
          </CharacterSheetButton>
          <CharacterSheetButton size="medium">
            {actions.ccfoliaCopy}
          </CharacterSheetButton>
          <CharacterSheetButton color="danger" size="medium">
            {actions.reset}
          </CharacterSheetButton>
          <DesktopErrorStatus />
        </div>
      </div>

      <div
        className={styles.floatingActions}
        data-character-sheet-action-controls
      >
        <button
          aria-label={actions.help}
          className={styles.iconButton}
          type="button"
        >
          <span aria-hidden="true" className={styles.helpMark}>
            ?
          </span>
        </button>
        <button
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? actions.closeMenu : actions.openMenu}
          className={styles.iconButton}
          onClick={onMenuToggle}
          ref={menuTriggerRef}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" size={18} strokeWidth={2.25} />
          ) : (
            <Menu aria-hidden="true" size={18} strokeWidth={2.25} />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <section
          aria-label={actions.menuLabel}
          className={styles.menu}
          id={menuId}
        >
          <div className={styles.menuActions}>
            <CharacterSheetButton
              className={styles.menuActionButton}
              size="medium"
            >
              {actions.export}
            </CharacterSheetButton>
            <CharacterSheetButton
              className={styles.menuActionButton}
              size="medium"
            >
              {actions.import}
            </CharacterSheetButton>
            <CharacterSheetButton
              className={styles.menuActionButton}
              size="medium"
            >
              {actions.ccfoliaCopy}
            </CharacterSheetButton>
            <CharacterSheetButton
              className={styles.menuActionButton}
              color="danger"
              size="medium"
            >
              {actions.reset}
            </CharacterSheetButton>
          </div>
          <ErrorSummary className={styles.errors} />
        </section>
      ) : null}
    </section>
  );
}

function ErrorSummary({ className }: { className: string }) {
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <section aria-live="polite" className={className}>
      <h2>{actions.errorsHeading}</h2>
      <p>{actions.noErrors}</p>
    </section>
  );
}

function DesktopErrorStatus() {
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <div
      aria-label={actions.errorStatusLabel}
      aria-live="polite"
      className={styles.desktopErrorStatus}
      role="status"
    >
      <p>{actions.noErrors}</p>
      <CharacterSheetButton size="small">
        {actions.reviewErrors}
      </CharacterSheetButton>
    </div>
  );
}
