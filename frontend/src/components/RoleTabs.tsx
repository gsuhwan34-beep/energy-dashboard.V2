import { Home, Sun } from 'lucide-react'

export type AppRole = 'consumer' | 'producer'

interface Props {
  role: AppRole
  onChange: (role: AppRole) => void
}

export default function RoleTabs({ role, onChange }: Props) {
  return (
    <div className="flex p-1 rounded-lg border border-border-strong bg-bg-subtle/50 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => onChange('consumer')}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          role === 'consumer'
            ? 'bg-brand-100 text-white shadow-sm'
            : 'text-fg-subtle hover:text-fg-base hover:bg-bg-base-opaque'
        }`}
      >
        <Home className="w-4 h-4" />
        소비자
      </button>
      <button
        type="button"
        onClick={() => onChange('producer')}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          role === 'producer'
            ? 'bg-brand-100 text-white shadow-sm'
            : 'text-fg-subtle hover:text-fg-base hover:bg-bg-base-opaque'
        }`}
      >
        <Sun className="w-4 h-4" />
        생산자
      </button>
    </div>
  )
}
