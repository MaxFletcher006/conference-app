export interface AgendaItem {
  day:     1 | 2;
  date:    string;
  time:    string;
  title:   string;
  title_mn: string;
  speaker?: string;
  type:    'plenary' | 'talk' | 'break' | 'social' | 'lecture' | 'tour';
  location: string;
}

// ── Full 7-day agenda (home page section) ──────────────────────────────────

export type AgendaItemType = 'session' | 'break' | 'social' | 'travel' | 'info'

export interface FullAgendaItem {
  time:      string
  en:        string
  mn:        string
  location?: string
  speakers?: string
  type:      AgendaItemType
}

export interface AgendaDay {
  date:     string
  en:       string
  mn:       string
  noteEn?:  string
  noteMn?:  string
  items:    FullAgendaItem[]
}

export const agendaDays: AgendaDay[] = [
  {
    date: '06.08', en: 'Monday', mn: 'Даваа',
    items: [
      { time: '13:30',       en: 'Registration',       mn: 'Бүртгэл',              location: 'NUM – Academic Hall', type: 'info' },
      { time: '14:00–14:40', en: 'Opening',             mn: 'Нээлт',                location: 'NUM – Academic Hall', speakers: 'Prof. Vincenzo Vagnoni · Academician Davaasambuu Jav · Mr. Erkhembayar Myagmarjav', type: 'session' },
      { time: '14:40–16:00', en: 'Session 1',           mn: '1-р Хэлэлцүүлэг',     location: 'NUM – Academic Hall', speakers: 'Prof. Jianchun Wang · Prof. Miroslav Saur · Dr. Marianna Fontana · Prof. Yiming Li', type: 'session' },
      { time: '16:00–16:25', en: 'Coffee Break',        mn: 'Кофе Завсарлага',      type: 'break' },
      { time: '16:25–17:45', en: 'Session 2',           mn: '2-р Хэлэлцүүлэг',     location: 'NUM – Academic Hall', speakers: 'Dr. Da Yu Tou · Prof. Xuhao Yuan · Dr. Benjamin Audurier · Dr. Patrick Robbe', type: 'session' },
      { time: '17:50',       en: 'Concluding Day',      mn: 'Өдрийн Хаалт',         type: 'info' },
      { time: '19:30',       en: 'Reception Dinner',    mn: 'Хүлээн Авалтын Зоог',  location: 'Ulaanbaatar Hotel', type: 'social' },
    ],
  },
  {
    date: '06.09', en: 'Tuesday', mn: 'Мягмар',
    items: [
      { time: '11:00',       en: 'Coffee Break',        mn: 'Кофе Завсарлага',      location: 'NUM – Academic Hall', type: 'break' },
      { time: '11:20–12:20', en: 'Session 3',           mn: '3-р Хэлэлцүүлэг',     location: 'NUM – Academic Hall', speakers: 'Dr. Enkhbat Tsedenbaljir · Prof. Tomasz Skwarnicki · Dr. Baasansuren Batsukh', type: 'session' },
      { time: '13:00–14:00', en: 'Lunch & Coffee Break',mn: 'Үдийн Хоол & Кофе',   location: 'NUM – Academic Hall', type: 'break' },
      { time: '14:00–15:30', en: 'Session 4',           mn: '4-р Хэлэлцүүлэг',     location: 'NUM – Academic Hall', speakers: 'Dr. Antonio Falabella · Prof. Barbara Sciascia · Dr. Saverio Mariani · Prof. Tim Gershon', type: 'session' },
      { time: '15:30',       en: 'Concluding Day',      mn: 'Өдрийн Хаалт',         type: 'info' },
      { time: '16:00–18:00', en: 'Public Lecture',      mn: 'Нийтийн Лекц',         location: 'Ulaanbaatar Hotel', speakers: 'Introduction · Mini lecture ×3 · Panel discussion (6 people)', type: 'session' },
      { time: '18:00',       en: 'Break Time',          mn: 'Завсарлага',            type: 'break' },
      { time: '19:00',       en: 'IPT Reception Dinner',mn: 'ИПТ Хүлээн Авалтын Зоог', location: 'Il Cavallo ресторант', type: 'social' },
    ],
  },
  {
    date: '06.10', en: 'Wednesday', mn: 'Лхагва',
    noteEn: 'Visit to the IPT & Terelj Mountain Lodge Excursion',
    noteMn: 'ИПТ айлчлал & Тэрэлжийн аялал',
    items: [
      { time: '10:00–11:00', en: 'Official Meeting & CNBC Media Program', mn: 'Албан Уулзалт & CNBC Медиа Хөтөлбөр', location: 'CNBC Office', type: 'session' },
      { time: '11:00–12:00', en: 'Visit to the IPT',    mn: 'ИПТ-д Айлчлал',        location: 'IPT, Mongolian Academy of Science', type: 'travel' },
      { time: '13:00–14:30', en: 'IPT to Terelj',       mn: 'ИПТ-ээс Тэрэлж рүү',  location: 'Terelj Mountain Lodge (~80 km)', type: 'travel' },
      { time: '15:00–19:00', en: 'Terelj Program',      mn: 'Тэрэлжийн Хөтөлбөр',  location: 'Terelj Mountain Lodge', speakers: 'Mongolian style cuisine', type: 'social' },
      { time: '20:00',       en: 'Break Time',          mn: 'Завсарлага',            location: 'Terelj Mountain Lodge', type: 'break' },
    ],
  },
  {
    date: '06.11', en: 'Thursday', mn: 'Пүрэв',
    items: [
      { time: '09:00–10:00', en: 'Breakfast',           mn: 'Өглөөний Хоол',        location: 'Terelj Mountain Lodge', type: 'break' },
      { time: '11:00–12:00', en: 'Departure to Ulaanbaatar', mn: 'Улаанбаатар Руу Буцах', type: 'travel' },
      { time: '12:00–13:00', en: 'Visit to Chinggis Khan Statue', mn: 'Чингис Хааны Хөшөөнд Айлчлал', location: 'Tsonjin Boldog', type: 'travel' },
      { time: '13:00–14:00', en: 'Lunch (on bus)',      mn: 'Үдийн Хоол (Автобусанд)', type: 'break' },
      { time: '15:00–17:00', en: 'Visit to Chinggis Khaan Museum', mn: 'Чингис Хааны Музейд Айлчлал', location: 'Чингис Хааны музей', type: 'travel' },
      { time: '17:00–18:00', en: 'Meeting with the Minister of Education', mn: 'Боловсролын Сайдтай Уулзалт', location: 'MOE', type: 'session' },
      { time: '19:00',       en: 'Informal Dinner',     mn: 'Энгийн Зоог',           type: 'social' },
    ],
  },
  {
    date: '06.12', en: 'Friday', mn: 'Баасан',
    noteEn: 'Outreach Day',
    noteMn: 'Гадагш Үйл Ажиллагааны Өдөр',
    items: [
      { time: '10:00–12:00', en: 'Sightseeing',         mn: 'Хотын Аялал',           type: 'travel' },
      { time: '12:00–13:00', en: 'Lunch',               mn: 'Үдийн Хоол',            type: 'break' },
      { time: '13:00–18:00', en: 'Meetings, City Tour & Outreach', mn: 'Уулзалт, Хотын Аялал & Гарыг Сунгах', type: 'session' },
      { time: '19:00',       en: 'Informal Dinner',     mn: 'Энгийн Зоог',           type: 'social' },
      { time: '21:30',       en: 'Free Time',           mn: 'Чөлөөт Цаг',            type: 'info' },
    ],
  },
  {
    date: '06.13', en: 'Saturday', mn: 'Бямба',
    noteEn: 'Departure A', noteMn: 'Нисэх Буудал А',
    items: [
      { time: '', en: 'Airport Transfers', mn: 'Нисэх Онгоцны Буудлын Тээвэрлэлт', type: 'travel' },
    ],
  },
  {
    date: '06.14', en: 'Sunday', mn: 'Ням',
    noteEn: 'Departure B', noteMn: 'Нисэх Буудал Б',
    items: [
      { time: '', en: 'Airport Transfers', mn: 'Нисэх Онгоцны Буудлын Тээвэрлэлт', type: 'travel' },
    ],
  },
]

