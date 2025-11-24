# Privacyx SDK — Examples

This folder contains small, self-contained examples showing how to use the
Privacyx SDK with the different PXP standards.

All examples are written as ESM modules (`.mjs`) and are meant to be run with Node.js 18+.

---

## 1) PXP-101 — Balance Pass (read-only example)

**File:** `node-read-root.mjs`

This script shows how to:

- Instantiate the PrivacyX SDK with a BalancePass contract
- Read the current Merkle root on-chain

### Run

```bash
node examples/node-read-root.mjs
You may want to edit the file to:

point to your own RPC URL,

change the balancePassAddress,

or switch chainId.

---

## 2) PXP-102 — Identity Pass (IO / API reference example)
Files:

identity-pass-node.example.mjs

identity_proof.example.json

identity_public.example.json

This example demonstrates how a backend or dApp will:

Instantiate the PXP-102 IdentityPass module from privacyx-sdk

Load a Groth16 identity proof from JSON

Load public signals [root, issuerHash, nullifierHash] from JSON

Convert them to bigint[] and call submitProof(...)

⚠️ Important:
As of now, IdentityPass.submitProof() is still marked as WIP and will
throw a PrivacyXError("... not implemented yet (PXP-102 WIP)").

The goal of this example is to lock the IO & API shape:

JSON format of proofs and public signals

TypeScript / JS signatures for the SDK

High-level integration pattern for future implementations

Environment variables
The script expects:

RPC_URL — JSON-RPC endpoint (e.g. an Infura / Alchemy URL)

PRIVATE_KEY — private key used as the signer

IDENTITY_PASS_ADDRESS — (optional) IdentityPass contract address
Defaults to 0x0000000000000000000000000000000000000000 as a placeholder.

Run
bash
Copier le code
export RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
export IDENTITY_PASS_ADDRESS="0xIdentityPassContractAddress"  # optional for now

node examples/identity-pass-node.example.mjs
You should see:

The dummy proof object logged

The dummy public signals logged as bigint[]

An error explaining that IdentityPass.submitProof is not yet implemented

This confirms the wiring without requiring a real circuit or live contract.

Notes
For a full PXP-102 implementation, see:

privacyx-identity-pass repo (contracts + tests + ZK IO format)

zk/identity_proof.example.json and zk/identity_public.example.json there

For PXP-101 details, see:

PXP-101.md in the privacyx-balance-pass repo

---

## 3) ZK IO helpers — Parsing Groth16 proof & pubSignals

**File:** `identity-parse.example.mjs`

This script shows how to:

- Load a Groth16 proof JSON (snarkjs-style)
- Load public signals `[root, issuerHash, nullifierHash]` from JSON
- Parse them into `BigInt` arrays using the internal helpers:

  - `parseGroth16Proof(proofJson)`
  - `parsePubSignals(pubSignalsJson, expectedLength)`

### Run

```bash
node examples/identity-parse.example.mjs

You should see:

- Parsed Groth16 proof: { ... BigInt ... }
- Parsed public signals (bigint[]): [ ... ]

---

## 4) PXP-102 — Identity Pass (local Hardhat demo)

**File:** `identity-pass-local-hardhat.example.mjs`

This script shows how to:

- Connect to a local Hardhat node (`npx hardhat node`)
- Use the PXP-102 `IdentityPass` SDK module
- Read the current root for a given issuer (`getCurrentRoot(...)`)
- Check nullifier status (`isNullifierUsed(...)`)
- Submit a dummy Groth16 proof against a locally deployed `IdentityPass`
- Observe the nullifier flip from `false` → `true` after `submitProof(...)`

### Setup

In the `privacyx-identity-pass` repo:

1. Start a local Hardhat node:

cd ~/privacyx-identity-pass  
npx hardhat node

2. In another terminal, deploy the mock verifier + IdentityPass and initialize the issuer/root compatible with `identity_public.example.json`:

cd ~/privacyx-identity-pass  
npx hardhat run scripts/deploy-local.js --network localhost

You will see the deployed IdentityPass address in the logs, e.g.:

IdentityPass deployed at: 0x...

### Run the SDK example

Back in the `privacyx-sdk` repo, configure env vars:

cd ~/privacyx-sdk

export RPC_URL="http://127.0.0.1:8545"  
export PRIVATE_KEY="0x<one of the Hardhat account private keys>"  
export IDENTITY_PASS_ADDRESS="0x<IdentityPass address from deploy-local.js logs>"

Then run:

node examples/identity-pass-local-hardhat.example.mjs

You should see:

Parsed dummy Groth16 proof and public signals  
Current root on-chain for the issuer  
Nullifier used BEFORE submitProof?: false  
A successful transaction receipt for proveIdentity  
Nullifier used AFTER submitProof?: true  

This confirms the end-to-end wiring between:

- PXP-102 reference contracts (`privacyx-identity-pass`)  
- Circom IO examples (`identity_proof.example.json` / `identity_public.example.json`)  
- And the IdentityPass SDK module in `privacyx-sdk`.

