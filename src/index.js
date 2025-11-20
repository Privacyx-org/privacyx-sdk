// src/index.js
import { BalancePass } from "./balancePass.js";
import { ensureProvider } from "./utils/providers.js";
import { PrivacyXError } from "./utils/errors.js";

// Future modules (placeholders)
import { IdentityPass } from "./identityPass.js";
import { ReputationPass } from "./reputationPass.js";

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

    // Reserved for future use (PXP-102 / PXP-103):
    // You can instantiate them manually if needed:
    //   new IdentityPass({ chainId, provider, address: ... })
    //   new ReputationPass({ chainId, provider, address: ... })
  };
}

// Default export for convenience
export default PrivacyX;

// Named exports for advanced usage and future modules
export { BalancePass } from "./balancePass.js";
export { IdentityPass } from "./identityPass.js";
export { ReputationPass } from "./reputationPass.js";
export { PrivacyXError } from "./utils/errors.js";

