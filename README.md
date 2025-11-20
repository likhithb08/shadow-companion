# Shadow Companion

Shadow Companion is a full-stack AI platform featuring a personal voice companion, AI news tracker, social feed, and productivity tools.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Gemini Live API (Native Audio)
- **Backend**: Java 17, Spring Boot 3.2
- **Database**: MySQL 8.0

## Getting Started

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google Gemini API Key

### 2. Setup Backend
The backend handles data persistence for Tasks and User Preferences.

```bash
# Start MySQL and Spring Boot API
docker-compose up --build
```
The API will be available at `http://localhost:8080`.

### 3. Setup Frontend
The frontend uses the Gemini API directly for the conversational intelligence.

```bash
# Install dependencies (if running locally)
npm install

# Run development server
npm start
```

### 4. Environment Variables
Create a `.env` file in the root (or configured in your environment):
```
API_KEY=your_google_gemini_api_key
```

## Features
- **Voice Companion**: Real-time bidirectional voice conversation using Gemini Live API (WebSockets).
- **Productivity**: Manage tasks via voice or UI.
- **AI Updates**: Generative AI news feed.
- **Social Feed**: Mock social network for AI enthusiasts.
