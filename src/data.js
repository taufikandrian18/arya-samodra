// All site copy, transcribed verbatim from the company profile.
// Source of truth: docs/superpowers/specs/2026-09-27-profile-content.md
import { keysWithPrefix } from './lib/media.js';

export const hero = {
  poster: '/media/hero/poster.webp',
  sources: { 720: '/media/hero/hero-720.mp4', 1080: '/media/hero/hero-1080.mp4' },
  caption: null,
  eyebrow: 'Since 2019 · Surabaya, East Java',
  lines: ['IMAGINE', 'CREATE', 'ELEVATE'],
  lead: 'Beyond structure, we design experiences, blending sustainability with the rhythm of human life.',
  cta: 'View selected works',
  bar: ['7°15′S · 112°45′E', '12 Projects · 05 Services · 07 Members', 'IAI · STRA 2.01.0.0004734'],
};

export const studio = {
  heading: 'Crafting a Legacy Through Human-Centric Design and Strategic Architecture.',
  lead: 'A synergy of strategic business insight and architectural excellence, dedicated to exploring how human behavior shapes the spaces we inhabit.',
  story:
    'OUR STORY began in 2019 with a mission to design architecture that responds to human behavior and its environment. We prioritize comfort, functionality, and a deep connection to human activities. Each project is approached with a commitment to comfort, functionality, and a profound connection to human activities.',
  note: 'As former CEO of Moengkopi Group, Arya Samodra integrates strategic business insight into architecture. This unique perspective makes the studio a key partner in designing high-performance commercial spaces, where business objectives and architectural excellence converge.',
  facts: [
    ['Founded', '2019'],
    ['Base', 'Surabaya'],
    ['Registration', 'IAI'],
    ['Team', '07'],
  ],
  figure: { key: 'studio/interior', alt: 'Studio interior, HQ Office Surabaya', caption: 'HQ OFFICE · SURABAYA' },
  principal: {
    no: '01',
    name: 'Ar. Arya Samodra, IAI',
    fullName: 'Arya Samodra Hening',
    role: 'Principal Architect',
    bio: 'Arya Samodra Hening earned his Bachelor of Architecture from Institut Teknologi Sepuluh Nopember (ITS). He is formally registered with the Indonesian Institute of Architects (IAI) and holds STRA certification, validating his professional credentials in Indonesia.',
    registration: 'STRA No. 2.01.0.0004734',
    record: [
      { title: 'IAI Jatim Award Nominee', detail: 'Category Retail Project (FnB)', year: '2025' },
      { title: 'Top 50 International', detail: 'Competition Tokyo Vertical Cemetery', year: '2017' },
      { title: 'Sou Fujimoto Architects', detail: 'Intern, Selected Works, Tokyo, Japan', year: '2016–2017' },
    ],
    quote:
      "Designing architecture that's sustainable allows spaces to stay present longer, and when rooted in human behavior, it creates experiences that stay not just in memory, but in feeling.",
    photo: 'studio/principal',
    photoAlt: 'Ar. Arya Samodra Hening, IAI',
  },
};

const PRIVATE = 'Private client';

