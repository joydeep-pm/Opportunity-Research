# Lessons

## 2026-03-05 - Avoid multi-app deployment ambiguity
- Trigger: User reported repeated Vercel detection/build errors and confusion from multiple app directories.
- Mistake pattern: Keeping multiple deployable app roots in one repo without a clearly enforced single deployment target.
- Preventive rule: Default to one canonical app at repository root for production deploys; keep experiments in clearly named legacy folders and document non-deploy status.
- Preventive rule: Keep `vercel.json` minimal unless custom build routing is truly required.
- Preventive rule: Validate with root `npm run build` before asking user to redeploy.
