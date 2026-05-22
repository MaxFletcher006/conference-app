import type { AgendaItem } from '@/data/agenda'
import { MapPin, User, Clock } from 'lucide-react'


export function AgendaRow({ item }: { item: AgendaItem }) {
  const isBreak = item.type === 'break'

  return (
    <div className="group relative flex gap-6 md:gap-10 pb-10 last:pb-0">
      <div className="absolute top-0 bottom-0 left-[75px] md:left-[107px] w-px bg-slate-100 group-last:bg-transparent" />

      <div className="w-[60px] md:w-[80px] flex-shrink-0 pt-1 text-right">
        <div className="flex items-center justify-end gap-1.5 text-slate-400 group-hover:text-indigo transition-colors">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-bold font-mono tracking-tighter">{item.time}</span>
        </div>
      </div>

      <div className="relative z-10 mt-2">
        <div className={`w-3 h-3 rounded-full border-2 border-white ring-4 ring-slate-50 transition-all duration-300 ${isBreak ? 'bg-slate-300' : 'bg-indigo group-hover:scale-125'}`} />
      </div>

      <div className={`flex-1 rounded-2xl p-5 md:p-6 transition-all duration-300 border ${isBreak ? 'bg-slate-50 border-slate-100' : 'bg-white border-transparent hover:border-indigo/10 hover:shadow-xl hover:shadow-indigo/5'}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className={`text-base md:text-lg font-bold leading-tight mb-2 ${isBreak ? 'text-slate-500' : 'text-navy-800 group-hover:text-indigo transition-colors'}`}>
              {item.title}
            </h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {item.speaker && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="h-3.5 w-3.5 text-indigo/60" />
                  <span className="font-medium">{item.speaker}</span>
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-300" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
