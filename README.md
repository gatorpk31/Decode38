# Decode38

**Free VA Disability Rating Estimator for Veterans**

Built by veterans who decoded the system. 26 condition modules, 38 CFR Part 4 compliant, with VA language translations, C&P exam prep, and AI-powered personal statements.

## Quick Start

Open `index.html` in a browser. No build step, no server, no dependencies.

For local development:
```bash
# Any static server works
python3 -m http.server 8000
# Then visit http://localhost:8000
```

For deployment: upload all files to Netlify, Vercel, or any static hosting.

## Project Structure

```
Decode38/
  index.html          # Main HTML shell (CSP, crisis banner, legal modal, footer)
  css/styles.css      # All styles (extracted from monolith + accessibility additions)
  js/
    config.js         # Namespace, feature flags, input limits
    storage.js        # localStorage session persistence (72hr expiry)
    ui.js             # DOM rendering, sanitization, accessibility, event delegation
    conditions.js     # 26 condition step definitions (questions, fields, options)
    ratings.js        # 26 rating engines based on 38 CFR Part 4 + combined VA math
    results.js        # Translations, secondary conditions, C&P exam tips
    statement.js      # AI personal statement via Anthropic API (Claude Sonnet)
    app.js            # Main controller (state, navigation, validation, session resume)
  tests/
    test-ratings.html # Browser-based test suite
```

## Features

- **26 Condition Modules**: PTSD, back, knee, tinnitus, sleep apnea, migraines, TBI, hypertension, shoulder, skin, respiratory, feet, hip, elbow/wrist/hand, neck, depression/anxiety, MST, diabetes, heart, GERD/GI, Gulf War illness, cancer, genitourinary, eye, cold injury, radiculopathy
- **VA Language Translations**: Converts everyday descriptions to 38 CFR Part 4 regulatory terminology
- **Combined Rating Math**: Full "Whole Person" calculation with step-by-step breakdown
- **Secondary Conditions**: Identifies related conditions to claim
- **C&P Exam Tips**: Condition-specific preparation guidance
- **AI Personal Statement**: Claude Sonnet-powered draft (user provides own API key)
- **Nexus Letter Framework**: Template for medical providers
- **Session Persistence**: Auto-saves progress with 72-hour expiry
- **Crisis Support**: Persistent 988 Veterans Crisis Line banner
- **Accessibility**: ARIA roles, keyboard navigation, screen reader support, focus management

## Security

- Content Security Policy via meta tag
- XSS prevention: all user input escaped via `esc()` before DOM insertion
- API key scoped to Statement module, never stored in localStorage
- AI prompt uses field whitelist per condition (no arbitrary data reaches API)
- Input length limits on all text fields

## Paywall Infrastructure

Feature flags are built in but disabled (`Decode38.Features.PAYWALL_ENABLED = false`). All features are free. When ready to monetize, set individual feature tiers in `config.js`.

## License

Copyright 2025-2026 Decode38. All rights reserved.
