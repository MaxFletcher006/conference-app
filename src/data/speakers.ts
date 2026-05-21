export interface Speaker {
  slug:        string;
  initials:    string;
  name:        string;
  title:       string;
  institution: string;
  country:     string;
  flag:        string;
  specialty:   string;
  bio_mn:      string;
  bio_en:      string;
  photo?:      string;
  photoZoom?:  number;
  links?: { type: 'web'|'orcid'|'scholar'; url: string }[];
}

export const speakers: Speaker[] = [
  {
    slug:        'tim-gershon',
    initials:    'TG',
    name:        'Prof. Tim Gershon',
    title:       'Professor',
    institution: 'University of Warwick',
    country:     'United Kingdom',
    flag:        '🇬🇧',
    specialty:   'CP violation in B-meson decays; LHCb Management Team',
    bio_mn: `Их Британийн Варвикийн их сургуулийн физикийн профессор. LHCb хамтын ажиллагааны тэргүүлэгч бөгөөд B-мезоны задаралын CP тэгш хэмийн зөрчлийн судалгааны тэргүүлэх мэргэжилтэн. Матери ба антиматерийн тэгш бус байдлын шалтгааныг тайлах зорилготой хэд хэдэн суурь судалгааг гүйцэтгэсэн.`,
    bio_en: `Professor of Physics at the University of Warwick. Soon to be spokesperson of the LHCb collaboration, renowned for CP-violation measurements in B-meson decays. Has led numerous foundational studies probing the matter–antimatter asymmetry of the universe.`,
    photo: '/speakers/Tim Gershon_Wonder 3.png'
  },
  {
    slug:        'vincenzo-vagnoni',
    initials:    'VV',
    name:        'Prof. Vincenzo Vagnoni',
    title:       'Professor',
    institution: 'INFN Bologna',
    country:     'Italy',
    flag:        '🇮🇹',
    specialty:   'B physics; rare decays; LHCb collaboration',
    bio_mn: `Итали Улсын Болоньягийн Их Сургуулийн профессор. LHCb хамтын ажиллагааны тэргүүлэгч. B-мезоны физик болон ховор задралын хэмжилтийн чиглэлээр мэргэшсэн.`,
    bio_en: `Professor at INFN Bologna, Italy. The spokesperson of the LHCb collaboration. Specialising in B-meson physics and rare-decay experimental analysis.`,
    photo: '/speakers/Vincenzo Vagnoni_OK.png'
  },
  {
    slug: 'jianchun-wang', initials: 'JC',
    name: 'Prof. Jianchun Wang', title: 'Professor',
    institution: 'IHEP, CAS', country: 'China', flag: '🇨🇳',
    specialty: 'LHCb China group; detector and physics analysis',
    bio_mn: `Хятадын ШУА-ийн IHEP-ийн профессор. LHCb-ийн Хятадын бүлгийг тэргүүлэн ажилладаг. Детекторын системийн боловсруулалт болон физикийн шинжилгээний чиглэлд тэргүүлэгч судлаач.`,
    bio_en: `Professor at IHEP, CAS, China. Leads the LHCb Chinese group; expert in detector R&D, integration and physics analysis. Head of the UP/UT sub-detector system.`,
    photo: '/speakers/Jianchun Wang_Wonder 3.png'
  },
  {
    slug: 'tomasz-skwarnicki', initials: 'TS',
    name: 'Prof. Tomasz Skwarnicki', title: 'Professor',
    institution: 'Syracuse University', country: 'USA', flag: '🇺🇸',
    specialty: 'LHCb member; exotic hadron spectroscopy',
    bio_mn: `АНУ-ын Сиракузын их сургуулийн профессор. LHCb-ийн гишүүн. Экзотик адрон болон спектроскопийн тэргүүлэх суддаач. Пентакваркийг нээхэд голлох үүрэг гүйцэтгэсэн.`,
    bio_en: `Professor at Syracuse University, USA. APS Fellow, key role in discovering pentaquarks`,
    photo: '/speakers/Tomasz Skwarnicki_Wonder 3.png'
  },
  {
    slug: 'barbara-sciascia', initials: 'BS',
    name: 'Prof. Barbara Sciascia', title: 'Professor',
    institution: 'INFN Frascati', country: 'Italy', flag: '🇮🇹',
    specialty: 'LHCb physics coordination; charm and beauty decays',
    bio_mn: `INFN Frascati -ийн эрдэмтэн. LHCb-ийн мюоны физикийн программын удирдлагч.`,
    bio_en: `Professor at INFN Frascati. Muon physics leader.`,
    photo: '/speakers/Barbara Sciascia_OK.png'
  },
  {
    slug: 'yiming-li', initials: 'YL',
    name: 'Prof. Yiming Li', title: 'Professor',
    institution: 'IHEP, CAS', country: 'China', flag: '🇨🇳',
    specialty: 'Silicon chip R&D',
    bio_mn: `IHEP-ийн профессор. Цахиурын чипийн хөгжүүлэгч.`,
    bio_en: `Professor at IHEP, CAS. Leading researcher in silicon chip R&D.`,
    photo: '/speakers/Yiming Li_Wonder 3.png'
  },
  {
    slug: 'xuhao-yuan', initials: 'XY',
    name: 'Prof. Xuhao Yuan', title: 'Professor',
    institution: 'IHEP, CAS', country: 'China', flag: '🇨🇳',
    specialty: 'LHCb physics, detector integration.',
    bio_mn: `IHEP-ийн профессор. LHCb спектроскопийн мэргэжилтэн.`,
    bio_en: `Professor at IHEP, CAS. LHCb spectroscopy, detector integration expert.`,
    photo: '/speakers/Xuhao Yuan_Wonder 3.png'
  },
  {
    slug: 'miroslav-saur', initials: 'MS',
    name: 'Prof. Miroslav Saur', title: 'Professor',
    institution: 'Lanzhou University', country: 'China', flag: '🇨🇿',
    specialty: 'LHCb RTA, Allen',
    bio_mn: `Ланьжоугийн их сургуулийн профессор. LHCb-ийн RTA -ийн мэргэжилтэн.`,
    bio_en: `Professor at Lanzhou University. RTA and Allen expert.`,
    photo: '/speakers/Miroslav Saur_Wonder 3.png'
  },
  {
    slug: 'antonio-falabella', initials: 'AF',
    name: 'Dr. Antonio Falabella', title: 'Researcher',
    institution: 'INFN CNAF', country: 'Italy', flag: '🇮🇹',
    specialty: 'Grid and HPC computing for LHCb data processing',
    bio_mn: `INFN CNAF-ийн судлаач. LHCb туршилтын өгөгдлийг боловсруулах grid болон өндөр гүйцэтгэлийн тооцооллын дэд бүтцийн мэргэжилтэн.`,
    bio_en: `Researcher at INFN CNAF. Expert in grid and high-performance computing infrastructure for LHCb data processing.`,
    photo: '/speakers/Antonio Falabella_Wonder 3.png'
  },
  {
    slug: 'marianna-fontana', initials: 'MF',
    name: 'Dr. Marianna Fontana', title: 'Researcher',
    institution: 'INFN Bologna', country: 'Italy', flag: '🇮🇹',
    specialty: 'LHCb RTA and Allen.',
    bio_mn: `INFN Bologna-ийн судлаач. LHCb RTA -ийн мэргэжилтэн.`,
    bio_en: `Researcher at INFN Bologna. Specialises in LHCb real time analysis.`,
    photo: '/speakers/marianna_fontana.png',
    photoZoom: 1.6
  },
  {
    slug: 'da-yu-tou', initials: 'DT',
    name: 'Dr. Da Yu Tou', title: 'Researcher',
    institution: 'Tsinghua University', country: 'China', flag: '🇨🇳',
    specialty: 'LHCb Trigger system expert',
    bio_mn: `Цинхуагийн их сургуулийн судлаач. LHCb -ийн өгөгдлийн сонголтын системийн мэргэжилтэн.`,
    bio_en: `Researcher at Tsinghua University. LHCb trigger and spectroscopy expert.`,
    photo: '/speakers/Da Yu Tou_Wonder 3.png'
  },
  {
    slug: 'patrick-robbe', initials: 'PR',
    name: 'Dr. Patrick Robbe', title: 'Researcher',
    institution: 'IJCLab, Orsay', country: 'France', flag: '🇫🇷',
    specialty: 'LHCb SciFi detector expert',
    bio_mn: `LHCb -ийн дэд системүүдийн эксперт.`,
    bio_en: `Researcher at IJCLab, Orsay, France. Leading expert on the LHCb sub systems and real-time data processing.`,
    photo: '/speakers/Patrick Robbe_OK.png'
  },
  {
    slug: 'saverio-mariani', initials: 'SM',
    name: 'Dr. Saverio Mariani', title: 'Researcher',
    institution: 'INFN Florence', country: 'Italy', flag: '🇮🇹',
    specialty: 'SMOG expert',
    bio_mn: `INFN Florence-ийн судлаач. LHCb -ийн сум бай болон сумын туршилтын мэргэжилтэн`,
    bio_en: `Researcher at INFN Florence. Specialises in the SMOG at LHCb.`,
    photo: '/speakers/Saverio Mariani_Wonder 3.png'
  },
  {
    slug: 'benjamin-audurier', initials: 'BA',
    name: 'Dr. Benjamin Audurier', title: 'Researcher',
    institution: 'IRFU, Saclay', country: 'France', flag: '🇫🇷',
    specialty: 'LHCb fixed-target programme; heavy-ion collisions',
    bio_mn: `CEA-IRFU (Саклэ, Франц)-ийн судлаач. LHCb-ийн тогтмол байн хөтөлбөр болон хүнд ионы мөргөлдөөний физикийн мэргэжилтэн.`,
    bio_en: `Researcher at IRFU, Saclay, France. Expert in the LHCb fixed-target programme and heavy-ion collision physics.`,
    photo: '/speakers/Benjamin Audurier_Wonder 3.png'
  },
  {
    slug: 'enkhbat-tsedenbaljir', initials: 'ET',
    name: 'Dr. Enkhbat Tsedenbaljir', title: 'Лабораторийн эрхлэгч',
    institution: 'Mongolian Academy of Science, IPT', country: 'Mongolia', flag: '🇲🇳',
    specialty: 'Theoretical and High Energy Physics Laboratory, IPT',
    bio_mn: `ШУА-ийн ФТХ-ийн Онол ба Их энергийн физикийн салбарын эрхлэгч.`,
    bio_en: `Head of the Theoretical and High Energy Physics Division at IPT, Mongolia.`,
    photo: '/speakers/enkhbat.png'
  },
  {
    slug: 'baasansuren-batsukh', initials: 'BB',
    name: 'Dr. Baasansuren Batsukh', title: 'Ахлах судлаач',
    institution: 'Mongolian Academy of Science, IPT', country: 'Mongolia', flag: '🇲🇳',
    specialty: 'Head of LHCb group at IPT; Mongolia–CERN liaison',
    bio_mn: `ФТХ-ийн LHCb судалгааны багийн ахлагч бөгөөд Монгол–CERN хамтын ажиллагааны гол холбоос. Монгол Улсыг LHCb туршилтад оруулах, Монголын залуу физикчдийг LHCb хамтын ажиллагаатай холбох ажлыг санаачлан удирдсан.`,
    bio_en: `Head of the LHCb group at IPT and the primary Mongolia–CERN liaison. Pioneered Mongolia's participation in LHCb and connects Mongolian physicists with CERN research groups.`,
    photo: '/speakers/baasansuren1.png'
  },
];
