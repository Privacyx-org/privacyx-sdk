// src/zk/parse.js
// Generic loader for PXP Groth16 proofs & public signals
// Works for both PXP-101 and PXP-102 formats.

import { PrivacyXError } from "../utils/errors.js";

/**
 * Load a Groth16 proof JSON (as produced by snarkjs).
 */
export function parseGroth16Proof(proofJson) {
  if (
    !proofJson ||
    !proofJson.pi_a ||
    !proofJson.pi_b ||
    !proofJson.pi_c
  ) {
    throw new PrivacyXError("Invalid Groth16 proof format");
  }

  return {
    pi_a: proofJson.pi_a.map((x) => BigInt(x)),
    pi_b: proofJson.pi_b.map((row) => row.map((x) => BigInt(x))),
    pi_c: proofJson.pi_c.map((x) => BigInt(x)),
  };
}

/**
 * Load public signals (array of decimal strings → bigint).
 */
export function parsePubSignals(pubSignalsJson, expectedLength) {
  if (!Array.isArray(pubSignalsJson)) {
    throw new PrivacyXError("Public signals must be an array");
  }
  if (expectedLength && pubSignalsJson.length !== expectedLength) {
    throw new PrivacyXError(
      `Expected ${expectedLength} public signals, got ${pubSignalsJson.length}`
    );
  }

  return pubSignalsJson.map((v) => BigInt(v));
}

