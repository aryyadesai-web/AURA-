import { Activity, Aperture, CheckSquare2, CircleHelp, Command, Compass, Focus, Settings2, Sparkles } from 'lucide-react'
import type { View } from '../types'

const items: { id: View; label: string; icon: typeof Compass }[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare2 },
  { id: 'focus', label: 'Focus', icon: Focus },
  { id: 'insights', label: 'Insights', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

function Brand() {
  return (
    <div className="brand-lockup" aria-label="AURA home">
      <div className="brand-mark"><Aperture size={21} strokeWidth={1.8} /></div>
      <span>AURA</span>
      <span className="brand-edition">PERSONAL</span>
    </div>
  )
}

function NavItems({ current, onChange, compact = false }: { current: View; onChange: (view: View) => void; compact?: boolean }) {
  return (
    <nav className={compact ? 'mobile-nav' : 'side-nav'} aria-label="Main navigation">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`nav-item ${current === id ? 'is-active' : ''}`}
          aria-current={current === id ? 'page' : undefined}
          aria-label={label}
          onClick={() => onChange(id)}
        >
          <Icon size={18} strokeWidth={1.8} />
          <span>{label}</span>
          {id === 'tasks' && !compact && <span className="nav-pulse" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  )
}

export function Sidebar({ current, onChange, name = 'Alex' }: { current: View; onChange: (view: View) => void; name?: string }) {
  return (
    <>
      <aside className="sidebar-shell">
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        <NavItems current={current} onChange={onChange} />
        <div className="sidebar-bottom">
          <div className="sidebar-nudge">
            <div className="nudge-icon"><Sparkles size={15} /></div>
            <p><strong>A little more space.</strong><br />One thing at a time.</p>
          </div>
          <button type="button" className="profile-chip" onClick={() => onChange('settings')} aria-label="Open profile settings">
            <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
            <span className="profile-copy"><strong>{name}</strong><small>Personal space</small></span>
            <Command className="profile-command" size={15} />
          </button>
          <div className="sidebar-meta"><CircleHelp size={14} /> AURA is in its early light</div>
        </div>
      </aside>
      <NavItems current={current} onChange={onChange} compact />
    </>
  )
}
