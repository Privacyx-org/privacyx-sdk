# PrivacyX SDK (v0.1.0)

The **PrivacyX SDK** provides a clean interface to interact with PrivacyX standards,  
starting with **PXP-101: Privacyx Balance Pass**.

🚀 Live module: https://pass.privacyx.tech  
📘 Standard: https://github.com/Privacyx-org/privacyx-balance-pass/blob/main/PXP-101.md

---

## Installation

    npm install privacyx-sdk ethers

---

## Usage

    import { PrivacyX } from "privacyx-sdk";
    import { BrowserProvider } from "ethers";

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const px = PrivacyX({
      chainId: 1,
      provider,
      balancePassAddress: "0x8333b589ad3A8A5fCe735631e8EDf693C6AE0472",
    });

    // Read values
    await px.balancePass.getRoot();
    await px.balancePass.getThreshold();

    // Submit proof
    await px.balancePass.submitProof(signer, proof, [root, nullifierHash]);

    // Listen to events
    px.balancePass.onAccessGranted((ev) => console.log("ZK Access:", ev));

---

## Modules

### **PXP-101: Balance Pass**
- Read Merkle root  
- Read required threshold  
- Check if a nullifier is used  
- Submit Groth16 proofs  
- Listen to `AccessGranted` events  

---

## Versioning

- **v0.1.0** — PXP-101 support  
- **v0.2.X** — IdentityPass (PXP-102)  
- **v0.3.X** — ReputationPass (PXP-103)  

---

## License

MIT

