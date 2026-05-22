export interface Organization {
  name: string;
  logo: string;
  url: string;
  role: string;
  role_mn: string;
  desc_mn: string;
  desc_en: string;
}

export const partners: Organization[] = [
  {
    name: 'CERN',
    logo: '/logos/cernlogo.png',
    url:  'https://cern.ch',
    role: 'Scientific Partner',
    role_mn: 'Шинжлэх ухааны түнш',
    desc_mn: 'Европын цөмийн судалгааны байгууллага (CERN) нь дэлхийн хамгийн том бөгөөд хамгийн хүчирхэг бөөмийн физикийн судалгааны төв юм. Женев хотод байрлах энэ байгууллага LHC хурдасгуурыг ажиллуулдаг.',
    desc_en: 'The European Organization for Nuclear Research (CERN) is the world\'s largest and most powerful particle physics laboratory. Based in Geneva, it operates the Large Hadron Collider and hosts thousands of scientists from over 100 nationalities.',
  },
  {
    name: 'Science Development Accelerator',
    logo: '/logos/Science Development Accelerator Logo.jpg',
    url:  'https://sciencedev.org',
    role: 'Organizer',
    role_mn: 'Зохион байгуулагч',
    desc_mn: 'Шинжлэх Ухааны Хөгжлийн Хурдасгуур ТББ нь Монгол Улсад шинжлэх ухаан, боловсрол, өндөр технологийн судалгааг дэмжин хөгжүүлэх зорилго бүхий байгууллага. Монголын залуу судлаачдыг CERN зэрэг дэлхийн тэргүүлэгч байгууллагуудтай холбодог.',
    desc_en: "Science Development Accelerator NGO is dedicated to advancing science, education, and high-technology research in Mongolia. One of our core missions is to support collaborations between Mongolian researchers and World's leading scientific institutions such as CERN",
  },
  {
    name: 'IPT',
    logo: '/logos/IPT Logo.jpg',
    url:  'http://ipt.ac.mn',
    role: 'Organizer',
    role_mn: 'Зохион байгуулагч',
    desc_mn: 'Монгол Улсын Шинжлэх Ухааны Академийн Физик, Технологийн Хүрээлэн (ФТХ) нь онолын болон их энергийн физикийн судалгаа явуулдаг. Монгол-CERN хамтын ажиллагааны суурь болох LHCb багийн үйл ажиллагааны төв.',
    desc_en: 'The Institute of Physics and Technology (IPT) of the Mongolian Academy of Sciences conducts research in theoretical and high-energy physics. It hosts Mongolia\'s LHCb research group — the cornerstone of the Mongolia–CERN collaboration.',
  },
  {
    name: 'NUM',
    logo: '/logos/National University of Mongolia.png',
    url:  'https://num.edu.mn',
    role: 'Organizer',
    role_mn: 'Зохион байгуулагч',
    desc_mn: 'Монгол Улсын Их Сургууль (МУИС) нь Монгол Улсын тэргүүлэгч их дээд сургууль юм. Mongolia - CERN LHCb 2026 хурлын үндсэн зохион байгуулагч болон лекцийн танхимуудаа нээж өгч байна.',
    desc_en: 'The National University of Mongolia (NUM) is the country\'s leading higher education institution. It serves as the one of the main organizers for Mongolia - CERN LHCb 2026, providing its Academic Hall.',
  },
  {
    name: 'CNBC Mongolia',
    logo: '/logos/CNBCLogo.png',
    url:  'https://cnbc.mn',
    role: 'Media Partner',
    role_mn: 'Хэвлэл мэдээллийн түнш',
    desc_mn: 'Монголын тэргүүлэгч эдийн засгийн мэдээллийн телевиз CNBC Mongolia нь олон нийтийн лекцийг шууд нэвтрүүлэх болон хурлын онцлох мөчүүдийг нийтэлнэ.',
    desc_en: 'CNBC Mongolia is the country\'s leading business news television channel. It will broadcast the public lecture live and cover key highlights from the Mongolia - CERN LHCb 2026 conference.',
  },
  {
    name: 'Gej Yu Ve',
    logo: '/logos/Gej Yu Ve.jpg',
    url:  '#',
    role: 'Media Partner',
    role_mn: 'Хэвлэл мэдээллийн түнш',
    desc_mn: '"Гэж Юу Вэ?" нь Монголын шинжлэх ухааны сонирхогчдын хамгийн том хүрээлэл юм. CERN болон LHCb-ийн тухай нэвтрүүлэгүүдийг бэлтгэж, Монгол эрдэмтэдтэй ярилцлага хийнэ.',
    desc_en: '"Gej Yu Ve? is a popular Mongolian science community that will produce an in-depth feature on CERN and LHCb, and interview Mongolian scientists.',
  },
  {
    name: 'Ulaanbaatar Hotel',
    logo: '/logos/UB HOTEL.png',
    url:  '#',
    role: 'Hospitality Partner',
    role_mn: 'Зочлох үйлчилгээний түнш',
    desc_mn: 'Улаанбаатар зочид буудал нь Монголын анхны орчин үеийн зочид буудлуудын нэг бөгөөд Mongolia - CERN LHCb 2026 хурлын олон нийтийн лекц болон зочдыг хүлээн авах түншээр ажиллаж байна.',
    desc_en: 'Ulaanbaatar Hotel is one of Mongolia\'s first modern hotels. It serves as the official hospitality partner for Mongolia - CERN LHCb 2026, hosting the public lectures and guest receptions.',
  },
];
