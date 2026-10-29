export type View = 'overview' | 'tasks' | 'focus' | 'insights' | 'settings'
export type Priority = 'High' | 'Medium' | 'Low'
export type TaskFilter = 'All' | 'Open' | 'Done'

export interface Task {
  id: string
  title: string
  category: string
  priority: Priority
  done: boolean
  due: string
}

export interface Preferences {
  name: string
  focusMinutes: number
  breakMinutes: number
}

export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  demo?: boolean
}
