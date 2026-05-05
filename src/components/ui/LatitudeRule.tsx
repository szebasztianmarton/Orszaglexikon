import { cn } from '@/lib/cn'

interface Props {
  className?: string
  /** Optional tag rendered to the right of the rule, e.g. a degree label. */
  tag?: string
}

export function LatitudeRule({ className, tag }: Props) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 latitude-rule" />
      {tag ? (
        <span className="plate text-ink-soft whitespace-nowrap">{tag}</span>
      ) : null}
      <div className="flex-1 latitude-rule" />
    </div>
  )
}
