// src/reputationPass.js
// PXP-103: Reputation Pass (placeholder / WIP)
// This is a forward-looking placeholder for future PrivacyX modules.
// Not implemented yet — all methods throw by design.

import { PrivacyXError } from "./utils/errors.js";

export class ReputationPass {
  constructor(config = {}) {
    this.chainId = config.chainId;
    this.provider = config.provider || null;
    this.address = config.address || null;
  }

  _notImplemented(method) {
    throw new PrivacyXError(
      `ReputationPass.${method}() is not implemented yet (PXP-103 WIP)`
    );
  }

  async getScoringModel() {
    this._notImplemented("getScoringModel");
  }

  async getUserScore(/* identifier */) {
    this._notImplemented("getUserScore");
  }

  async submitProof(/* signer, proof, pubSignals */) {
    this._notImplemented("submitProof");
  }
}

