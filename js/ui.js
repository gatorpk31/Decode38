// ══════════════════════════════════════════════════════════════════
// Decode38 — UI Rendering, Sanitization & Accessibility
// ══════════════════════════════════════════════════════════════════
Decode38.UI = {

  // ── Sanitization ────────────────────────────────────────────────
  esc: function(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // ── Screen Reader Announcements ─────────────────────────────────
  announce: function(message, priority) {
    var region = document.getElementById('sr-announcer');
    if (region) {
      region.setAttribute('aria-live', priority || 'polite');
      region.textContent = message;
      setTimeout(function() { region.textContent = ''; }, 1500);
    }
  },

  // ── Focus Management ────────────────────────────────────────────
  focusElement: function(selector) {
    var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus();
    }
  },

  // ── Toast Notification ──────────────────────────────────────────
  showToast: function(msg) {
    var toast = document.getElementById('saveToast');
    if (!toast) return;
    toast.textContent = msg || 'Progress saved';
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2000);
  },

  // ── Toggle Panel ────────────────────────────────────────────────
  togglePanel: function(header) {
    var body = header.nextElementSibling;
    var toggle = header.querySelector('.panel-toggle');
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    toggle.classList.toggle('open', !isOpen);
    toggle.textContent = isOpen ? '\u25BC' : '\u25B2';
    header.setAttribute('aria-expanded', String(!isOpen));
  },

  // ── Copy to Clipboard ──────────────────────────────────────────
  copyEl: function(id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    var text = el.innerText;
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = '\u2713 Copied!';
      btn.classList.add('copied');
      setTimeout(function() { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
    });
  },

  // ── Update Progress Bar ─────────────────────────────────────────
  updateProgressBar: function(step, total, label) {
    var pct = total > 1 ? Math.round((step / (total - 1)) * 100) : 0;
    var fill = document.getElementById('progressFill');
    var lbl = document.getElementById('progressLabel');
    var cnt = document.getElementById('progressCount');
    var bar = document.getElementById('progressFill');
    if (fill) fill.style.width = pct + '%';
    if (lbl) lbl.textContent = label || 'Progress';
    if (cnt) cnt.textContent = 'Step ' + (step + 1) + ' of ' + total;
    if (bar) {
      bar.parentElement.setAttribute('role', 'progressbar');
      bar.parentElement.setAttribute('aria-valuenow', String(pct));
      bar.parentElement.setAttribute('aria-valuemin', '0');
      bar.parentElement.setAttribute('aria-valuemax', '100');
      bar.parentElement.setAttribute('aria-label', 'Progress: step ' + (step + 1) + ' of ' + total);
    }
  },

  // ── Print Report ────────────────────────────────────────────────
  printReport: function() {
    var ph = document.getElementById('printHeader');
    var combinedEl = document.querySelector('.rating-num');
    var combined = combinedEl ? combinedEl.textContent : '--';
    var dateStr = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
    if (ph) {
      ph.innerHTML = '<h1>Decode38 \u2014 VA Compensation Analysis Report</h1>' +
        '<p>Generated ' + Decode38.UI.esc(dateStr) + ' \u00B7 Estimated Combined Compensation Level: ' + Decode38.UI.esc(combined) + '%</p>' +
        '<p style="font-size:8pt;color:#888;margin-top:4px">Built by Veterans \u00B7 Decode38.com \u00B7 Educational estimate \u2014 not an official VA determination</p>';
    }
    window.print();
  },

  // ── Render Step (wizard question card) ──────────────────────────
  renderStep: function(step, currentStep, totalSteps, isFirst, isLast, answers) {
    var esc = this.esc;
    var html = '<div class="card">';

    if (step.conditionLabel) {
      html += '<div style="display:inline-block;background:var(--navy);color:var(--gold-light);font-size:.68rem;font-weight:700;padding:3px 10px;border-radius:2px;letter-spacing:.07em;text-transform:uppercase;margin-bottom:.6rem">' + esc(step.conditionLabel) + '</div>';
    }
    html += '<div class="card-eyebrow">' + esc(step.label) + '</div>';
    html += '<h2 id="step-heading">' + esc(step.title) + '</h2>';
    html += '<div class="card-desc">' + step.desc + '</div>';

    // Active duty note for service step
    if (step.id === 'service') {
      html += '<div class="active-duty-note show" style="display:flex">' +
        '<span>\uD83C\uDF96\uFE0F</span>' +
        '<span><strong>Active Duty &amp; Guard/Reserve:</strong> All service types are covered. Guard and Reserve members who were federally activated (Title 10 orders) are treated the same as active duty for VA purposes. Your STRs (Service Treatment Records), AHLTA records, and activation orders are your primary evidence.</span>' +
        '</div>';
    }

    step.fields.forEach(function(f) {
      var savedVal = answers[f.id] || '';
      var savedArr = Array.isArray(answers[f.id]) ? answers[f.id] : [];
      html += '<div class="field">';
      html += '<label class="field-label" id="label-' + esc(f.id) + '">' + esc(f.label);
      if (f.optional) html += ' <span class="field-note">(optional)</span>';
      if (f.sensitive) html += ' <span class="field-sensitive">Important for rating accuracy</span>';
      html += '</label>';

      if (f.info) html += '<div class="field-info">\u2139\uFE0F ' + f.info + '</div>';

      if (f.type === 'text') {
        html += '<input type="text" id="' + esc(f.id) + '" placeholder="' + esc(f.placeholder || '') + '" value="' + esc(savedVal) + '" maxlength="' + Decode38.LIMITS.TEXT_MAX_LENGTH + '" aria-labelledby="label-' + esc(f.id) + '">';
      } else if (f.type === 'textarea') {
        html += '<textarea id="' + esc(f.id) + '" placeholder="' + esc(f.placeholder || '') + '" maxlength="' + Decode38.LIMITS.TEXT_MAX_LENGTH + '" aria-labelledby="label-' + esc(f.id) + '">' + esc(savedVal) + '</textarea>';
      } else if (f.type === 'radio') {
        html += '<div class="options" role="radiogroup" aria-labelledby="label-' + esc(f.id) + '">';
        f.options.forEach(function(opt, idx) {
          var sel = savedVal === opt;
          html += '<div class="opt' + (sel ? ' sel' : '') + '" data-field="' + esc(f.id) + '" data-val="' + esc(opt) + '" data-type="radio" role="radio" aria-checked="' + sel + '" tabindex="' + (idx === 0 ? '0' : '-1') + '">' +
            '<div class="radio-dot"></div><span>' + esc(opt) + '</span></div>';
        });
        html += '</div>';
      } else if (f.type === 'checkbox') {
        html += '<div class="options" role="group" aria-labelledby="label-' + esc(f.id) + '">';
        f.options.forEach(function(opt) {
          var sel = savedArr.indexOf(opt) > -1;
          html += '<div class="opt' + (sel ? ' sel' : '') + '" data-field="' + esc(f.id) + '" data-val="' + esc(opt) + '" data-type="check" role="checkbox" aria-checked="' + sel + '" tabindex="0">' +
            '<div class="check-box">' + (sel ? '\u2713' : '') + '</div><span>' + esc(opt) + '</span></div>';
        });
        html += '</div>';
      }

      // Validation message placeholder
      html += '<div class="validation-msg" id="val-' + esc(f.id) + '"></div>';
      html += '</div>';
    });

    html += '<div class="nav">';
    html += '<button class="btn-back" data-action="go-back" aria-label="Go back to previous step">\u2190 Back</button>';
    if (isLast) {
      html += '<button class="btn-generate" data-action="run-generate" aria-label="Generate your results">\u2726 Generate My Results</button>';
    } else {
      html += '<button class="btn-next" data-action="go-next" aria-label="Continue to next step">Continue \u2192</button>';
    }
    html += '</div></div>';

    return html;
  },

  // ── Render Condition Selector ───────────────────────────────────
  renderConditionSelector: function(selectedConditions) {
    var esc = this.esc;
    var conditionDefs = [
      { key:'ptsd', icon:'\uD83E\uDDE0', name:'PTSD / Mental Health', dc:'DC 9411' },
      { key:'back', icon:'\uD83E\uDDB4', name:'Back & Spine', dc:'DC 5235' },
      { key:'knee', icon:'\uD83E\uDDB5', name:'Knee Conditions', dc:'DC 5257' },
      { key:'tinnitus', icon:'\uD83D\uDC42', name:'Tinnitus & Hearing', dc:'DC 6260' },
      { key:'sleep_apnea', icon:'\uD83D\uDE34', name:'Sleep Apnea', dc:'DC 6847' },
      { key:'migraines', icon:'\uD83E\uDD15', name:'Migraines', dc:'DC 8100' },
      { key:'tbi', icon:'\uD83D\uDCA2', name:'TBI', dc:'DC 8045' },
      { key:'hypertension', icon:'\u2764\uFE0F', name:'Hypertension', dc:'DC 7101' },
      { key:'shoulder', icon:'\uD83E\uDDB7', name:'Shoulder', dc:'DC 5201' },
      { key:'skin', icon:'\uD83D\uDD25', name:'Skin Conditions', dc:'DC 7806' },
      { key:'respiratory', icon:'\uD83E\uDEC1', name:'Respiratory', dc:'DC 6602' },
      { key:'feet', icon:'\uD83E\uDDB6', name:'Feet & Ankles', dc:'DC 5276' },
      { key:'hip', icon:'\uD83E\uDDB4', name:'Hip Conditions', dc:'DC 5252' },
      { key:'elbow_wrist_hand', icon:'\u270A', name:'Elbow, Wrist & Hand', dc:'DC 5151+' },
      { key:'neck', icon:'\uD83D\uDD39', name:'Neck (Cervical Spine)', dc:'DC 5237' },
      { key:'mental_health', icon:'\uD83D\uDCAD', name:'Depression & Anxiety', dc:'DC 9434' },
      { key:'mst', icon:'\uD83D\uDEE1\uFE0F', name:'Military Sexual Trauma', dc:'DC 9411' },
      { key:'diabetes', icon:'\uD83E\uDE78', name:'Diabetes Mellitus', dc:'DC 7913' },
      { key:'heart', icon:'\uD83E\uDEC0', name:'Heart Disease / CAD', dc:'DC 7005' },
      { key:'gerd_gi', icon:'\uD83E\uDEC3', name:'GERD & GI Conditions', dc:'DC 7346' },
      { key:'gulfwar', icon:'\uD83C\uDF35', name:'Gulf War Illness', dc:'DC 9027' },
      { key:'cancer', icon:'\u2695\uFE0F', name:'Cancer / Toxic Exposure', dc:'DC 7343' },
      { key:'genitourinary', icon:'\uD83E\uDED8', name:'Kidney & Bladder', dc:'DC 7530' },
      { key:'eye', icon:'\uD83D\uDC41\uFE0F', name:'Eye Conditions', dc:'DC 6000+' },
      { key:'cold_injury', icon:'\uD83E\uDD76', name:'Cold Injuries / Frostbite', dc:'DC 7122' },
      { key:'radiculopathy', icon:'\u26A1', name:'Radiculopathy / Nerve', dc:'DC 8520' },
    ];

    var html = '<div class="card">' +
      '<div class="card-eyebrow">Step 1 of many</div>' +
      '<h2 id="step-heading">Select Your Service-Connected Conditions</h2>' +
      '<div class="card-desc">Select all conditions you want to evaluate for VA compensation. Choose one or as many as apply. The tool walks through each one with targeted questions \u2014 written by veterans, field-tested by veterans.</div>' +
      '<div class="module-select-grid" id="condGrid">';

    conditionDefs.forEach(function(c) {
      var active = selectedConditions.indexOf(c.key) > -1;
      html += '<div class="mod-sel-btn' + (active ? ' active' : '') + '" data-key="' + esc(c.key) + '" role="checkbox" aria-checked="' + active + '" tabindex="0" aria-label="' + esc(c.name) + '">' +
        '<div class="mod-sel-icon">' + c.icon + '</div>' +
        '<div class="mod-sel-name">' + esc(c.name) + '</div>' +
        '<div class="mod-sel-dc">' + esc(c.dc) + '</div>' +
        '</div>';
    });

    html += '</div>' +
      '<div class="info-callout" style="margin-top:1rem">' +
      '<span>\uD83D\uDCA1</span>' +
      '<span>You don\'t have to select everything. Start with the conditions that affect your life most. Service background questions apply to all conditions and come first.</span>' +
      '</div>' +
      '<div class="nav"><div></div>' +
      '<button class="btn-next" data-action="begin-intake" aria-label="Begin intake questionnaire">Begin Intake \u2192</button>' +
      '</div></div>';

    return html;
  },

  // ── Render Trigger Warning ──────────────────────────────────────
  renderTriggerWarning: function(conditionLabel) {
    return '<div class="trigger-warning">' +
      '<h3>Before we continue</h3>' +
      '<p>The next section includes questions about <strong>' + this.esc(conditionLabel) + '</strong>. Some questions may ask about difficult experiences including suicidal thoughts, trauma, or substance use.</p>' +
      '<p>You can take a break at any time. Your progress is saved automatically.</p>' +
      '<div class="crisis-note">Need support? Call or text <a href="tel:988">988</a> (press 1 for veterans)</div>' +
      '<div class="trigger-warning-actions">' +
      '<button class="btn-back" data-action="go-back">\u2190 Go Back</button>' +
      '<button class="btn-next" data-action="dismiss-trigger">Continue \u2192</button>' +
      '</div></div>';
  },

  // ── Render Results ──────────────────────────────────────────────
  renderResults: function(ratings, combined, secondary, translations, statement, tips, answers) {
    var esc = this.esc;
    var html = '';

    // Disclaimer
    html += '<div class="disclaimer-box">' +
      '<strong>\u2696\uFE0F EDUCATIONAL TOOL \u2014 NOT LEGAL OR MEDICAL ADVICE</strong>' +
      'Decode38 is designed to help you understand the language gap between your everyday descriptions and VA compensation terminology. Estimated compensation levels are based on 38 CFR Part 4 criteria applied to your self-reported responses \u2014 they are not official VA determinations and do not account for the full weight of medical evidence, C&P examination findings, or adjudicator discretion. This tool does not establish service connection and does not constitute legal advice. Always consult an <strong>accredited VSO, VA-accredited attorney, or claims agent</strong> before filing. If you are a veteran in crisis, call <strong>988</strong> (Veterans Crisis Line).</div>';

    // Print Report Bar
    if (Decode38.Features.isAvailable('PRINT_REPORT')) {
      html += '<div class="print-report-bar">' +
        '<div><div class="print-report-bar-title">\uD83D\uDCCB Your Full Decode38 Report</div>' +
        '<div class="print-report-bar-sub">A complete summary of your conditions, estimated ratings, VA language translations, and C&P exam prep.</div></div>' +
        '<button class="btn-print-report" data-action="print-report">\uD83D\uDDA8\uFE0F Print Full Report</button></div>';
    }

    // Rating Summary Hero
    html += '<div class="results-hero">' +
      '<h2>Your VA Compensation Summary</h2>' +
      '<p>Based on 38 CFR Part 4 \u00B7 Self-reported responses \u00B7 ' + new Date().toLocaleDateString() + '</p>' +
      '<div class="rating-row">' +
      '<div class="rating-circle"><div class="rating-num">' + combined.combined + '%</div><div class="rating-sub">Combined</div></div>' +
      '<div class="rating-detail">' +
      '<div class="rating-tag">VA Combined Compensation Level (Whole Person Method)</div>' +
      '<div class="rating-desc">';

    // Individual ratings list
    var ratingValues = Object.values(ratings);
    ratingValues.forEach(function(r) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.07)">' +
        '<span style="color:#CBD5E1;font-size:.8rem">' + esc(r.name) + ' (DC ' + esc(r.dc) + ')</span>' +
        '<span style="color:' + (r.rating >= 50 ? 'var(--gold-light)' : '#94A3B8') + ';font-weight:600;font-size:.85rem">' + r.rating + '%</span></div>';
    });

    html += '</div></div></div>';

    // TDIU flag
    var anyTDIU = ratingValues.some(function(r) { return r.tdiuFlag; });
    if (anyTDIU) {
      html += '<div class="flag-box"><div class="flag-box-icon">\u2605</div>' +
        '<div><strong>TDIU Flag:</strong> One or more conditions may support a Total Disability Individual Unemployability (TDIU) claim under 38 CFR \u00A7 4.16. This can result in 100% compensation pay even if your combined percentage is below 100%. Discuss this with your VSO.</div></div>';
    }

    // Combined math note
    if (Object.keys(ratings).length > 1) {
      html += '<div class="combined-box"><span>\uD83D\uDCCA</span>' +
        '<span>VA does not add percentages together \u2014 it uses "Whole Person" math. Starting with 100% "whole person," each service-connected condition accounts for a share of what remains. This is why ' +
        ratingValues.map(function(r) { return r.rating + '%'; }).join(' + ') + ' does not equal ' +
        ratingValues.reduce(function(a, r) { return a + r.rating; }, 0) + '%.</span></div>';
    }

    html += '</div>'; // close results-hero

    // ── Condition Detail Panel ──────────────────────────────────
    html += '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="true" tabindex="0">' +
      '<div class="panel-title-wrap"><div class="panel-icon pi-blue">\uD83D\uDCCA</div>' +
      '<div><div class="panel-title">Compensation Level by Condition</div>' +
      '<div class="panel-subtitle"><span class="free-tag">Free</span> What the criteria say and what compensation level applies for each condition</div></div></div>' +
      '<div class="panel-toggle open">\u25B2</div></div>' +
      '<div class="panel-body open">';

    ratingValues.forEach(function(r) {
      var desc = r.ratingDescriptions ? (r.ratingDescriptions[r.rating] || '') : '';
      html += '<div style="margin-bottom:1.25rem;padding-bottom:1.25rem;border-bottom:1px solid var(--cream-dark)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">' +
        '<strong style="color:var(--navy)">' + esc(r.name) + '</strong>' +
        '<span style="background:' + (r.rating >= 50 ? 'var(--navy-mid)' : 'var(--cream-dark)') + ';color:' + (r.rating >= 50 ? '#fff' : 'var(--text-mid)') + ';padding:3px 10px;border-radius:2px;font-size:.78rem;font-weight:700">' + r.rating + '% \u2014 DC ' + esc(r.dc) + '</span></div>' +
        '<div style="font-size:.8rem;color:var(--text-mid);line-height:1.6">' + esc(desc) + '</div>';
      if (r.bridge) {
        html += '<div style="font-size:.75rem;color:var(--amber);margin-top:.4rem;background:var(--amber-bg);padding:4px 8px;border-radius:2px">\u2B06 Per 38 CFR \u00A7 4.7: your symptoms bridge two levels \u2014 consider claiming the higher compensation level</div>';
      }
      if (r.note) {
        html += '<div style="font-size:.75rem;color:var(--text-light);margin-top:.35rem;font-style:italic">' + esc(r.note) + '</div>';
      }
      if (r.pactFlag) {
        html += '<div style="font-size:.75rem;color:var(--green);margin-top:.35rem;background:var(--green-bg);padding:4px 8px;border-radius:2px">\u2605 PACT Act flag \u2014 presumptive service connection may apply. Consult a VSO.</div>';
      }
      html += '</div>';
    });

    html += '</div></div>';

    // ── Combined Math Table ─────────────────────────────────────
    if (combined.steps.length > 1) {
      var condNames = ratingValues.map(function(r) { return r.name; }).sort(function(a, b) {
        var ra = ratingValues.find(function(r) { return r.name === a; });
        var rb = ratingValues.find(function(r) { return r.name === b; });
        return rb.rating - ra.rating;
      });

      html += '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="false" tabindex="0">' +
        '<div class="panel-title-wrap"><div class="panel-icon pi-teal">\uD83D\uDD22</div>' +
        '<div><div class="panel-title">How VA Calculates Your Combined Level</div>' +
        '<div class="panel-subtitle">The Whole Person method explained with your numbers</div></div></div>' +
        '<div class="panel-toggle">\u25BC</div></div>' +
        '<div class="panel-body">' +
        '<p style="font-size:.82rem;color:var(--text-mid);margin-bottom:1rem">VA does not add percentages \u2014 it applies each service-connected condition to the remaining "whole person." Here is how your combined level is calculated:</p>' +
        '<table class="combined-table"><thead><tr><th>Condition</th><th>Compensation %</th><th>Applied To</th><th>Accounted For</th><th>Remaining</th></tr></thead><tbody>';

      combined.steps.forEach(function(s, i) {
        html += '<tr><td>' + esc(condNames[i] || 'Condition ' + (i + 1)) + '</td><td>' + s.rating + '%</td><td>' +
          (i === 0 ? '100' : combined.steps[i - 1].remaining) + '%</td><td>' + s.disabled + '%</td><td>' + s.remaining + '%</td></tr>';
      });

      html += '<tr class="combined-final"><td colspan="3"><strong>Combined VA Compensation Level (rounded to nearest 10%)</strong></td>' +
        '<td colspan="2"><strong>' + combined.combined + '%</strong></td></tr></tbody></table></div></div>';
    }

    // ── Secondary Conditions Panel ──────────────────────────────
    html += '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="true" tabindex="0">' +
      '<div class="panel-title-wrap"><div class="panel-icon pi-green">\uD83D\uDD17</div>' +
      '<div><div class="panel-title">Related Conditions to Consider</div>' +
      '<div class="panel-subtitle">' + secondary.length + ' additional service-connected conditions you may be eligible to claim</div></div></div>' +
      '<div class="panel-toggle open">\u25B2</div></div>' +
      '<div class="panel-body open"><div class="sec-grid">';

    secondary.forEach(function(s) {
      html += '<div class="sec-card ' + esc(s.priority) + '"><div class="sec-dot"></div>' +
        '<div><div class="sec-name">' + esc(s.name) + '</div><div class="sec-why">' + esc(s.reason) + '</div></div></div>';
    });

    html += '</div><p style="margin-top:1rem;font-size:.74rem;color:var(--text-light)">' +
      '<strong style="color:var(--red-light)">\u25A0 Red</strong> = strong medical link based on your answers &nbsp;' +
      '<strong style="color:var(--amber-light)">\u25A0 Yellow</strong> = moderate connection, worth pursuing &nbsp;' +
      '<strong style="color:#60A5FA">\u25A0 Blue</strong> = evaluate with VSO</p></div></div>';

    // ── Translations Panel ──────────────────────────────────────
    if (Decode38.Features.isAvailable('TRANSLATIONS')) {
      html += '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="true" tabindex="0">' +
        '<div class="panel-title-wrap"><div class="panel-icon pi-blue">\uD83D\uDCDD</div>' +
        '<div><div class="panel-title">Your VA Language Translation Guide</div>' +
        '<div class="panel-subtitle">How to say what you experience in the language VA is required to respond to</div></div></div>' +
        '<div class="panel-toggle open">\u25B2</div></div>' +
        '<div class="panel-body open">' +
        '<p style="font-size:.82rem;color:var(--text-mid);margin-bottom:1rem">This is the core of Decode38. Use this language in your personal statement, with your VSO, and during your C&P exam. You served \u2014 this is how VA needs to hear it.</p>' +
        '<table class="trans-table"><thead><tr><th>What You Experience / How You Say It</th><th>VA Compensation Language to Use</th></tr></thead><tbody>';

      translations.forEach(function(t) {
        html += '<tr><td>' + esc(t.layman) + '</td><td>' + esc(t.va) + '</td></tr>';
      });

      html += '</tbody></table></div></div>';
    }

    // ── Personal Statement Panel ────────────────────────────────
    if (Decode38.Features.isAvailable('AI_STATEMENT')) {
      html += '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="true" tabindex="0">' +
        '<div class="panel-title-wrap"><div class="panel-icon pi-amber">\uD83D\uDCC4</div>' +
        '<div><div class="panel-title">Personal Statement Draft</div>' +
        '<div class="panel-subtitle">A formal statement in VA regulatory language based on your responses</div></div></div>' +
        '<div class="panel-toggle open">\u25B2</div></div>' +
        '<div class="panel-body open">';

      if (statement) {
        html += '<div class="stmt-box" id="stmtText">' + esc(statement) + '</div>' +
          '<button class="copy-btn" data-action="copy-el" data-target="stmtText">\uD83D\uDCCB Copy Statement</button>' +
          '<p style="font-size:.74rem;color:var(--text-light);margin-top:.6rem">Review this draft with your VSO before submitting. This is a starting point \u2014 your VSO or claims agent may refine it further.</p>';
      } else {
        html += '<div style="background:var(--cream);border:1px dashed var(--border);border-radius:3px;padding:1.5rem;text-align:center;color:var(--text-light);font-size:.84rem">' +
          '<div style="font-size:1.4rem;margin-bottom:.5rem">\uD83D\uDD11</div>' +
          '<strong style="display:block;color:var(--navy);margin-bottom:.35rem">Add your Anthropic API key to generate a personalized statement</strong>' +
          'Enter your API key in the field on the landing page and restart to enable this feature.</div>';
      }

      // Nexus Framework
      if (Decode38.Features.isAvailable('NEXUS_TEMPLATE')) {
        html += '<div style="margin-top:1.5rem">' +
          '<h4 style="font-family:\'Libre Baskerville\',serif;color:var(--navy);margin-bottom:.6rem;font-size:.95rem">Nexus Letter Framework</h4>' +
          '<p style="font-size:.78rem;color:var(--text-mid);margin-bottom:.75rem">Take this framework to your doctor and ask them to complete it on official letterhead. A nexus letter establishes the medical connection between your service and your condition.</p>' +
          '<div class="stmt-box" id="nexusText">' + this._buildNexusTemplate(ratings, answers) + '</div>' +
          '<button class="copy-btn" data-action="copy-el" data-target="nexusText" style="margin-top:.5rem">\uD83D\uDCCB Copy Nexus Framework</button></div>';
      }

      html += '</div></div>';
    }

    // ── C&P Tips Panel ──────────────────────────────────────────
    if (Decode38.Features.isAvailable('CP_TIPS')) {
      html += '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="true" tabindex="0">' +
        '<div class="panel-title-wrap"><div class="panel-icon pi-purple">\uD83C\uDFAF</div>' +
        '<div><div class="panel-title">C&P Exam Preparation</div>' +
        '<div class="panel-subtitle">How to give an honest, accurate account that reflects your full functional impact</div></div></div>' +
        '<div class="panel-toggle open">\u25B2</div></div>' +
        '<div class="panel-body open">';

      tips.forEach(function(t, i) {
        html += '<div class="tip' + (t.urgent ? ' urgent' : '') + '"><div class="tip-num">' + (i + 1) + '</div><div class="tip-txt">' + t.text + '</div></div>';
      });

      html += '</div></div>';
    }

    // ── Free Help & Rights Panel ────────────────────────────────
    html += this._buildRightsPanel();

    // ── Restart Button ──────────────────────────────────────────
    html += '<div style="text-align:center;padding:2rem 0">' +
      '<button class="btn-restart" data-action="restart-app">\u2190 Start a New Assessment</button>' +
      '<p style="font-size:.72rem;color:var(--text-light);margin-top:.75rem">Decode38 \u00B7 Educational tool only \u00B7 Not legal or medical advice</p></div>';

    return html;
  },

  // ── Build Nexus Template (sanitized) ────────────────────────────
  _buildNexusTemplate: function(ratings, answers) {
    var esc = this.esc;
    var branch = esc(answers.branch || '[Branch]');
    var start = esc(answers.service_start || '[start]');
    var end = esc(answers.service_end || '[end]');
    var status = answers.service_status || '';
    var guardNote = (status.indexOf('Guard') > -1) ? ' as a National Guard/Reserve member' : '';
    var conditionNames = Object.values(ratings).map(function(r) { return esc(r.name); }).join('; ');

    return 'To Whom It May Concern,\n\n' +
      'I am writing on behalf of my patient [VETERAN NAME], who served in the ' + branch + ' from ' + start + ' to ' + end + guardNote + '.\n\n' +
      'PURPOSE OF LETTER: This letter provides a medical nexus opinion connecting the veteran\'s current diagnoses to their military service, as required for VA disability claims under 38 CFR \u00A7 3.304.\n\n' +
      'CONDITIONS BEING ADDRESSED: ' + conditionNames + '\n\n' +
      'MEDICAL OPINION STANDARD: Under 38 CFR \u00A7 3.102, the standard for service connection is "at least as likely as not" \u2014 meaning a 50% or greater probability that the condition is related to military service. The benefit of the doubt goes to the claimant.\n\n' +
      'MY CLINICAL FINDINGS: [PROVIDER: Describe your examination findings, diagnosed conditions, current symptom severity, and any objective findings relevant to the conditions above]\n\n' +
      'MY NEXUS OPINION: Based on my clinical evaluation, it is my medical opinion that it is at least as likely as not that the veteran\'s [CONDITION(S)] are caused by, related to, or were aggravated beyond their natural progression by the veteran\'s military service, specifically [PROVIDER: cite the relevant in-service events, exposures, or occupational factors from the veteran\'s service history].\n\n' +
      'SUPPORTING RATIONALE: [PROVIDER: Include medical literature, clinical guidelines, or your professional medical reasoning connecting the in-service event to the current diagnosis]\n\n' +
      '[Signature, License Number, Date, Contact Information]\n' +
      '[Print on Official Medical Letterhead]';
  },

  // ── Build Rights Panel (static content) ─────────────────────────
  _buildRightsPanel: function() {
    return '<div class="panel"><div class="panel-head" data-action="toggle-panel" role="button" aria-expanded="false" tabindex="0">' +
      '<div class="panel-title-wrap"><div class="panel-icon pi-green">\uD83E\uDD1D</div>' +
      '<div><div class="panel-title">Free Help &amp; Your Legal Rights</div>' +
      '<div class="panel-subtitle">Accredited organizations and federal protections every veteran should know</div></div></div>' +
      '<div class="panel-toggle">\u25BC</div></div>' +
      '<div class="panel-body">' +
      '<div class="rights-box">' +
      '<div class="rights-box-title">\uD83D\uDEE1\uFE0F Built by Vets Who Know the System \u2014 Free Help Always Exists</div>' +
      '<div class="rights-rule"><div class="rights-rule-icon">\u2014</div><div>VSO representatives from DAV, VFW, American Legion, AMVETS, and similar organizations provide claims assistance at <strong>no cost</strong>. Always.</div></div>' +
      '<div class="rights-rule"><div class="rights-rule-icon">\u2014</div><div>Under <strong>38 U.S.C. \u00A7 5904</strong>, no accredited claims agent or attorney may charge you a fee before your claim is decided. Upfront fees for VA claims help are <strong>illegal</strong>.</div></div>' +
      '<div class="rights-rule"><div class="rights-rule-icon">\u2014</div><div>Attorneys and agents may only be paid from retroactive back pay awarded after a decision \u2014 and those fees are regulated and subject to VA approval.</div></div>' +
      '<div class="rights-rule"><div class="rights-rule-icon">\u2014</div><div>Verify whether anyone helping you is VA-accredited at <a href="https://www.va.gov/ogc/apps/accreditation/index.asp" target="_blank" rel="noopener">va.gov/ogc</a>. If they are not listed, do not pay them.</div></div>' +
      '<div class="rights-rule"><div class="rights-rule-icon">\u2014</div><div>To report a predatory claims service, call the VA Office of General Counsel at <strong>1-800-827-1000</strong> or contact your state attorney general.</div></div>' +
      '<p style="font-size:.75rem;color:#166534;margin-top:.65rem;padding-top:.65rem;border-top:1px solid #BBF7D0">Decode38 will never charge fees tied to your claim, refer you to any service that charges upfront, or profit from your VA claim outcome.</p></div>' +
      '<p style="font-size:.82rem;color:var(--text-mid);margin-bottom:.85rem">The following organizations provide <strong>free, accredited</strong> claims assistance:</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem;font-size:.82rem">' +
      '<div style="background:var(--cream);padding:.85rem;border-radius:3px;border:1px solid var(--cream-dark)"><strong style="display:block;color:var(--navy)">DAV</strong>Disabled American Veterans<br><a href="https://www.dav.org" target="_blank" rel="noopener" style="color:var(--navy-light)">dav.org</a></div>' +
      '<div style="background:var(--cream);padding:.85rem;border-radius:3px;border:1px solid var(--cream-dark)"><strong style="display:block;color:var(--navy)">VFW</strong>Veterans of Foreign Wars<br><a href="https://www.vfw.org" target="_blank" rel="noopener" style="color:var(--navy-light)">vfw.org</a></div>' +
      '<div style="background:var(--cream);padding:.85rem;border-radius:3px;border:1px solid var(--cream-dark)"><strong style="display:block;color:var(--navy)">American Legion</strong>Claims assistance<br><a href="https://www.legion.org" target="_blank" rel="noopener" style="color:var(--navy-light)">legion.org</a></div>' +
      '<div style="background:var(--cream);padding:.85rem;border-radius:3px;border:1px solid var(--cream-dark)"><strong style="display:block;color:var(--navy)">AMVETS</strong>American Veterans<br><a href="https://amvets.org" target="_blank" rel="noopener" style="color:var(--navy-light)">amvets.org</a></div>' +
      '<div style="background:var(--cream);padding:.85rem;border-radius:3px;border:1px solid var(--cream-dark)"><strong style="display:block;color:var(--navy)">VA.gov</strong>File your compensation claim<br><a href="https://www.va.gov/disability" target="_blank" rel="noopener" style="color:var(--navy-light)">va.gov/disability</a></div>' +
      '<div style="background:var(--cream);padding:.85rem;border-radius:3px;border:1px solid var(--cream-dark)"><strong style="display:block;color:var(--navy)">Veterans Crisis Line</strong>Call or text 988<br><span style="color:var(--red)">Press 1 for veterans</span></div>' +
      '</div></div></div>';
  }
};

