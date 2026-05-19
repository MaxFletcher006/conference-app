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
