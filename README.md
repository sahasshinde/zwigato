# 🍽️ Zwigato — Food Instagram

A full-stack food social media platform built with **React + Node.js + MongoDB**.  
Two user types: **Food Lovers** (browse, like, comment, follow) and **Food Partners** (restaurants that post dishes).

---

## 📁 Project Structure

```
zwigato/
├── backend/          ← Node.js + Express + MongoDB API
│   ├── models/       ← Mongoose schemas (User, Partner, Post)
│   ├── routes/       ← REST API routes
│   ├── middleware/   ← JWT auth middleware
│   └── server.js     ← Entry point
└── frontend/         ← React + Vite + Tailwind CSS
    └── src/
        ├── pages/    ← All page components
        ├── components/ ← Reusable components
        ├── context/  ← Auth context (global state)
        └── api/      ← Axios instance
```

---

## ⚙️ Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** → https://www.mongodb.com/try/download/community
- **Git** (optional)

---

## 🚀 Setup & Run Locally

### Step 1 — Install MongoDB
Download and install MongoDB Community Server.  
Start MongoDB: `mongod` (or use MongoDB Compass GUI).

### Step 2 — Backend Setup

```bash
cd zwigato/backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Your `.env` should contain:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/zwigato
JWT_SECRET=zwigato_super_secret_key_change_this
NODE_ENV=development
```

Start the backend:
```bash
npm run dev       # development (auto-reload)
# or
npm start         # production
```

✅ Backend runs at: `http://localhost:5000`

### Step 3 — Frontend Setup

Open a **new terminal**:
```bash
cd zwigato/frontend
npm install
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/user/register` | Register a food lover |
| POST | `/api/auth/user/login` | Login as food lover |
| POST | `/api/auth/partner/register` | Register a restaurant |
| POST | `/api/auth/partner/login` | Login as restaurant |
| GET | `/api/auth/me` | Get current logged-in profile |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/feed` | Get all posts (paginated) |
| POST | `/api/posts` | Create a post (partner only) |
| PUT | `/api/posts/:id/like` | Like / unlike a post (user only) |
| POST | `/api/posts/:id/comment` | Add a comment (user only) |
| DELETE | `/api/posts/:id` | Delete own post (partner only) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get own profile |
| PUT | `/api/users/profile` | Update name/bio |
| PUT | `/api/users/follow/:partnerId` | Follow / unfollow a partner |

### Partners
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/partners` | Get all partners (discover) |
| GET | `/api/partners/profile` | Own partner profile |
| PUT | `/api/partners/profile` | Update profile |
| GET | `/api/partners/:handle` | Public partner profile |

---

## ✨ Features

### 👤 Food Lovers
- Register / Login / Logout with real email validation
- Browse a feed of all dishes
- Like & unlike posts
- Comment on posts
- Discover & follow/unfollow food partners
- Edit profile (name, bio)
- View who you're following

### 🏪 Food Partners (Restaurants)
- Register / Login / Logout with real email validation
- Post dishes with: name, emoji, price, tags, caption
- View dashboard with stats (posts, likes, comments)
- Delete own posts
- Edit restaurant profile (name, bio, location)
- See follower count

---

## 🔐 Authentication
- Passwords are **bcrypt hashed** (never stored plain)
- **JWT tokens** (7-day expiry) stored in localStorage
- All protected routes require `Authorization: Bearer <token>` header
- Email validated with the `validator` library (real email format required)
- Separate auth flows for users vs partners

---

## 🚢 Deploy Online

### Backend → Render.com
1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Set root to `backend/`
4. Add environment variables (MONGO_URI from MongoDB Atlas, JWT_SECRET)
5. Build command: `npm install` | Start command: `npm start`

### Database → MongoDB Atlas (free)
1. Create account at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Get connection string and set as `MONGO_URI`

### Frontend → Vercel
1. Create account at https://vercel.com
2. Import GitHub repo, set root to `frontend/`
3. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Update `frontend/src/api/axios.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| Validation | validator.js |

---

## 📝 Notes for Evaluators
- No images/videos — posts use emoji + text cards (as required)
- Real email format validation on both frontend and backend
- Role-based access control (users vs partners have different permissions)
- Passwords are hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- All API errors return meaningful messages

---

*Built with ❤️ — Zwigato © 2024*
