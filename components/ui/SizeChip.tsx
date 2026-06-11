'use client'

import { cn } from '@/lib/utils'

interface SizeChipProps {
  size: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function SizeChip({ size, selected, disabled, onClick }: SizeChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-sans font-semibold transition-all duration-200 border',
        {
          'bg-primary text-white border-primary': selected,
          'bg-surface-rose text-on-surface border-transparent hover:border-primary/30':
            !selected && !disabled,
          'opacity-40 cursor-not-allowed bg-surface-rose text-on-surface border-transparent':
            disabled,
        }
      )}
    >
      {size}
    </button>
  )
}
