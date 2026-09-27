// @vitest-environment node
import site from '../../src/content/site.json';
import { validate, resolveImages } from '../fetch-cms.mjs';

test('the committed snapshot is valid CMS content', () => {
  expect(validate(site)).toEqual([]);
});

test('validation names what is missing', () => {
  const errors = validate({ version: 1, works: [{ id: 'Bad Slug', name: 'X', images: [] }], hero: { lines: [] } });
  expect(errors.join('\n')).toMatch(/bad slug/);
  expect(errors.join('\n')).toMatch(/at least one photo/);
  expect(errors.join('\n')).toMatch(/hero headline/);
});

test('imported photos reuse their repo key; new uploads are downloaded as cms/<id>', async () => {
  const c = structuredClone(site);
  c.works[0].images = [
    { id: 5, url: 'https://x/a.jpg', key: 'works/araya-resto-kostel/01', modified: 1 },
    { id: 99, url: 'https://x/new.jpg', key: '', modified: 2 },
  ];
  c.studio.figure.image = { id: 7, url: 'https://x/s.jpg', key: 'studio/interior', modified: 1 };
  c.studio.principal.photo = null;
  c.team = [];
  c.clients = [];
  const seen = [];
  await resolveImages(c, async (img) => (seen.push(img.id), `cms/${img.id}`));
  expect(c.works[0].images).toEqual(['works/araya-resto-kostel/01', 'cms/99']);
  expect(c.studio.figure.image).toBe('studio/interior');
  expect(seen).toEqual([99]);
});
