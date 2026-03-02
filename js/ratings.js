// ══════════════════════════════════════════════════════════════════
// Decode38 — Rating Engine
// All 26 condition rate functions + combined VA math
// ══════════════════════════════════════════════════════════════════
window.Decode38 = window.Decode38 || {};

Decode38.Ratings = (function() {
  'use strict';

  // ────────────────────────────────────────────────────────────────
  // snapRating — snap a raw score to the nearest valid VA percentage
  // ────────────────────────────────────────────────────────────────
  function snapRating(score, valid) {
    if (!valid) valid = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    return valid.reduce(function(p, c) {
      return Math.abs(c - score) < Math.abs(p - score) ? c : p;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 1. PTSD (DC 9411)
  // ────────────────────────────────────────────────────────────────
  function ratePTSD(a) {
    var score = 0;
    var flags = [];

    if (a.ptsd_suicidal === 'Yes — I have had these thoughts') { score = Math.max(score, 70); flags.push('suicidal'); }
    if (a.ptsd_panic === 'Daily or near-daily') { score = Math.max(score, 70); flags.push('panic_daily'); }
    else if (a.ptsd_panic === 'More than once a week') { score = Math.max(score, 50); flags.push('panic_weekly'); }

    if (a.ptsd_employment === 'Unable to work at all due to PTSD') { score = Math.max(score, 70); flags.push('unemployable'); }
    if (a.ptsd_employment === 'Significant work impairment — missed work, performance issues, job loss') score = Math.max(score, 50);

    if (a.ptsd_sleep === 'Severely disrupted — rarely get more than 2-3 hours at a time') score = Math.max(score, 50);
    else if (a.ptsd_sleep === 'Poor — frequently interrupted, difficulty falling or staying asleep') score = Math.max(score, 30);

    if (a.ptsd_nightmares === 'Almost every night' || a.ptsd_nightmares === 'Several nights per week') score = Math.max(score, 50);
    else if (a.ptsd_nightmares === 'Weekly') score = Math.max(score, 30);

    if (a.ptsd_numbing === 'Most of the time — persistent numbness') score = Math.max(score, 50);

    if (a.ptsd_relationships === 'Severe — major relationship damage, isolation, inability to maintain relationships') score = Math.max(score, 70);
    else if (a.ptsd_relationships === 'Significant — family/friends notice major personality changes') score = Math.max(score, 50);

    if (a.ptsd_avoidance === 'Severe — significantly limits where I go, who I see, what I do') score = Math.max(score, 50);

    if (a.ptsd_memory === 'Significant — affects daily functioning, miss appointments, forget conversations') score = Math.max(score, 50);
    else if (a.ptsd_memory === 'Moderate — noticeable issues but compensating') score = Math.max(score, 30);

    if (a.ptsd_irritability === 'Frequent and significant — affects relationships and daily life') score = Math.max(score, 50);

    if (a.ptsd_meds && !a.ptsd_meds.includes('No')) score = Math.max(score, 10);
    if (a.ptsd_diagnosis && a.ptsd_diagnosis.includes('diagnosis')) score = Math.max(score, 10);

    var tdiuFlag = flags.indexOf('unemployable') !== -1 || (score >= 70);

    return {
      rating: snapRating(score, [0, 10, 30, 50, 70, 100]),
      score: score,
      flags: flags,
      tdiuFlag: tdiuFlag,
      dc: '9411',
      name: 'PTSD / Mental Health',
      bridge: score >= 30 && score <= 65,
      ratingDescriptions: {
        0:   'Diagnosis confirmed; symptoms not severe enough to cause occupational or social impairment, or well-controlled by medication.',
        10:  'Mild or transient symptoms; only decrease work efficiency during periods of significant stress; generally controlled by medication.',
        30:  'Occasional decrease in work efficiency; intermittent inability to perform occupational tasks; generally functioning satisfactorily.',
        50:  'Reduced reliability and productivity; more frequent/severe symptoms; significant occupational and social impairment.',
        70:  'Deficiencies in most areas — work, family, judgment, thinking, or mood. Near-continuous symptoms. Serious impairment.',
        100: 'Total occupational and social impairment. Persistent delusions, hallucinations, or persistent danger of self-harm.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 2. Back / Spine (DC 5235)
  // BUG-7: Two ROM ranges both map to 40% — this is correct per
  //        38 CFR § 4.71a (forward flexion ≤30° = 40%).
  // ────────────────────────────────────────────────────────────────
  function rateBack(a) {
    var score = 0;

    if (a.back_motion === 'Cannot bend forward past 15-20 degrees (severe)') score = Math.max(score, 40);
    // BUG-7 clarification: ≤30° also rates 40% per 38 CFR § 4.71a General Rating Formula
    else if (a.back_motion === 'Limited to about 30 degrees of forward flexion') score = Math.max(score, 40);
    else if (a.back_motion === 'Limited to about 45-60 degrees') score = Math.max(score, 20);
    else if (a.back_motion === 'Moderate limitation — noticeable restriction') score = Math.max(score, 10);
    else if (a.back_motion === 'Mild limitation — slight stiffness') score = Math.max(score, 10);

    if (a.back_radiculopathy === 'Yes — both legs/arms affected (bilateral)') score = Math.max(score, 40);
    else if (a.back_radiculopathy === 'Yes — one leg or one arm affected') score = Math.max(score, 20);

    if (a.back_work === 'Cannot perform any physical work') score = Math.max(score, 40);
    if (a.back_flareup === 'Yes — frequent severe flare-ups (weekly)') score = Math.max(score, 30);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 50, 60, 100]),
      score: score,
      flags: [],
      tdiuFlag: score >= 40,
      dc: '5235',
      name: 'Back / Spine',
      bridge: false,
      ratingDescriptions: {
        0:   'No limitation; no symptoms documented.',
        10:  'Mild symptoms; minor range of motion limitation or muscle spasm.',
        20:  'Moderate limitation of motion or characteristic pain on motion.',
        30:  'Range of motion limited to 30\u00B0; or frequent incapacitating episodes.',
        40:  'Range of motion limited to 20\u00B0; or chronic symptoms with functional loss.',
        50:  'Severe — range of motion limited to 15\u00B0 or less; with muscle spasm.',
        60:  'Severely limited motion with ankylosis in disadvantageous position.',
        100: 'Unfavorable ankylosis of entire spine.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 3. Knee (DC 5257)
  // ────────────────────────────────────────────────────────────────
  function rateKnee(a) {
    var score = 0;

    if (a.knee_instability === 'Severe — buckles with walking, cannot rely on it for weight bearing') score = Math.max(score, 30);
    else if (a.knee_instability === 'Moderate — occasional buckle under moderate activity') score = Math.max(score, 20);
    else if (a.knee_instability === 'Mild — only gives out under heavy exertion') score = Math.max(score, 10);

    if (a.knee_flexion === 'Less than 30 degrees — severe limitation') score = Math.max(score, 30);
    else if (a.knee_flexion === 'About 30-60 degrees') score = Math.max(score, 20);
    else if (a.knee_flexion === 'About 60-90 degrees') score = Math.max(score, 10);

    var bilateral = a.knee_which === 'Both knees';
    if (bilateral) score = Math.min(score + 10, 60);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 60]),
      score: score,
      flags: bilateral ? ['bilateral'] : [],
      tdiuFlag: false,
      dc: '5257',
      name: 'Knee Condition',
      bridge: false,
      ratingDescriptions: {
        0:  'No current disability from knee condition.',
        10: 'Slight recurrent subluxation or lateral instability; mild limitation of motion.',
        20: 'Moderate recurrent subluxation or lateral instability; moderate limitation of flexion.',
        30: 'Severe recurrent subluxation or lateral instability with frequent incapacitating episodes.',
        40: 'Severe limitation of extension in addition to instability.',
        60: 'Ankylosis of knee in unfavorable position.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 4. Tinnitus (DC 6260)
  // ────────────────────────────────────────────────────────────────
  function rateTinnitus(a) {
    var hasTinnitus = a.tinnitus_present && !a.tinnitus_present.includes('No');
    var rating = hasTinnitus ? 10 : 0;
    var hearingScore = 0;

    if (a.hearing_loss === 'Yes — significant bilateral hearing loss (both ears)') hearingScore = 30;
    else if (a.hearing_loss === 'Yes — significant unilateral hearing loss (one ear)') hearingScore = 10;
    else if (a.hearing_loss === 'Yes — mild bilateral hearing loss') hearingScore = 10;

    return {
      rating: rating,
      score: rating,
      flags: [],
      tdiuFlag: false,
      dc: '6260',
      name: 'Tinnitus',
      hearingRating: hearingScore,
      note: 'Tinnitus is rated at 10% for recurrent tinnitus. Hearing loss is rated separately based on audiometric testing.',
      ratingDescriptions: {
        0:  'No tinnitus documented or non-compensable.',
        10: 'Recurrent tinnitus — head or ear noise, subjective. Maximum single rating is 10%.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 5. Sleep Apnea (DC 6847)
  // ────────────────────────────────────────────────────────────────
  function rateSleepApnea(a) {
    var score = 0;

    if (a.sa_cpap === 'Yes — prescribed and using CPAP/BiPAP/APAP' ||
        a.sa_cpap === 'Yes — prescribed but not compliant (important for rating)' ||
        a.sa_cpap === 'Yes — prescribed but not tolerated') {
      score = 50;
    } else if (a.sa_symptoms && a.sa_symptoms.includes('Excessive daytime sleepiness (EDS)')) {
      score = 30;
    } else if (a.sa_diagnosis && a.sa_diagnosis.includes('Formally diagnosed')) {
      score = 30;
    }

    return {
      rating: snapRating(score, [0, 30, 50, 100]),
      score: score,
      flags: [],
      tdiuFlag: false,
      dc: '6847',
      name: 'Sleep Apnea',
      ratingDescriptions: {
        0:   'Asymptomatic with documented sleep disorder breathing.',
        30:  'Persistent daytime hypersomnolence (excessive daytime sleepiness).',
        50:  'Requires use of breathing assistance device (CPAP/BiPAP).',
        100: 'Chronic respiratory failure with carbon dioxide retention, cor pulmonale, or requires tracheostomy.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 6. Migraines (DC 8100)
  // ────────────────────────────────────────────────────────────────
  function rateMigraines(a) {
    var score = 0;

    if (a.mig_prostrating === 'More than once a week (very frequent)') score = 50;
    else if (a.mig_prostrating === 'About once a week') score = 30;
    else if (a.mig_prostrating === '1-4 times per month') score = 30;
    else if (a.mig_prostrating === 'Less than once a month') score = 10;
    else if (a.mig_prostrating === 'I have chronic headaches but rarely fully prostrating attacks') score = 10;

    return {
      rating: snapRating(score, [0, 10, 30, 50]),
      score: score,
      flags: [],
      tdiuFlag: false,
      dc: '8100',
      name: 'Migraines / Headaches',
      ratingDescriptions: {
        0:  'Infrequent headaches; no prostrating attacks.',
        10: 'Less frequent attacks — characteristic prostrating attacks averaging once a month over last several months.',
        30: 'Prostrating attacks occurring on average once a month over last several months.',
        50: 'Very frequent completely prostrating and prolonged attacks productive of severe economic inadaptability.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 7. TBI (DC 8045)
  // ────────────────────────────────────────────────────────────────
  function rateTBI(a) {
    var score = 0;
    var cogCount = Array.isArray(a.tbi_cognitive) ? a.tbi_cognitive.length : 0;
    // var physCount = Array.isArray(a.tbi_physical) ? a.tbi_physical.length : 0;

    // Severity baseline
    if (a.tbi_severity && a.tbi_severity.includes('Mild')) score = Math.max(score, 10);
    else if (a.tbi_severity && a.tbi_severity.includes('Moderate')) score = Math.max(score, 40);
    else if (a.tbi_severity && a.tbi_severity.includes('Severe')) score = Math.max(score, 70);

    // Work/functional impact
    if (a.tbi_work === 'Total — cannot maintain employment or independent living') score = Math.max(score, 100);
    else if (a.tbi_work === 'Severe — significant limitations in most areas') score = Math.max(score, 70);
    else if (a.tbi_work === 'Moderate — noticeable impairment but partially functional') score = Math.max(score, 40);
    else if (a.tbi_work === 'Mild — some difficulty with complex tasks') score = Math.max(score, 10);

    // Cognitive domain count
    if (cogCount >= 4) score = Math.max(score, 70);
    else if (cogCount >= 2) score = Math.max(score, 40);

    return {
      rating: snapRating(score, [0, 10, 40, 70, 100]),
      score: score,
      flags: [],
      tdiuFlag: score >= 70,
      dc: '8045',
      name: 'TBI',
      note: 'TBI ratings are based on residual effects across 10 cognitive and physical domains, each rated separately.',
      ratingDescriptions: {
        0:   'No residuals or residuals evaluated under other diagnostic codes.',
        10:  'Mild residuals — mild cognitive impairment or emotional/behavioral dysfunction.',
        40:  'Moderate residuals — moderate cognitive impairment, memory problems, behavioral issues.',
        70:  'Moderately severe — marked impairment in multiple domains, requiring supervision.',
        100: 'Severe residuals — total impairment, persistent vegetative state, or marked disorientation.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 8. Hypertension (DC 7101)
  // BUG-3 FIX: normalize htn_nexus to array at the top
  // ────────────────────────────────────────────────────────────────
  function rateHypertension(a) {
    var score = 0;

    // BUG-3 FIX: normalize htn_nexus to array regardless of input shape
    var nexus = Array.isArray(a.htn_nexus) ? a.htn_nexus : (a.htn_nexus ? [a.htn_nexus] : []);

    if (a.htn_bp === 'Diastolic predominantly 130 or higher (severe)') score = 60;
    else if (a.htn_bp === 'Diastolic predominantly 120-129') score = 40;
    else if (a.htn_bp === 'Diastolic predominantly 110-119') score = 20;
    else if (a.htn_bp === 'Diastolic predominantly 100-109') score = 10;
    else if (a.htn_bp === 'Diastolic predominantly 90-99') score = 10;

    if (a.htn_meds && a.htn_meds.includes('multiple')) score = Math.max(score, 20);
    if (a.htn_cardiac === 'Yes — echocardiogram showing cardiac enlargement') score = Math.max(score, 60);

    // Secondary nexus flag (using normalized array)
    var hasNexus = nexus.length > 0 && !nexus.every(function(n) { return n.includes('no other'); });
    var flags = hasNexus ? ['secondary'] : [];

    return {
      rating: snapRating(score, [0, 10, 20, 40, 60]),
      score: score,
      flags: flags,
      tdiuFlag: false,
      dc: '7101',
      name: 'Hypertension',
      ratingDescriptions: {
        0:  'Hypertension managed by diet — no medication required.',
        10: 'Diastolic 90-99, or systolic 160-199.',
        20: 'Diastolic 100-109, or systolic 200+, or requiring continuous medication.',
        40: 'Diastolic 110-119.',
        60: 'Diastolic 120+, or with history of diastolic pressure 130+.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 9. Shoulder (DC 5201)
  // ────────────────────────────────────────────────────────────────
  function rateShoulder(a) {
    var score = 0;

    if (a.shoulder_abduction === 'Less than 25 degrees — severely limited') score = 40;
    else if (a.shoulder_abduction === 'About 25-60 degrees') score = 30;
    else if (a.shoulder_abduction === 'About 60-90 degrees') score = 20;
    else if (a.shoulder_abduction === 'About 90-120 degrees') score = 10;

    var dominant = a.shoulder_which && (a.shoulder_which.includes('dominant arm') || a.shoulder_which.includes('Right'));
    if (dominant && score > 0) score += 10;

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 50, 60]),
      score: score,
      flags: dominant ? ['dominant'] : [],
      tdiuFlag: false,
      dc: '5201',
      name: 'Shoulder',
      ratingDescriptions: {
        0:  'No limitation of motion.',
        10: 'Motion limited to 90\u00B0 or more (non-dominant), or limited to 60\u00B0 or more (dominant).',
        20: 'Arm limited to 60-90\u00B0 (non-dominant) or 45-60\u00B0 (dominant).',
        30: 'Arm limited to 45\u00B0 from the side (non-dominant) or arm limited to 45\u00B0 (dominant).',
        40: 'Arm limited to 25\u00B0 from the side.',
        50: 'Ankylosis in favorable position.',
        60: 'Ankylosis in unfavorable position.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 10. Skin (DC 7806)
  // ────────────────────────────────────────────────────────────────
  function rateSkin(a) {
    var score = 0;

    if (a.skin_body_area === 'More than 40% (most of body surface)') score = 60;
    else if (a.skin_body_area === '20-40% (large area, multiple body regions)') score = 30;
    else if (a.skin_body_area === '5-20% (moderate area)') score = 10;
    else if (a.skin_body_area === 'Less than 5% (small patches)' || a.skin_body_area === 'Localized scar or single lesion') score = 10;

    if (a.skin_treatment === 'Systemic therapy (oral medications, biologics, immunosuppressants)') score = Math.max(score, 30);
    else if (a.skin_treatment === 'Systemic therapy (6+ weeks/year)') score = Math.max(score, 30);

    var pactFlag = !!(a.skin_pact && a.skin_pact.includes('Yes'));

    return {
      rating: snapRating(score, [0, 10, 30, 60]),
      score: score,
      flags: pactFlag ? ['pact'] : [],
      tdiuFlag: false,
      pactFlag: pactFlag,
      dc: '7806',
      name: 'Skin Condition',
      ratingDescriptions: {
        0:  'No active symptoms; in remission.',
        10: 'Less than 5% of the entire body or less than 5% of exposed areas, and no more than topical therapy required.',
        30: '5\u201320% of the entire body or 5\u201320% of exposed areas, or requiring intermittent systemic therapy.',
        60: '20\u201340% of the entire body or 20\u201340% of exposed areas, or systemic therapy required for 6 weeks or more per year.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 11. Respiratory (DC 6602)
  // BUG-2 FIX: use a.resp_pact instead of a.resp_exposure;
  //            removed a.resp_fev1 references (no corresponding field)
  // ────────────────────────────────────────────────────────────────
  function rateRespiratory(a) {
    var score = 0;

    // Primary: severity-based rating
    if (a.resp_severity === 'Severely limiting — cannot perform strenuous activity, frequent hospitalizations') score = 100;
    else if (a.resp_severity === 'Moderately severe — requires daily medication, limits exertion') score = 30;
    else if (a.resp_severity === 'Moderate — managed with regular medication, some limitations') score = 30;
    else if (a.resp_severity === 'Mild — intermittent symptoms, controlled with PRN medication') score = 10;

    // BUG-2 FIX: use a.resp_pact exclusively (resp_exposure had no corresponding form field)
    var pactFlag = !!(a.resp_pact && a.resp_pact.includes('Yes'));

    return {
      rating: snapRating(score, [0, 10, 30, 60, 100]),
      score: score,
      flags: pactFlag ? ['pact'] : [],
      tdiuFlag: false,
      pactFlag: pactFlag,
      dc: '6602',
      name: 'Respiratory',
      ratingDescriptions: {
        0:   'No functional impairment.',
        10:  'FEV-1 71-80% predicted, or FEV-1/FVC 71-80%.',
        30:  'FEV-1 56-70% predicted, or requiring more than occasional use of bronchodilators.',
        60:  'FEV-1 40-55% predicted; or requiring daily use of systemic steroids.',
        100: 'FEV-1 <40% predicted; or greater than one incapacitating episode per month.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 12. Feet / Ankles (DC 5276)
  // BUG-1 FIX: use a.feet_type instead of a.feet_diagnosis
  // ────────────────────────────────────────────────────────────────
  function rateFeet(a) {
    var score = 0;

    if (a.feet_severity === 'Severe — unable to walk more than short distances, requires assistive device') score = 30;
    else if (a.feet_severity === 'Moderate-severe — significantly limits standing, walking, and physical activity') score = 20;
    else if (a.feet_severity === 'Moderate — noticeable limitation, requires orthotics or bracing') score = 10;
    else if (a.feet_severity === 'Mild — some pain and limitation but functional') score = 10;

    // BUG-1 FIX: use feet_type (the actual checkbox/array field) instead of feet_diagnosis
    var diags = Array.isArray(a.feet_type) ? a.feet_type : [];
    if (diags.some(function(d) { return d.includes('Plantar fasciitis') || d.includes('Pes planus') || d.includes('Achilles'); })) {
      score = Math.max(score, 10);
    }

    var bilateral = a.feet_both === 'Yes — bilateral (both sides)';
    if (bilateral && score > 0) score += 10;

    return {
      rating: snapRating(score, [0, 10, 20, 30]),
      score: score,
      flags: bilateral ? ['bilateral'] : [],
      tdiuFlag: false,
      dc: '5276',
      name: 'Feet / Ankles',
      ratingDescriptions: {
        0:  'No significant functional impairment.',
        10: 'Mild symptoms; managed with orthotics.',
        20: 'Moderate — weight-bearing painful; requires orthopedic footwear.',
        30: 'Marked — use of crutch or cane required.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 13. Hip (DC 5252)
  // ────────────────────────────────────────────────────────────────
  function rateHip(a) {
    var score = 0;
    var flexMap = {
      'Less than 20 degrees — severe limitation (40% level)': 40,
      'About 20-40 degrees': 30,
      'About 40-70 degrees': 20,
      'About 70-90 degrees': 10,
      'Greater than 90 degrees — mild limitation': 10
    };

    if (a.hip_flexion && flexMap[a.hip_flexion]) score = Math.max(score, flexMap[a.hip_flexion]);
    if (a.hip_which === 'Both hips') score = Math.min(score + 10, 50);
    if (a.hip_work && a.hip_work.includes('Cannot walk')) score = Math.max(score, 40);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40]),
      score: score,
      flags: [],
      tdiuFlag: false,
      name: 'Hip Conditions',
      dc: '5252',
      ratingDescriptions: {
        0:  'No compensable limitation of motion.',
        10: 'Favorable ankylosis or limitation of flexion to 70 degrees.',
        20: 'Limitation of flexion to 45 degrees.',
        30: 'Limitation of flexion to 30 degrees.',
        40: 'Unfavorable ankylosis or limitation to 20 degrees — major functional loss.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 14. Elbow, Wrist & Hand (DC 5151+)
  // ────────────────────────────────────────────────────────────────
  function rateElbowWristHand(a) {
    var score = 0;

    if (a.ewh_grip === 'Cannot grip at all — complete functional loss') score = 50;
    else if (a.ewh_grip === 'Severely limited — grip only possible with great effort') score = 40;
    else if (a.ewh_grip === 'Moderate limitation — grip is painful and restricted') score = 20;
    else if (a.ewh_grip === 'Mild limitation — grip is weaker but functional') score = 10;

    if (a.ewh_motion === 'Severely limited — less than half normal motion') score = Math.max(score, 40);
    else if (a.ewh_motion === 'Moderately limited — about half normal motion') score = Math.max(score, 20);
    else if (a.ewh_motion === 'Mildly limited — some restriction') score = Math.max(score, 10);

    var dominant = a.ewh_which && (Array.isArray(a.ewh_which)
      ? a.ewh_which.some(function(e) { return e.includes('dominant'); })
      : (a.ewh_which.includes('dominant arm') || a.ewh_which.includes('dominant')));
    if (dominant && score > 0) score = Math.min(score + 10, 60);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 50, 60]),
      score: score,
      flags: dominant ? ['dominant arm'] : [],
      tdiuFlag: score >= 40,
      name: 'Elbow, Wrist & Hand',
      dc: '5151+',
      ratingDescriptions: {
        0:  'No compensable limitation.',
        10: 'Mild limitation of motion or grip strength.',
        20: 'Moderate limitation.',
        30: 'Moderately severe limitation — significant functional loss.',
        40: 'Severe limitation affecting most upper extremity function.',
        50: 'Very severe loss — major grip and motion deficit.',
        60: 'Dominant extremity — severe limitation with functional loss of hand.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 15. Neck / Cervical Spine (DC 5237)
  // ────────────────────────────────────────────────────────────────
  function rateNeck(a) {
    var score = 0;
    var flexMap = {
      'Cannot bend forward past 10-15 degrees — severe (30% level)': 30,
      'Limited to about 15-30 degrees (20% level)': 20,
      'Limited to about 30-45 degrees (10% level)': 10,
      'Limited but greater than 45 degrees — mild': 10,
      'Near normal range of motion': 0
    };

    if (a.neck_flexion && flexMap[a.neck_flexion] !== undefined) score = Math.max(score, flexMap[a.neck_flexion]);
    if (a.neck_radiculopathy && a.neck_radiculopathy.includes('bilateral')) score = Math.max(score, 20);
    if (a.neck_work && a.neck_work.includes('Cannot perform any work')) score = Math.max(score, 30);

    return {
      rating: snapRating(score, [0, 10, 20, 30]),
      score: score,
      flags: [],
      tdiuFlag: score >= 30,
      name: 'Neck (Cervical Spine)',
      dc: '5237',
      ratingDescriptions: {
        0:  'No compensable limitation.',
        10: 'Forward flexion greater than 30 degrees but not greater than 40 degrees.',
        20: 'Forward flexion of 15-30 degrees.',
        30: 'Unfavorable ankylosis or forward flexion of 0-15 degrees.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 16. Depression & Anxiety (DC 9434)
  // ────────────────────────────────────────────────────────────────
  function rateMentalHealth(a) {
    var score = 0;
    var flags = [];

    if (a.mh_suicidal === 'Yes — I have had these thoughts') { score = Math.max(score, 70); flags.push('suicidal'); }
    if (a.mh_employment === 'Unable to work at all') { score = Math.max(score, 70); flags.push('unemployable'); }
    if (a.mh_employment === 'Significant impairment — missed work, job loss, performance issues') score = Math.max(score, 50);
    if (a.mh_social === 'Severe — isolated, no meaningful relationships maintained') score = Math.max(score, 70);
    if (a.mh_daily === 'Severe — unable to manage basic daily functions') score = Math.max(score, 70);
    if (a.mh_daily === 'Significant — requires help with many tasks') score = Math.max(score, 50);
    if (a.mh_frequency === 'Constant — persistent most of the time') score = Math.max(score, 50);

    if (score < 10) score = 10;

    var tdiuFlag = score >= 70 || a.mh_employment === 'Unable to work at all';

    return {
      rating: snapRating(score, [0, 10, 30, 50, 70, 100]),
      score: score,
      flags: flags,
      tdiuFlag: tdiuFlag,
      name: 'Depression & Anxiety',
      dc: '9434',
      ratingDescriptions: {
        0:   'Symptoms controlled by continuous medication.',
        10:  'Occupational and social impairment due to mild symptoms.',
        30:  'Occupational and social impairment with occasional decrease in efficiency.',
        50:  'Reduced reliability and productivity; difficulty adapting to stressful circumstances.',
        70:  'Deficiencies in most areas — work, school, family, judgment, thinking, or mood.',
        100: 'Total occupational and social impairment.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 17. Military Sexual Trauma (DC 9411/9434)
  // ────────────────────────────────────────────────────────────────
  function rateMST(a) {
    var score = 0;
    var conditions = a.mst_conditions || [];

    if (conditions.includes('PTSD / trauma symptoms')) score = Math.max(score, 50);
    if (conditions.includes('Major depression')) score = Math.max(score, 30);
    if (conditions.includes('Anxiety disorder')) score = Math.max(score, 30);
    if (conditions.length >= 4) score = Math.max(score, 50);
    if (score < 10 && conditions.length > 0) score = 10;

    return {
      rating: snapRating(score, [0, 10, 30, 50, 70]),
      score: score,
      flags: ['mst'],
      tdiuFlag: score >= 70,
      name: 'Military Sexual Trauma',
      dc: '9411/9434',
      note: 'MST is the in-service event. This estimate is based on resulting conditions you reported. A thorough evaluation by a VA MST Coordinator will produce a more precise compensation level. Ask your VA facility for the MST Coordinator specifically.',
      ratingDescriptions: {
        0:  'Resulting conditions not yet quantified — MST coordinator evaluation recommended.',
        10: 'Mild resulting conditions — occupational and social impairment due to mild symptoms.',
        30: 'Moderate resulting conditions.',
        50: 'Significant resulting conditions — reduced reliability and productivity.',
        70: 'Severe resulting conditions — deficiencies in most life areas.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 18. Diabetes Mellitus (DC 7913)
  // ────────────────────────────────────────────────────────────────
  function rateDiabetes(a) {
    var score = 0;

    if (a.dm_treatment === 'Insulin pump') score = Math.max(score, 40);
    else if (a.dm_treatment === 'Insulin — two or more injections per day') score = Math.max(score, 40);
    else if (a.dm_treatment === 'Insulin — one injection per day') score = Math.max(score, 20);
    else if (a.dm_treatment === 'Oral medications only') score = Math.max(score, 10);

    if (a.dm_regulation === 'Poorly — frequent hospitalizations or hypoglycemic episodes requiring assistance') score = Math.max(score, 60);
    else if (a.dm_regulation === 'Difficult — requires frequent medication adjustments') score = Math.max(score, 40);

    var pactFlag = a.dm_exposure && (a.dm_exposure.includes('Agent Orange') || a.dm_exposure.includes('Camp Lejeune') || a.dm_exposure.includes('PACT Act'));

    return {
      rating: snapRating(score, [0, 10, 20, 40, 60, 100]),
      score: score,
      flags: pactFlag ? ['presumptive'] : [],
      tdiuFlag: score >= 60,
      pactFlag: !!pactFlag,
      name: 'Diabetes Mellitus',
      dc: '7913',
      note: 'Complications of diabetes (neuropathy, retinopathy, kidney disease, erectile dysfunction) are rated separately and can significantly increase the combined compensation level.',
      ratingDescriptions: {
        0:   'Well controlled — diet only.',
        10:  'Manageable with oral medications only.',
        20:  'Requiring insulin and restricted diet.',
        40:  'Requiring insulin, restricted diet, and regulation difficult.',
        60:  'Requiring insulin, restricted diet, and episodes of ketoacidosis or hypoglycemic reactions requiring hospitalization.',
        100: 'Requiring more than one daily injection of insulin, plus restricted diet, plus regulation of activities.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 19. Heart Disease / CAD (DC 7005)
  // ────────────────────────────────────────────────────────────────
  function rateHeart(a) {
    var score = 0;
    var metsMap = {
      'Less than 3 METs — cannot climb stairs or walk slowly without symptoms (100% level)': 100,
      '3-5 METs — light housework OK; symptoms with moderate effort (60% level)': 60,
      '5-7 METs — walk briskly OK; symptoms only with strenuous effort (30% level)': 30,
      'Greater than 7 METs — mostly functional; symptoms with heavy exertion only (10% level)': 10
    };

    if (a.heart_mets && metsMap[a.heart_mets]) score = Math.max(score, metsMap[a.heart_mets]);

    if (a.heart_ef === 'Less than 30% — severely reduced (100% level)') score = Math.max(score, 100);
    else if (a.heart_ef === '30-50% — moderately reduced') score = Math.max(score, 60);

    var pactFlag = a.heart_nexus && a.heart_nexus.includes('Agent Orange');
    if (a.heart_work && a.heart_work.includes('Cannot work')) score = Math.max(score, 60);

    return {
      rating: snapRating(score, [0, 10, 30, 60, 100]),
      score: score,
      flags: pactFlag ? ['presumptive'] : [],
      tdiuFlag: score >= 60,
      pactFlag: !!pactFlag,
      name: 'Heart Disease / CAD',
      dc: '7005',
      ratingDescriptions: {
        0:   'No compensable cardiac symptoms.',
        10:  'Workload greater than 7 METs — dyspnea or angina only on heavy exertion.',
        30:  'Workload of 5-7 METs — dyspnea, fatigue, or angina with moderate activity.',
        60:  'Workload of 3-5 METs — more than slight restriction; or ejection fraction 30-50%.',
        100: 'Chronic congestive heart failure, workload less than 3 METs, or ejection fraction less than 30%.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 20. GERD & GI Conditions (DC 7346)
  // ────────────────────────────────────────────────────────────────
  function rateGerdGI(a) {
    var score = 0;

    if (a.gi_severity === 'Severe — hospitalizations or ER visits') score = Math.max(score, 60);
    else if (a.gi_severity === 'Moderate to severe — requires continuous prescription medication') score = Math.max(score, 30);
    else if (a.gi_severity === 'Moderate — managed with daily medication') score = Math.max(score, 10);

    if (a.gi_weight === 'Yes — significant weight loss (10+ lbs unintentional)') score = Math.max(score, 30);
    if (a.gi_work && a.gi_work.includes('Cannot maintain')) score = Math.max(score, 30);
    if (a.gi_frequency === 'Daily — constant, affecting every meal') score = Math.max(score, 30);

    return {
      rating: snapRating(score, [0, 10, 30, 60]),
      score: score,
      flags: [],
      tdiuFlag: score >= 60,
      name: 'GERD & GI Conditions',
      dc: '7346',
      note: 'Multiple GI conditions are each rated separately. Claiming GERD secondary to PTSD or medications is a well-established nexus.',
      ratingDescriptions: {
        0:  'No compensable GI symptoms.',
        10: 'Symptoms controlled by medication or dietary modification.',
        30: 'Persistently recurrent epigastric distress with dysphagia, pyrosis, and regurgitation — not controlled by medication.',
        60: 'Symptoms of pain, vomiting, or material weight loss.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 21. Gulf War Illness (DC 9027)
  // ────────────────────────────────────────────────────────────────
  function rateGulfWar(a) {
    var score = 0;
    var symptoms = a.gw_symptoms || [];
    var chronic = a.gw_duration && a.gw_duration.includes('6 months or more');

    if (symptoms.length >= 5 && chronic) score = 40;
    else if (symptoms.length >= 3 && chronic) score = 30;
    else if (symptoms.length >= 2 && chronic) score = 20;
    else if (symptoms.length >= 1) score = 10;

    if (a.gw_exclusions && a.gw_exclusions.includes('fibromyalgia or chronic fatigue')) score = Math.max(score, 40);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 50]),
      score: score,
      flags: ['gulfwar'],
      tdiuFlag: score >= 40,
      pactFlag: true,
      name: 'Gulf War Illness',
      dc: '9027',
      note: 'Gulf War Illness is a presumptive condition under 38 CFR \u00A7 3.317. No specific cause needs to be proven — qualifying service plus qualifying chronic symptoms (present 6+ months) are sufficient. A VSO can help build this claim.',
      ratingDescriptions: {
        0:  'Symptoms not yet chronic or qualifying service not established.',
        10: 'Mild — one to two qualifying symptoms; minimal functional impact.',
        20: 'Moderate — qualifying symptoms with some functional limitation.',
        30: 'Moderately severe — qualifying symptoms significantly affecting work or daily life.',
        40: 'Severe — multiple qualifying symptoms with major functional impairment.',
        50: 'Severely debilitating — unable to maintain employment or normal activities.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 22. Cancer / Toxic Exposure (DC 7343)
  // ────────────────────────────────────────────────────────────────
  function rateCancer(a) {
    var score = 0;

    if (a.cancer_status === 'Active — currently in treatment') score = 100;
    else if (a.cancer_status === 'In remission — treatment complete, monitoring') score = 30;
    else if (a.cancer_status === 'Recurrent — returned after remission') score = 100;
    else if (a.cancer_status === 'Residuals only — cancer resolved but permanent damage remains') score = 20;

    var residuals = a.cancer_residuals || [];
    if (residuals.length >= 3) score = Math.max(score, 30);

    var pactFlag = !!(a.cancer_exposure && (Array.isArray(a.cancer_exposure)
      ? a.cancer_exposure.some(function(e) {
          return e.includes('PACT Act') || e.includes('Agent Orange') || e.includes('Camp Lejeune') || e.includes('Ionizing') || e.includes('Mustard') || e.includes('Depleted');
        })
      : (a.cancer_exposure.includes('PACT Act') || a.cancer_exposure.includes('Agent Orange') || a.cancer_exposure.includes('Camp Lejeune'))));

    return {
      rating: snapRating(score, [0, 10, 20, 30, 100]),
      score: score,
      flags: pactFlag ? ['presumptive'] : [],
      tdiuFlag: score >= 30,
      pactFlag: pactFlag,
      name: 'Cancer / Toxic Exposure',
      dc: '7343',
      note: 'Active cancer is rated at 100% during treatment. After treatment, residuals are rated separately for permanent damage. PACT Act and Agent Orange presumptives apply — no nexus proof required for qualifying exposures.',
      ratingDescriptions: {
        0:   'No active cancer; no significant residuals.',
        10:  'In remission; minimal residuals.',
        20:  'In remission; notable residuals affecting function.',
        30:  'Significant residuals post-treatment; or in remission with moderate functional loss.',
        100: 'Active malignancy requiring treatment.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 23. Kidney & Bladder (DC 7530)
  // ────────────────────────────────────────────────────────────────
  function rateGenitourinary(a) {
    var score = 0;

    if (a.gu_severity === 'Severe — requires dialysis or major medical management') score = 60;
    else if (a.gu_severity === 'Constant involuntary voiding / incontinence') score = 60;
    else if (a.gu_severity === 'Requires wearing absorbent materials daily') score = 40;
    else if (a.gu_severity === 'Moderate — frequent symptoms requiring ongoing treatment') score = 20;
    else if (a.gu_severity === 'Mild — periodic symptoms') score = 10;

    var smcK = a.gu_ed && a.gu_ed.includes('Complete erectile dysfunction');

    return {
      rating: snapRating(score, [0, 10, 20, 40, 60]),
      score: score,
      flags: smcK ? ['SMC-K eligible'] : [],
      tdiuFlag: score >= 60,
      name: 'Kidney & Bladder',
      dc: '7530',
      note: smcK ? 'Complete erectile dysfunction qualifies for Special Monthly Compensation (SMC-K) — approximately $130/month in addition to your combined rating.' : '',
      ratingDescriptions: {
        0:  'No compensable GU symptoms.',
        10: 'Mild symptoms — periodic episodes requiring treatment.',
        20: 'Moderate — frequent symptoms requiring ongoing medical treatment.',
        40: 'Requiring use of absorbent materials.',
        60: 'Constant or near-constant involuntary voiding; or requiring dialysis.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 24. Eye Conditions (DC 6000+)
  // ────────────────────────────────────────────────────────────────
  function rateEye(a) {
    var score = 0;
    var acuityMap = {
      '20/200 or worse — severe impairment': 60,
      '20/100 to 20/200 in affected eye(s)': 30,
      '20/50 to 20/100 — moderate impairment': 20,
      '20/40 or better — mild impairment': 10,
      'Normal or near-normal with correction': 0
    };

    if (a.eye_acuity && acuityMap[a.eye_acuity] !== undefined) score = Math.max(score, acuityMap[a.eye_acuity]);
    if (a.eye_which === 'Both eyes') score = Math.min(score + 20, 100);
    if (a.eye_condition && (Array.isArray(a.eye_condition)
      ? a.eye_condition.some(function(e) { return e.includes('Photophobia'); })
      : a.eye_condition.includes('Photophobia'))) {
      score = Math.max(score, 10);
    }

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 60, 100]),
      score: score,
      flags: [],
      tdiuFlag: score >= 60,
      name: 'Eye Conditions',
      dc: '6000+',
      note: 'Eye conditions are rated based on best corrected visual acuity. Each eye is rated separately. Loss of use of one or both eyes may qualify for Special Monthly Compensation (SMC).',
      ratingDescriptions: {
        0:   'No compensable visual impairment.',
        10:  'Mild impairment — corrected to near normal.',
        20:  'Moderate impairment in one eye.',
        30:  'Significant visual impairment.',
        40:  'Major impairment in affected eye(s).',
        60:  'Severe impairment — 20/200 or worse.',
        100: 'Loss of use of both eyes.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 25. Cold Injuries / Frostbite (DC 7122)
  // ────────────────────────────────────────────────────────────────
  function rateColdInjury(a) {
    var score = 0;
    var residuals = a.cold_residuals || [];

    if (a.cold_severity === 'Severe — major tissue loss or complete loss of sensation') score = 40;
    else if (a.cold_severity === 'Moderate — significant ongoing symptoms affecting daily function') score = 20;
    else if (a.cold_severity === 'Mild — noticeable but not significantly limiting') score = 10;
    else if (a.cold_severity === 'Minimal — occasional symptoms only') score = 10;

    if (residuals.includes('Raynaud\'s phenomenon — exaggerated cold/color response')) score = Math.max(score, 20);
    if (residuals.includes('Tissue loss at tip of finger or toe')) score = Math.max(score, 30);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40]),
      score: score,
      flags: [],
      tdiuFlag: false,
      name: 'Cold Injuries / Frostbite',
      dc: '7122',
      note: 'Cold injury residuals are commonly under-claimed. Even if the original injury was not formally documented, current symptoms combined with evidence of cold weather service can establish the nexus.',
      ratingDescriptions: {
        0:  'No compensable residuals.',
        10: 'Mild residuals — occasional symptoms.',
        20: 'Moderate residuals — Raynaud\'s phenomenon or chronic pain affecting daily activities.',
        30: 'Significant residuals — tissue loss or marked functional impairment.',
        40: 'Severe residuals — major tissue loss or complete sensory loss.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 26. Radiculopathy / Nerve (DC 8520)
  // ────────────────────────────────────────────────────────────────
  function rateRadiculopathy(a) {
    var score = 0;
    var sevMap = {
      'Complete — total loss of function or paralysis (80% level)': 80,
      'Severe — significantly decreased sensation and marked muscle atrophy (60% level)': 60,
      'Moderately severe — marked decreased sensation and muscle weakness (40% level)': 40,
      'Moderate — moderate decreased sensation and some weakness (20% level)': 20,
      'Mild — mild numbness or tingling, no motor weakness (10% level)': 10
    };

    if (a.rad_severity && sevMap[a.rad_severity]) score = sevMap[a.rad_severity];

    var bilateral = a.rad_location && (a.rad_location.includes('Both legs') || a.rad_location.includes('Both arms'));
    if (bilateral) score = Math.min(score + 10, 80);

    var symptoms = a.rad_symptoms || [];
    if (symptoms.includes('Foot drop (inability to lift front of foot)')) score = Math.max(score, 40);
    if (symptoms.includes('Muscle atrophy — visible shrinking of muscle')) score = Math.max(score, 40);

    return {
      rating: snapRating(score, [0, 10, 20, 30, 40, 60, 80]),
      score: score,
      flags: bilateral ? ['bilateral'] : [],
      tdiuFlag: score >= 60,
      name: 'Radiculopathy / Nerve',
      dc: '8520',
      note: 'Radiculopathy is rated SEPARATELY from the underlying back or neck condition — not included in it. Each extremity is rated independently. This is one of the most common ways veterans significantly increase their total combined compensation level.',
      ratingDescriptions: {
        0:  'No compensable nerve symptoms.',
        10: 'Mild — mild paresthesias only.',
        20: 'Moderate — moderate sensory deficit or mild motor involvement.',
        40: 'Moderately severe — marked decreased sensation with some motor weakness.',
        60: 'Severe — significant motor and sensory loss with atrophy.',
        80: 'Complete — total paralysis of the affected extremity.'
      }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // calculateAllRatings — call individual rate functions for
  //                       each selected condition
  // ────────────────────────────────────────────────────────────────
  var rateFnMap = {
    ptsd:             ratePTSD,
    back:             rateBack,
    knee:             rateKnee,
    tinnitus:         rateTinnitus,
    sleep_apnea:      rateSleepApnea,
    migraines:        rateMigraines,
    tbi:              rateTBI,
    hypertension:     rateHypertension,
    shoulder:         rateShoulder,
    skin:             rateSkin,
    respiratory:      rateRespiratory,
    feet:             rateFeet,
    hip:              rateHip,
    elbow_wrist_hand: rateElbowWristHand,
    neck:             rateNeck,
    mental_health:    rateMentalHealth,
    mst:              rateMST,
    diabetes:         rateDiabetes,
    heart:            rateHeart,
    gerd_gi:          rateGerdGI,
    gulfwar:          rateGulfWar,
    cancer:           rateCancer,
    genitourinary:    rateGenitourinary,
    eye:              rateEye,
    cold_injury:      rateColdInjury,
    radiculopathy:    rateRadiculopathy
  };

  function calculateAllRatings(selectedConditions, answers) {
    var results = {};
    selectedConditions.forEach(function(c) {
      if (rateFnMap[c]) {
        results[c] = rateFnMap[c](answers);
      }
    });
    return results;
  }

  // ────────────────────────────────────────────────────────────────
  // calculateCombinedRating — VA "Whole Person" combined math
  //
  // 1. Sort individual ratings highest to lowest
  // 2. Apply each rating to the remaining "whole person" %
  // 3. Round final combined value to nearest 10%
  // ────────────────────────────────────────────────────────────────
  function calculateCombinedRating(ratings) {
    var vals = [];
    var keys = Object.keys(ratings);
    for (var i = 0; i < keys.length; i++) {
      var r = ratings[keys[i]].rating;
      if (r > 0) vals.push(r);
    }
    vals.sort(function(a, b) { return b - a; });

    if (vals.length === 0) return { combined: 0, raw: 0, steps: [] };

    var remaining = 100;
    var steps = [];

    vals.forEach(function(v) {
      var disabled = remaining * (v / 100);
      steps.push({
        rating: v,
        disabled: Math.round(disabled),
        remaining: Math.round(remaining - disabled)
      });
      remaining = remaining - disabled;
    });

    var raw = 100 - remaining;
    var combined = Math.round(raw / 10) * 10; // snap to nearest 10%

    return { combined: combined, raw: Math.round(raw), steps: steps };
  }

  // ────────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────────
  return {
    snapRating:             snapRating,
    calculateAllRatings:    calculateAllRatings,
    calculateCombinedRating: calculateCombinedRating,

    // Individual rate functions exposed for direct access / testing
    ratePTSD:              ratePTSD,
    rateBack:              rateBack,
    rateKnee:              rateKnee,
    rateTinnitus:          rateTinnitus,
    rateSleepApnea:        rateSleepApnea,
    rateMigraines:         rateMigraines,
    rateTBI:               rateTBI,
    rateHypertension:      rateHypertension,
    rateShoulder:          rateShoulder,
    rateSkin:              rateSkin,
    rateRespiratory:       rateRespiratory,
    rateFeet:              rateFeet,
    rateHip:               rateHip,
    rateElbowWristHand:    rateElbowWristHand,
    rateNeck:              rateNeck,
    rateMentalHealth:      rateMentalHealth,
    rateMST:               rateMST,
    rateDiabetes:          rateDiabetes,
    rateHeart:             rateHeart,
    rateGerdGI:            rateGerdGI,
    rateGulfWar:           rateGulfWar,
    rateCancer:            rateCancer,
    rateGenitourinary:     rateGenitourinary,
    rateEye:               rateEye,
    rateColdInjury:        rateColdInjury,
    rateRadiculopathy:     rateRadiculopathy
  };

})();