const rawWorks = [
  {
    id: 'arya-samodra-hq',
    name: 'HQ Office Arya Samodra Architects',
    place: 'Surabaya',
    type: 'OFFICE',
    status: 'Built',
    year: '2016',
    client: 'Handal Natsa Kedathon',
    scope: 'Tropical architectural studio design featuring open-plan collaborative workspaces.',
    description:
      'HQ Office Arya Samodra Architect stands as a manifesto of our design philosophy: a tropical sanctuary for collective creativity. The architecture prioritizes an open-plan collaborative workspace, dissolving traditional barriers to encourage fluid dialogue and innovation. By integrating lush greenery, natural ventilation, and honest materiality, the studio breathes with the environment. It is more than an office; it is a living laboratory where architectural thought meets the tactile calm of nature.',
  },
  {
    id: 'petrokimia-review',
    name: 'Review Design Petrokimia',
    place: 'Gresik',
    type: 'PUBLIC',
    status: 'Design proposal',
    year: '2023',
    client: 'PT. Petrokimia Gresik',
    scope: 'Aesthetic facade design and spatial optimization for sports arena.',
    heading: 'Contemporary Facade',
    description:
      "redefines industrial-scale architecture through aesthetic facade design and rigorous spatial optimization. The project focuses on a dynamic exterior 'skin' that provides thermal comfort while articulating a sense of rhythmic movement. Internally, the design prioritizes clear sightlines and efficient flow, transforming the traditional arena into a high-performance environment. It stands as a landmark of modern sport, where structural integrity meets contemporary elegance.",
  },
  {
    id: 'six-nine-coffee-retail',
    name: 'Six Nine Coffee & Retail',
    place: 'Bandung',
    type: 'RETAIL',
    status: 'Work in progress',
    year: '2025',
    client: 'PT. Farrel Pelita Indonesia',
    scope: 'Integrated commercial hub blending urban retail, padel club and contemporary cafe concepts.',
    description:
      'Six Nine: A vibrant integrated hub. The design seamlessly blends urban retail, a padel club, and a contemporary cafe, creating a modular architectural rhythm for active modern lifestyles.',
  },
  {
    id: 'araya-resto-kostel',
    name: 'Araya Resto & Kostel',
    place: 'Malang',
    type: 'MIXED USE',
    status: 'Work in progress',
    year: '2025',
    client: PRIVATE,
    scope: 'Mixed-use development, culinary spaces with efficient co-living units.',
    description:
      'Araya Resto & Kostel is a refined mixed-use development designed to harmonize the vibrancy of culinary spaces with the quiet efficiency of modern co-living. The architecture prioritizes vertical functionality, creating a seamless transition between social dining environments and private residential units. By integrating clean lines with strategic spatial planning, the project offers an urban lifestyle solution that balances communal connection with individual comfort and contemporary ease.',
  },
  {
    id: 'joglo-modern-villa',
    name: 'Joglo Modern Villa & Resort',
    place: 'Yogyakarta',
    type: 'RESORT',
    status: 'Work in progress',
    year: '2025',
    client: PRIVATE,
    scope: 'Reimagining traditional Javanese heritage into a luxury modern resort experience.',
    description:
      'A sophisticated reimagining of Javanese heritage where traditional timber craftsmanship meets luxury resort living. The design honors ancestral wisdom through a modern architectural lens, creating a seamless dialogue between cultural soul and contemporary comfort. By integrating iconic tiered rooflines with expansive open-plan layouts, the resort offers a sanctuary defined by timeless structure, tropical elegance, and a deep connection to the surrounding landscape.',
  },
  {
    id: 'monograph-coffee',
    name: 'Monograph Coffee',
    place: 'Tulungagung',
    type: 'F&B',
    status: 'Built',
    year: '2024',
    client: PRIVATE,
    scope: 'Modern coffee shop transformation focusing on natural lighting and sharp lines.',
    description:
      'A Modern precision, where natural light and clean sharp lines define a quiet architectural clarity. This transformative space celebrates the beauty of simplicity, offering a focused environment for both daily ritual and creative reflection.',
  },
  {
    id: 'smesta-coffee-dining',
    name: 'Smesta Coffee & Dining',
    place: 'Surabaya',
    type: 'F&B',
    status: 'Built',
    year: '2021',
    client: 'Moeng Kopi Corp.',
    scope: 'Restaurant design with a lush modern & artsy atmosphere.',
    description:
      'A contemporary urban retreat exploring light, shadow, and crafted simplicity. Its minimal architecture transitions seamlessly between interior intimacy and the freshness of the outdoors',
  },
  {
    id: 'nooma-resto-jemursari',
    name: 'Nooma Resto Jemursari',
    place: 'Surabaya',
    type: 'F&B',
    status: 'Built',
    year: '2024',
    client: PRIVATE,
    scope: 'Spacious family dining concept prioritizing seamless circulation and comfort.',
    description:
      'NOOMA is conceived as a reinterpretation of contemporary café architecture, one that merges crafted intimacy with spatial openness. The building articulates a sense of calm through measured geometry, a muted palette, and layered textures. Each spatial transition, from entry to courtyard, from interior to terrace is designed to evoke a feeling of warmth and belonging.',
  },
  {
    id: 'forenoon-coffee-araya',
    name: 'Forenoon Coffee Araya',
    place: 'Malang',
    type: 'F&B',
    status: 'Built',
    year: '2024',
    client: PRIVATE,
    scope: 'Boutique cafe design emphasizing industrial textures and facade details.',
    heading: 'Calm Precision',
    description:
      'An architectural embodiment of morning calm. Merging precision in form with material warmth, this urban retreat transforms routine coffee culture into a refined, reflective experience.',
  },
  {
    id: 'handall-coffee',
    name: 'Handall Coffee',
    place: 'Malang',
    type: 'F&B',
    status: 'Built',
    year: '2020',
    client: PRIVATE,
    scope: 'Iconic cafe architecture featuring a bold facade and expansive outdoor seating.',
    description:
      'Handall Coffee is a contemporary urban sanctuary where natural calm meets modern structure. Through an interplay of concrete, wood, and light, the design balances industrial precision with organic warmth, creating a rhythmic dialogue between city life and a peaceful, green atmosphere.',
  },
  {
    id: 'bebek-goreng-h-slamet',
    name: 'Resto Bebek H. Slamet',
    place: 'GKB Gresik',
    type: 'F&B',
    status: 'Built',
    year: '2024',
    client: 'Assalam Sejahtera Group',
    scope: 'Architectural redesign & interior modernization of a traditional culinary brand for urban dining.',
    description:
      'An architectural reinterpretation of a culinary icon. The design bridges the gap between traditional Indonesian heritage and modern urban dining, employing a palette of warm earth tones and refined structural lines. By optimizing spatial flow and integrating natural ventilation, the project creates a contemporary sanctuary for family gatherings.',
  },
  {
    id: 'cluster-buduran-masterplan',
    name: 'Masterplan Perumahan Cluster Buduran',
    place: 'Sidoarjo',
    type: 'MASTERPLAN',
    status: 'Work in progress',
    year: '2025',
    client: 'Rumah Bagus Gresik',
    scope: 'Residential masterplanning, infrastructure layout, and green-focused urban development.',
    description:
      'A vision of contemporary suburban living in Sidoarjo. The design prioritizes a high-quality residential experience by integrating green spines and communal nodes within a secure, gated environment. By optimizing land efficiency without sacrificing openness, the layout ensures natural light and ventilation for every unit. This masterplan creates a sustainable urban ecosystem, a neighborhood designed for long-term growth, safety, and a deep sense of community.',
  },
];

