import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { JsonRpcProvider, Wallet, toBeHex } from "ethers";
import {
  IdentityPass,
  parseGroth16Proof,
  parsePubSignals,
} from "privacyx-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // 1) Provider & signer vers le node Hardhat local
  const rpcUrl = process.env.RPC_URL ?? "http://127.0.0.1:8545";
  const privateKey = process.env.PRIVATE_KEY; // copie d'une private key Hardhat

  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY env var for demo (use a Hardhat account key)");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);

  // 2) Adresse du contrat IdentityPass déployé en local
  const contractAddress = process.env.IDENTITY_PASS_ADDRESS;
  if (!contractAddress) {
    throw new Error("Missing IDENTITY_PASS_ADDRESS env var (local IdentityPass address)");
  }

  const idPass = new IdentityPass({
    chainId: 31337, // chainId par défaut de Hardhat local
    provider,
    address: contractAddress,
  });

  // 3) Charger les JSON dummy
  const proofRaw = await readFile(
    resolve(__dirname, "identity_proof.example.json"),
    "utf8"
  );
  const pubSignalsRaw = await readFile(
    resolve(__dirname, "identity_public.example.json"),
    "utf8"
  );

  const proofJson = JSON.parse(proofRaw);
  const pubSignalsJson = JSON.parse(pubSignalsRaw);

  // 4) Parser via helpers du SDK
  const proof = parseGroth16Proof(proofJson);
  const pubSignals = parsePubSignals(pubSignalsJson, 3);

  console.log("Parsed dummy proof:", proof);
  console.log("Parsed dummy public signals:", pubSignals);

  const [rootField, issuerField, nullifierField] = pubSignals;

  // On reconstruit les hex bytes32 comme le contrat les attend
  const issuerHex = toBeHex(issuerField, 32);
  const nullifierHex = toBeHex(nullifierField, 32);

  // 5) Read path: getCurrentRoot + isNullifierUsed avant submitProof
  const currentRoot = await idPass.getCurrentRoot(issuerHex);
  console.log("Current root on-chain for issuerHex:", issuerHex, "=>", currentRoot.toString());

  const usedBefore = await idPass.isNullifierUsed(nullifierHex);
  console.log("Nullifier used BEFORE submitProof?:", usedBefore);

  // 6) Write path: appel submitProof vers le contrat local
  try {
    const receipt = await idPass.submitProof(signer, proofJson, pubSignalsJson);
    console.log("IdentityPass local tx receipt:", receipt);

    const usedAfter = await idPass.isNullifierUsed(nullifierHex);
    console.log("Nullifier used AFTER submitProof?:", usedAfter);
  } catch (err) {
    console.error("IdentityPass.submitProof failed on local hardhat node.");
    console.error("Error:", err?.message ?? err);
  }
}

main().catch((err) => {
  console.error("identity-pass-local-hardhat.example.mjs failed:", err);
  process.exit(1);
});

