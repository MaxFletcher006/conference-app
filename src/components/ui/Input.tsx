import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('w-full h-12 px-4 rounded-xl transition-colors focus:outline-none', className)}
      style={{
        background: 'var(--bg-3)',
        border: '1px solid var(--border-2)',
        color: '#ffffff',
        fontSize: 15,
      }}
      {...props}
    />
  )
)
Input.displayName = 'Input'
