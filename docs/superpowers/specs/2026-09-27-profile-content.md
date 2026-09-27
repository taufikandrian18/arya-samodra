# Site content: transcribed from the company profile

Source: `assets-src/profile/company-profile.pdf` ("[FINAL] Company Profile", Adobe Illustrator, 64 pp., March 2026). Most text in the PDF is outlined, so it was transcribed visually on 2026-09-27. **This file is the source of truth for `src/data.js`.** Copy verbatim, including the client's own spelling ("Handall").

Markers: **[verify]** means the reading is uncertain. **[private]** means a private individual's name: publish only with client approval; until then the site shows "Private client".

## Brand

- Wordmark: `ARYA SAMODRA ARCHITECTS®` followed by a full-width hairline rule (every page header).
- Monogram: custom "A" glyph (cover, back cover, page footers). **Needed from client as SVG**; not extracted.
- Legal entity: PT. ARYA SAMODRA ARCHITECTS
- Typeface: Space Grotesk (Light for display; the PDF embeds `SpaceGrotesk-Light`).
- Colours sampled from the PDF:
  - navy `#0A1E3F` (cover, manifesto, services, back cover; gradient down to `#06152C`)
  - warm grey `#DAD9D7` (project pages)
  - terracotta `#9D5338` (headings on white, contact page, status tags)
  - white
- Footer line (every page): `arya samodra hening · studio capability statement · manifesto · ©2026`

## Hero / manifesto (p.2–3)

- Manifesto (p.2): "Beyond structure, we design experiences, blending sustainability with the rhythm of human life."
- Hero triad (p.3, over the Araya facade): "IMAGINE / CREATE / ELEVATE"

## About us (p.6)

- Heading: "Crafting a Legacy Through Human-Centric Design and Strategic Architecture."
- Lead: "A synergy of strategic business insight and architectural excellence, dedicated to exploring how human behavior shapes the spaces we inhabit."
- Story: "OUR STORY began in 2019 with a mission to design architecture that responds to human behavior and its environment. We prioritize comfort, functionality, and a deep connection to human activities. Each project is approached with a commitment to comfort, functionality, and a profound connection to human activities."
- Principal: "As former CEO of Moengkopi Group, Arya Samodra integrates strategic business insight into architecture. This unique perspective makes the studio a key partner in designing high-performance commercial spaces, where business objectives and architectural excellence converge."

## Principal (p.7): "The People Behind the Vision"

- Name: **Ar. Arya Samodra, IAI** (full name: Arya Samodra Hening). Number 01.
- Role: Principal Architect of PT. ARYA SAMODRA ARCHITECTS
- Bio: "Arya Samodra Hening earned his Bachelor of Architecture from Institut Teknologi Sepuluh Nopember (ITS). He is formally registered with the Indonesian Institute of Architects (IAI) and holds STRA certification, validating his professional credentials in Indonesia."
- Registration: Surat Tanda Registrasi Arsitek No. 2.01.0.0004734 (IAI)
- Record:
  - IAI Jatim Award Nominee, Category Retail Project (FnB) [2025]
  - Top 50 International, Competition Tokyo Vertical Cemetery [2017]
  - Sou Fujimoto Architects, Intern, Selected Works, Tokyo, Japan [2016–2017]
- Quote: "Designing architecture that's sustainable allows spaces to stay present longer, and when rooted in human behavior, it creates experiences that stay not just in memory, but in feeling."

## Our Studio (p.8)

- Address: Jl. Medayu Selatan XIX No.43, Medokan Ayu, Kec. Rungkut, Surabaya, Jawa Timur, Indonesia 60295

## Our Team (p.9)

