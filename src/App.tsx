import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { ArrowRight, CalendarDays, Check, CheckCheck, Clock3, Focus, Leaf, Sparkles, Sunset, Target, Zap, Aperture, House, Activity, UserRound, Search, Bell, ChevronDown, CornerDownLeft, X, ListTodo } from 'lucide-react'
import { TaskList } from './components/TaskList'
import { FocusTimer } from './components/FocusTimer'
import { WeeklyChart } from './components/WeeklyChart'
import { FocusReminder } from './components/FocusReminder'
import type { FocusSessionRecord } from './components/WeeklyChart'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { defaultPreferences, starterTasks } from './data'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Preferences, Priority, Task, View } from './types'

const views: Record<View, { title: string; eyebrow: string; description: string }> = {
  overview: { title: 'A little room to think.', eyebrow: 'YOUR SPACE, AT YOUR PACE', description: 'A gentle place to begin again.' },
  tasks: { title: 'Make it feel manageable.', eyebrow: 'A CLEARER LIST', description: 'One thing at a time is still progress.' },
  focus: { title: 'Come back to the moment.', eyebrow: 'A QUIETER KIND OF FOCUS', description: 'A little time, held just for you.' },
  insights: { title: 'Notice your own rhythm.', eyebrow: 'LOOK BACK, GENTLY', description: 'A pattern is not a measure of your worth.' },
  settings: { title: 'Make this space yours.', eyebrow: 'YOUR PERSONAL SPACE', description: 'A few small preferences, kept on this device.' },
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayLabel() {
  return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
}

function PageHeader({ view, name }: { view: View; name: string }) {
  return <header className="page-header"><div className="page-header-copy"><span className="eyebrow">{views[view].eyebrow}</span><h1>{view === 'overview' ? `${greeting()}, ${name}.` : views[view].title}</h1><p>{view === 'overview' ? 'Make space for what matters to you today.' : views[view].description}</p></div><div className="header-right"><div className="date-chip"><span className="date-chip-icon"><CalendarDays size={15} /></span><span><strong>{todayLabel()}</strong><small>Your own, local view</small></span></div><div className="header-avatar" aria-label={`${name}'s profile`}>{name.slice(0, 1).toUpperCase()}</div></div></header>
}

function PreferencesPanel({ preferences, onChange }: { preferences: Preferences; onChange: (next: Preferences) => void }) {
  const change = (key: keyof Preferences, value: string | number) => onChange({ ...preferences, [key]: value })
  return (
    <Card className="surface preferences-card">
      <CardHeader className="card-heading"><div className="heading-copy"><span className="eyebrow">A SMALL SPACE, YOURS</span><CardTitle className="section-title">Personal preferences</CardTitle></div><span className="saved-label"><span /> Saved on this device</span></CardHeader>
      <CardContent className="preferences-content">
        <label className="preference-field"><span>Your name</span><small>Used in your dashboard greeting.</small><input value={preferences.name} onChange={(event) => change('name', event.target.value)} placeholder="Your name" maxLength={30} /></label>
        <div className="preference-rule" />
        <div className="preference-field"><span>Focus rhythm</span><small>A few minutes set aside, then a pause.</small><div className="duration-fields"><label><span>Focus session</span><select value={preferences.focusMinutes} onChange={(event) => change('focusMinutes', Number(event.target.value))}>{[15, 20, 25, 30, 45, 50].map((value) => <option key={value} value={value}>{value} minutes</option>)}</select></label><label><span>Gentle break</span><select value={preferences.breakMinutes} onChange={(event) => change('breakMinutes', Number(event.target.value))}>{[3, 5, 10, 15].map((value) => <option key={value} value={value}>{value} minutes</option>)}</select></label></div></div>
        <div className="preference-rule" />
        <div className="storage-notice"><Check size={15} /><span>Tasks and preferences stay in localStorage on this browser. There’s no account or server connected.</span></div>
      </CardContent>
    </Card>
  )
}

function InsightSnapshot({ tasks, activity }: { tasks: Task[]; activity: FocusSessionRecord[] }) {
  const done = tasks.filter((task) => task.done).length
  const mins = activity.reduce((total, item) => total + item.minutes, 0)
  return (
    <div className="insight-notes-grid">
      <Card className="surface insight-note-card"><div className="note-card-icon lilac-icon"><Clock3 size={17} /></div><span className="eyebrow">RECORDED FOCUS TIME</span><strong>{Math.floor(mins / 60)}h {mins % 60}m</strong><p>From {activity.length} completed focus {activity.length === 1 ? 'session' : 'sessions'} on this device.</p></Card>
      <Card className="surface insight-note-card"><div className="note-card-icon mint-icon"><CheckCheck size={17} /></div><span className="eyebrow">YOUR LOCAL TASKS</span><strong>{done} {done === 1 ? 'small win' : 'small wins'}</strong><p>Based on {tasks.length} tasks in your personal list on this device.</p></Card>
      <Card className="surface insight-note-card"><div className="note-card-icon peach-icon"><Leaf size={17} /></div><span className="eyebrow">A GENTLER MEASURE</span><strong>Showing up</strong><p>Progress here is for noticing, not comparing. Take what feels useful.</p></Card>
    </div>
  )
}

function App() {
  const [view, setView] = useLocalStorage<View>('aura:view:v1', 'overview')
  const [tasks, setTasks] = useLocalStorage<Task[]>('aura:tasks:v1', starterTasks)
  const [preferences, setPreferences] = useLocalStorage<Preferences>('aura:preferences:v1', defaultPreferences)
  const [focusSessions, setFocusSessions] = useLocalStorage<FocusSessionRecord[]>('aura:focus-activity:v1', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [resetNotice, setResetNotice] = useState('')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` })
  const name = preferences.name.trim() || 'there'
  const done = useMemo(() => tasks.filter((task) => task.done).length, [tasks])
  const completedPercent = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const recordFocusSession = useCallback((minutes: number) => {
    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setFocusSessions((current) => [...current, { id: crypto.randomUUID(), date, minutes }].slice(-500))
  }, [setFocusSessions])
  const calendarDays = useMemo(() => Array.from({ length: 5 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + index - 2)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return { key, date, day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date), number: date.getDate() }
  }), [])
  const selectedCalendarLabel = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${selectedCalendarDate}T12:00:00`))
  const todayDateKey = calendarDays[2]?.key ?? selectedCalendarDate
  const selectedDayActivity = focusSessions.filter((session) => session.date === selectedCalendarDate)
  const selectedDayMinutes = selectedDayActivity.reduce((total, session) => total + session.minutes, 0)
  const heatmapDays = useMemo(() => {
    const activityByDate = new Map<string, number>()
    focusSessions.forEach((session) => activityByDate.set(session.date, (activityByDate.get(session.date) ?? 0) + session.minutes))
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const mondayOffset = (today.getDay() + 6) % 7
    const start = new Date(today); start.setDate(today.getDate() - mondayOffset - 21)
    return Array.from({ length: 28 }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const minutes = activityByDate.get(key) ?? 0
      return { key, date, minutes }
    })
  }, [focusSessions])
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    const pages: { kind: 'page'; id: View; label: string; detail: string }[] = [
      { kind: 'page', id: 'overview', label: 'Home', detail: 'Dashboard and daily overview' },
      { kind: 'page', id: 'tasks', label: 'Tasks', detail: 'Your task list and priorities' },
      { kind: 'page', id: 'focus', label: 'Focus', detail: 'Timer and focus reminders' },
      { kind: 'page', id: 'insights', label: 'Statistics', detail: 'Activity and focus history' },
      { kind: 'page', id: 'settings', label: 'Profile & settings', detail: 'Name and focus preferences' },
    ].filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query))
    const matchingTasks = tasks.filter((task) => `${task.title} ${task.category} ${task.priority} ${task.done ? 'done completed' : 'open active'}`.toLowerCase().includes(query)).slice(0, 5).map((task) => ({ kind: 'task' as const, id: task.id, label: task.title, detail: `${task.category} · ${task.done ? 'Completed' : 'Open'} · ${task.priority} priority` }))
    return [...pages, ...matchingTasks].slice(0, 8)
  }, [searchQuery, tasks])
  function chooseSearchResult(result: { kind: 'page' | 'task'; id: string }) {
    setView(result.kind === 'page' ? result.id as View : 'tasks')
    setSearchQuery('')
    setSearchOpen(false)
  }
  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
    if (event.key === 'Enter' && searchResults[0]) { event.preventDefault(); chooseSearchResult(searchResults[0]) }
  }
  function resetWorkspace() {
    const confirmed = window.confirm('Reset AURA on this browser? This clears saved tasks, preferences, focus history, timer state, and pinned reminders. This cannot be undone.')
    if (!confirmed) return
    Object.keys(window.localStorage).filter((key) => key.startsWith('aura:')).forEach((key) => window.localStorage.removeItem(key))
    setTasks([])
    setPreferences(defaultPreferences)
    setFocusSessions([])
    setView('settings')
    window.localStorage.setItem('aura:view:v1', JSON.stringify('settings'))
    setResetNotice('AURA has been reset on this browser. Your workspace is fresh.')
  }

  function addTask(title: string, priority: Priority, category: string) {
    setTasks((current) => [{ id: crypto.randomUUID(), title, priority, category, done: false, due: 'Today' }, ...current])
  }
  function toggleTask(id: string) { setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task)) }
  function deleteTask(id: string) { setTasks((current) => current.filter((task) => task.id !== id)) }
  function changePriority(id: string, priority: Priority) { setTasks((current) => current.map((task) => task.id === id ? { ...task, priority } : task)) }
  function taskProps() { return { tasks, onAdd: addTask, onToggle: toggleTask, onDelete: deleteTask, onPriority: changePriority } }

  const navItems: { id: View; label: string; icon: typeof House }[] = [
    { id: 'overview', label: 'Home', icon: House },
    { id: 'insights', label: 'Statistics', icon: Activity },
    { id: 'settings', label: 'Profile', icon: UserRound },
    { id: 'focus', label: 'Focus', icon: Focus },
    { id: 'tasks', label: 'Tasks', icon: CheckCheck },
  ]

  return (
    <div className="aura-shell">
      <header className="topbar">
        <button type="button" className="top-brand" onClick={() => setView('overview')} aria-label="AURA home"><Aperture size={24} /><span>AURA</span><i>✦</i></button>
        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`top-nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}><Icon size={15} /><span>{label}</span></button>)}
      </nav>
      <div className="top-actions"><div className={`search-box ${searchOpen ? 'search-box-open' : ''}`}><Search size={16} /><input aria-label="Search AURA" placeholder="Search tasks or pages…" value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchQuery(event.target.value); setSearchOpen(true) }} onKeyDown={handleSearchKeyDown} />{searchQuery && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearchQuery('')}><X size={13} /></button>}{searchOpen && searchQuery.trim() && <div className="search-results" role="listbox">{searchResults.length ? searchResults.map((result) => <button type="button" key={`${result.kind}-${result.id}`} className="search-result" onClick={() => chooseSearchResult(result)}><span className="search-result-icon">{result.kind === 'task' ? <ListTodo size={15} /> : <CornerDownLeft size={15} />}</span><span><strong>{result.label}</strong><small>{result.detail}</small></span></button>) : <div className="search-empty">No tasks or pages match “{searchQuery}”.</div>}</div>}</div><button type="button" className="icon-button" aria-label="Notifications" onClick={() => { setSearchQuery(''); setSearchOpen(false); setView('insights') }}><Bell size={17} /><i /></button><button type="button" className="user-dot" onClick={() => setView('settings')} aria-label="Open profile settings">{name.slice(0, 1).toUpperCase()}</button></div>
      </header>

      <main className="main-panel">
        {view !== 'overview' && <PageHeader view={view} name={name} />}
        <div className={`page-content page-${view}`}>
          {view === 'overview' && <>
            <section className="green-hero">
              <div className="hero-copy"><span className="eyebrow">{todayLabel().toUpperCase()}</span><h2>{greeting()},<br /><em>{name}.</em></h2><p>A calmer mind. A brighter tomorrow.</p><div className="hero-rule" /></div>
              <div className="hero-mantra"><span>SAME GIRL.</span><strong>HIGHER<br />STANDARDS.</strong><i /></div>
              <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring" /><div className="orbit-core"><Leaf size={27} /></div></div>
            </section>
            <section className="dashboard-grid" aria-label="AURA dashboard">
              <div className="focus-feature"><FocusTimer focusMinutes={preferences.focusMinutes} breakMinutes={preferences.breakMinutes} onFocusComplete={recordFocusSession} /></div>
              <Card className="surface calendar-card">
                <CardHeader className="widget-heading"><CardTitle className="widget-title">Calendar</CardTitle><span className="period-pill">{selectedCalendarDate === todayDateKey ? 'Today' : selectedCalendarLabel} <ChevronDown size={13} /></span></CardHeader>
                <CardContent className="calendar-content"><div className="calendar-days">{calendarDays.map((day)=><button type="button" key={day.key} className={`calendar-day ${selectedCalendarDate === day.key ? 'today' : ''}`} onClick={() => setSelectedCalendarDate(day.key)} aria-pressed={selectedCalendarDate === day.key}><span>{day.day}</span><strong>{day.number}</strong></button>)}</div><div className="calendar-summary"><span><Zap size={14} /> {done} <small>done</small></span><span className="summary-up">↗</span><span>{tasks.length-done} <small>left</small></span><span className="summary-divider" /><Clock3 size={14} /><strong>{Math.floor(selectedDayMinutes / 60)}h {selectedDayMinutes % 60}m focus</strong></div><div className="schedule-track"><span style={{ width: `${Math.min(100, selectedDayMinutes / Math.max(1, preferences.focusMinutes) * 100)}%` }} /></div><div className="schedule-times"><span>{selectedCalendarLabel}</span><span>{selectedDayActivity.length} completed session{selectedDayActivity.length === 1 ? '' : 's'}</span></div><button type="button" className="calendar-event" onClick={() => setView('focus')}><span className="event-dot" /><span><strong>{selectedDayActivity.length ? 'Focus time recorded' : 'Plan a focus session'}</strong><small>{selectedDayActivity.length ? `${selectedDayMinutes} minutes completed` : 'Start a session whenever you’re ready'}</small></span><ArrowRight size={15} /></button></CardContent>
              </Card>
              <div className="tasks-feature"><TaskList {...taskProps()} compact onSeeAll={() => setView('tasks')} /></div>
              <Card className="surface ritual-card"><CardHeader className="widget-heading"><CardTitle className="widget-title">A little ritual</CardTitle><span className="live-dot" /></CardHeader><CardContent className="ritual-content"><div className="ritual-art"><div className="ritual-moon" /><Leaf size={42} /></div><span className="eyebrow">RESET YOUR PACE</span><strong>Small steps.<br /><em>Big shifts.</em></strong><p>Give your attention somewhere kind to land.</p><button type="button" className="ritual-button" onClick={() => setView('focus')}>Enter focus mode <ArrowRight size={14} /></button></CardContent></Card>
              <div className="progress-feature"><WeeklyChart compact activity={focusSessions} /></div>
              <Card className="surface heatmap-card"><CardHeader className="widget-heading"><CardTitle className="widget-title">Progress report</CardTitle><span className="period-pill">Last 4 weeks</span></CardHeader><CardContent><div className="heatmap-labels">{['M','T','W','T','F','S','S'].map((label, index)=><span key={`${label}-${index}`}>{label}</span>)}</div><div className="heatmap-grid">{heatmapDays.map((day)=><span key={day.key} className={`heat ${day.minutes === 0 ? 'heat-0' : day.minutes < 25 ? 'heat-1' : day.minutes < 50 ? 'heat-2' : day.minutes < 100 ? 'heat-3' : day.minutes < 150 ? 'heat-4' : 'heat-5'}`} title={`${day.key}: ${day.minutes} focus minutes`} />)}</div><div className="heatmap-foot"><span>Less</span>{[0,1,2,3,4,5].map(level=><i key={level} className={`heat heat-${level}`} />)}<span>More</span></div><p className="heatmap-caption">Based on your completed focus sessions.</p></CardContent></Card>
            </section>
            <div className="overview-footer"><span><Sparkles size={13} /> {completedPercent === 100 ? 'You showed up for everything you planned.' : 'Discipline creates freedom — one small step at a time.'}</span><span>Local to this browser · no account needed</span></div>
          </>}
          {view === 'tasks' && <div className="single-column-view"><div className="task-page-note"><div className="task-note-mark"><Target size={17} /></div><span><strong>{tasks.length} {tasks.length === 1 ? 'thing' : 'things'} in your orbit</strong><small>{tasks.length === 0 ? 'There’s room for a first thought.' : `${done} finished · ${tasks.length - done} still in progress`}</small></span><div className="task-note-progress"><span style={{ width: `${completedPercent}%` }} /></div></div><TaskList {...taskProps()} /></div>}
          {view === 'focus' && <div className="focus-page-grid"><div className="focus-page-main"><FocusTimer focusMinutes={preferences.focusMinutes} breakMinutes={preferences.breakMinutes} onFocusComplete={recordFocusSession} /><FocusReminder /></div><div className="focus-page-side"><TaskList {...taskProps()} compact onSeeAll={() => setView('tasks')} /></div></div>}
          {view === 'insights' && <div className="insights-page"><div className="insight-quiet-banner"><div className="banner-art"><Sunset size={21} /></div><div><span className="eyebrow">NO SCORE TO CHASE</span><strong>Notice patterns. Leave the pressure behind.</strong></div><span className="demo-tag"><span /> LIVE LOCAL HISTORY</span></div><WeeklyChart activity={focusSessions} /><InsightSnapshot tasks={tasks} activity={focusSessions} /></div>}
          {view === 'settings' && <div className="settings-page"><PreferencesPanel preferences={preferences} onChange={setPreferences} /><Card className="surface privacy-card"><div className="privacy-icon"><Check size={15} /></div><span><strong>A quieter kind of privacy</strong><small>Your tasks, preferences, and focus history live in this browser’s localStorage on this device.</small></span></Card><Card className="surface reset-workspace-card"><div><span className="eyebrow">START FRESH</span><strong>Reset this workspace</strong><p>Clear saved tasks, focus history, timer progress, and pinned reminders from this browser. This does not delete your project files.</p>{resetNotice && <small className="reset-notice">{resetNotice}</small>}</div><button type="button" className="reset-workspace-button" onClick={resetWorkspace}>Reset AURA data</button></Card></div>}
        </div>
      </main>
    </div>
  )
}

export default App
