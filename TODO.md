# AURA reset QA checklist

## Implemented in this reset
- [x] Search tasks by title, category, priority, and completion status.
- [x] Search and jump to Home, Tasks, Focus, Statistics, and Settings.
- [x] Enter selects the first search result; Escape clears the search.
- [x] Replace fabricated weekly chart values with completed focus-session history.
- [x] Select 7-day, 30-day, and 90-day activity windows.
- [x] Record focus sessions when the focus timer completes.
- [x] Make the four-week activity heatmap reflect recorded sessions.
- [x] Generate calendar dates from the current date and select a day to view its activity.
- [x] Add working focus reminders: cycle through messages and pin/unpin a saved reminder.
- [x] Keep tasks, preferences, timer state, focus sessions, and pinned reminder in localStorage.
- [x] Keep the OpenAI API key in the local backend `.env`; no frontend API key.
- [x] Apply the black/forest/lime claymorphism surface system without backdrop blur.

## Local verification
- [x] Node syntax check for `server/index.js`.
- [x] TypeScript/TSX transpile syntax check.
- [ ] Full `npm run build` (requires installed dependencies).
- [ ] Live OpenAI request (requires a valid API key, accessible model, and API quota).
