// src/utils/providers.js
import { BrowserProvider, JsonRpcProvider } from "ethers";
import { PrivacyXError } from "./errors.js";

// Auto-detect provider or fallback
export function ensureProvider(input) {
  if (input && typeof input === "object") {
    return input; // Already a provider
  }

  if (typeof window !== "undefined" && window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }

  // Fallback RPC if provided
  if (typeof input === "string") {
    return new JsonRpcProvider(input);
  }

  throw new PrivacyXError("No Ethereum provider found");
}

