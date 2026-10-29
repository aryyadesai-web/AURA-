# AURA — Green & Black

A local-first productivity dashboard built with React, TypeScript, Vite, Tailwind CSS v4, and Lucide icons. The visual language uses black, forest green, lime accents, and tactile claymorphism rather than glass panels.

## What works

- Tasks: create, complete, delete, filter, and reprioritize tasks.
- Focus timer: configurable focus and break lengths, pause/resume, reset, and automatic focus-session recording on completion.
- Activity chart: choose 7, 30, or 90 days; it plots completed focus sessions stored locally, with no fabricated sample values.
- Activity heatmap: updates from completed sessions across the last four weeks.
- Calendar strip: dates update from the current date; selecting a day shows recorded focus activity for that date.
- Search: search tasks by title/category/priority/status or jump to a dashboard page; Enter opens the first result and Escape clears the search.
- Focus reminders: cycle through reminders and pin one to local storage.
- Preferences and tasks persist in this browser's localStorage.

## Run locally

Use Node.js 20+ and npm 10+. From the folder containing `package.json`: 

```sh
npm install
npm run dev
```


```sh
npm run dev
```

```sh
```


## Build

```sh
npm run build
npm run preview
```

The production output is written to `dist/`.


## Frontend-only setup

AURA runs locally in your browser. No AI backend or API key is required.

```bash
npm install
npm run dev
```
