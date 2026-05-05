import { cn } from '@/lib/cn'

interface Props {
  children: React.ReactNode
  className?: string
}

export function PlateLabel({ children, className }: Props) {
  return <div className={cn('plate', className)}>{children}</div>
}
