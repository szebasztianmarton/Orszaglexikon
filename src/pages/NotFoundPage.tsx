import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useT } from '@/i18n/useT'
import { PageFrame } from '@/components/layout/PageFrame'

export function NotFoundPage() {
  const t = useT()
  return (
    <PageFrame withTopo className="py-24 lg:py-32">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative inline-block"
        >
          <div className="font-display font-medium leading-none italic text-[clamp(96px,18vw,224px)] text-oxblood">
            ?
          </div>
          <div className="absolute inset-x-0 -bottom-3 h-[1px] bg-ink/30" />
        </motion.div>

        <h1 className="mt-10 font-display italic text-[32px] leading-tight">
          {t.notFound.title}
        </h1>
        <p className="mt-3 font-sans text-[15px] text-ink-soft leading-relaxed">
          {t.notFound.body}
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper hover:bg-oxblood transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          <span aria-hidden>←</span> {t.notFound.back}
        </Link>
      </div>
    </PageFrame>
  )
}
