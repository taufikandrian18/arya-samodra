import { keysWithPrefix } from './lib/media.js';

const rawWorks = [
  { no: '01', id: 'monograph-coffee', name: 'Monograph Coffee', place: 'Tulungagung', type: 'F&B' },
  { no: '02', id: 'smesta-coffee-dining', name: 'Smesta Coffee & Dining', place: 'Surabaya', type: 'F&B' },
  { no: '03', id: 'nooma-resto-jemursari', name: 'Nooma Resto Jemursari', place: 'Surabaya', type: 'F&B' },
  { no: '04', id: 'forenoon-coffee-araya', name: 'Forenoon Coffee Araya', place: 'Malang', type: 'F&B' },
  { no: '05', id: 'handall-coffee', name: 'Handall Coffee', place: 'Malang', type: 'F&B' },
  { no: '06', id: 'bebek-goreng-h-slamet', name: 'Resto Bebek Goreng H. Slamet', place: 'GKB Gresik', type: 'F&B' },
  { no: '07', id: 'cluster-buduran-masterplan', name: 'Masterplan Perumahan Cluster Buduran', place: 'Sidoarjo', type: 'MASTERPLAN' },
  { no: '08', id: 'arya-samodra-hq', name: 'HQ Office Arya Samodra Architects', place: 'Surabaya', type: 'OFFICE' },
  { no: '09', id: 'petrokimia-review', name: 'Review Design Petrokimia', place: 'Gresik', type: 'INDUSTRIAL' },
  { no: '10', id: 'six-nine-coffee-retail', name: 'Six Nine Coffee & Retail', place: 'Bandung', type: 'RETAIL' },
  { no: '11', id: 'araya-resto-kostel', name: 'Araya Resto & Kostel', place: 'Malang', type: 'MIXED USE' },
  { no: '12', id: 'joglo-modern-villa', name: 'Joglo Modern Villa Resort', place: 'Yogyakarta', type: 'RESORT' },
];

export const works = rawWorks.map((w) => {
  const images = keysWithPrefix(`works/${w.id}/`);
  return { ...w, images, cover: images[0] };
});

export const services = [
  { no: '01', name: 'Architectural Design Services', desc: 'Schematic through construction documents for hospitality, retail, office and residential work.' },
  { no: '02', name: 'Masterplan & Urban Design', desc: 'Cluster housing and mixed-use site planning, circulation and phasing.' },
  { no: '03', name: 'Renovation & Redevelopment', desc: 'Adaptive reuse of existing structures, including change of programme.' },
  { no: '04', name: 'Sustainable Design Consultation', desc: 'Passive strategy, envelope and material review against local climate.' },
  { no: '05', name: 'Construction Supervision', desc: 'Site administration, shop drawing review and quality control to handover.' },
];

export const team = [
  { name: 'Ar. Arya Samodra, IAI', role: 'PRINCIPAL ARCHITECT', photo: 'studio/principal' },
  { name: 'Muhammad Ihsan', role: 'ARCHITECT' },
  { name: 'Irene Arlana Olivia', role: 'ARCHITECT' },
  { name: 'Shintya Della Permana', role: 'DESIGNER' },
  { name: 'Elvira Nur Cholida', role: 'DESIGNER' },
  { name: 'Gerard Levinas', role: 'VISUALISER' },
  { name: 'Ahsin Ainan Naim', role: 'DRAFTER' },
];

export const clients = Array.from({ length: 20 }, (_, i) => ({
  key: `clients/client-${String(i + 1).padStart(2, '0')}`,
  name: '',
}));

export const HERO_VIDEO = '/media/legacy-hls/playlist.m3u8';
