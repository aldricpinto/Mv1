# The Plug

**AI-Powered Personalized Playlist Generator** 

The Plug is an innovative music discovery application that leverages Google's Gemini AI and YouTube Music to create personalized playlists based on your mood, preferences, and conversational input. Simply describe how you're feeling or what you want to hear, and The Plug crafts the perfect playlist for you.

---

## ✨ Features

- 🎵 **AI-Driven Playlist Generation**: Powered by Google Gemini to understand natural language mood descriptions
- 🎙️ **Voice Input Support**: Speak your mood using built-in voice recognition
- 🎨 **Retro-Futuristic UI**: Stunning retro-aesthetic interface with neon accents and smooth animations
- 📱 **Real-time Streaming**: Watch your playlist being generated in real-time with streaming responses
- 🔐 **Google OAuth Integration**: Secure authentication for personalized experiences
- 💾 **Conversation Memory**: Remembers your previous playlist requests for contextual recommendations
- 🎧 **YouTube Music Integration**: Direct integration with YouTube Music for seamless playback

---

## 🏗️ Architecture

```
MV1/
├── backend/              # FastAPI Python backend
│   ├── routers/         # API route handlers (auth, moods, playlists)
│   ├── services/        # Core services (Gemini, YouTube Music, Auth)
│   ├── models/          # Pydantic data models
│   └── utils/           # Utilities (config, cache, rate limiting)
├── frontend/            # Next.js React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   └── app/        # Next.js app routes
│   └── public/         # Static assets
└── data/               # Application data storage
```

### Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Google Gemini AI (playlist generation)
- YouTube Music API (music search and metadata)
- Google OAuth 2.0 (authentication)
- Pydantic (data validation)

**Frontend:**
- Next.js 16 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Framer Motion (animations)
- React OAuth Google (authentication)

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **Google Cloud Account** with:
  - Gemini API key
  - OAuth 2.0 credentials
- **npm** or **yarn** (package manager)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd MV1/Mv1
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

```

**Required Environment Variables (.env):**

```env
# Google AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
APP_NAME=Muse
VERSION=1.0.0
FRONTEND_ORIGIN=http://localhost:3000

# Optional
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

```

**Required Environment Variables (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🎮 Running the Application

### Start Backend Server

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## 📖 Usage

1. **Open the App**: Navigate to `http://localhost:3000`
2. **Sign In**: Click the sign-in button and authenticate with Google
3. **Describe Your Mood**: Type or speak your mood/preference
   - Examples:
     - "I need something energetic for my morning workout"
     - "Chill vibes for a rainy evening"
     - "90s hip hop to get pumped"
4. **Generate**: Click "EXECUTE" or press Enter
5. **Enjoy**: Your personalized playlist streams in real-time

---

## 🔧 Development

### Backend Commands

```bash
# Run tests
pytest

# Run with auto-reload
uvicorn app:app --reload

# Check code quality
ruff check .
```

### Frontend Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## 🎨 Features Deep Dive

### AI Mood Analysis
The Muse Agent uses Google Gemini to analyze your natural language input and extract:
- Primary and secondary moods
- Energy levels
- Musical preferences
- Contextual cues (time of day, activity, etc.)

### Playlist Generation
- **Smart Segmentation**: Playlists are divided into intro, energy lift, and reflection segments
- **Smooth Transitions**: AI-crafted transitions between songs for cohesive listening
- **Personalization**: Learns from your conversation history for better recommendations

### Real-time Streaming
Experience playlist generation as it happens with Server-Sent Events (SSE) streaming from the backend.

---

## 📝 API Endpoints

### Core Endpoints

- `GET /health` - Health check
- `POST /auth/google` - Google OAuth authentication
- `POST /playlists/generate/stream` - Generate playlist (streaming)
- `GET /moods/history/{user_id}` - Get user's mood history

For full API documentation, visit `/docs` when the backend is running.

---

## 🛡️ Security

- OAuth 2.0 authentication via Google
- CORS protection with allowed origins
- Rate limiting to prevent abuse
- Environment variable-based secrets management
- Secure session handling

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](Mv1/LICENSE) file for details.

Copyright (c) 2025 Aldric Pinto

---
## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---
