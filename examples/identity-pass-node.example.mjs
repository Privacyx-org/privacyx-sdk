import { JsonRpcProvider, Wallet } from "ethers";
import { IdentityPass } from "privacyx-sdk";
import proof from "./identity_proof.example.json" assert { type: "json" };
import pubSignalsJson from "./identity_public.example.json" assert { type: "json" };

async function main() {
  // 1) Provider & signer (backend-style)
  const rpcUrl = process.env.RPC_URL ?? "https://mainnet.infura.io/v3/YOUR_KEY";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY env var for demo");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);

  // 2) IdentityPass SDK instance
  const contractAddress =
    process.env.IDENTITY_PASS_ADDRESS ?? "0x0000000000000000000000000000000000000000";

  const idPass = new IdentityPass({
    chainId: 1, // Ethereum mainnet in this example
    provider,
    address: contractAddress,
  });

  // 3) Convert public signals (strings) -> bigint[]
  const pubSignals = pubSignalsJson.map((v) => BigInt(v));

  console.log("Loaded dummy proof:", proof);
  console.log("Loaded dummy public signals:", pubSignals);

  // 4) Submit proof (will currently throw: 'not implemented yet (PXP-102 WIP)')
  try {
    const receipt = await idPass.submitProof(signer, proof, pubSignals);
    console.log("IdentityPass tx receipt:", receipt);
  } catch (err) {
    console.error(
      "IdentityPass.submitProof is not implemented yet (PXP-102 WIP). This example is for IO/API reference only."
    );
    console.error("Error:", err?.message ?? err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
