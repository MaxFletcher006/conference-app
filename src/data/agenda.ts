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
    ],
  }
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
];