| No | Name | Role | Line |
| --- | --- | --- | --- |
| 02 | Muhammad Ihsan | Lead Architect | Ihsan finds beauty in the lines of a sketch and the ritual of morning coffee. He honors the process. |
| 03 | Irene Arlana Olivia | Junior Architect | Lala finds her rhythm in the quiet hum of a model kit, weaving soul into every line and tiny scale. |
| 04 | Shintya Della Permana | Sr. Interior Designer | Shintya finds beauty in the fold of a fabric and the quiet craft of a space. |
| 05 | Elvira Nur Cholida | Junior Architect | Vira traces the soul of a space through raw ink and rough models, loving the grit of the process. |
| 06 | Gerard Levinas | Jr. Interior Designer | Lives for the tactile spark, finding a quiet rhythm in every raw detail and messy sketch. |
| 07 | Ahsin Ainan Naim | Technical Drafter | Ahsin navigates the logic of a line, finding a quiet zen in the precision of every technical detail. |

The PDF prints 02, 05, 06, 06, 07, 07. The site renumbers 02–07 in the order above: **[verify]** order with the client.

Portrait sizes in the PDF: Shintya 1252×1583, Ihsan 676×855, Irene 460×581, Elvira 338×427, Ahsin 295×373, Gerard 252×319. **The last three are too small for sharp cards; ask for originals.**

## Services (p.10): "What we do"

Intro: "We transform visionary concepts into enduring spaces through a comprehensive suite of architectural services."

| No | Service | Scope line |
| --- | --- | --- |
| 01 | Architectural Design | Commercial, Residential, Public Area, Landscape, Highrise, Exterior, Interior. |
| 02 | Masterplan & Urban Design | Macro Planning, Circulation, Connectivity, Transportation, Urban Development, Zoning & Phasing. |
| 03 | Renovation & Redevelopment | Revitalization, Adaptive Reuse, Heritage Preservation, Structural & Utility Upgrades. |
| 04 | Sustainable Design Consult. | Natural Lighting, Ventilation, Building Orientation, Energy Efficiency, Green Materials, Design Strategies. |
| 05 | Construction Supervision | On-Site Supervision, Quality Control, Time & Cost Management, Contractor & Vendor Coordination. |

## Workflow (p.11)

| Step | Title | Detail |
| --- | --- | --- |
| 1 | Discover & Consult | Site Survey, Collect Data, Site Analysis, Consultation. |
| 2 | Initial Quotation | Negotiation, Budget Adjustment, Quotation. |
| 3 | Concept & Design | Initial Sketch, Concept Development, 3D Visualization. |
| 4 | Develop & Document | Detailed Design, Construction Drawing, Permit Assistance. |
| 5 | Execute & Monitor | Construction Supervision, Quality Control. |
| 6 | Deliver & Aftercare | Handover, Post Occupancy Evaluation. |

## Selected Works (p.12–61), in the profile's order

`type` is not in the PDF; it is the site's filter taxonomy (kept from the demo except Petrokimia, see note). `status` is the PDF's bracket tag.

