import { useEffect, useMemo } from 'react'
import { ArrowLeftRight, Check, CirclePause, CirclePlay, RotateCcw, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useLocalStorage } from '../hooks/useLocalStorage'

type TimerMode = 'focus' | 'break'
type TimerState = {
  mode: TimerMode
  remainingSeconds: number
  running: boolean
  deadline: number | null
  durationMinutes: number
}

function timerDefaults(focusMinutes: number): TimerState {
  return { mode: 'focus', remainingSeconds: focusMinutes * 60, running: false, deadline: null, durationMinutes: focusMinutes }
}

export function FocusTimer({ focusMinutes, breakMinutes, onFocusComplete }: { focusMinutes: number; breakMinutes: number; onFocusComplete?: (minutes: number) => void }) {
  const [timer, setTimer] = useLocalStorage<TimerState>('aura:focus-timer:v1', timerDefaults(focusMinutes))
  const [sessions, setSessions] = useLocalStorage('aura:focus-sessions:v1', 0)
  const mode = timer.mode
  const totalSeconds = (mode === 'focus' ? focusMinutes : breakMinutes) * 60
  const secondsLeft = timer.running && timer.deadline !== null
    ? Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1000))
    : timer.remainingSeconds
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0
  const display = useMemo(() => `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`, [secondsLeft])
  const completedThisRound = sessions % 4 || (sessions > 0 ? 4 : 0)

  useEffect(() => {
    const duration = (timer.mode === 'focus' ? focusMinutes : breakMinutes)
    if (timer.durationMinutes === duration) return
    setTimer((current) => ({
      ...current,
      durationMinutes: duration,
      remainingSeconds: duration * 60,
      deadline: current.running ? Date.now() + duration * 60_000 : null,
    }))
  }, [focusMinutes, breakMinutes, timer.mode, timer.durationMinutes, timer.running, setTimer])

  useEffect(() => {
    if (!timer.running || timer.deadline === null) return
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((timer.deadline! - Date.now()) / 1000))
      if (remaining > 0) {
        setTimer((current) => ({ ...current, remainingSeconds: remaining }))
        return
      }
      const nextMode: TimerMode = timer.mode === 'focus' ? 'break' : 'focus'
      const nextDuration = nextMode === 'focus' ? focusMinutes : breakMinutes
      if (timer.mode === 'focus') {
        setSessions((count) => count + 1)
        onFocusComplete?.(timer.durationMinutes)
      }
      setTimer({ mode: nextMode, remainingSeconds: nextDuration * 60, running: false, deadline: null, durationMinutes: nextDuration })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [timer.running, timer.deadline, timer.mode, timer.durationMinutes, focusMinutes, breakMinutes, onFocusComplete, setSessions, setTimer])

  function toggleRunning() {
    if (timer.running) {
      setTimer((current) => ({ ...current, running: false, deadline: null, remainingSeconds: secondsLeft }))
      return
    }
    setTimer((current) => ({ ...current, running: true, deadline: Date.now() + secondsLeft * 1000, remainingSeconds: secondsLeft }))
  }

  function reset() {
    setTimer({ ...timer, running: false, deadline: null, remainingSeconds: totalSeconds, durationMinutes: totalSeconds / 60 })
  }

  function changeMode() {
    const nextMode: TimerMode = mode === 'focus' ? 'break' : 'focus'
    const nextDuration = nextMode === 'focus' ? focusMinutes : breakMinutes
    setTimer({ mode: nextMode, running: false, deadline: null, remainingSeconds: nextDuration * 60, durationMinutes: nextDuration })
  }

  const radius = 97
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <Card className="surface focus-card">
      <CardHeader className="card-heading focus-heading">
        <div className="heading-copy"><span className="eyebrow">A MOMENT, JUST FOR YOU</span><CardTitle className="section-title">Focus room</CardTitle></div>
        <button type="button" className="mode-switch" onClick={changeMode} aria-label={`Switch to ${mode === 'focus' ? 'break' : 'focus'} mode`}><ArrowLeftRight size={14} /><span>{mode === 'focus' ? 'Focus' : 'Break'}</span></button>
      </CardHeader>
      <CardContent className="focus-content">
        <div className="timer-orbit" aria-label={`${display} remaining in ${mode} session`}>
          <svg viewBox="0 0 230 230" aria-hidden="true" className="timer-ring">
            <defs><linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b1f7b4" /><stop offset="100%" stopColor="#55c777" /></linearGradient></defs>
            <circle className="ring-track" cx="115" cy="115" r={radius} />
            <circle className="ring-progress" cx="115" cy="115" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className="timer-center"><span className="timer-mode">{mode === 'focus' ? 'IN YOUR FLOW' : 'BREATHE OUT'}</span><strong>{display}</strong><span className="timer-caption">{timer.running ? 'The rest can wait.' : 'A softer kind of momentum.'}</span></div>
        </div>
        <div className="timer-controls">
          <button type="button" className="timer-play" onClick={toggleRunning} aria-label={timer.running ? 'Pause focus timer' : 'Start focus timer'}>{timer.running ? <CirclePause size={19} /> : <CirclePlay size={19} />}<span>{timer.running ? 'Pause session' : 'Begin session'}</span></button>
          <button type="button" className="timer-reset" onClick={reset} aria-label="Reset focus timer"><RotateCcw size={17} /></button>
        </div>
        <div className="session-progress"><div className="session-copy"><span>YOUR RHYTHM</span><strong>{completedThisRound} <i>/ 4 sessions</i></strong></div><div className="session-dots" aria-label={`${completedThisRound} of 4 focus sessions completed`}>{[0, 1, 2, 3].map((dot) => <span key={dot} className={`session-dot ${dot < sessions % 4 || (sessions > 0 && sessions % 4 === 0) ? 'done' : ''}`}>{dot < sessions % 4 || (sessions > 0 && sessions % 4 === 0) ? <Check size={10} /> : null}</span>)}</div></div>
        <div className="focus-footnote"><Sparkles size={13} /> {sessions === 0 ? 'A small pause can change the shape of a day.' : `${sessions} focus ${sessions === 1 ? 'session' : 'sessions'} completed across visits.`}</div>
      </CardContent>
    </Card>
  )
}
