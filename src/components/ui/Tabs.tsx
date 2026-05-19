import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsCtx { value: string; setValue: (v: string) => void }
const Ctx = createContext<TabsCtx>({ value: '', setValue: () => {} })

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: ReactNode; className?: string }) {
  const [value, setValue] = useState(defaultValue)
  return <Ctx.Provider value={{ value, setValue }}><div className={className}>{children}</div></Ctx.Provider>
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex', className)}>{children}</div>
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(Ctx)
  return (
    <button
      onClick={() => ctx.setValue(value)}
      data-state={ctx.value === value ? 'active' : 'inactive'}
      className={cn('flex-1 transition-all', className)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(Ctx)
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
