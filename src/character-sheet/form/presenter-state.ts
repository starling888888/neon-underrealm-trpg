import type { CharacterImageRecord } from "../schemas/character-image";

export type CharacterImagePresenterState = {
  characterImage: CharacterImageRecord | null;
  isRootOperationInProgress: boolean;
  onCharacterImageCleared: () => Promise<void>;
  onCharacterImageSelected: (file: File) => Promise<void>;
  onCharacterImageOperationStarted: (trigger: HTMLButtonElement) => void;
};
