import type { ApplicationErrorCode } from "@neon-underrealm/shared";

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;

  constructor(code: ApplicationErrorCode) {
    super(code);
    this.code = code;
  }
}
