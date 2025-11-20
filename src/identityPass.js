// src/identityPass.js
// PXP-102: Identity Pass (placeholder / WIP)
// This is a forward-looking placeholder for future PrivacyX modules.
// Not implemented yet — all methods throw by design.

import { PrivacyXError } from "./utils/errors.js";

export class IdentityPass {
  constructor(config = {}) {
    this.chainId = config.chainId;
    this.provider = config.provider || null;
    this.address = config.address || null;
  }

  _notImplemented(method) {
    throw new PrivacyXError(
      `IdentityPass.${method}() is not implemented yet (PXP-102 WIP)`
    );
  }

  async getSchema() {
    this._notImplemented("getSchema");
  }

  async getVerifier() {
    this._notImplemented("getVerifier");
  }

  async submitProof(/* signer, proof, pubSignals */) {
    this._notImplemented("submitProof");
  }
}

