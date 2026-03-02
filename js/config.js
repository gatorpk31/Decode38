// ══════════════════════════════════════════════════════════════════
// Decode38 — Configuration & Feature Flags
// ══════════════════════════════════════════════════════════════════
window.Decode38 = window.Decode38 || {};

Decode38.VERSION = '1.0.0';

// Feature flag system — paywall infrastructure
// When PAYWALL_ENABLED is false, isAvailable() always returns true (all free)
Decode38.Features = {
  PAYWALL_ENABLED: false,

  AI_STATEMENT:        { tier: 'free', enabled: true },
  PRINT_REPORT:        { tier: 'free', enabled: true },
  NEXUS_TEMPLATE:      { tier: 'free', enabled: true },
  TRANSLATIONS:        { tier: 'free', enabled: true },
  SECONDARY_CONDITIONS:{ tier: 'free', enabled: true },
  CP_TIPS:             { tier: 'free', enabled: true },

  isAvailable: function(featureKey) {
    if (!this.PAYWALL_ENABLED) return true;
    var feature = this[featureKey];
    return feature && feature.enabled;
  }
};

// Input constraints
Decode38.LIMITS = {
  TEXT_MAX_LENGTH: 500,
  API_KEY_MAX_LENGTH: 200,
  MAX_CONDITIONS: 26,
  SESSION_EXPIRY_HOURS: 72
};