export const works = rawWorks.map((w, i) => {
  const images = keysWithPrefix(`works/${w.id}/`);
  return { no: String(i + 1).padStart(2, '0'), ...w, images, cover: images[0] };
});

export const workIds = works.map((w) => w.id);
const byId = new Map(works.map((w) => [w.id, w]));
export const getWork = (id) => byId.get(id) ?? null;

// In Focus: a curated run of projects with the strongest (highest-resolution)
// photography, shown as horizontal panes. Edit the list to change the run.
export const focus = {
  label: 'IN FOCUS',
  ids: ['araya-resto-kostel', 'joglo-modern-villa', 'six-nine-coffee-retail', 'monograph-coffee', 'arya-samodra-hq', 'bebek-goreng-h-slamet'],
};

export const servicesIntro =
  'We transform visionary concepts into enduring spaces through a comprehensive suite of architectural services.';

export const services = [
  { no: '01', name: 'Architectural Design', scope: 'Commercial, Residential, Public Area, Landscape, Highrise, Exterior, Interior.' },
  { no: '02', name: 'Masterplan & Urban Design', scope: 'Macro Planning, Circulation, Connectivity, Transportation, Urban Development, Zoning & Phasing.' },
  { no: '03', name: 'Renovation & Redevelopment', scope: 'Revitalization, Adaptive Reuse, Heritage Preservation, Structural & Utility Upgrades.' },
  { no: '04', name: 'Sustainable Design Consult.', scope: 'Natural Lighting, Ventilation, Building Orientation, Energy Efficiency, Green Materials, Design Strategies.' },
  { no: '05', name: 'Construction Supervision', scope: 'On-Site Supervision, Quality Control, Time & Cost Management, Contractor & Vendor Coordination.' },
];

