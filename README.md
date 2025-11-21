# Shadow Companion

Shadow Companion is a full-stack AI platform featuring a personal voice companion, AI news tracker, social feed, and productivity tools.

## Project Structure

```
shadow-companion/
├── frontend/          # React + Vite frontend application
├── backend/           # Spring Boot backend (planned)
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS (CDN)
- **AI Integration**: Google Gemini Live API (Native Audio)
- **Routing**: React Router 6
- **State Management**: React Context API

### Backend (Planned)
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Database**: MySQL 8.0

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Google Gemini API Key

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure API Key**:
   
   Create/edit `.env` file in the `frontend/` directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
   
   Get your API key from: https://aistudio.google.com/apikey

4. **Start development server**:
   ```bash
   pnpm run dev
   ```

5. **Open the app**:
   
   The app will be available at `http://localhost:3000` (or `http://localhost:3001` if 3000 is in use)

### Backend Setup (Future)

The backend is not yet implemented. See `backend/README.md` for planned architecture.

## Features

### ✅ Implemented

- **Voice Companion**: Real-time bidirectional voice conversation using Gemini Live API (WebSockets)
  - Native audio processing (24kHz output, 16kHz input)
  - Multiple voice personas (Puck, Charon, Kore, Fenrir, Zephyr)
  - Function calling - AI can control the app interface
  
- **Text Chat**: Alternative text-based interaction with the AI companion

- **Productivity Tools**: 
  - Task management with categories
  - Voice-controlled task creation
  - Task completion tracking

- **AI Updates**: Curated AI/tech news feed

- **Social Feed**: Mock social network for AI enthusiasts

- **Automation**: Workflow management interface

### 🚧 Planned

- **Backend API**: Spring Boot REST API for data persistence
- **User Authentication**: Secure login/signup system
- **Database Integration**: MySQL for storing tasks, preferences, and workflows
- **Advanced Automation**: Custom workflow creation and execution

## Development Commands

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Project Configuration

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_api_key_here
```

### Vite Configuration

The frontend uses Vite with:
- React plugin for Fast Refresh
- Path aliases (`@/` points to `src/`)
- Environment variable injection
- Port 3000 (fallback to 3001)

## Troubleshooting

### Voice feature not working

1. **Check API key**: Ensure `GEMINI_API_KEY` is set in `frontend/.env`
2. **Restart dev server**: Stop and restart `pnpm run dev` after adding the key
3. **Microphone permissions**: Allow microphone access when prompted
4. **Browser compatibility**: Use Chrome or Edge for best results

### Installation issues

- **Use pnpm**: This project works best with pnpm (`npm install -g pnpm`)
- **Clear cache**: Run `pnpm cache clean --force` if you encounter issues
- **Delete node_modules**: Remove `frontend/node_modules` and reinstall

## Architecture

### Frontend Architecture

```
frontend/src/
├── components/     # Reusable UI components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
│   ├── useLiveSession.ts    # Gemini Live API WebSocket
│   └── useGeminiTools.ts    # AI function calling
├── pages/          # Route pages
├── services/       # API services
├── utils/          # Utility functions
└── types.ts        # TypeScript type definitions
```

### Key Technologies

- **Gemini Live API**: Real-time voice conversation via WebSockets
- **Web Audio API**: Audio processing and playback
- **MediaStream API**: Microphone input capture
- **React Router**: Client-side routing
- **Local Storage**: Temporary data persistence

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Google Gemini AI for the Live API
- Tailwind CSS for styling
- Lucide React for icons
