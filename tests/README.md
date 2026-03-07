# Test Suite — Knowledge Work Center

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` and configure as needed.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run P0 (critical) tests only
npm run test:e2e:p0

# Run in headed mode (see the browser)
npx playwright test --headed

# Run in debug mode (step through)
npx playwright test --debug

# Run a specific test file
npx playwright test tests/e2e/homepage.spec.ts

# View HTML report after a run
npx playwright show-report
```

## Architecture

```
tests/
├── e2e/                         # End-to-end browser + API tests
│   ├── homepage.spec.ts
│   └── signal-api.spec.ts
├── support/
│   ├── merged-fixtures.ts       # Single test object (mergeTests)
│   ├── fixtures/                # Custom Playwright fixtures
│   ├── factories/               # Faker-based data factories
│   │   └── signal-factory.ts
│   └── helpers/                 # Reusable helper utilities
│       └── api-helpers.ts
└── contract/                    # Pact consumer contract tests (future)
    ├── consumer/
    └── support/
```

### Key Concepts

- **Merged fixtures** (`merged-fixtures.ts`): All tests import `test` and `expect` from here. Combines `@seontechnologies/playwright-utils` (apiRequest, recurse, log) via `mergeTests`.
- **Data factories**: Use `@faker-js/faker` to generate unique, parallel-safe test data. Override only what matters for each test.
- **Helpers**: Reusable API and utility functions for test setup.

## Best Practices

- **Selectors**: Use `data-testid` attributes, not CSS classes.
- **Test format**: Given/When/Then comments in every test.
- **Priority tags**: `[P0]`, `[P1]`, `[P2]`, `[P3]` in test names for selective execution.
- **No hard waits**: Use explicit waits (`waitForSelector`, `expect` with timeout) — never `waitForTimeout`.
- **No shared state**: Each test is independent and self-cleaning.
- **Factories over fixtures**: Use faker-based factories, not static JSON files.
- **API-first setup**: Seed data via API calls, not UI interactions.

## CI Integration

The `playwright.config.ts` is CI-ready:

- `forbidOnly: true` in CI (prevents `.only()` from blocking pipeline)
- `retries: 2` in CI
- `workers: 1` in CI for stability
- Artifacts (screenshots, video, trace) retained on failure
- HTML + JUnit reporters for CI dashboard integration

Upload `test-results/` and `playwright-report/` as CI artifacts on failure.

## Configuration

| Setting | Value |
|---------|-------|
| Action timeout | 15s |
| Navigation timeout | 30s |
| Expect timeout | 10s |
| Test timeout | 60s |
| Base URL | `http://localhost:3000` (or `BASE_URL` env) |
| Browser | Chromium |

## Knowledge Base References

- `@seontechnologies/playwright-utils` — Fixture-based testing utilities
- TEA fragments: `fixture-architecture`, `data-factories`, `playwright-config`, `test-quality`
