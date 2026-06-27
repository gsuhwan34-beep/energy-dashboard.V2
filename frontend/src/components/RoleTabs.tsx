import { Home, Sun, Monitor } from 'lucide-react'

export type AppRole = 'consumer' | 'producer' | 'presentation'

interface Props {
  role: AppRole
  onChange: (role: AppRole) => void
}

const TABS: { id: AppRole; label: string; icon: typeof Home }[] = [
  { id: 'consumer', label: '소비자', icon: Home },
  { id: 'producer', label: '생산자', icon: Sun },
  { id: 'presentation', label: '프레젠테이션', icon: Monitor },
]

export default function RoleTabs({ role, onChange }: Props) {
  return (
    <div className="flex p-1 rounded-xl border border-border-strong bg-bg-subtle/50 w-full gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:px-5 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all ${
            role === tab.id
              ? tab.id === 'presentation'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'bg-brand-100 text-white shadow-sm'
              : 'text-fg-subtle hover:text-fg-base hover:bg-bg-base-opaque'
          }`}
        >
          <tab.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
