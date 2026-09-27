// @vitest-environment node
import * as d from '../data.js';
import { glob, read } from '../test/fsHelpers.js';

test('facts match the company profile', () => {
  expect(d.works.map((w) => w.id)).toEqual([
    'arya-samodra-hq', 'petrokimia-review', 'six-nine-coffee-retail', 'araya-resto-kostel', 'joglo-modern-villa', 'monograph-coffee',
    'smesta-coffee-dining', 'nooma-resto-jemursari', 'forenoon-coffee-araya', 'handall-coffee', 'bebek-goreng-h-slamet', 'cluster-buduran-masterplan',
  ]);
  expect(d.contact.channels.find((c) => c.label === 'Email').value).toBe('architects@aryasamodra.com');
  expect(d.contact.channels.find((c) => c.label === 'Instagram').value).toBe('@arya.architects');
  expect(d.studio.facts).toContainEqual(['Founded', '2019']);
  expect(d.team).toHaveLength(6);
  expect(d.workflow).toHaveLength(6);
  for (const w of d.works) expect(w.images.length, w.id).toBeGreaterThan(0);
  for (const w of d.works) expect(['Built', 'Work in progress', 'Design proposal']).toContain(w.status);
});

test('private individuals are not named', () => {
  const src = read('src/content/site.json');
  for (const name of ['Aiwa Sanjaya', 'H. Baskoro', 'Wisnu Wardhana', 'Nadira', 'Mr. Rizal']) expect(src).not.toContain(name);
});

test('demo inventions are gone from the source', () => {
  for (const f of glob('src', ['.js', '.jsx', '.json'])) {
    if (f.includes('media/manifest')) continue;
    if (f.includes('__tests__')) continue;
    expect(read(f), f).not.toMatch(/studio@aryasamodra\.co\.id|aryasamodra\.architects|Est\. 2018|standing light|VISUALISER/);
  }
});
