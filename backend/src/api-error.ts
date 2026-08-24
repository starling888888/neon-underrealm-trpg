import type { ApiErrorCode } from "@neon-underrealm/shared";

type ApiErrorStatus = 400 | 401 | 403 | 404 | 413 | 419 | 500;

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: ApiErrorStatus;

  constructor(status: ApiErrorStatus, code: ApiErrorCode) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
