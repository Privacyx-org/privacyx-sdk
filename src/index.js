// src/index.js
import { BalancePass } from "./balancePass.js";
import { ensureProvider } from "./utils/providers.js";
import { PrivacyXError } from "./utils/errors.js";

export function PrivacyX(config = {}) {
  if (!config.chainId) {
    throw new PrivacyXError("Missing chainId in PrivacyX() config");
  }

  const provider = ensureProvider(config.provider);

  return {
    chainId: config.chainId,
    provider,

    // ---- MODULES ----
    balancePass: new BalancePass({
      provider,
      chainId: config.chainId,
      address: config.balancePassAddress,
    }),
  };
}

export default PrivacyX;

