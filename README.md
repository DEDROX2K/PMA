# AirPaste

AirPaste is a local-first desktop bookmark and note board built with Electron and React. Open any folder, let AirPaste create a `data.json`, and keep every card, note, and canvas position on your own drive.

## MVP

- Single canvas per folder
- Global paste for URLs and plain text
- Open Graph previews with graceful fallback cards
- JSON storage instead of a database
- Minimal sidebar with folder controls and local card count

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

## Packaging

```bash
npm run package
```

This builds the Vite renderer and packages the Electron app with `electron-builder`.