| # | id | Name (as on project page) | Place | Type | Status | Year | Client | Scope |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | arya-samodra-hq | HQ Office Arya Samodra Architects | Surabaya | OFFICE | Built | 2016 | Handal Natsa Kedathon **[verify]** | Tropical architectural studio design featuring open-plan collaborative workspaces. |
| 02 | petrokimia-review | Review Design Petrokimia | Gresik | PUBLIC **[verify: demo said INDUSTRIAL; the project is a sports-arena facade]** | Design Proposal | 2023 | PT. Petrokimia Gresik | Aesthetic facade design and spatial optimization for sports arena. |
| 03 | six-nine-coffee-retail | Six Nine Coffee & Retail | Bandung | RETAIL | Work in progress | 2025 | PT. Farrel Pelita Indonesia | Integrated commercial hub blending urban retail, padel club and contemporary cafe concepts. |
| 04 | araya-resto-kostel | Araya Resto & Kostel | Malang | MIXED USE | Work in progress | 2025 | Mrs. Aiwa Sanjaya **[private]** | Mixed-use development, culinary spaces with efficient co-living units. |
| 05 | joglo-modern-villa | Joglo Modern Villa & Resort | Yogyakarta | RESORT | Work in progress | 2025 | Mr. H. Baskoro **[private]** | Reimagining traditional Javanese heritage into a luxury modern resort experience. |
| 06 | monograph-coffee | Monograph Coffee | Tulungagung | F&B | Built | 2024 | Mr. Wisnu Wardhana **[private]** | Modern coffee shop transformation focusing on natural lighting and sharp lines. |
| 07 | smesta-coffee-dining | Smesta Coffee & Dining | Surabaya | F&B | Built | 2021 | Moeng Kopi Corp. | Restaurant design with a lush modern & artsy atmosphere. |
| 08 | nooma-resto-jemursari | Nooma Resto Jemursari | Surabaya | F&B | Built | 2024 | Mrs. Nadira **[private]** | Spacious family dining concept prioritizing seamless circulation and comfort. |
| 09 | forenoon-coffee-araya | Forenoon Coffee Araya | Malang | F&B | Built | 2024 | Mrs. Aiwa Sanjaya **[private]** | Boutique cafe design emphasizing industrial textures and facade details. |
| 10 | handall-coffee | Handall Coffee | Malang | F&B | Built | 2020 | Mr. Rizal **[private]** | Iconic cafe architecture featuring a bold facade and expansive outdoor seating. |
| 11 | bebek-goreng-h-slamet | Resto Bebek H. Slamet (contents page: "Resto Bebek Goreng H. Slamet") | GKB Gresik | F&B | Built | 2024 | Assalam Sejahtera Group | Architectural redesign & interior modernization of a traditional culinary brand for urban dining. |
| 12 | cluster-buduran-masterplan | Masterplan Perumahan Cluster Buduran | Sidoarjo | MASTERPLAN | Work in Progress | 2025 | Rumah Bagus Gresik | Residential masterplanning, infrastructure layout, and green-focused urban development. |

Photo resolution per project (longest edge in the PDF): HQ, Petrokimia, Six Nine, Monograph, Bebek, Masterplan, Araya, Joglo are 2,000–3,840 px. **Smesta, Nooma, Forenoon, Handall top out at 960–1,250 px**: ask for originals of these four.

### Descriptions (verbatim)

