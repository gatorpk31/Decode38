// ══════════════════════════════════════════════════════════════════
// Decode38 — Main Application Controller
// Manages state, navigation, validation, session persistence,
// trigger warnings, and results generation.
// ══════════════════════════════════════════════════════════════════
Decode38.App = {

  // ── Internal State ──────────────────────────────────────────────
  _state: {
    selectedConditions: [],
    answers: {},
    currentStep: 0,
    allSteps: [],
    triggerDismissed: {}
  },

  // Conditions requiring a trigger warning
  _sensitiveConditions: ['ptsd', 'mst', 'mental_health'],

  // ── Initialization ──────────────────────────────────────────────
  init: function() {
    var saved = Decode38.Storage.load();
    if (saved && saved.selectedConditions && saved.selectedConditions.length > 0) {
      this._showResumePrompt(saved);
    }
  },

  // ── Session Resume ──────────────────────────────────────────────
  _showResumePrompt: function(saved) {
    var overlay = document.getElementById('resumeOverlay');
    if (!overlay) return;
    var condCount = saved.selectedConditions.length;
    var stepInfo = (saved.currentStep + 1) + ' of ' + (saved.selectedConditions.length * 3 + 3);
    overlay.querySelector('.resume-info').textContent =
      condCount + ' condition' + (condCount > 1 ? 's' : '') + ' selected \u00B7 Step ' + stepInfo;
    overlay.classList.add('open');

    var self = this;
    document.getElementById('resumeYes').onclick = function() {
      overlay.classList.remove('open');
      self._state.selectedConditions = saved.selectedConditions;
      self._state.answers = saved.answers || {};
      self._state.allSteps = Decode38.Conditions.buildSteps(saved.selectedConditions);
      self._state.currentStep = Math.min(saved.currentStep, self._state.allSteps.length - 1);
      self._enterWizard();
      self._renderCurrentStep();
    };
    document.getElementById('resumeNo').onclick = function() {
      overlay.classList.remove('open');
      Decode38.Storage.clear();
    };
  },

  // ── Start App (from hero button) ────────────────────────────────
  startApp: function() {
    this._state.selectedConditions = [];
    this._state.answers = {};
    this._state.currentStep = 0;
    this._state.allSteps = [];
    this._state.triggerDismissed = {};
    this._showConditionSelector();
  },

  // ── Show Condition Selector ─────────────────────────────────────
  _showConditionSelector: function() {
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('landingArea').style.display = 'none';
    document.getElementById('progressWrap').classList.add('show');
    document.getElementById('formArea').style.display = 'block';

    var html = Decode38.UI.renderConditionSelector(this._state.selectedConditions);
    document.getElementById('formArea').innerHTML = html;
    Decode38.UI.updateProgressBar(0, 1, 'Select Conditions');
    Decode38.UI.focusElement('#step-heading');
    Decode38.UI.announce('Condition selection screen. Choose conditions to evaluate.');
  },

  // ── Begin Intake (after condition selection) ────────────────────
  beginIntake: function() {
    if (this._state.selectedConditions.length === 0) {
      Decode38.UI.announce('Please select at least one condition.');
      var grid = document.getElementById('condGrid');
      if (grid) {
        grid.style.outline = '2px solid var(--red-light)';
        setTimeout(function() { grid.style.outline = ''; }, 2000);
      }
      return;
    }
    this._state.allSteps = Decode38.Conditions.buildSteps(this._state.selectedConditions);
    this._state.currentStep = 0;
    this._enterWizard();
    this._renderCurrentStep();
  },

  // ── Enter Wizard Mode ───────────────────────────────────────────
  _enterWizard: function() {
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('landingArea').style.display = 'none';
    document.getElementById('progressWrap').classList.add('show');
    document.getElementById('formArea').style.display = 'block';
  },

  // ── Render Current Step ─────────────────────────────────────────
  _renderCurrentStep: function() {
    var step = this._state.allSteps[this._state.currentStep];
    if (!step) return;

    // Check for trigger warning on sensitive conditions
    if (step.conditionKey && this._sensitiveConditions.indexOf(step.conditionKey) > -1) {
      if (step._isFirstForCondition && !this._state.triggerDismissed[step.conditionKey]) {
        this._showTriggerWarning(step);
        return;
      }
    }

    var isFirst = this._state.currentStep === 0;
    var isLast = this._state.currentStep === this._state.allSteps.length - 1;
    var total = this._state.allSteps.length;
    var label = step.label || 'Progress';

    Decode38.UI.updateProgressBar(this._state.currentStep, total, label);

    var html = Decode38.UI.renderStep(step, this._state.currentStep, total, isFirst, isLast, this._state.answers);
    document.getElementById('formArea').innerHTML = html;

    window.scrollTo({ top: document.getElementById('formArea').offsetTop - 70, behavior: 'smooth' });
    Decode38.UI.focusElement('#step-heading');
    Decode38.UI.announce('Step ' + (this._state.currentStep + 1) + ' of ' + total + ': ' + step.title);

    // Auto-save
    this._autoSave();
  },

  // ── Trigger Warning ─────────────────────────────────────────────
  _showTriggerWarning: function(step) {
    var condLabel = step.conditionLabel || step.conditionKey;
    var html = Decode38.UI.renderTriggerWarning(condLabel);
    document.getElementById('formArea').innerHTML = html;
    Decode38.UI.announce('Content advisory for ' + condLabel + '. You may take a break at any time.');
  },

  dismissTriggerWarning: function() {
    var step = this._state.allSteps[this._state.currentStep];
    if (step && step.conditionKey) {
      this._state.triggerDismissed[step.conditionKey] = true;
    }
    this._renderCurrentStep();
  },

  // ── Save Text Fields ────────────────────────────────────────────
  _saveCurrentFields: function() {
    var step = this._state.allSteps[this._state.currentStep];
    if (!step) return;
    var answers = this._state.answers;
    step.fields.forEach(function(f) {
      if (f.type === 'text' || f.type === 'textarea') {
        var el = document.getElementById(f.id);
        if (el) {
          answers[f.id] = el.value.substring(0, Decode38.LIMITS.TEXT_MAX_LENGTH);
        }
      }
    });
  },

  // ── Navigation ──────────────────────────────────────────────────
  goNext: function() {
    this._saveCurrentFields();

    // Gentle validation: check if at least one required field has a value
    var step = this._state.allSteps[this._state.currentStep];
    var answers = this._state.answers;
    var hasRequired = step.fields.some(function(f) { return !f.optional; });
    if (hasRequired) {
      var hasAnswer = step.fields.some(function(f) {
        if (f.optional) return true;
        var val = answers[f.id];
        if (Array.isArray(val)) return val.length > 0;
        return val != null && val !== '';
      });
      if (!hasAnswer) {
        // Show gentle validation but still allow proceeding
        var firstField = step.fields.find(function(f) { return !f.optional; });
        if (firstField) {
          var valMsg = document.getElementById('val-' + firstField.id);
          if (valMsg) {
            valMsg.textContent = 'Answering helps improve your rating estimate, but you can skip if needed.';
            valMsg.classList.add('show');
            Decode38.UI.announce('Some questions are unanswered. You may continue or answer for a more accurate result.');
          }
        }
        // Allow proceeding after showing the message
      }
    }

    this._state.currentStep++;
    this._renderCurrentStep();
  },

  goBack: function() {
    this._saveCurrentFields();
    if (this._state.currentStep === 0) {
      this._showConditionSelector();
      return;
    }
    this._state.currentStep--;
    this._renderCurrentStep();
  },

  // ── Auto-save ───────────────────────────────────────────────────
  _autoSave: function() {
    Decode38.Storage.save({
      selectedConditions: this._state.selectedConditions,
      answers: this._state.answers,
      currentStep: this._state.currentStep
    });
    Decode38.UI.showToast('Progress saved');
  },

  // ── Generate Results ────────────────────────────────────────────
  runGenerate: function() {
    this._saveCurrentFields();
    var self = this;
    var a = this._state.answers;
    var sc = this._state.selectedConditions;

    // Hide form, show loading
    document.getElementById('formArea').style.display = 'none';
    document.getElementById('progressWrap').classList.remove('show');
    var ls = document.getElementById('loadingScreen');
    ls.classList.add('show');

    var setLS = function(n, state) {
      var el = document.getElementById('ls' + n);
      if (!el) return;
      el.className = 'ls ' + state;
      var ic = el.querySelector('.ls-ic');
      if (ic) ic.textContent = state === 'done' ? '\u2713' : state === 'active' ? '\u21BB' : '\u23F3';
    };

    // Step 1: Calculate ratings
    setLS(1, 'active');
    var ratings = Decode38.Ratings.calculateAllRatings(sc, a);
    var combined = Decode38.Ratings.calculateCombinedRating(ratings);
    setLS(1, 'done');

    // Step 2: Secondary conditions
    setLS(2, 'active');
    var secondary = Decode38.Results.getSecondaryConditions(sc, a);
    setLS(2, 'done');

    // Step 3: Translations
    setLS(3, 'active');
    var translations = Decode38.Results.getAllTranslations(sc, a);
    setLS(3, 'done');

    // Step 4: C&P tips
    setLS(4, 'active');
    var tips = Decode38.Results.getCPTips(sc, a);
    setLS(4, 'done');

    // Step 5: AI personal statement (async)
    setLS(5, 'active');
    Decode38.Statement.generate(a, sc, ratings).then(function(statement) {
      setLS(5, 'done');

      // Brief pause for visual feedback
      setTimeout(function() {
        ls.classList.remove('show');
        self._showResults(ratings, combined, secondary, translations, statement, tips);
      }, 300);
    }).catch(function() {
      setLS(5, 'done');
      setTimeout(function() {
        ls.classList.remove('show');
        self._showResults(ratings, combined, secondary, translations, null, tips);
      }, 300);
    });
  },

  // ── Show Results ────────────────────────────────────────────────
  _showResults: function(ratings, combined, secondary, translations, statement, tips) {
    var ra = document.getElementById('resultsArea');
    var a = this._state.answers;
    var html = Decode38.UI.renderResults(ratings, combined, secondary, translations, statement, tips, a);
    ra.innerHTML = html;
    ra.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Decode38.UI.announce('Your VA compensation summary is ready.');

    // Clear saved session since results are shown
    Decode38.Storage.clear();
  },

  // ── Restart App ─────────────────────────────────────────────────
  restartApp: function() {
    this._state.answers = {};
    this._state.currentStep = 0;
    this._state.allSteps = [];
    this._state.selectedConditions = [];
    this._state.triggerDismissed = {};

    document.getElementById('resultsArea').classList.remove('show');
    document.getElementById('resultsArea').innerHTML = '';
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('landingArea').style.display = 'block';
    document.getElementById('progressWrap').classList.remove('show');
    document.getElementById('formArea').style.display = 'none';
    document.getElementById('formArea').innerHTML = '';
    document.getElementById('loadingScreen').classList.remove('show');

    Decode38.Storage.clear();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ── Save API Key ────────────────────────────────────────────────
  saveApiKey: function() {
    var input = document.getElementById('apiKeyInput');
    var status = document.getElementById('apiStatus');
    if (!input || !status) return;

    var key = input.value.trim();
    if (!key) {
      status.textContent = 'Please enter an API key.';
      status.style.color = 'var(--red-light)';
      return;
    }

    if (Decode38.Statement.setApiKey(key)) {
      status.textContent = '\u2713 API key saved for this session. It will be used to generate your personal statement.';
      status.style.color = 'var(--green-light)';
      input.type = 'password';
    } else {
      status.textContent = 'Invalid API key format. Keys should start with sk-ant- and be under ' + Decode38.LIMITS.API_KEY_MAX_LENGTH + ' characters.';
      status.style.color = 'var(--red-light)';
    }
  }
};

// ── Legal Modal ─────────────────────────────────────────────────
Decode38.Legal = {
  open: function() {
    document.getElementById('legalModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  close: function() {
    document.getElementById('legalModal').classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') Decode38.Legal.close();
});

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  Decode38.App.init();
  if (Decode38.DonateFeedback) Decode38.DonateFeedback.init();
});
