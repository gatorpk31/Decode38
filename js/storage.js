// ══════════════════════════════════════════════════════════════════
// Decode38 — Session Storage (localStorage persistence)
// ══════════════════════════════════════════════════════════════════
Decode38.Storage = {
  STORAGE_KEY: 'decode38_session',

  save: function(state) {
    try {
      var data = {
        version: Decode38.VERSION,
        timestamp: Date.now(),
        selectedConditions: state.selectedConditions,
        answers: state.answers,
        currentStep: state.currentStep
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage full or unavailable — fail silently
    }
  },

  load: function() {
    try {
      var raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (ageHours > Decode38.LIMITS.SESSION_EXPIRY_HOURS) {
        this.clear();
        return null;
      }
      if (data.version !== Decode38.VERSION) {
        this.clear();
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },

  clear: function() {
    try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) { /* ignore */ }
  }
};
