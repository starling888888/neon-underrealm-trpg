import { Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

import styles from "./CharacterSheetActionButton.module.css";

export type CharacterSheetActionButtonColor = "default" | "warning";

type DeleteButtonProps = Omit<
  ComponentProps<"button">,
  "aria-label" | "children" | "type"
> & {
  ariaLabel: string;
  color?: CharacterSheetActionButtonColor;
};

/** Shared icon-only action for removing a row or category. */
export default function DeleteButton({
  ariaLabel,
  className,
  color = "default",
  ...buttonProps
}: DeleteButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={[styles.button, styles[color], styles.delete, className]
        .filter(Boolean)
        .join(" ")}
      data-character-sheet-action="delete"
      type="button"
      {...buttonProps}
    >
      <Trash2 aria-hidden="true" size={14} />
    </button>
  );
}
