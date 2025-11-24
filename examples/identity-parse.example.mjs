import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parseGroth16Proof, parsePubSignals } from "../src/zk/parse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // 1) Charger les JSON bruts
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

  // 2) Parser via les helpers SDK
  const proof = parseGroth16Proof(proofJson);
  const pubSignals = parsePubSignals(pubSignalsJson, 3);

  console.log("Parsed Groth16 proof:", proof);
  console.log("Parsed public signals (bigint[]):", pubSignals);
}

main().catch((err) => {
  console.error("identity-parse.example.mjs failed:", err);
  process.exit(1);
});

