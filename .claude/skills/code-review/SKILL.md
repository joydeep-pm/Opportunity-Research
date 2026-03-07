# Skill: Code Review

## Goal
Run a practical engineer-grade review focused on correctness, regressions, risk, and missing tests.

## Review Order
1. Functional correctness and edge cases.
2. API/schema contract stability.
3. UX behavior and accessibility regressions.
4. Test coverage gaps.
5. Maintainability and clarity.

## Required Output Format
- Findings first, ordered by severity.
- For each finding: file path, risk, and concrete fix.
- If no findings, explicitly say so and list residual risk.

## Commands
```bash
npm run build
npm run test:e2e
```
