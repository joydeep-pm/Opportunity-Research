# Claude Hooks

Hooks are deterministic guardrails for operations that must happen every time.

## Included Hooks
- `run-quick-verify.sh`
  - Runs build checks and fails fast on breakage.
- `check-protected-paths.sh`
  - Blocks direct edits to sensitive paths unless explicitly allowed.

## Usage
Run manually, or wire to your preferred automation/CI step.

```bash
bash .claude/hooks/check-protected-paths.sh
bash .claude/hooks/run-quick-verify.sh
```

## Notes
- Keep hook logic small and deterministic.
- Avoid long-running hooks in local inner-loop unless required.
