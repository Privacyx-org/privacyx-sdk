// src/balancePass.js
import { Contract } from "ethers";
import { PrivacyXError } from "./utils/errors.js";

const ABI = [
  "function currentRoot() view returns (uint256)",
  "function requiredThreshold() view returns (uint256)",
  "function nullifiers(bytes32) view returns (bool)",
  "event AccessGranted(address indexed caller, bytes32 nullifier, uint256 root)",
  "function proveAndConsume(uint256[2], uint256[2][2], uint256[2], uint256[2])",
];

export class BalancePass {
  constructor({ provider, chainId, address }) {
    if (!provider) throw new PrivacyXError("Provider missing for BalancePass");
    if (!address) throw new PrivacyXError("Missing BalancePass contract address");

    this.provider = provider;
    this.chainId = chainId;
    this.address = address;
    this.contract = new Contract(address, ABI, provider);
  }

  // --- READ-ONLY METHODS ---

  async getRoot() {
    try {
      return await this.contract.currentRoot();
    } catch (err) {
      throw new PrivacyXError("Failed to read currentRoot()", err);
    }
  }

  async getThreshold() {
    try {
      return await this.contract.requiredThreshold();
    } catch (err) {
      throw new PrivacyXError("Failed to read requiredThreshold()", err);
    }
  }

  async hasNullifierBeenUsed(nullifierHash) {
    try {
      return await this.contract.nullifiers(nullifierHash);
    } catch (err) {
      throw new PrivacyXError("Failed to check nullifierHash()", err);
    }
  }

  // --- EVENT LISTENERS ---

  onAccessGranted(callback) {
    this.contract.on("AccessGranted", (caller, nullifier, root, event) => {
      callback({ caller, nullifier, root, event });
    });
  }

  removeAllListeners() {
    this.contract.removeAllListeners("AccessGranted");
  }

  // --- WRITE METHODS ---

  async submitProof(signer, proof, pubSignals) {
    if (!signer) {
      throw new PrivacyXError("submitProof() requires an ethers signer");
    }

    const { a, b, c } = proof;

    if (!Array.isArray(pubSignals) || pubSignals.length !== 2) {
      throw new PrivacyXError("pubSignals must be exactly: [root, nullifierHash]");
    }

    try {
      const contract = this.contract.connect(signer);
      const tx = await contract.proveAndConsume(a, b, c, pubSignals);
      return await tx.wait();
    } catch (err) {
      if (String(err).includes("Nullifier already used")) {
        throw new PrivacyXError("This ZK pass has already been used", err);
      }
      throw new PrivacyXError("ZK proof transaction failed", err);
    }
  }
}
