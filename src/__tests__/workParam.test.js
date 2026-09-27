import { readWorkParam, writeWorkParam } from '../lib/workParam.js';

test('reads the work param', () => {
  expect(readWorkParam('?work=handall-coffee')).toBe('handall-coffee');
  expect(readWorkParam('')).toBeNull();
});

test('writes and clears the param, keeping the hash', () => {
  window.history.replaceState(null, '', '/#works');
  writeWorkParam('handall-coffee');
  expect(window.location.search).toBe('?work=handall-coffee');
  expect(window.location.hash).toBe('#works');
  writeWorkParam(null);
  expect(window.location.search).toBe('');
  expect(window.location.hash).toBe('#works');
});
