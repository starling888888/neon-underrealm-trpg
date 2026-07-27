import type { CharacterImageRecord } from "../character-image";

export type CharacterImagePresenterState = {
  characterImage: CharacterImageRecord | null;
  isRootOperationInProgress: boolean;
  onCharacterImageCleared: () => Promise<void>;
  onCharacterImageSelected: (file: File) => Promise<void>;
  onCharacterImageOperationStarted: (trigger: HTMLButtonElement) => void;
};
