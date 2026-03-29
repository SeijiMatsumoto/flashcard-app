# Flashcard App

A lightweight flashcard study app built with React, TypeScript, and Vite.

**Live site:** https://seijimatsumoto.github.io/flashcard-app/

## Features

- Import flashcard decks via JSON file (drag-and-drop or upload) or paste JSON directly
- Interactive study mode with card flip animations
- Track progress by marking cards as learned or not learned
- Persistent storage using localStorage
- Deck management with completion stats, reset, and delete

## Getting Started

```bash
npm install
npm run dev
```

## JSON Format

```json
{
  "title": "My Deck",
  "description": "Optional description",
  "tags": ["optional", "tags"],
  "cards": [
    { "id": "1", "front": "Question", "back": "Answer" }
  ]
}
```

## Deploy

```bash
npm run deploy
```
