export const works = [
  { no: '01', name: 'Monograph Coffee', place: 'Tulungagung', type: 'F&B', img: '/assets/p47-1.png' },
  { no: '02', name: 'Smesta Coffee & Dining', place: 'Surabaya', type: 'F&B', img: '/assets/p47-2.png' },
  { no: '03', name: 'Nooma Resto Jemursari', place: 'Surabaya', type: 'F&B', img: '/assets/p36-1.png' },
  { no: '04', name: 'Forenoon Coffee Araya', place: 'Malang', type: 'F&B', img: '/assets/p36-2.png' },
  { no: '05', name: 'Handall Coffee', place: 'Malang', type: 'F&B', img: '/assets/p31-2.png' },
  { no: '06', name: 'Resto Bebek Goreng H. Slamet', place: 'GKB Gresik', type: 'F&B', img: '/assets/p53-1.png' },
  { no: '07', name: 'Masterplan Perumahan Cluster Buduran', place: 'Sidoarjo', type: 'MASTERPLAN', img: '/assets/p21-1.png' },
  { no: '08', name: 'HQ Office Arya Samodra Architects', place: 'Surabaya', type: 'OFFICE', img: '/assets/p8-1.png' },
  { no: '09', name: 'Review Design Petrokimia', place: 'Gresik', type: 'INDUSTRIAL', img: '/assets/p26-1.png' },
  { no: '10', name: 'Six Nine Coffee & Retail', place: 'Bandung', type: 'RETAIL', img: '/assets/p18-1.png' },
  { no: '11', name: 'Araya Resto & Kostel', place: 'Malang', type: 'MIXED USE', img: '/assets/p31-1.png' },
  { no: '12', name: 'Joglo Modern Villa Resort', place: 'Yogyakarta', type: 'RESORT', img: '/assets/p18-2.png' },
];

export const services = [
  { no: '01', name: 'Architectural Design Services', desc: 'Schematic through construction documents for hospitality, retail, office and residential work.' },
  { no: '02', name: 'Masterplan & Urban Design', desc: 'Cluster housing and mixed-use site planning, circulation and phasing.' },
  { no: '03', name: 'Renovation & Redevelopment', desc: 'Adaptive reuse of existing structures, including change of programme.' },
  { no: '04', name: 'Sustainable Design Consultation', desc: 'Passive strategy, envelope and material review against local climate.' },
  { no: '05', name: 'Construction Supervision', desc: 'Site administration, shop drawing review and quality control to handover.' },
];

export const team = [
  { name: 'Ar. Arya Samodra, IAI', role: 'PRINCIPAL ARCHITECT', photo: '/assets/p7-1.png' },
  { name: 'Muhammad Ihsan', role: 'ARCHITECT' },
  { name: 'Irene Arlana Olivia', role: 'ARCHITECT' },
  { name: 'Shintya Della Permana', role: 'DESIGNER' },
  { name: 'Elvira Nur Cholida', role: 'DESIGNER' },
  { name: 'Gerard Levinas', role: 'VISUALISER' },
  { name: 'Ahsin Ainan Naim', role: 'DRAFTER' },
];

export const clients = Array.from(
  { length: 20 },
  (_, i) => `/assets/clients/client-${String(i + 1).padStart(2, '0')}.png`
);

export const HERO_VIDEO = '/assets/hls/playlist.m3u8';
