# roadmap-dev

Next.js app for a software engineering roadmap.

The roadmap content is bundled as static JSON in `data/roadmap.json`. User completion progress is saved in the browser with `localStorage`, so it survives page reloads on the same browser without a database.

## Requirements

- Node.js 20 or newer
- Bun 1.3.1 or newer

## Install dependencies

```bash
bun install
```

## Run the app

```bash
bun run dev
```

Open http://localhost:3000.

## Useful commands

```bash
bun run build
bun run start
bun run lint
```
