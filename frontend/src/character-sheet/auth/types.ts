import type { CredentialResponse } from "@react-oauth/google";

export type GoogleAuthenticationStatus =
  | "signed-out"
  | "signing-in"
  | "signed-in"
  | "error";

export type GoogleAuthentication = {
  onCredential: (credentialResponse: CredentialResponse) => void;
  onLoginError: () => void;
  onLoginStarted: () => void;
  onLogout: () => void;
  status: GoogleAuthenticationStatus;
};
