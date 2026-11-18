# 🌸 Lumina - Minimal Tasklist Productivity Dashboard

A full-stack MERN productivity application crafted with a dreamy pastel watercolor aesthetic, translucent glassmorphism panels, and background blur, backed by Node.js, Express, and MongoDB.

![Design Style](https://img.shields.io/badge/Design-Watercolor%20Glassmorphism-pink)
![Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **🎨 Dreamy Pastel Watercolor & Glassmorphism Aesthetic:** Translucent frosted glass panels, soft glowing borders, background blur, and subtle animated golden sparkles.
- **🔄 Real-Time Multi-View Synchronization:** A single source of truth powered by MongoDB. Adding, updating, or completing a task immediately updates the Dashboard, Tasks view, Calendar, and Sidebar badge counters.
- **⏰ Task Deadlines & Priority Tracking:** Native date and time pickers with dynamic status tags (*Overdue*, *Due today*, *Due tomorrow*, *Due in X days*, and *Completed*).
- **🔔 Real-Time Reminder Scheduler:** Background scheduler (running every 15s) that triggers in-app notification center alerts and HTML5 Web Notifications without duplicates.
- **📅 Interactive Calendar Engine:** Previous/Next month navigation, "Today" return button, accurate leap-year day calculations, task markers on corresponding dates, day agenda, and Monthly/Weekly/Daily views.
- **⏱️ Pomodoro Focus Timer:** 25-minute deep focus, 5-minute short break, and 15-minute long rest modes. Persists completed focus sessions to MongoDB and tracks daily focus minutes.
- **📊 Real MongoDB Dashboard:** Dynamically computed completion rates, pending tasks, overdue alerts, and weekly productivity velocity.
- **⚙️ Custom Appearance Controls:** 10 color swatches, light/dark/system themes, density slider, typography selector (Inter, Poppins, Nunito, Outfit), and live reactive miniature preview.

---

## 🚀 Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/varshinimuniraj21/To-Do-List.git
cd To-Do-List
npm install
```

### 2. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
*(If no external MongoDB URI is provided, Lumina automatically starts an embedded MongoDB engine locally for development).*

### 3. Run Application
```bash
# Start backend server (Port 5000)
npm run server

# In another terminal, start Vite frontend (Port 5173)
npm run dev

# Or run both concurrently
npm run start
```
Open [http://localhost:5000](http://localhost:5000) or [http://localhost:5173](http://localhost:5173).

---

## 🌐 Production Deployment Guide

### A. Deploy Backend to Render

1. Sign up / Log in to [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `varshinimuniraj21/To-Do-List`.
4. Configure the Web Service:
   - **Name:** `lumina-todo-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Plan:** Free
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_random_secret_key`
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/minimal_tasklist?retryWrites=true&w=majority` *(From MongoDB Atlas)*
6. Click **Deploy Web Service**.
7. Copy your backend service URL (e.g. `https://lumina-todo-backend.onrender.com`).

---

### B. Deploy Frontend to Vercel

1. Sign up / Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `varshinimuniraj21/To-Do-List`.
4. Framework Preset will automatically detect **Vite**.
5. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://lumina-todo-backend.onrender.com/api` *(Your Render backend URL + `/api`)*
6. Click **Deploy**.
7. Vercel will build and assign your live production URL (e.g. `https://to-do-list-lumina.vercel.app`).

---

### C. MongoDB Atlas Database Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free Shared Cluster (M0).
3. Under **Database Access**, create a database user (username and password).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. In **Clusters** > **Connect** > **Drivers**, copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/minimal_tasklist?retryWrites=true&w=majority
   ```
6. Paste this string as `MONGODB_URI` in your Render Environment Variables.

---

## 🧪 Testing

Run the automated test suite verifying all 10 core integration tests:
```bash
node server/test/suite.js
```
