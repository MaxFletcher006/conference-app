import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn('w-full px-4 py-3 rounded-xl transition-colors focus:outline-none resize-none', className)}
      style={{
        background: 'var(--bg-3)',
        border: '1px solid var(--border-2)',
        color: 'rgba(255,255,255,0.75)',
        fontSize: 15,
      }}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
