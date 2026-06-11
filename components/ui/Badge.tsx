import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  variant?: 'new' | 'sale' | 'default'
  className?: string
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-sans font-semibold',
        {
          'bg-secondary-container text-primary': variant === 'new',
          'bg-primary text-white': variant === 'sale',
          'bg-surface-mist text-on-surface': variant === 'default',
        },
        className
      )}
    >
      {label}
    </span>
  )
}
