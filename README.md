# DevOps Conference Session Planner

A specialized tool for planning, scheduling, and managing DevOps conference sessions.

## 🚀 Quick Start (Docker)

The easiest way to get started is using Docker Compose:

1. **Clone the repository** (or ensure you are in the project root).
2. **Set up Environment Variables**:
   Copy the example files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. **Run the services**:
   ```bash
   docker-compose up --build
   ```

## 🌐 Accessing the App

- **Frontend**: [http://localhost:5173](http://localhost:5173) (HMR enabled)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Health Check**: [http://localhost:8000/api/auth/me](http://localhost:8000/api/auth/me) (requires token)

## 🛠️ Local Development (Manual)

If you prefer to run services manually:

### Backend (Express)
```bash
cd backend
npm install
npm run dev
```
*Note: Requires a running PostgreSQL instance. Update `.env` accordingly.*

### Frontend (React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing Flow
1. Open the [Frontend](http://localhost:5173).
2. Go to **"Create Account"** and register as an Admin, Speaker, or Attendee.
3. You will be automatically redirected to the **Dashboard**.
4. Use the **Logout** button and try logging back in.
"# Conference-session-planner" 