export const workflow = [
  { step: 1, title: 'Discover & Consult', detail: 'Site Survey, Collect Data, Site Analysis, Consultation.' },
  { step: 2, title: 'Initial Quotation', detail: 'Negotiation, Budget Adjustment, Quotation.' },
  { step: 3, title: 'Concept & Design', detail: 'Initial Sketch, Concept Development, 3D Visualization.' },
  { step: 4, title: 'Develop & Document', detail: 'Detailed Design, Construction Drawing, Permit Assistance.' },
  { step: 5, title: 'Execute & Monitor', detail: 'Construction Supervision, Quality Control.' },
  { step: 6, title: 'Deliver & Aftercare', detail: 'Handover, Post Occupancy Evaluation.' },
];

// Profile p.7 heading.
export const teamHeading = 'The People Behind the Vision';

export const team = [
  { no: '02', name: 'Muhammad Ihsan', role: 'Lead Architect', line: 'Ihsan finds beauty in the lines of a sketch and the ritual of morning coffee. He honors the process.', photo: 'team-cutout/muhammad-ihsan' },
  { no: '03', name: 'Irene Arlana Olivia', role: 'Junior Architect', line: 'Lala finds her rhythm in the quiet hum of a model kit, weaving soul into every line and tiny scale.', photo: 'team-cutout/irene-arlana-olivia' },
  { no: '04', name: 'Shintya Della Permana', role: 'Sr. Interior Designer', line: 'Shintya finds beauty in the fold of a fabric and the quiet craft of a space.', photo: 'team-cutout/shintya-della-permana' },
  { no: '05', name: 'Elvira Nur Cholida', role: 'Junior Architect', line: 'Vira traces the soul of a space through raw ink and rough models, loving the grit of the process.', photo: 'team-cutout/elvira-nur-cholida' },
  { no: '06', name: 'Gerard Levinas', role: 'Jr. Interior Designer', line: 'Lives for the tactile spark, finding a quiet rhythm in every raw detail and messy sketch.', photo: 'team-cutout/gerard-levinas' },
  { no: '07', name: 'Ahsin Ainan Naim', role: 'Technical Drafter', line: 'Ahsin navigates the logic of a line, finding a quiet zen in the precision of every technical detail.', photo: 'team-cutout/ahsin-ainan-naim' },
];

const OFFICE = 'Jl. Medayu Selatan XIX No.43, Surabaya, Jawa Timur, Indonesia 60295';

export const contact = {
  heading: 'Get in touch',
  sub: "Let's talk about your project & collaborate with us.",
  channels: [
    { label: 'Email', value: 'architects@aryasamodra.com', href: 'mailto:architects@aryasamodra.com', note: 'Contact us by email, and we will respond shortly.' },
    { label: 'Phone', value: '+62 31-872-1349', href: 'tel:+62318721349', note: 'Call us on weekdays from 9 AM to 5 PM.' },
    { label: 'Mobile', value: '+62 812-3074-4242', href: 'tel:+6281230744242', note: 'Call us on weekdays from 9 AM to 5 PM.' },
    { label: 'Instagram', value: '@arya.architects', href: 'https://instagram.com/arya.architects', note: "Follow our journey, stay tuned for what's next." },
    { label: 'Office', value: OFFICE, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE)}`, note: 'Visit us at our headquarters.' },
  ],
};

export const clients = Array.from({ length: 20 }, (_, i) => ({
  key: `clients/client-${String(i + 1).padStart(2, '0')}`,
  name: '',
}));
