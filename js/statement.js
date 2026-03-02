// ══════════════════════════════════════════════════════════════════
// Decode38 — AI Personal Statement Generation (via Anthropic API)
// Uses Claude Sonnet for cost-effective statement generation.
// The API key is scoped to this module and never stored in localStorage.
// ══════════════════════════════════════════════════════════════════
Decode38.Statement = {
  _apiKey: null,

  setApiKey: function(key) {
    if (!key || key.length > Decode38.LIMITS.API_KEY_MAX_LENGTH) return false;
    if (!/^sk-ant-/.test(key)) return false;
    this._apiKey = key;
    return true;
  },

  hasApiKey: function() {
    return !!this._apiKey;
  },

  clearApiKey: function() {
    this._apiKey = null;
  },

  // Whitelist of answer fields allowed in the AI prompt per condition
  _allowedKeys: {
    _common: ['branch', 'service_status', 'service_start', 'service_end', 'mos', 'deployments', 'discharge_type', 'prior_va_rating'],
    ptsd: ['ptsd_stressor_type', 'ptsd_stressor_desc', 'ptsd_inservice_tx', 'ptsd_onset', 'ptsd_diagnosis', 'ptsd_employment', 'ptsd_panic', 'ptsd_sleep', 'ptsd_nightmares', 'ptsd_flashbacks', 'ptsd_avoidance', 'ptsd_numbing', 'ptsd_irritability', 'ptsd_relationships', 'ptsd_memory', 'ptsd_startle', 'ptsd_suicidal', 'ptsd_meds'],
    back: ['back_region', 'back_diagnosis', 'back_cause', 'back_motion', 'back_pain_freq', 'back_radiculopathy', 'back_work', 'back_flareup'],
    knee: ['knee_which', 'knee_diagnosis', 'knee_condition', 'knee_flexion', 'knee_instability', 'knee_pain', 'knee_cause'],
    tinnitus: ['tinnitus_present', 'tinnitus_noise_exposure', 'tinnitus_diagnosis', 'hearing_loss', 'tinnitus_impact', 'hearing_aids'],
    sleep_apnea: ['sa_diagnosis', 'sa_type', 'sa_cpap', 'sa_symptoms', 'sa_nexus'],
    migraines: ['mig_diagnosis', 'mig_type', 'mig_prostrating', 'mig_duration', 'mig_triggers', 'mig_work', 'mig_cause'],
    tbi: ['tbi_event', 'tbi_diagnosis', 'tbi_severity', 'tbi_cognitive', 'tbi_physical', 'tbi_work'],
    hypertension: ['htn_diagnosis', 'htn_bp', 'htn_meds', 'htn_nexus', 'htn_cardiac'],
    shoulder: ['shoulder_which', 'shoulder_diagnosis', 'shoulder_condition', 'shoulder_abduction', 'shoulder_cause'],
    skin: ['skin_type', 'skin_diagnosis', 'skin_pact', 'skin_body_area', 'skin_treatment'],
    respiratory: ['resp_type', 'resp_diagnosis', 'resp_pact', 'resp_severity', 'resp_work'],
    feet: ['feet_type', 'feet_diagnosis', 'feet_severity', 'feet_both', 'feet_cause'],
    hip: ['hip_which', 'hip_condition', 'hip_flexion', 'hip_cause', 'hip_work'],
    elbow_wrist_hand: ['ewh_which', 'ewh_condition', 'ewh_grip', 'ewh_motion', 'ewh_cause'],
    neck: ['neck_condition', 'neck_diagnosis', 'neck_flexion', 'neck_radiculopathy', 'neck_cause', 'neck_work'],
    mental_health: ['mh_diagnosis', 'mh_employment', 'mh_daily', 'mh_social', 'mh_frequency', 'mh_suicidal', 'mh_meds', 'mh_nexus'],
    mst: ['mst_occurred', 'mst_reported', 'mst_conditions', 'mst_treatment', 'mst_evidence'],
    diabetes: ['dm_type', 'dm_treatment', 'dm_regulation', 'dm_complications', 'dm_exposure'],
    heart: ['heart_condition', 'heart_mets', 'heart_ef', 'heart_nexus', 'heart_work'],
    gerd_gi: ['gi_condition', 'gi_frequency', 'gi_severity', 'gi_weight', 'gi_nexus', 'gi_work'],
    gulfwar: ['gw_service', 'gw_symptoms', 'gw_duration', 'gw_exclusions', 'gw_exposure'],
    cancer: ['cancer_type', 'cancer_status', 'cancer_exposure', 'cancer_residuals', 'cancer_work'],
    genitourinary: ['gu_condition', 'gu_severity', 'gu_ed', 'gu_nexus'],
    eye: ['eye_condition', 'eye_which', 'eye_acuity', 'eye_cause'],
    cold_injury: ['cold_type', 'cold_location', 'cold_residuals', 'cold_severity', 'cold_service_link'],
    radiculopathy: ['rad_location', 'rad_severity', 'rad_symptoms', 'rad_diagnosis', 'rad_nexus']
  },

  _buildSafeAnswers: function(a, conditions) {
    var safe = {};
    var maxLen = Decode38.LIMITS.TEXT_MAX_LENGTH;
    var keys = this._allowedKeys._common.slice();

    for (var i = 0; i < conditions.length; i++) {
      var condKeys = this._allowedKeys[conditions[i]];
      if (condKeys) {
        for (var j = 0; j < condKeys.length; j++) {
          if (keys.indexOf(condKeys[j]) === -1) keys.push(condKeys[j]);
        }
      }
    }

    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (a[key] != null) {
        var val = a[key];
        if (Array.isArray(val)) {
          safe[key] = val.map(function(v) { return String(v).substring(0, maxLen); });
        } else {
          safe[key] = String(val).substring(0, maxLen);
        }
      }
    }
    return safe;
  },

  generate: function(a, conditions, ratings) {
    if (!Decode38.Features.isAvailable('AI_STATEMENT')) {
      return Promise.reject(new Error('Feature not available'));
    }
    if (!this._apiKey) return Promise.resolve(null);

    var safeAnswers = this._buildSafeAnswers(a, conditions);
    var conditionList = conditions.map(function(c) {
      var r = ratings[c];
      return r ? r.name + ' (estimated ' + r.rating + '%)' : c;
    }).join(', ');

    var prompt = 'You are an expert VA claims writer with 20+ years of experience. Write a formal VA personal statement for a veteran\'s compensation claim. This statement will be submitted as lay evidence supporting service connection and compensation level under 38 CFR Part 4.\n\n' +
      'The framing should treat the veteran as someone who earned compensation through service \u2014 not as someone with limitations. Use "service-connected condition" rather than "disability." Use "compensation" rather than "disability compensation" where possible. The language should be dignified, factual, and regulatory.\n\n' +
      'VETERAN PROFILE:\n' +
      '- Branch: ' + (safeAnswers.branch || 'Not specified') + '\n' +
      '- Service period: ' + (safeAnswers.service_start || 'Unknown') + ' to ' + (safeAnswers.service_end || 'Unknown') + '\n' +
      '- Service status: ' + (safeAnswers.service_status || 'Veteran') + '\n' +
      '- MOS/AFSC: ' + (safeAnswers.mos || 'Not specified') + '\n' +
      '- Deployments: ' + (safeAnswers.deployments || 'Not specified') + '\n' +
      '- Conditions being claimed: ' + conditionList + '\n\n' +
      'KEY SYMPTOMS AND IMPACT:\n' +
      JSON.stringify(safeAnswers, null, 2) + '\n\n' +
      'REQUIREMENTS FOR THIS STATEMENT:\n' +
      '1. Open by identifying the veteran\'s service and the conditions being claimed\n' +
      '2. For each condition, describe symptoms using 38 CFR \u00A7 4.130 / diagnostic code terminology\n' +
      '3. Describe functional impact on employment and daily activities\n' +
      '4. Reference how symptoms connect to in-service events or exposures\n' +
      '5. Use first-person voice, formal but readable language\n' +
      '6. Do NOT exaggerate \u2014 only reflect what was reported\n' +
      '7. End with a statement on continuous symptoms since service\n' +
      '8. For Guard/Reserve: acknowledge the period of federal activation if relevant\n' +
      '9. Length: 4-5 paragraphs\n\n' +
      'Output ONLY the personal statement. No preamble, no commentary, no labels.';

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this._apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    }).then(function(response) {
      if (!response.ok) {
        return response.text().then(function(text) {
          throw new Error('API error (' + response.status + '): ' + text.substring(0, 200));
        });
      }
      return response.json();
    }).then(function(data) {
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      }
      throw new Error('Unexpected API response format');
    }).catch(function(err) {
      console.error('Decode38 Statement generation failed:', err.message);
      return null;
    });
  }
};