export const agenda: AgendaItem[] = [
  // Day 1 — June 8 (Mon)
  { 
    day: 1, 
    date: 'June 8', 
    time: '13:30', 
    title: 'Registration', 
    title_mn: 'Бүртгэл', 
    type: 'plenary', 
    location: 'МУИС — Эрдмийн танхим' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '14:00', 
    title: 'Opening Ceremony', 
    title_mn: 'Нээлт', 
    speaker: 'Prof. Vincenzo Vagnoni · Davaasambuu Jav · Enkhbat (ТББ)',
    type: 'plenary', 
    location: 'МУИС — Дугуй заал' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '14:40', 
    title: 'Session 1 — "Detector and Software"', 
    title_mn: 'Session 1 — "Detector and Software"', 
    speaker: 'Prof. Jianchun Wang · Prof. Miroslav Saur · Dr. Marianna Fontana · Prof. Yiming Li',
    type: 'talk', 
    location: 'МУИС — Дугуй заал' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '16:00', 
    title: 'Coffee break', 
    title_mn: 'Кофе завсарлага', 
    type: 'break', 
    location: 'МУИС' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '16:25', 
    title: 'Session 2 — "Detector and Software"', 
    title_mn: 'Session 2 — "Detector and Software"', 
    speaker: 'Dr. Da Yu Tou · Prof. Xuhao Yuan · Dr. Benjamin Audurier',
    type: 'talk', 
    location: 'МУИС — Дугуй заал' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '17:25', 
    title: 'Conference End', 
    title_mn: 'Хурал өндөрлөх', 
    type: 'plenary', 
    location: 'МУИС' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '19:30', 
    title: 'Reception Dinner', 
    title_mn: 'Reception Dinner', 
    type: 'social', 
    location: 'TBA' 
  },
  { 
    day: 1, 
    date: 'June 8', 
    time: '22:00', 
    title: 'Free Time / Hotel', 
    title_mn: 'Чөлөөт цаг / Hotel', 
    type: 'social', 
    location: 'Hotel' 
  },

  // Day 2 — June 9 (Tue)
  { 
    day: 2, 
    date: 'June 9', 
    time: '11:00', 
    title: 'Coffee break', 
    title_mn: 'Кофе завсарлага', 
    type: 'break', 
    location: 'МУИС — Дугуй заал' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '11:20', 
    title: 'Session 3 — "Physics Analysis"', 
    title_mn: 'Session 3 — "Physics Analysis"', 
    speaker: 'Enkhbat Ts. · Prof. Tomasz Skwarnicki · Baasansuren B.',
    type: 'talk', 
    location: 'МУИС — Дугуй заал' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '13:00', 
    title: 'Lunch & Coffee break', 
    title_mn: 'Үдийн хоол & Кофе завсарлага', 
    type: 'break', 
    location: 'МУИС' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '14:00', 
    title: 'Session 4 — "Physics Analysis"', 
    title_mn: 'Session 4 — "Physics Analysis"', 
    speaker: 'Dr. Antonio Falabella · Prof. Barbara Sciascia · Dr. Saverio Mariani · Prof. Tim Gershon (Future Prospects)',
    type: 'talk', 
    location: 'МУИС — Дугуй заал' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '15:30', 
    title: 'Public Lecture', 
    title_mn: 'Олон нийтийн лекц', 
    speaker: 'Opening · Lectures · Panel discussion',
    type: 'lecture', 
    location: 'Улаанбаатар зочид буудал' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '17:30', 
    title: 'Breaktime', 
    title_mn: 'Чөлөөт цаг', 
    type: 'break', 
    location: 'TBA' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '19:00', 
    title: 'IPT Reception Dinner', 
    title_mn: 'IPT Reception Dinner', 
    type: 'social', 
    location: 'Il Cavallo ресторант' 
  },
  { 
    day: 2, 
    date: 'June 9', 
    time: '21:00', 
    title: 'Free Time / Hotel', 
    title_mn: 'Чөлөөт цаг / Hotel', 
    type: 'social', 
    location: 'Hotel' 
  },
];
