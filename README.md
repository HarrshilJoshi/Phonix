# 🎵 Phonix - Your Private Music Sanctuary

Phonix is a modern, high-performance music streaming and downloading application. It combines a sleek React-based frontend with a powerful Node.js backend to provide seamless music playback, on-demand track compilation, and deep Telegram integration.

## ✨ Features

- **🚀 High-Quality Streaming**: Smooth audio playback with intuitive controls.
- **📥 On-Demand Compilation**: Request any track, and the backend compiles it into high-quality MP3 using FFmpeg.
- **🤖 Telegram Integration**: Integrated bot support for music requests and automated processing.
- **❤️ Personal Library**: Save your favorite tracks to "Liked Songs" and manage custom playlists.
- **🔐 Secure Auth**: Robust user authentication and data persistence powered by Firebase.
- **🎨 Premium UI**: Modern, responsive design with fluid animations (GSAP & Lucide).
- **📱 PWA Ready**: Installable on mobile and desktop for a native App experience.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Processing**: [FFmpeg](https://ffmpeg.org/)
- **Bot Framework**: [Telegraf](https://telegraf.js.org/) (Telegram Bot API)

### Database & Services
- **Auth/Database**: [Firebase](https://firebase.google.com/)
- **Hosting**: Render 

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- FFmpeg installed on your system (for backend processing)

### 1. Clone the Repository
```bash
git clone https://github.com/HarrshilJoshi/Music-app.git
cd Music-app
```

### 2. Backend Setup (`saadhna-server`)
```bash
cd saadhna-server
npm install
```
Create a `.env` file in `saadhna-server/`:
```env
TELEGRAM_TOKEN=your_bot_token
GROUP_ID=your_telegram_group_id
PORT=3000
```
Run the server:
```bash
npm start
```

### 3. Frontend Setup (`frontend`)
```bash
cd ../frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```
Run the development server:
```bash
npm run dev
```

## 📜 License

This project is licensed under the MIT License.

## ✨ Author
[Harshil Joshi](https://github.com/HarrshilJoshi)
