import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-sans font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary text-white shadow-brand hover:bg-primary-container active:scale-95':
              variant === 'primary',
            'bg-tertiary-container text-primary hover:opacity-90 active:scale-95':
              variant === 'secondary',
            'border border-primary text-primary bg-transparent hover:bg-primary/5 active:scale-95':
              variant === 'ghost',
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
