import { googleLogout, type CredentialResponse } from "@react-oauth/google";
import { useCallback, useMemo, useState } from "react";
import type { GoogleAuthentication, GoogleAuthenticationStatus } from "./types";

/**
 * Keeps the GIS ID token only in React memory.
 *
 * The token is intentionally not persisted. A fresh page mount requests a new
 * credential through the single Action Pane GoogleLogin instance when the
 * browser's Google session permits it.
 */
export default function useGoogleAuthentication(): GoogleAuthentication {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [status, setStatus] =
    useState<GoogleAuthenticationStatus>("signed-out");

  const onCredential = useCallback(({ credential }: CredentialResponse) => {
    if (credential === undefined || credential === "") {
      setIdToken(null);
      setStatus("error");
      return;
    }
    setIdToken(credential);
    setStatus("signed-in");
  }, []);
  const onLoginError = useCallback(() => {
    setIdToken(null);
    setStatus("error");
  }, []);
  const onLoginStarted = useCallback(() => {
    setStatus("signing-in");
  }, []);
  const onLogout = useCallback(() => {
    googleLogout();
    setIdToken(null);
    setStatus("signed-out");
  }, []);

  return useMemo(
    () => ({
      idToken,
      onCredential,
      onLoginError,
      onLoginStarted,
      onLogout,
      status,
    }),
    [idToken, onCredential, onLoginError, onLoginStarted, onLogout, status],
  );
}
