import { cn } from '@/lib/cn'

interface Props {
  children: React.ReactNode
  className?: string
  /** Show topographic line decoration behind the frame. */
  withTopo?: boolean
}

export function PageFrame({ children, className, withTopo = false }: Props) {
  return (
    <main className={cn('relative z-10', className)}>
      {withTopo && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none text-ink/20 dark:text-ink/15"
          style={{
            backgroundImage: 'url(/topo-lines.svg)',
            backgroundSize: '1200px auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            opacity: 0.45,
            maskImage:
              'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
          }}
        />
      )}
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">{children}</div>
    </main>
  )
}
