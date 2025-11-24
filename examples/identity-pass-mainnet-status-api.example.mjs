import express from "express";
import { JsonRpcProvider, toBeHex } from "ethers";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { IdentityPass, parsePubSignals } from "privacyx-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createApp() {
  const rpcUrl = process.env.RPC_URL;
  const contractAddress = process.env.IDENTITY_PASS_ADDRESS;

  if (!rpcUrl) {
    throw new Error("Missing RPC_URL env var (mainnet RPC URL)");
  }
  if (!contractAddress) {
    throw new Error(
      "Missing IDENTITY_PASS_ADDRESS env var (mainnet IdentityPass address)"
    );
  }

  const provider = new JsonRpcProvider(rpcUrl);

  const idPass = new IdentityPass({
    chainId: 1,
    provider,
    address: contractAddress,
  });

  // Charger les public signals de démo
  const pubSignalsRaw = await readFile(
    resolve(__dirname, "identity_public.example.json"),
    "utf8"
  );
  const pubSignalsJson = JSON.parse(pubSignalsRaw);
  const pubSignals = parsePubSignals(pubSignalsJson, 3);
  const [rootField, issuerField, nullifierField] = pubSignals;

  const app = express();

  // 🌐 Page d'accueil simple de l'API
  app.get("/", (_req, res) => {
    res.json({
      name: "PrivacyX Identity Pass Status API",
      standard: "PXP-102",
      network: "mainnet",
      contractAddress,
      endpoints: [
        "/health",
        "/pxp-102/status/default",
        "/pxp-102/status?issuer=0x...&nullifier=0x..."
      ],
      docsHint:
        "Use this API to check issuer Merkle roots and nullifier usage for PXP-102 identities.",
    });
  });

  // Healthcheck simple
  app.get("/health", async (_req, res) => {
    try {
      const blockNumber = await provider.getBlockNumber();

      res.json({
        status: "ok",
        network: "mainnet",
        blockNumber,
        contractAddress,
      });
    } catch (err) {
      console.error("Error in /health:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  });

  // Endpoint simple: statut par défaut
  app.get("/pxp-102/status/default", async (_req, res) => {
    try {
      const issuerHex = toBeHex(issuerField, 32);
      const nullifierHex = toBeHex(nullifierField, 32);

      const currentRoot = await idPass.getCurrentRoot(issuerHex);
      const used = await idPass.isNullifierUsed(nullifierHex);

      res.json({
        network: "mainnet",
        contractAddress,
        issuerHex,
        nullifierHex,
        currentRoot: currentRoot.toString(),
        expectedRoot: rootField.toString(),
        rootMatches: currentRoot === rootField,
        nullifierUsed: used,
      });
    } catch (err) {
      console.error("Error in /pxp-102/status/default:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint générique: passer issuer/nullifier
  app.get("/pxp-102/status", async (req, res) => {
    try {
      const issuerHex = req.query.issuer;
      const nullifierHex = req.query.nullifier;

      if (!issuerHex || !nullifierHex) {
        return res.status(400).json({
          error: "Missing issuer or nullifier query params (hex bytes32)",
          example: "/pxp-102/status?issuer=0x...&nullifier=0x...",
        });
      }

      const currentRoot = await idPass.getCurrentRoot(issuerHex);
      const used = await idPass.isNullifierUsed(nullifierHex);

      res.json({
        network: "mainnet",
        contractAddress,
        issuerHex,
        nullifierHex,
        currentRoot: currentRoot.toString(),
        nullifierUsed: used,
      });
    } catch (err) {
      console.error("Error in /pxp-102/status:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}

createApp()
  .then((app) => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(
        `✅ PXP-102 status API listening on http://localhost:${port}`
      );
      console.log(`   • GET /`);
      console.log(`   • GET /health`);
      console.log(`   • GET /pxp-102/status/default`);
      console.log(`   • GET /pxp-102/status?issuer=0x...&nullifier=0x...`);
    });
  })
  .catch((err) => {
    console.error("Failed to start PXP-102 status API:", err);
    process.exit(1);
  });

