import { useState } from 'react'
import { Bookmark, Check, Leaf, RefreshCw, Sparkles } from 'lucide-react'
import { Card } from './ui/card'
import { useLocalStorage } from '../hooks/useLocalStorage'

const reminders = [
  { title: 'Rest is part of the rhythm.', body: 'Pausing is not falling behind. Give your attention a moment to settle before you begin again.' },
  { title: 'Start smaller than you think.', body: 'Choose one action you can finish in five minutes. Momentum can come after the first step.' },
  { title: 'You only need to be here.', body: 'You do not have to solve the whole day right now. Return to the next thing in front of you.' },
  { title: 'Progress can be quiet.', body: 'A little honest effort counts, even when nobody else sees it. Let this session be enough.' },
  { title: 'Protect your attention.', body: 'Put one distraction away, take one breath, and give the next few minutes to what matters.' },
]

export function FocusReminder() {
  const [savedReminder, setSavedReminder] = useLocalStorage<string | null>('aura:focus-reminder:v1', null)
  const [index, setIndex] = useState(() => Math.max(0, reminders.findIndex((reminder) => reminder.title === savedReminder)))
  const current = reminders[index]
  const isSaved = savedReminder === current.title

  function nextReminder() {
    setIndex((currentIndex) => (currentIndex + 1) % reminders.length)
  }

  return (
    <Card className="surface focus-prompt focus-reminder-card">
      <div className="reminder-symbol"><Leaf size={18} /></div>
      <div className="reminder-copy"><span className="eyebrow">A REMINDER FOR THIS MOMENT</span><strong>{current.title}</strong><p>{current.body}</p>
        {isSaved && <span className="reminder-saved"><Check size={12} /> Saved as your reminder</span>}
        <div className="reminder-actions">
          <button type="button" className="reminder-action primary" onClick={nextReminder}><RefreshCw size={13} /> Another thought</button>
          <button type="button" className={`reminder-action ${isSaved ? 'is-saved' : ''}`} onClick={() => setSavedReminder(isSaved ? null : current.title)}><Bookmark size={13} /> {isSaved ? 'Unpin reminder' : 'Keep this'}</button>
        </div>
      </div>
      <Sparkles className="reminder-spark" size={15} aria-hidden="true" />
    </Card>
  )
}
