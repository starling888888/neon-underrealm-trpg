import { GoogleLogin } from "@react-oauth/google";
import { memo } from "react";
import { characterSheetDictionary } from "../dictionary";
import type { GoogleAuthentication } from "../auth/types";
import CharacterSheetButton from "./_common/CharacterSheetButton";
import styles from "./CharacterSheetActionPane.module.css";

function CharacterSheetGoogleAuthentication({
  authentication,
}: {
  authentication: GoogleAuthentication;
}) {
  const { authentication: copy } = characterSheetDictionary.characterSheet;

  return (
    <section aria-label={copy.regionLabel} className={styles.authentication}>
      {authentication.status === "error" ? (
        <p className={styles.authenticationError} role="alert">
          {copy.error}
        </p>
      ) : null}
      <div hidden={authentication.status === "signed-in"}>
        <GoogleLogin
          auto_select
          containerProps={{
            className: styles.googleLogin,
            style: { width: "100%" },
          }}
          onError={authentication.onLoginError}
          onSuccess={authentication.onCredential}
          text="signin_with"
          theme="outline"
          type="standard"
          useOneTap
          click_listener={authentication.onLoginStarted}
        />
      </div>
      {authentication.status === "signed-in" ? (
        <CharacterSheetButton onClick={authentication.onLogout} size="medium">
          {copy.logout}
        </CharacterSheetButton>
      ) : null}
    </section>
  );
}

export default memo(CharacterSheetGoogleAuthentication);
