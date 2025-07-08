# 🚀 DevTok

**DevTok** is a modern, full-stack web application for sharing, watching, and discussing code tutorial videos — think *TikTok/Instagram for developers*, with **AI-powered features** like code explanation and quiz generation.

---

## ✨ Features

- 🔐 **User Authentication**: Google OAuth via Firebase  
- 📤 **Video Upload**: Upload coding tutorial videos (stored on Cloudinary)  
- 📱 **Feed**: Browse a stylish, vertical video feed (Instagram/TikTok style)  
- ❤️ **Like & Comment**: Social features for each video  

### 🤖 AI Tools

- 🧪 Run code snippets in-browser (Pyodide)  
- 📘 AI-powered code explanation  
- 🧠 AI-generated quizzes  

- 👤 **Profile**: User profile and bio  
- ✅ **Production-Ready**: All secrets managed via `.env` and never committed  

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- React (Vite)
- Tailwind CSS
- Firebase Auth

### 🧠 Backend
- FastAPI
- Firebase Firestore
- Cloudinary
- python-dotenv

### 🤖 AI/ML
- External endpoints for:
  - Code explanation
  - Quiz generation

### 🧬 Other
- Pyodide (in-browser Python)
- Google OAuth

---


## 📱 Usage

1. 🔐 **Sign in with Google** (OAuth)
2. 📤 **Upload a code tutorial video** (with code snippet)
3. 📱 **Browse** the vertical video feed
4. ❤️ **Like**, 💬 **comment**, and 📤 **share** videos
5. 🧪 **Run code snippets in-browser**
6. 📘 **Get AI explanations** for code/video
7. 🧠 **Generate quizzes** for learning

---

## 📡 API Endpoints (Backend)

### 👤 User
- `POST /register_user/` — Register a new user

### 📹 Snaps (Videos)
- `POST /upload_snap/` — Upload a new video snap
- `GET /fetch_snaps/` — Fetch all video snaps
- `POST /like_snap/{snap_id}` — Like a snap

### 💬 Comments
- `GET /comments/{snap_id}` — Get comments for a snap
- `POST /comment_snap/{snap_id}` — Add a comment

> ⚠️ **Note**: AI-related endpoints are **proxied/external** and not exposed directly in the backend.

---

## 🔐 Security

- 🔑 All secrets are loaded from `.env`
- 🔒 Service account JSON is **never committed**
- 🌐 CORS is **enabled for development**; restrict in production for security
