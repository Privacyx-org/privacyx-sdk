# Privacyx SDK

The **Privacyx SDK** provides a clean, unified JavaScript/TypeScript interface  
to interact with the PrivacyX Standards Framework (PXP).

PrivacyX introduces a family of privacy-preserving access primitives using  
**zero-knowledge proofs, Merkle commitments, and nullifier-based anti-replay**.

Current modules:

- **PXP-101 — Balance Pass** (fully implemented & live)
- **PXP-102 — Identity Pass** (API surface ready, implementation WIP)
- **PXP-103 — Reputation Pass** (future module)

---

# 🚀 Live modules & documentation

### **PXP-101 dApp (demo / reference)**
https://pass.privacyx.tech

### **PXP-101 Standard Specification**
https://github.com/Privacyx-org/privacyx-balance-pass/blob/main/PXP-101.md

### **PXP-102 Standard Specification (Draft)**
https://github.com/Privacyx-org/privacyx-balance-pass/blob/main/PXP-102.md

---

# 📦 Installation

    npm install privacyx-sdk ethers

---

# 🧭 Usage (PXP-101: Balance Pass)

    import { PrivacyX } from "privacyx-sdk";
    import { BrowserProvider } from "ethers";
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const px = PrivacyX({
      chainId: 1,
      provider,
      balancePassAddress: "0x8333b589ad3A8A5fCe735631e8EDf693C6AE0472",
    });
    
    // Read Merkle root & threshold
    await px.balancePass.getRoot();
    await px.balancePass.getThreshold();
    
    // Submit Groth16 proof
    await px.balancePass.submitProof(signer, proof, [root, nullifierHash]);
    
    // Listen to AccessGranted events
    px.balancePass.onAccessGranted((ev) => {
      console.log("ZK Access:", ev);
    });

---

# 🔒 ZK Helpers — Groth16 IO parsing (preview)

The SDK exposes generic utilities to parse Groth16 proofs and public signals (snarkjs-compatible format). These helpers are shared across PXP-101 and the upcoming PXP-102 Identity Pass.

import { parseGroth16Proof, parsePubSignals } from "privacyx-sdk";

Proof parser:
const proof = parseGroth16Proof(proofJson);
// → {
//     pi_a: bigint[3],
//     pi_b: bigint[3][2],
//     pi_c: bigint[3]
//   }

Public signals parser:
const pubSignals = parsePubSignals(pubSignalsJson, expectedLength);
// → bigint[]

These utilities ensure:
- consistent BigInt conversion
- validated JSON shape
- predictable input format across passes

Example usage:
examples/identity-parse.example.mjs
   
---

# 📚 SDK Modules Overview

## ✅ PXP-101 — Balance Pass (implemented)

The Balance Pass allows users to prove they meet an off-chain balance threshold  
without revealing their address or exact holdings.

### Features:

- Read current Merkle root  
- Read required threshold  
- Check if a nullifier is used  
- Submit Groth16 proofs  
- Listen to AccessGranted events  

### Standard:
👉 https://github.com/Privacyx-org/privacyx-balance-pass/blob/main/PXP-101.md

---

## 🧩 PXP-102 — Identity Pass (API surface ready, implementation WIP)

The Identity Pass enables users to prove they possess a valid identity  
attestation from an Issuer (KYC provider, Proof-of-Personhood system, Web2 verifier, etc.)  
**without revealing any personal data or binding to a wallet address.**

This module is exported and its API is stable, but the implementation is not yet active.  
All methods currently throw a *not implemented* error.

### ➤ Import

    import { IdentityPass } from "privacyx-sdk";
    
    const idPass = new IdentityPass({
      chainId: 1,
      provider,
      address: "0xIdentityPassContractAddress",
    });

### ➤ API Preview (WIP)

    await idPass.getCurrentRoot(issuerHex);
    // → bigint
    
    await idPass.isNullifierUsed(nullifierHashHex);
    // → boolean
    
    await idPass.submitProof(signer, proof, [root, issuerHash, nullifierHash]);
    // → TransactionReceipt
    
    idPass.onIdentityPassUsed((event) => {
      console.log(event);
    });
    // → unsubscribe function

### ➤ Standard Specification (Draft)

👉 https://github.com/Privacyx-org/privacyx-balance-pass/blob/main/PXP-102.md

### ➤ Reference contracts

👉 https://github.com/Privacyx-org/privacyx-identity-pass

### Status

- SDK API surface: complete  
- Smart contract: upcoming  
- ZK circuit: upcoming  

---

## 🧩 PXP-103 — Reputation Pass (future module)

The Reputation Pass (PXP-103) will enable zero-knowledge proofs of:

- Stake-based reputation  
- Governance participation  
- Historical activity  
- Time-based eligibility  

**Without revealing the underlying history or wallet identity.**

Currently exported as a placeholder:

    import { ReputationPass } from "privacyx-sdk";
    
    const repPass = new ReputationPass({
      chainId: 1,
      provider,
      address: "0x...",
    });

---

# 🔖 Versioning

- **v0.1.X — Balance Pass (PXP-101 implemented)**  
- **v0.2.X — Identity Pass (PXP-102 implementation)**  
- **v0.3.X — Reputation Pass (PXP-103)**  
- **v1.0.0 — Full PXP suite stabilized**

---

# 📄 License

MIT
