import { useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, ChevronDown, Circle, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { Priority, Task, TaskFilter } from '../types'

type Props = {
  tasks: Task[]
  onAdd: (title: string, priority: Priority, category: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onPriority: (id: string, priority: Priority) => void
  compact?: boolean
  onSeeAll?: () => void
}

const filters: TaskFilter[] = ['All', 'Open', 'Done']
const priorities: Priority[] = ['High', 'Medium', 'Low']

export function TaskList({ tasks, onAdd, onToggle, onDelete, onPriority, compact = false, onSeeAll }: Props) {
  const [filter, setFilter] = useState<TaskFilter>('All')
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Studio')
  const [priority, setPriority] = useState<Priority>('Medium')
  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => filter === 'All' || (filter === 'Open' ? !task.done : task.done))
    return compact ? filtered.slice(0, 3) : filtered
  }, [tasks, filter, compact])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), priority, category)
    setTitle('')
    setPriority('Medium')
    setComposing(false)
  }

  return (
    <Card className={`surface task-card ${compact ? 'task-card-compact' : ''}`}>
      <CardHeader className="card-heading">
        <div className="heading-copy">
          <span className="eyebrow">THE SMALL, IMPORTANT THINGS</span>
          <CardTitle className="section-title">Today’s tasks</CardTitle>
        </div>
        {compact && onSeeAll ? (
          <button type="button" className="text-action" onClick={onSeeAll}>All tasks <ArrowUpRight size={14} /></button>
        ) : (
          <span className="count-pill">{tasks.filter((task) => !task.done).length} open</span>
        )}
      </CardHeader>
      <CardContent className="task-body">
        {!compact && (
          <div className="filter-row" role="group" aria-label="Filter tasks">
            {filters.map((item) => <button type="button" key={item} className={`filter-chip ${filter === item ? 'selected' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        )}
        {composing && (
          <form className="task-composer" onSubmit={submit}>
            <label className="sr-only" htmlFor={`new-task-${compact ? 'compact' : 'full'}`}>Task name</label>
            <input id={`new-task-${compact ? 'compact' : 'full'}`} autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" maxLength={80} />
            <div className="composer-fields">
              <label className="select-wrap"><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Studio</option><option>Personal</option><option>Research</option><option>Wellbeing</option></select><ChevronDown size={13} /></label>
              <label className="select-wrap"><span className="sr-only">Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{priorities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label>
              <button className="composer-submit" type="submit">Add task</button>
              <button className="composer-cancel" type="button" onClick={() => setComposing(false)}>Cancel</button>
            </div>
          </form>
        )}
        <div className="task-list">
          {visibleTasks.map((task) => (
            <article className={`task-row ${task.done ? 'task-done' : ''}`} key={task.id}>
              <button type="button" className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => onToggle(task.id)} aria-label={`${task.done ? 'Mark as open' : 'Complete'}: ${task.title}`}>{task.done ? <Check size={13} strokeWidth={2.6} /> : <Circle size={17} strokeWidth={1.5} />}</button>
              <div className="task-description">
                <span className="task-name">{task.title}</span>
                <span className="task-meta">{task.category}<span className="meta-dot" />{task.due}</span>
              </div>
              <label className={`priority-select priority-${task.priority.toLowerCase()}`}>
                <span className="sr-only">Priority for {task.title}</span>
                <select value={task.priority} onChange={(event) => onPriority(task.id, event.target.value as Priority)}>{priorities.map((item) => <option key={item}>{item}</option>)}</select>
                <ChevronDown size={11} />
              </label>
              <button type="button" className="task-delete" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}><Trash2 size={15} /></button>
            </article>
          ))}
          {visibleTasks.length === 0 && (
            <div className="empty-tasks">
              <div className="empty-orbit"><Check size={18} /></div>
              <strong>{tasks.length === 0 ? 'A clear page is a good place to start.' : 'Nothing in this view.'}</strong>
              <span>{tasks.length === 0 ? 'Add one small thing you’d like to move forward.' : 'Try another filter or add a new task.'}</span>
            </div>
          )}
        </div>
        {!composing && (
          <button type="button" className="add-task-button" onClick={() => setComposing(true)}><span><Plus size={16} /></span> Add a task</button>
        )}
      </CardContent>
    </Card>
  )
}
