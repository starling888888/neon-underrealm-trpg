export type AuthenticationStatus =
  | "initializing"
  | "signed-out"
  | "signing-in"
  | "signed-in"
  | "error";

export type Authentication = {
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  sessionKey: string | null;
  status: AuthenticationStatus;
};
