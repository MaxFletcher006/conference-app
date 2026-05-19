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
    specialty:   'CP violation in B-meson decays; LHCb leadership',
    bio_mn: `Их Британийн Варвикийн их сургуулийн физикийн профессор. LHCb хамтын ажиллагааны тэргүүлэгч эрдэмтэн бөгөөд B-мезоны задаралд CP тэгш хэмгүйдлийн судалгааны чиглэлээр дэлхийд тэргүүлэгч мэргэжилтэн. Матери ба антиматерийн тэгш бус байдлын шалтгааныг тайлах зорилготой хэд хэдэн суурь судалгааг удирдан гүйцэтгэсэн.`,
    bio_en: `Professor of Physics at the University of Warwick. A leading figure in the LHCb collaboration, renowned for CP-violation measurements in B-meson decays. Has led numerous foundational studies probing the matter–antimatter asymmetry of the universe.`,
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
    bio_mn: `Итали Улсын Болонья хотын INFN судалгааны хүрээлэнгийн профессор. LHCb хамтын ажиллагааны идэвхтэй гишүүн. B-мезон физик болон ховор задарлын туршилтын шинжилгээгээр мэргэшсэн.`,
    bio_en: `Professor at INFN Bologna, Italy. Active member of the LHCb collaboration, specialising in B-meson physics and rare-decay experimental analysis.`,
    photo: '/speakers/Vincenzo Vagnoni_OK.png'
  },
  {
    slug: 'jianchun-wang', initials: 'JW',
    name: 'Prof. Jianchun Wang', title: 'Professor',
    institution: 'IHEP, CAS', country: 'China', flag: '🇨🇳',
    specialty: 'LHCb China group; detector and physics analysis',
    bio_mn: `Хятадын ШУА-ийн IHEP-ийн профессор. LHCb-ийн Хятадын бүлгийг тэргүүлэн ажилладаг. Детекторын системийн боловсруулалт болон физикийн шинжилгээний чиглэлд тэргүүлэгч судлаач.`,
    bio_en: `Professor at IHEP, CAS, China. Leads the LHCb China group; expert in detector development and physics analysis.`,
    photo: '/speakers/Jianchun Wang_Wonder 3.png'
  },
  {
    slug: 'tomasz-skwarnicki', initials: 'TS',
    name: 'Prof. Tomasz Skwarnicki', title: 'Professor',
    institution: 'Syracuse University', country: 'USA', flag: '🇺🇸',
    specialty: 'LHCb founding member; exotic hadron spectroscopy',
    bio_mn: `АНУ-ын Сиракузын их сургуулийн профессор. LHCb-ийн үүсгэн байгуулагч гишүүн. Экзотик адрон спектроскопийн тэргүүлэгч эрдэмтэн — пентакварк, тетракварк нээхэд гол үүрэг гүйцэтгэсэн.`,
    bio_en: `Professor at Syracuse University, USA. Founding member of LHCb; pioneer of exotic hadron spectroscopy — key role in discovering pentaquarks and tetraquarks.`,
    photo: '/speakers/Tomasz Skwarnicki_Wonder 3.png'
  },
  {
    slug: 'barbara-sciascia', initials: 'BS',
    name: 'Prof. Barbara Sciascia', title: 'Professor',
    institution: 'INFN Frascati', country: 'Italy', flag: '🇮🇹',
    specialty: 'LHCb physics coordination; charm and beauty decays',
    bio_mn: `INFN Frascati лабораторийн профессор. LHCb-ийн физикийн зохицуулалтын удирдлагуудын нэг. Чарм кваркийн физик болон гоо задарлын судалгааны мэргэжилтэн.`,
    bio_en: `Professor at INFN Frascati. Physics coordination leader in LHCb; specialises in charm and beauty decay analyses.`,
    photo: '/speakers/Barbara Sciascia_OK.png'
  },
  {
    slug: 'yiming-li', initials: 'YL',
    name: 'Prof. Yiming Li', title: 'Professor',
    institution: 'IHEP, CAS', country: 'China', flag: '🇨🇳',
    specialty: 'Particle physics and AI; big data in HEP',
    bio_mn: `IHEP-ийн профессор. Бөөмийн физикт хиймэл оюун болон их өгөгдлийн аналитикийг нэвтрүүлэх судалгааны тэргүүлэгч мэргэжилтэн.`,
    bio_en: `Professor at IHEP, CAS. Leading researcher in applying AI and big-data analytics to particle physics experiments.`,
    photo: '/speakers/Yiming Li_Wonder 3.png'
  },
  {
    slug: 'xuhao-yuan', initials: 'XY',
    name: 'Prof. Xuhao Yuan', title: 'Professor',
    institution: 'IHEP, CAS', country: 'China', flag: '🇨🇳',
    specialty: 'LHCb charm physics; BESIII collaboration',
    bio_mn: `IHEP-ийн профессор. LHCb туршилт дахь чарм физикийн шинжилгээ болон BESIII хамтын ажиллагааны идэвхтэй гишүүн.`,
    bio_en: `Professor at IHEP, CAS. Active in LHCb charm physics analysis and the BESIII collaboration.`,
    photo: '/speakers/Xuhao Yuan_Wonder 3.png'
  },
  {
    slug: 'miroslav-saur', initials: 'MS',
    name: 'Prof. Miroslav Saur', title: 'Professor',
    institution: 'Lanzhou University', country: 'China', flag: '🇨🇳',
    specialty: 'Heavy-ion and fixed-target physics in LHCb',
    bio_mn: `Ланьжоугийн их сургуулийн профессор. LHCb-ийн хүнд ионы мөргөлдөөн болон тогтмол байн дахь физикийн судалгааны мэргэжилтэн.`,
    bio_en: `Professor at Lanzhou University. Specialises in heavy-ion and fixed-target physics within the LHCb programme.`,
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
    specialty: 'LHCb detector operations; silicon tracker systems',
    bio_mn: `INFN Bologna-ийн судлаач. LHCb детекторын операцийн болон цахиурын мөрдөгчийн системийн мэргэжилтэн.`,
    bio_en: `Researcher at INFN Bologna. Specialises in LHCb detector operations and silicon tracker systems.`,
    // photo: '/speakers/marianna-fontana.jpg' // Missing image
  },
  {
    slug: 'da-yu-tou', initials: 'DT',
    name: 'Dr. Da Yu Tou', title: 'Researcher',
    institution: 'Tsinghua University', country: 'China', flag: '🇨🇳',
    specialty: 'Machine learning for particle identification in LHCb',
    bio_mn: `Цинхуагийн их сургуулийн судлаач. LHCb туршилт дахь бөөмсийн таних тэмдгийн машин сургалтын аргаар шинжлэх мэргэжилтэн.`,
    bio_en: `Researcher at Tsinghua University. Applies machine learning to particle identification in LHCb.`,
    photo: '/speakers/Da Yu Tou_Wonder 3.png'
  },
  {
    slug: 'patrick-robbe', initials: 'PR',
    name: 'Dr. Patrick Robbe', title: 'Researcher',
    institution: 'IJCLab, Orsay', country: 'France', flag: '🇫🇷',
    specialty: 'LHCb trigger system and online data processing',
    bio_mn: `IJCLab (Орсэ, Франц)-ийн судлаач. LHCb-ийн өдөөгч систем болон онлайн өгөгдөл боловсруулалтын тэргүүлэгч мэргэжилтэн.`,
    bio_en: `Researcher at IJCLab, Orsay, France. Leading expert on the LHCb trigger system and real-time online data processing.`,
    photo: '/speakers/Patrick Robbe_OK.png'
  },
  {
    slug: 'saverio-mariani', initials: 'SM',
    name: 'Dr. Saverio Mariani', title: 'Researcher',
    institution: 'INFN Florence', country: 'Italy', flag: '🇮🇹',
    specialty: 'CP violation measurements in B-meson decays',
    bio_mn: `INFN Florence-ийн судлаач. B-мезоны задаралд CP тэгш хэмгүйдлийн хэмжилтийн судалгаанд мэргэшсэн.`,
    bio_en: `Researcher at INFN Florence. Specialises in precision CP-violation measurements in B-meson decays.`,
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
    name: 'Д-р Энхбат Цэдэнбалжир', title: 'Лабораторийн эрхлэгч',
    institution: 'ШУА-ийн Физик, Технологийн Хүрээлэн', country: 'Mongolia', flag: '🇲🇳',
    specialty: 'Theoretical and High Energy Physics Laboratory, IPT',
    bio_mn: `ШУА-ийн ФТХ-ийн Онолын болон Өндөр Энергийн Физикийн лабораторийн эрхлэгч. Монгол Улс дахь өндөр энергийн физикийн судалгааг хөгжүүлэх, олон улсын хамтын ажиллагааг өргөжүүлэхэд тэргүүлэгч үүрэг гүйцэтгэж байна.`,
    bio_en: `Head of the Theoretical and High Energy Physics Laboratory at IPT, Mongolia. Leading the development of HEP research and international partnerships in Mongolia.`,
    photo: '/speakers/enkhbat.png'
  },
  {
    slug: 'baasansuren-batsukh', initials: 'BB',
    name: 'Д-р Баасансүрэн Батсүх', title: 'Ахлах судлаач',
    institution: 'ШУА-ийн Физик, Технологийн Хүрээлэн', country: 'Mongolia', flag: '🇲🇳',
    specialty: 'Head of LHCb group at IPT; Mongolia–CERN liaison',
    bio_mn: `ФТХ-ийн LHCb бүлгийн ахлагч бөгөөд Монгол–CERN хамтын ажиллагааны гол холбоос. Монгол Улсыг LHCb туршилтад оруулах, Монголын залуу физикчдийг CERN-ийн судалгааны бүлгүүдтэй холбох ажлыг санаачлан удирдсан.`,
    bio_en: `Head of the LHCb group at IPT and the primary Mongolia–CERN liaison. Pioneered Mongolia's participation in LHCb and connects Mongolian physicists with CERN research groups.`,
    photo: '/speakers/baasansuren1.png'
  },
];
