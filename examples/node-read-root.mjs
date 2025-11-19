// examples/node-read-root.mjs
// Simple example: read PXP-101 root & threshold via the SDK directly from this repo.

import PrivacyX from "../src/index.js"; // local import for repo dev
import { JsonRpcProvider } from "ethers";

async function main() {
  const rpcUrl = process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/XXX";

  const provider = new JsonRpcProvider(rpcUrl);

  const px = PrivacyX({
    chainId: 1,
    provider,
    balancePassAddress: "0x8333b589ad3a8a5fce735631e8edf693c6ae0472",
  });

  const root = await px.balancePass.getRoot();
  const threshold = await px.balancePass.getThreshold();

  console.log("PXP-101 root:", root.toString());
  console.log("PXP-101 threshold:", threshold.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

