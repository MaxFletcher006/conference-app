import { SectionHeader } from '@/components/ui/SectionHeader'
import { AgendaRow } from '@/components/ui/AgendaRow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { agenda } from '@/data/agenda'
import { Download } from 'lucide-react'

const days = [
  { num: 1 as const, date: 'June 8',  theme: 'Opening & Detector' },
  { num: 2 as const, date: 'June 9',  theme: 'Physics & Lecture' },
]

export default function Agenda() {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <div className="mb-14">
          <SectionHeader
            eyebrow="Schedule"
            title="Event Agenda"
            lead="A comprehensive five-day program including scientific talks, public lectures, and cultural activities."
          />
        </div>

        <Tabs defaultValue="1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto bg-white border border-slate-200 rounded-2xl p-1.5 mb-10 shadow-sm gap-1 max-w-md mx-auto">
            {days.map((day) => (
              <TabsTrigger
                key={day.num}
                value={day.num.toString()}
                className="rounded-xl data-[state=active]:bg-indigo data-[state=active]:text-white data-[state=active]:shadow-md flex flex-col gap-0.5 py-3 transition-all text-slate-600"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Day {day.num}</span>
                <span className="font-bold text-sm">{day.date}</span>
                <span className="text-[9px] opacity-70 hidden md:block">{day.theme}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map((day) => {
            const items = agenda.filter((item) => item.day === day.num)
            return (
              <TabsContent key={day.num} value={day.num.toString()} className="mt-0">
                <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm mb-10">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo text-white flex items-center justify-center shadow-lg shadow-indigo/20">
                      <span className="font-black text-2xl">{day.num}</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-navy-800 text-2xl md:text-3xl mb-1">{day.theme}</h2>
                      <p className="text-slate-400 font-medium">{day.date}, 2026 — Day {day.num}</p>
                    </div>
                  </div>
                  <div className="relative">
                    {items.map((item, i) => <AgendaRow key={i} item={item} />)}
                  </div>
                  {items.length === 0 && (
                    <div className="py-20 text-center text-slate-300 font-bold italic">
                      No sessions scheduled for this day yet.
                    </div>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        <div className="mt-14 flex flex-col md:flex-row gap-8 items-center justify-between bg-navy-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Download Program PDF</h3>
            <p className="text-slate-400 text-sm">Get the full brochure with session abstracts and speaker bios.</p>
          </div>
          <button className="relative z-10 flex items-center gap-3 bg-white text-navy-800 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-xl flex-shrink-0">
            <Download className="h-5 w-5" />
            Download Guide (5.2 MB)
          </button>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-indigo opacity-10 -skew-x-12 translate-x-12 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
