import { faker } from '@faker-js/faker';

export type SignalSection = {
  key: 'fintech-rbi' | 'product';
  title: string;
  body: string;
};

export type SignalResponse = {
  markdown: string;
  sections: SignalSection[];
  exists: boolean;
  updatedAt: string | null;
  source: 'filesystem' | 'memory' | 'none';
  meta?: Record<string, unknown>;
};

export const createSignalSection = (
  overrides: Partial<SignalSection> = {},
): SignalSection => ({
  key: 'fintech-rbi',
  title: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(2),
  ...overrides,
});

export const createSignalResponse = (
  overrides: Partial<SignalResponse> = {},
): SignalResponse => {
  const sections = overrides.sections || [
    createSignalSection({ key: 'fintech-rbi', title: 'Fintech / RBI Window' }),
    createSignalSection({ key: 'product', title: 'Product Window' }),
  ];

  const markdown =
    overrides.markdown ||
    sections.map((s) => `## ${s.title}\n\n${s.body}`).join('\n\n');

  return {
    markdown,
    sections,
    exists: true,
    updatedAt: faker.date.recent().toISOString(),
    source: 'filesystem',
    ...overrides,
  };
};
