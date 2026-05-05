import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 font-sans tracking-wide transition-[background-color,color,border-color,transform] duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]'

const sizes: Record<Size, string> = {
  sm: 'text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 leading-none',
  md: 'text-[12px] uppercase tracking-[0.2em] px-4 py-2.5 leading-none',
  lg: 'text-[13px] uppercase tracking-[0.22em] px-5 py-3 leading-none',
}

const variants: Record<Variant, string> = {
  solid:
    'bg-ink text-paper hover:bg-oxblood border border-ink hover:border-oxblood',
  outline:
    'bg-transparent text-ink border border-ink/50 hover:border-ink hover:bg-paper-deep',
  ghost:
    'bg-transparent text-ink-soft border border-transparent hover:text-ink hover:border-ink/40',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'outline', size = 'md', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    />
  )
})
