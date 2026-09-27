// Site content. The copy lives in src/content/site.json: a snapshot of the
// company-profile transcription (docs/superpowers/specs/2026-09-27-profile-content.md)
// that the CMS build step (scripts/fetch-cms.mjs) replaces with what the client
// has published in WordPress. This module only shapes it for the components.
import content from './content/site.json';
import { asset } from './lib/media.js';

export const hero = {
  ...content.hero,
  poster: asset('media/hero/poster.webp'),
  sources: { 720: asset('media/hero/hero-720.mp4'), 1080: asset('media/hero/hero-1080.mp4') },
};

export const studio = {
  ...content.studio,
  figure: { key: content.studio.figure.image, alt: content.studio.figure.alt, caption: content.studio.figure.caption },
};

export const works = content.works.map((w, i) => ({
  no: String(i + 1).padStart(2, '0'),
  ...w,
  cover: w.images[0],
}));

export const workIds = works.map((w) => w.id);
const byId = new Map(works.map((w) => [w.id, w]));
export const getWork = (id) => byId.get(id) ?? null;

export const focus = { ...content.focus, ids: content.focus.ids.filter((id) => byId.has(id)) };
export const servicesIntro = content.servicesIntro;
export const services = content.services;
export const workflow = content.workflow;
export const teamHeading = content.teamHeading;
export const team = content.team;
export const contact = content.contact;
export const clients = content.clients.map((c) => ({ key: c.image, name: c.name || '' }));