- **arya-samodra-hq**: "HQ Office Arya Samodra Architect stands as a manifesto of our design philosophy: a tropical sanctuary for collective creativity. The architecture prioritizes an open-plan collaborative workspace, dissolving traditional barriers to encourage fluid dialogue and innovation. By integrating lush greenery, natural ventilation, and honest materiality, the studio breathes with the environment. It is more than an office; it is a living laboratory where architectural thought meets the tactile calm of nature."
- **petrokimia-review** (heading "Contemporary Facade"): "redefines industrial-scale architecture through aesthetic facade design and rigorous spatial optimization. The project focuses on a dynamic exterior 'skin' that provides thermal comfort while articulating a sense of rhythmic movement. Internally, the design prioritizes clear sightlines and efficient flow, transforming the traditional arena into a high-performance environment. It stands as a landmark of modern sport, where structural integrity meets contemporary elegance."
- **six-nine-coffee-retail**: "Six Nine: A vibrant integrated hub. The design seamlessly blends urban retail, a padel club, and a contemporary cafe, creating a modular architectural rhythm for active modern lifestyles."
- **araya-resto-kostel**: "Araya Resto & Kostel is a refined mixed-use development designed to harmonize the vibrancy of culinary spaces with the quiet efficiency of modern co-living. The architecture prioritizes vertical functionality, creating a seamless transition between social dining environments and private residential units. By integrating clean lines with strategic spatial planning, the project offers an urban lifestyle solution that balances communal connection with individual comfort and contemporary ease."
- **joglo-modern-villa**: "A sophisticated reimagining of Javanese heritage where traditional timber craftsmanship meets luxury resort living. The design honors ancestral wisdom through a modern architectural lens, creating a seamless dialogue between cultural soul and contemporary comfort. By integrating iconic tiered rooflines with expansive open-plan layouts, the resort offers a sanctuary defined by timeless structure, tropical elegance, and a deep connection to the surrounding landscape."
- **monograph-coffee**: "A Modern precision, where natural light and clean sharp lines define a quiet architectural clarity. This transformative space celebrates the beauty of simplicity, offering a focused environment for both daily ritual and creative reflection."
- **smesta-coffee-dining**: "A contemporary urban retreat exploring light, shadow, and crafted simplicity. Its minimal architecture transitions seamlessly between interior intimacy and the freshness of the outdoors"
- **nooma-resto-jemursari**: "NOOMA is conceived as a reinterpretation of contemporary café architecture, one that merges crafted intimacy with spatial openness. The building articulates a sense of calm through measured geometry, a muted palette, and layered textures. Each spatial transition, from entry to courtyard, from interior to terrace is designed to evoke a feeling of warmth and belonging."
- **forenoon-coffee-araya** (heading "Calm Precision"): "An architectural embodiment of morning calm. Merging precision in form with material warmth, this urban retreat transforms routine coffee culture into a refined, reflective experience."
- **handall-coffee**: "Handall Coffee is a contemporary urban sanctuary where natural calm meets modern structure. Through an interplay of concrete, wood, and light, the design balances industrial precision with organic warmth, creating a rhythmic dialogue between city life and a peaceful, green atmosphere."
- **bebek-goreng-h-slamet**: "An architectural reinterpretation of a culinary icon. The design bridges the gap between traditional Indonesian heritage and modern urban dining, employing a palette of warm earth tones and refined structural lines. By optimizing spatial flow and integrating natural ventilation, the project creates a contemporary sanctuary for family gatherings."
- **cluster-buduran-masterplan**: "A vision of contemporary suburban living in Sidoarjo. The design prioritizes a high-quality residential experience by integrating green spines and communal nodes within a secure, gated environment. By optimizing land efficiency without sacrificing openness, the layout ensures natural light and ventilation for every unit. This masterplan creates a sustainable urban ecosystem, a neighborhood designed for long-term growth, safety, and a deep sense of community."

## Get in touch (p.62)

- Heading: "Get in touch". Sub: "Let's talk about your project & collaborate with us."
- Email: architects@aryasamodra.com ("Contact us by email, and we will respond shortly.")
- Phone: +62 31-872-1349 ("Call us on weekdays from 9 AM to 5 PM.")
- Mobile: +62 812-3074-4242 ("Call us on weekdays from 9 AM to 5 PM.")
- Instagram: @arya.architects ("Follow our journey, stay tuned for what's next.")
- Office: Jl. Medayu Selatan XIX No.43, Surabaya, Jawa Timur, Indonesia 60295 ("Visit us at our headquarters.")

## Our Clients (p.63)

20 logos (the demo's `clients/` PNGs). Names are legible on the page if alt text is wanted.

## Corrections vs. the demo site

| Field | Demo | Profile |
| --- | --- | --- |
| Email | studio@aryasamodra.co.id | architects@aryasamodra.com |
| Instagram | @aryasamodra.architects | @arya.architects |
| Phone/mobile | masked | +62 31-872-1349 / +62 812-3074-4242 |
| Founded | Est. 2018 | 2019 |
| Hero line | "Architecture measured in standing light." (invented) | Manifesto + IMAGINE / CREATE / ELEVATE |
| Team roles | Architect/Designer/Visualiser/Drafter | as table above |
| Project order | Monograph first | HQ first (profile order) |
| Photo mapping | demo PNGs labelled by guess; ProjectFocus showed other projects' photos as Araya | `assets-src/profile/profile-map.json` |
