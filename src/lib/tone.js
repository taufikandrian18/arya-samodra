// Which tone ('dark' | 'light') sits under the header's baseline at y.
export function toneAt(sections, y = 30) {
  const hit = sections.find((s) => s.top <= y && s.bottom > y);
  return hit ? hit.tone : 'dark';
}
