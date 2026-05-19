import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'link' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none disabled:opacity-50',
          {
            'bg-indigo text-white hover:bg-indigo-dark': variant === 'default',
            'bg-transparent hover:bg-white/10 text-current': variant === 'ghost',
            'bg-transparent underline-offset-4 hover:underline text-current p-0 h-auto': variant === 'link',
            'border border-current bg-transparent hover:bg-slate-50': variant === 'outline',
          },
          size === 'sm' && variant !== 'link' && 'h-9 px-4 text-sm',
          size === 'md' && variant !== 'link' && 'h-11 px-6 text-sm',
          size === 'lg' && variant !== 'link' && 'h-14 px-8 text-base',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
