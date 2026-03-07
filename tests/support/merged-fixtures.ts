import { mergeTests } from '@playwright/test';
import { test as apiRequestFixture } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures';
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures';

export const test = mergeTests(apiRequestFixture, recurseFixture, logFixture);

export { expect } from '@playwright/test';
