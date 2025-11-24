// src/identityPass.js
// PXP-102 — Identity Pass SDK module (read + submitProof wiring)

import { Contract, isHexString, zeroPadValue } from "ethers";
import { ensureProvider } from "./utils/providers.js";
import { PrivacyXError } from "./utils/errors.js";
import { parseGroth16Proof, parsePubSignals } from "./zk/parse.js";

/**
 * Minimal ABI for the PXP-102 IdentityPass contract.
 * Mirrors IPxp102IdentityPass + proveIdentity signature.
 */
const IDENTITY_PASS_ABI = [
  // Event
  "event IdentityPassUsed(address indexed caller, bytes32 indexed nullifier, bytes32 indexed issuer, uint256 root)",

  // Read methods
  "function getCurrentRoot(bytes32 issuer) view returns (uint256)",
  "function isNullifierUsed(bytes32 nullifierHash) view returns (bool)",

  // ZK proof entrypoint
  "function proveIdentity(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals)"
];

/**
 * PXP-102 IdentityPass SDK wrapper.
 *
 * Responsibilities:
 * - validate config (chainId, provider, address)
 * - expose read helpers: getCurrentRoot, isNullifierUsed
 * - expose submitProof(signer, proofJsonOrParsed, pubSignalsJsonOrParsed)
 * - expose event subscription: onIdentityPassUsed
 *
 * NOTE:
 * - This wiring assumes a contract implementing IPxp102IdentityPass.
 * - It does not depend on a specific deployment; you pass the address.
 */
export class IdentityPass {
  constructor(config = {}) {
    const { chainId, provider, address } = config;

    if (!chainId) {
      throw new PrivacyXError("IdentityPass: missing chainId in constructor config");
    }

    this.chainId = chainId;
    this.provider = ensureProvider(provider);
    this.address = address;

    if (!this.address) {
      // On laisse la possibilité d'instancier sans address,
      // mais toutes les méthodes qui touchent la chaîne vérifieront.
      console.warn(
        "[IdentityPass] No contract address provided. " +
          "Read/write methods will throw until you set a valid address."
      );
    }
  }

  // ---- Internal helpers ----------------------------------------------------

  _requireAddress() {
    if (!this.address) {
      throw new PrivacyXError("IdentityPass: contract address is not set");
    }
  }

  _getContract(signerOrProvider) {
    this._requireAddress();
    const p = signerOrProvider ?? this.provider;
    return new Contract(this.address, IDENTITY_PASS_ABI, p);
  }

  _toBytes32(label, value) {
    if (typeof value !== "string" || !isHexString(value)) {
      throw new PrivacyXError(
        `IdentityPass: invalid ${label} hex string (expected 0x-prefixed hex)`
      );
    }
    // Pad / normalize to bytes32
    return zeroPadValue(value, 32);
  }

  // ---- Read methods --------------------------------------------------------

  /**
   * Read the current Merkle root (or commitment) for a given issuer.
   *
   * @param {string} issuerHex - 0x-prefixed hex representing the issuer id (bytes32).
   * @returns {Promise<bigint>} root
   */
  async getCurrentRoot(issuerHex) {
    const issuerBytes32 = this._toBytes32("issuer", issuerHex);
    const contract = this._getContract(this.provider);
    const root = await contract.getCurrentRoot(issuerBytes32);
    // Ethers v6 already returns bigint for uint256, mais on normalise explicitement
    return BigInt(root);
  }

  /**
   * Check whether a given nullifier hash has already been consumed.
   *
   * @param {string} nullifierHex - 0x-prefixed hex representing the nullifier (bytes32).
   * @returns {Promise<boolean>}
   */
  async isNullifierUsed(nullifierHex) {
    const nullifierBytes32 = this._toBytes32("nullifier", nullifierHex);
    const contract = this._getContract(this.provider);
    const used = await contract.isNullifierUsed(nullifierBytes32);
    return Boolean(used);
  }

  // ---- ZK proof submission -------------------------------------------------

  /**
   * Submit a Groth16 identity proof to the IdentityPass contract.
   *
   * @param {Signer} signer - ethers.js Signer (BrowserProvider.getSigner(), Wallet, etc.)
   * @param {object} proofJsonOrParsed - Groth16 proof (snarkjs-style JSON or already parsed).
   * @param {Array<string|bigint>} pubSignalsJsonOrParsed - public signals
   *   [root, issuerHash, nullifierHash] as decimal strings or bigint.
   *
   * The method:
   * - parses the proof via parseGroth16Proof(...)
   * - parses the public signals via parsePubSignals(..., 3)
   * - maps them to the Solidity signature:
   *     proveIdentity(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals)
   * - waits for the transaction to be mined and returns the receipt.
   */
  async submitProof(signer, proofJsonOrParsed, pubSignalsJsonOrParsed) {
    if (!signer || typeof signer.getAddress !== "function") {
      throw new PrivacyXError(
        "IdentityPass.submitProof requires an ethers.js Signer instance as first argument"
      );
    }

    const contract = this._getContract(signer);

    // 1) Parse Groth16 proof (tolerant: accepts JSON with strings or pre-BigInt)
    const proof = parseGroth16Proof(proofJsonOrParsed);

    // 2) Parse public signals, enforcing length = 3
    const pubSignals = parsePubSignals(pubSignalsJsonOrParsed, 3);

    const [root, issuerHash, nullifierHash] = pubSignals;

    // 3) Map to Solidity-friendly proof format
    //
    // snarkjs Groth16 convention:
    //   proof.pi_a: [Ax, Ay, 1]
    //   proof.pi_b: [[Bx1, Bx2], [By1, By2], [1, 0]]
    //   proof.pi_c: [Cx, Cy, 1]
    //
    // Solidity verifier expects:
    //   a: [Ax, Ay]
    //   b: [[Bx2, Bx1], [By2, By1]]  (G2 reordering)
    //   c: [Cx, Cy]
    //
    const a = [proof.pi_a[0], proof.pi_a[1]];
    const b = [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]]
    ];
    const c = [proof.pi_c[0], proof.pi_c[1]];

    const inputs = [root, issuerHash, nullifierHash];

    // 4) Send transaction & wait for receipt
    const tx = await contract.proveIdentity(a, b, c, inputs);
    const receipt = await tx.wait();

    return receipt;
  }

  // ---- Events --------------------------------------------------------------

  /**
   * Subscribe to IdentityPassUsed events.
   *
   * @param {(event: { caller, nullifier, issuer, root, raw }) => void} callback
   * @returns {() => void} unsubscribe fn
   */
  onIdentityPassUsed(callback) {
    if (typeof callback !== "function") {
      throw new PrivacyXError("IdentityPass.onIdentityPassUsed requires a callback function");
    }

    const contract = this._getContract(this.provider);
    const filter = contract.filters.IdentityPassUsed();

    const handler = (caller, nullifier, issuer, root, event) => {
      callback({
        caller,
        nullifier,
        issuer,
        root,
        raw: event
      });
    };

    contract.on(filter, handler);

    // Return unsubscribe function
    return () => {
      contract.off(filter, handler);
    };
  }
}

