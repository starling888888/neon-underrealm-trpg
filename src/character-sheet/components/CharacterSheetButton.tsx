import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";

import styles from "./CharacterSheetButton.module.css";

export type CharacterSheetButtonColor =
  | "muted"
  | "danger"
  | "warning"
  | "default";
export type CharacterSheetButtonSize = "small" | "medium";
export type CharacterSheetButtonVariant = "outline" | "solid";

export type CharacterSheetButtonProps = ComponentPropsWithoutRef<"button"> & {
  color?: CharacterSheetButtonColor;
  size?: CharacterSheetButtonSize;
  variant?: CharacterSheetButtonVariant;
};

/** Shared text-button styling for the character sheet's regular actions. */
const CharacterSheetButton = forwardRef<
  ComponentRef<"button">,
  CharacterSheetButtonProps
>(function CharacterSheetButton(
  {
    className,
    color = "default",
    size = "small",
    type = "button",
    variant = "outline",
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      className={[
        styles.button,
        styles[color],
        styles[variant],
        styles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-character-sheet-button-color={color}
      data-character-sheet-button-size={size}
      data-character-sheet-button-variant={variant}
      ref={ref}
      type={type}
    />
  );
});

export default CharacterSheetButton;