// ── Event Delegation ──────────────────────────────────────────────
// All interaction is handled here via data-action attributes.
// No inline onclick handlers — CSP script-src 'self' blocks them.
document.addEventListener('click', function(e) {

  // ── data-action routing ─────────────────────────────────────────
  var actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    var action = actionEl.dataset.action;

    // Prevent default on anchor tags to avoid hash navigation
    if (actionEl.tagName === 'A') e.preventDefault();

    switch (action) {
      case 'start-app':
        Decode38.App.startApp();
        return;
      case 'restart-app':
        Decode38.App.restartApp();
        return;
      case 'legal-open':
        Decode38.Legal.open();
        return;
      case 'legal-close':
        Decode38.Legal.close();
        return;
      case 'legal-overlay':
        // Only close if clicking the overlay itself, not the modal content
        if (e.target === actionEl) Decode38.Legal.close();
        return;
      case 'save-api-key':
        Decode38.App.saveApiKey();
        return;
      case 'go-back':
        Decode38.App.goBack();
        return;
      case 'go-next':
        Decode38.App.goNext();
        return;
      case 'run-generate':
        Decode38.App.runGenerate();
        return;
      case 'begin-intake':
        Decode38.App.beginIntake();
        return;
      case 'dismiss-trigger':
        Decode38.App.dismissTriggerWarning();
        return;
      case 'toggle-panel':
        Decode38.UI.togglePanel(actionEl);
        return;
      case 'print-report':
        Decode38.UI.printReport();
        return;
      case 'copy-el':
        Decode38.UI.copyEl(actionEl.dataset.target, actionEl);
        return;
    }
  }

  // ── .opt clicks (answer selections) ─────────────────────────────
  var optBtn = e.target.closest('.opt[data-field]');
  if (optBtn) {
    e.preventDefault();
    e.stopPropagation();
    var id = optBtn.dataset.field;
    var val = optBtn.dataset.val;
    var type = optBtn.dataset.type;
    var answers = Decode38.App._state.answers;
    if (type === 'radio') {
      answers[id] = val;
      optBtn.closest('.options').querySelectorAll('.opt').forEach(function(o) {
        o.classList.remove('sel');
        o.setAttribute('aria-checked', 'false');
        o.setAttribute('tabindex', '-1');
      });
      optBtn.classList.add('sel');
      optBtn.setAttribute('aria-checked', 'true');
      optBtn.setAttribute('tabindex', '0');
    } else {
      if (!Array.isArray(answers[id])) answers[id] = [];
      var arr = answers[id];
      var idx = arr.indexOf(val);
      if (idx > -1) {
        arr.splice(idx, 1);
        optBtn.classList.remove('sel');
        optBtn.setAttribute('aria-checked', 'false');
        var cb = optBtn.querySelector('.check-box');
        if (cb) cb.textContent = '';
      } else {
        arr.push(val);
        optBtn.classList.add('sel');
        optBtn.setAttribute('aria-checked', 'true');
        var cb2 = optBtn.querySelector('.check-box');
        if (cb2) cb2.textContent = '\u2713';
      }
    }
    return;
  }

  var modBtn = e.target.closest('.mod-sel-btn[data-key]');
  if (modBtn) {
    e.preventDefault();
    e.stopPropagation();
    var key = modBtn.dataset.key;
    var sc = Decode38.App._state.selectedConditions;
    var idx2 = sc.indexOf(key);
    if (idx2 > -1) {
      sc.splice(idx2, 1);
      modBtn.classList.remove('active');
      modBtn.setAttribute('aria-checked', 'false');
    } else {
      sc.push(key);
      modBtn.classList.add('active');
      modBtn.setAttribute('aria-checked', 'true');
    }
    return;
  }
});

// Keyboard support for custom controls
document.addEventListener('keydown', function(e) {
  var target = e.target;
  if (!target.closest('.opt[data-field]') && !target.closest('.mod-sel-btn[data-key]')) return;

  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    target.click();
  }

  // Arrow key navigation within radio groups
  if (target.closest('.opt[data-type="radio"]') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    var opts = Array.from(target.closest('.options').querySelectorAll('.opt'));
    var currentIdx = opts.indexOf(target);
    var nextIdx;
    if (e.key === 'ArrowDown') {
      nextIdx = (currentIdx + 1) % opts.length;
    } else {
      nextIdx = (currentIdx - 1 + opts.length) % opts.length;
    }
    opts[nextIdx].focus();
  }
});
