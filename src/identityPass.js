// src/identityPass.js
// PXP-102: Privacyx Identity Pass (SDK surface, WIP)
//
// This module defines the public JS API for interacting with a future
// IdentityPass smart contract implementing the PXP-102 standard.
//
// At this stage, all methods throw a clear "not implemented" error,
// but the signatures are stable so integrators can already depend on them.

import { PrivacyXError } from "./utils/errors.js";
import { ensureProvider } from "./utils/providers.js";

function notImplemented(method) {
  throw new PrivacyXError(
    `IdentityPass.${method}() is not implemented yet (PXP-102 WIP)`
  );
}

/**
 * IdentityPass (PXP-102) — Zero-knowledge identity-based access.
 *
 * Expected on-chain interface (IPxp102IdentityPass):
 *
 *  event IdentityPassUsed(
 *    address indexed caller,
 *    bytes32 indexed nullifier,
 *    bytes32 indexed issuer,
 *    uint256 root
 *  );
 *
 *  function getCurrentRoot(bytes32 issuer) external view returns (uint256);
 *  function isNullifierUsed(bytes32 nullifierHash) external view returns (bool);
 *
 *  function proveIdentity(
 *    uint256[2] calldata _pA,
 *    uint256[2][2] calldata _pB,
 *    uint256[2] calldata _pC,
 *    uint256[3] calldata _pubSignals
 *  ) external;
 */
export class IdentityPass {
  /**
   * @param {Object} config
   * @param {import("ethers").Provider | import("ethers").BrowserProvider | string} config.provider
   * @param {number} config.chainId
   * @param {string} config.address - IdentityPass contract address (PXP-102)
   */
  constructor(config = {}) {
    const { provider, chainId, address } = config;

    if (!chainId) {
      throw new PrivacyXError(
        "Missing chainId in IdentityPass() config (PXP-102)"
      );
    }
    if (!address) {
      throw new PrivacyXError(
        "Missing IdentityPass contract address in IdentityPass() config (PXP-102)"
      );
    }

    this.chainId = chainId;
    this.provider = ensureProvider(provider);
    this.address = address;

    // NOTE: We intentionally do NOT instantiate an ethers.Contract yet.
    // Once the PXP-102 reference contract is deployed, this class
    // will be wired to it similarly to BalancePass.
  }

  /**
   * Returns the currently accepted root for a given issuer.
   * Mirrors IPxp102IdentityPass.getCurrentRoot(bytes32 issuer).
   *
   * @param {string} issuerHex - 0x-prefixed bytes32 issuer identifier
   * @returns {Promise<bigint>}
   */
  async getCurrentRoot(issuerHex) {
    notImplemented("getCurrentRoot");
  }

  /**
   * Returns true if a given nullifierHash has already been used.
   * Mirrors IPxp102IdentityPass.isNullifierUsed(bytes32 nullifierHash).
   *
   * @param {string} nullifierHashHex - 0x-prefixed bytes32 hash
   * @returns {Promise<boolean>}
   */
  async isNullifierUsed(nullifierHashHex) {
    notImplemented("isNullifierUsed");
  }

  /**
   * Submits a zero-knowledge identity proof to the IdentityPass contract.
   * Conceptually mirrors IPxp102IdentityPass.proveIdentity(...).
   *
   * @param {import("ethers").Signer} signer - Ethers signer (EOA or connected wallet)
   * @param {Object} proof - Groth16 proof object
   * @param {Array<string | bigint>} pubSignals - [root, issuerHash, nullifierHash]
   * @returns {Promise<import("ethers").TransactionReceipt>}
   */
  async submitProof(signer, proof, pubSignals) {
    notImplemented("submitProof");
  }

  /**
   * Subscribe to IdentityPassUsed events.
   *
   * Expected event shape (once implemented):
   * {
   *   caller: string,        // address
   *   nullifier: string,     // 0x...
   *   issuer: string,        // 0x...
   *   root: bigint,          // commitment root
   *   txHash?: string,
   *   blockNumber?: number
   * }
   *
   * @param {(event: any) => void} callback
   * @returns {() => void} unsubscribe function
   */
  onIdentityPassUsed(callback) {
    notImplemented("onIdentityPassUsed");
  }
}

