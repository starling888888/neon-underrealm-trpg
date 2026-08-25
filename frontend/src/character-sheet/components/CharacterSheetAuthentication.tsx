import { memo } from "react";
import { characterSheetDictionary } from "../dictionary";
import type { Authentication } from "../auth/types";
import CharacterSheetButton from "./_common/CharacterSheetButton";
import styles from "./CharacterSheetActionPane.module.css";

function CharacterSheetAuthentication({
  authentication,
}: {
  authentication: Authentication;
}) {
  const { authentication: copy } = characterSheetDictionary.characterSheet;
  const isAuthenticated = authentication.sessionKey !== null;

  return (
    <section aria-label={copy.regionLabel} className={styles.authentication}>
      {authentication.status === "error" ? (
        <p className={styles.authenticationError} role="alert">
          {copy.error}
        </p>
      ) : null}
      {!isAuthenticated ? (
        <CharacterSheetButton
          disabled={
            authentication.status === "initializing" ||
            authentication.status === "signing-in"
          }
          onClick={() => void authentication.onLogin()}
          size="medium"
        >
          {authentication.status === "initializing"
            ? copy.initializing
            : authentication.status === "signing-in"
              ? copy.signingIn
              : copy.login}
        </CharacterSheetButton>
      ) : (
        <CharacterSheetButton onClick={authentication.onLogout} size="medium">
          {copy.logout}
        </CharacterSheetButton>
      )}
    </section>
  );
}

export default memo(CharacterSheetAuthentication);
