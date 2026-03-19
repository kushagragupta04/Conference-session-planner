# DevOps Conference Session Planner

A comprehensive, full-stack application designed to streamline the organization, scheduling, and management of DevOps conferences. The platform provides dedicated portals for organizers to manage the event, speakers to submit and schedule sessions, and attendees to discover and register for talks.

## Architecture

The project is built on a modern stack:
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Containerization**: Docker, Docker Compose
- **CI/CD**: Jenkins

### Database Structure

The complete Entity Relationship Diagram (ERD) defining all 11 tables (Users, Sessions, Speakers, Rooms, etc.) and their relationships can be found in the [Infrastructure Documentation](file:///d:/session_planner/infra/infrastructure.md). 

### Docker Containers

When deploying via `docker compose`, the following four containers are provisioned and work together:

1. **`db` (Postgres 16)**
   - Acts as the primary persistent data store for all application data (users, conferences, sessions, schedules).
   - Utilizes a Docker volume (`postgres_data`) to prevent data loss on container restart.
2. **`redis` (Redis 7)**
   - Serves as the in-memory cache and message broker. Primary function is handling high-speed data lookup and potential rate-limiting.
3. **`backend` (Node.js/Express)**
   - The core API server. It connects to both Postgres and Redis, handling all business logic, authentication (JWT), and route processing.
4. **`frontend` (React/Vite)**
   - The user-facing client application. It communicates strictly with the `backend` container via REST APIs to serve the Organizer, Speaker, and Attendee portals.

## Getting Started

Follow these instructions to set up the project locally for development or production use.

### Prerequisites

Ensure you have the following installed on your system:
- Docker and Docker Compose
- Node.js (v18 or higher) and npm (if developing locally without Docker)
- Git

### Quick Start with Docker (Recommended)

The most reliable way to run the application is using the provided Docker Compose configuration.

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd session_planner
   ```

2. **Configure Environment Variables**
   The application requires environment variables for both the frontend and backend. Copy the provided sample files and modify them if necessary.
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start the Services**
   Use Docker Compose to build the images and start the containers. This will spin up the PostgreSQL database, Redis cache, Node.js backend, and the React frontend.
   ```bash
   docker compose up --build -d
   ```

4. **Access the Application**
   - **Frontend App**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   
   *Note: The frontend supports Hot Module Replacement (HMR) for live reloads during development.*

### Local Development (Without Docker)

To run the components individually without Docker:

1. **Start the Database**
   Ensure an instance of PostgreSQL and Redis are running on your machine. Update the `backend/.env` file with your local database credentials.

2. **Run the Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Run the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Continuous Integration & Delivery (Jenkins)

The repository includes a declarative `Jenkinsfile` designed to automate the build, test, and deployment lifecycle. 

The pipeline defines the following stages:
1. **Backend Audit & Build**: Installs Node dependencies and runs `npm audit` for security vulnerabilities.
2. **Frontend Audit & Build**: Installs dependencies, runs a production build (`npm run build`), and performs an audit.
3. **Docker Images Build**: Creates versioned Docker images for both the frontend and backend services utilizing the `env.BUILD_NUMBER`.
4. **Infra Validation**: Validates the syntax of `docker-compose.yml`.
5. **Deploy**: Optionally stops existing containers and brings up the new version using Docker Compose.

To utilize this, initialize a Jenkins Pipeline job pointing to this repository.

## API Endpoints Reference

The backend exposes a RESTful API under the `http://localhost:8000/api` base path. Authentication is handled via JWT. Most endpoints require an Authorization header: `Bearer <token>`.

### Authentication (`/api/auth`)
- `POST /register`: Register a new user (Admin, Speaker, or Attendee).
- `POST /login`: Authenticate and receive a JWT.
- `GET /me`: Retrieve the authenticated user's profile.
- `POST /forgot-password`: Initiate the password recovery process.
- `POST /reset-password`: Commit a new password using a recovery code.

### Organizer Management
- **Conferences** (`/api/conferences`)
  - `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`
- **Tracks** (`/api/tracks`)
  - `GET /`, `GET /conference/:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- **Venues & Rooms** (`/api/venues`, `/api/rooms`)
  - Complete CRUD operations for physical locations and room capacities.

### Speaker Portal (`/api/speaker-portal`)
- `POST /submit-proposal`: Submit a new session proposal.
- `GET /my-sessions`: Retrieve sessions belonging to the authenticated speaker.
- `GET /available-slots`: Fetch open scheduling slots based on room availability and conference dates.
- `POST /schedule`: Lock in a specific timeslot for an approved session.
- `DELETE /sessions/:id`: Withdraw a session proposal.

### Attendee Portal (`/api/attendee-portal`)
- `GET /sessions`: Discover and filter all approved and scheduled sessions.
- `POST /bookmarks`, `GET /bookmarks`: Manage saved sessions.
- `POST /register`: Register to attend a session or join the waitlist.
- `GET /schedule`: View the attendee's personal itinerary.
- `GET /recommendations`: Fetch personalized session recommendations.

### Scheduling & Management (`/api/schedule`, `/api/sessions`)
- **Sessions**: `GET /`, `PATCH /:id/status` (Update state between PENDING, APPROVED, REJECTED).
- **Schedule**: 
  - `GET /`: Retrieve the master schedule.
  - `POST /`: Assign an approved session to a room and timeslot.
  - `PATCH /:session_id/confirm`: Lock a scheduled session.
  - `DELETE /:session_id`: Remove a session from the master schedule.

## Initial Setup & Testing Workflow

1. Open the Frontend at http://localhost:5173.
2. Navigate to "Create Account" and register an Admin user.
3. As an Admin, configure the Conference dates, Venues, Rooms, and Tracks.
4. Log out and register a Speaker account to submit session proposals.
5. Log back in as Admin to review proposals and approve them.
6. As a Speaker, schedule the approved sessions into available slots.
7. As an Admin, use the Schedule Planner to finalize and confirm the master schedule.
8. Finally, register an Attendee account to browse the schedule, bookmark items, and register for sessions.
