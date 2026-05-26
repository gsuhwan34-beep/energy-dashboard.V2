interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4 flex flex-col gap-1">
      <span className="text-xs text-fg-muted uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${accent ? 'text-brand-100' : 'text-fg-base'}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-fg-subtle">{sub}</span>}
    </div>
  )
}
