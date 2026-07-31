import { Eraser } from "lucide-react";
import type { ComponentProps } from "react";

import styles from "./CharacterSheetActionButton.module.css";
import type { CharacterSheetActionButtonColor } from "./DeleteButton";

type ClearButtonProps = Omit<
  ComponentProps<"button">,
  "aria-label" | "children" | "type"
> & {
  ariaLabel: string;
  color?: CharacterSheetActionButtonColor;
};

/** Shared icon-only action for clearing a row without removing it. */
export default function ClearButton({
  ariaLabel,
  className,
  color = "default",
  ...buttonProps
}: ClearButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={[styles.button, styles[color], styles.clear, className]
        .filter(Boolean)
        .join(" ")}
      data-character-sheet-action="clear"
      type="button"
      {...buttonProps}
    >
      <Eraser aria-hidden="true" size={14} />
    </button>
  );
}
