import { useMemo, useState } from 'react'
import { Activity, CalendarDays, Clock3, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export type FocusSessionRecord = { id: string; date: string; minutes: number }
type Range = 7 | 30 | 90

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shortDay(date: Date) {
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date)
}

function shortDate(date: Date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

export function getActivityDays(sessions: FocusSessionRecord[], count: number) {
  const today = new Date()
  const activityByDate = new Map<string, { minutes: number; sessions: number }>()
  sessions.forEach((session) => {
    const current = activityByDate.get(session.date) ?? { minutes: 0, sessions: 0 }
    activityByDate.set(session.date, { minutes: current.minutes + session.minutes, sessions: current.sessions + 1 })
  })
  const days = Array.from({ length: count }, (_, index) => {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - (count - index - 1))
    const key = dateKey(date)
    const totals = activityByDate.get(key) ?? { minutes: 0, sessions: 0 }
    return { key, date, day: shortDay(date), label: shortDate(date), ...totals }
  })
  return days
}

export function WeeklyChart({ compact = false, activity = [] }: { compact?: boolean; activity?: FocusSessionRecord[] }) {
  const [range, setRange] = useState<Range>(7)
  const days = useMemo(() => getActivityDays(activity, range), [activity, range])
  const totalMinutes = days.reduce((total, item) => total + item.minutes, 0)
  const maxMinutes = Math.max(25, ...days.map((point) => point.minutes))
  const chartWidth = 560
  const chartHeight = 178
  const left = 12
  const right = 12
  const baseline = 139
  const maxHeight = 104
  const gap = range === 7 ? 24 : range === 30 ? 7 : 2
  const barWidth = Math.max(2, (chartWidth - left - right - gap * (range - 1)) / range)
  const step = barWidth + gap

  return (
    <Card className={`surface chart-card ${compact ? 'chart-card-compact' : ''}`}>
      <CardHeader className="card-heading chart-heading">
        <div className="heading-copy"><span className="eyebrow">YOUR REAL FOCUS HISTORY</span><CardTitle className="section-title">A rhythm, not a race.</CardTitle></div>
        <label className="chart-range"><CalendarDays size={13} /><span className="sr-only">Activity period</span><select value={range} onChange={(event) => setRange(Number(event.target.value) as Range)}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
      </CardHeader>
      <CardContent className="chart-content">
        <div className="chart-summary"><strong>{Math.floor(totalMinutes / 60)}<i>h</i> {totalMinutes % 60}<i>m</i></strong><span>recorded focus in {range} days</span><span className="chart-change"><Activity size={13} /> {activity.length} sessions total</span></div>
        <div className="chart-canvas">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`Recorded focus minutes over the last ${range} days`} preserveAspectRatio="xMidYMid meet">
            <defs><linearGradient id="auraActivityBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b4f7bb" /><stop offset="100%" stopColor="#39784b" /></linearGradient></defs>
            {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={chartWidth} y1={35 + line * 34} y2={35 + line * 34} className="chart-gridline" />)}
            {days.map((point, index) => {
              const height = point.minutes > 0 ? Math.max(5, (point.minutes / maxMinutes) * maxHeight) : 3
              const x = left + index * step
              const showLabel = range === 7 || (range === 30 && (index % 5 === 0 || index === range - 1)) || (range === 90 && (index % 15 === 0 || index === range - 1))
              return <g key={point.key}>
                <title>{`${point.label}: ${point.minutes} minutes, ${point.sessions} completed focus sessions`}</title>
                <rect x={x} y={baseline - height} width={barWidth} height={height} rx={Math.min(7, barWidth / 2)} fill={point.minutes ? 'url(#auraActivityBar)' : '#26352b'} opacity={point.minutes ? 1 : .7} />
                {showLabel && <text x={x + barWidth / 2} y="164" textAnchor="middle" className="chart-label">{range === 7 ? point.day : point.date.getDate()}</text>}
              </g>
            })}
          </svg>
        </div>
        <div className="chart-note"><Info size={14} /><span>Only completed focus sessions are counted. No sample activity is added.</span><Clock3 size={14} className="chart-note-icon" /></div>
      </CardContent>
    </Card>
  )
}
