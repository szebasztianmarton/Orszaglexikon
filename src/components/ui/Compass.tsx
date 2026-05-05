interface Props {
  size?: number
  className?: string
}

export function Compass({ size = 48, className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
      {/* tick marks every 30deg */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180
        const x1 = 32 + Math.cos(a) * 26
        const y1 = 32 + Math.sin(a) * 26
        const x2 = 32 + Math.cos(a) * 28
        const y2 = 32 + Math.sin(a) * 28
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      })}
      {/* main spokes */}
      <path d="M32 8 L34 30 L32 33 L30 30 Z" fill="currentColor" />
      <path d="M32 56 L30 34 L32 31 L34 34 Z" fill="currentColor" opacity="0.55" />
      <path d="M56 32 L34 30 L31 32 L34 34 Z" fill="currentColor" opacity="0.55" />
      <path d="M8 32 L30 34 L33 32 L30 30 Z" fill="currentColor" opacity="0.55" />
      <circle cx="32" cy="32" r="1.6" fill="var(--color-oxblood)" />
    </svg>
  )
}
