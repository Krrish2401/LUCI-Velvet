# Lucidity Chatbot

A full-stack AI-powered productivity assistant built with **Next.js** (frontend) and **Node.js/Express** (backend), featuring conversational AI via Groq, authentication, chat history, and a modern UI with Tailwind CSS.

---

## Features

- ✨ Conversational AI assistant (Groq API, Llama-3.3-70b)
- 🔒 User authentication & session management
- 📚 Persistent chat history (SQLite)
- 📌 Pin, rename, and delete conversations
- 🎨 Responsive, animated UI (Tailwind CSS, Framer Motion)
- 🐳 Dockerized for easy deployment

---


## Getting Started (Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for containerized setup)

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/lucidity-chatbot.git
cd lucidity-chatbot
```

### 2. Environment Variables

#### Backend (`back/.env`)

```
PORT=5000
JWT_SECRET_KEY=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

#### Frontend (`front/.env`)

For **local development**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For **Dockerized/production**:
```
NEXT_PUBLIC_API_URL=http://backend:5000
```

### 3. Run Locally (Without Docker)

#### Backend

```sh
cd back
npm install
npm run dev
```

#### Frontend

```sh
cd front
npm install
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## Dockerized Deployment

### 1. Build & Run with Docker Compose

From the project root:

```sh
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000) (internal: `http://backend:5000`)

### 2. Accessing the App

- Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Environment Variables in Docker

- The backend uses `back/.env` (mounted automatically).
- The frontend uses `front/.env` (copied during build).

---

## API Endpoints

### Authentication

- `POST /api/user/register` — Register new user
- `POST /api/user/login` — Login user

### Chat

- `POST /api/chat/message` — Send message to AI
- `GET /api/chat/chats` — List user chats
- `GET /api/chat/chat/:id` — Get messages for a chat
- `PUT /api/chat/rename/:id` — Rename chat
- `PUT /api/chat/pin/:id` — Pin/unpin chat
- `DELETE /api/chat/delete/:id` — Delete chat

---

## Customization

- **Frontend UI:** Edit components in [`front/app/components/`](front/app/components/)
- **Backend Logic:** Edit routes in [`back/routes/`](back/routes/)
- **Styling:** Tailwind config in [`front/tailwind.config.ts`](front/tailwind.config.ts)

---

## Deployment

- Deploy on any cloud VM (e.g., AWS EC2, DigitalOcean) with Docker installed.
- For production, use a reverse proxy (NGINX, Caddy) for HTTPS and domain routing.
