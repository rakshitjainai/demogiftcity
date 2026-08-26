# Final Release Implementation Plan

## Goal Description

Perform the final production readiness tasks for the RegMate application as requested:
1. Review and finalize the audit report.
2. Apply any required fixes identified by the audit (UI visibility of mock‑test cards, payment validation enum mismatch, content & difficulty classification issues, etc.).
3. Run a real end‑to‑end smoke test covering authentication, entitlement, payment, mock‑test access, mobile responsiveness, and console errors.
4. Deploy the verified code to GitHub (and to the production environment).

## User Review Required

> [!IMPORTANT]
> The plan includes actions that will modify live source files and push commits to the repository. Please confirm:
> - The correct Git remote URL to push to (e.g., `git@github.com:your-org/regmate.git`).
> - Whether you want the CI/CD pipeline to be triggered after the push, or prefer a manual deployment step.
> - Availability of Razorpay test‑mode credentials for the payment‑flow smoke test.

## Open Questions

> [!QUESTION]
> 1. What is the Git remote URL for the repository?
> 2. Should the CI/CD pipeline be triggered after push, or do you prefer a manual deployment step?
> 3. Do you have Razorpay test‑mode `key_id` and `key_secret` set in the environment, or should we use placeholder values?
> 4. Are there any additional domains or subdomains (e.g., staging) that need to be verified during the smoke test?

## Proposed Changes

---
### UI – Practice Page Mock‑Test Cards

- **[MODIFY]** `client/src/pages/practice/index.tsx` (or the relevant component) to replace the tab‑style selector with two independent card components for **FME Mock Test** and **CMI Mock Test**.
- Add clear headings, icons, and CTA buttons on each card.
- Ensure both cards are visible on initial page load and are fully responsive.

---
### Payment Validation – productType Enum

- **[MODIFY]** `client/src/utils/razorpay.js` (if needed) to confirm the payload uses `productType: "exam_pass"` for the FME mock test and `productType: "membership"` for the all‑access membership.
- **[VERIFY]** `server/models/Payment.js` already lists `"exam_pass"` in the enum; no change required unless mismatched elsewhere.
- Add comments explaining the accepted enum values for future maintainers.

---
### Content & Difficulty Audit

- **[CREATE]** `docs/Final_Content_Quality_Audit.md` summarizing the difficulty distribution, source‑verified vs derived classifications, and any adjustments made.
- Update any JSON files (`reglearn-fme-content-final.json`) if necessary to reflect correct `difficulty`, `difficulty_basis`, and `source-verified` flags.

---
### Smoke Test Automation Script

- **[NEW]** `scripts/smoke_test.ps1` (PowerShell) that:
  1. Starts the dev server (`npm install && npm run dev`).
  2. Performs HTTP requests to verify:
     - Public access to Q1 & Q2.
     - Locked status of Q3.
     - Payment flow (Razorpay test mode) and entitlement creation.
     - Unlocking of Q3 after purchase.
     - Refresh token handling.
     - Loading of the 100‑question test and scoring.
     - Responsive breakpoints at 320px, 375px, 430px.
     - Official‑text resolver endpoint.
  3. Checks console output for errors.
- The script will exit with status 0 on success, non‑zero on failure.

---
### Deployment

- **[NEW]** Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) if not present, to build and deploy the app to Vercel on push to `main`.
- Ensure the workflow uses the Razorpay test keys from repository secrets.

## Verification Plan

### Automated Tests
- Run `scripts/smoke_test.ps1` locally after applying code changes.
- Execute `npm test` (if unit tests exist).

### Manual Verification
- Open the app in a browser (desktop and mobile emulation) and manually check:
  * Visibility of both mock‑test cards.
  * Payment modal flow completes without validation errors.
  * Entitlement correctly unlocks Q3.
  * Responsiveness at required breakpoints.
  * No console errors.

Once all checks pass and the open questions are answered, we will push the changes and trigger deployment.
