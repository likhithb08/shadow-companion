# Shadow Companion Frontend

React + Vite frontend for Shadow Companion AI platform.

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure API Key**:
   
   Edit `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   Get your key from: https://aistudio.google.com/apikey

3. **Run the app**:
   ```bash
   pnpm run dev
   ```

4. **Open browser**: http://localhost:3000

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Layout.tsx
│   └── Visualizer.tsx
├── context/        # React Context providers
│   └── AppContext.tsx
├── hooks/          # Custom React hooks
│   ├── useLiveSession.ts
│   └── useGeminiTools.ts
├── pages/          # Route pages
│   ├── Companion.tsx
│   ├── Feed.tsx
│   ├── Updates.tsx
│   ├── Productivity.tsx
│   ├── Automation.tsx
│   └── Login.tsx
├── services/       # API services
│   └── gemini.ts
├── utils/          # Utility functions
│   ├── audioUtils.ts
│   └── storage.ts
├── App.tsx         # Main app component
├── index.tsx       # Entry point
└── types.ts        # TypeScript types
```

## Features

- **Voice Companion**: Real-time voice conversation with Gemini Live API
- **Text Chat**: Alternative text-based interaction
- **Task Management**: Create and manage tasks
- **AI News Feed**: Curated AI/tech updates
- **Social Feed**: Community posts and discussions
- **Automation**: Workflow management

## Configuration

### Environment Variables

- `GEMINI_API_KEY` - Google Gemini API key (required for voice features)

### Vite Config

- Port: 3000 (fallback to 3001)
- Host: 0.0.0.0 (accessible from network)
- Path alias: `@/` → `src/`

## Troubleshooting

### Voice not working
- Check that `GEMINI_API_KEY` is set in `.env`
- Restart dev server after adding the key
- Allow microphone permissions in browser

### Build errors
- Delete `node_modules` and run `pnpm install` again
- Clear pnpm cache: `pnpm cache clean --force`

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Tailwind CSS
- Google Gemini Live API
- Lucide React (icons)
