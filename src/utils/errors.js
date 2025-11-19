// src/utils/errors.js
export class PrivacyXError extends Error {
  constructor(message, inner = null) {
    super(message);
    this.name = "PrivacyXError";

    if (inner) {
      this.inner = inner;
    }
  }
}

