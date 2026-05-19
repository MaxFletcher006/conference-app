import type { ReactNode } from 'react'

export function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[11.5px] font-semibold tracking-widest2 uppercase text-indigo mb-2.5">
      {children}
    </span>
  )
}
