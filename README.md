# Pawn Broker Management System

A comprehensive, full-stack web application for managing a pawn brokering business. It features a modern, high-contrast **Neumorphic UI** with a built-in Dark/Light mode toggle, dynamic interest calculations, PDF/CSV reporting, and a persistent SQLite database.

## 🚀 Tech Stack

### Frontend
- **React.js**: Core frontend framework.
- **Material-UI (MUI)**: Component library for layout, typography, and interactive elements.
- **React Router**: For client-side routing and navigation.
- **Axios**: For making HTTP requests to the backend.
- **Custom CSS (Neumorphism)**: A custom-built UI methodology using inset and outset box-shadows to create extruded components with Light and Dark themes.

### Backend
- **Node.js & Express.js**: Server-side runtime and API framework.
- **SQLite3**: Lightweight, file-based relational database for storing customers, bills, and payments.
- **CORS & JSON Body Parser**: Middleware for handling cross-origin requests and JSON payloads.

### DevOps & Deployment
- **Docker & Docker Compose**: Containerization of frontend and backend services for seamless environment setup.
- **Persistent Volumes**: Docker volumes configured to ensure the SQLite database survives container restarts.

---

## 🛠️ Features

- **Authentication**: Secure login page (Default credentials: `admin` / `admin123`).
- **Dashboard**: High-level metrics showing Total Bills, Active Bills, Total Customers, and Interest Collected.
- **Create New Bills**: Register new pawn items, calculate loan amounts, and set interest rates.
- **Update & Close Bills**: Manage the lifecycle of a bill, including payment settlements and closing calculations.
- **Export & Reporting**: Generate downloadable reports in PDF, CSV, and JSON formats with digital signature placement.
- **Dynamic Theming**: Seamless switching between Dark and Light mode, dynamically scaling text colors for perfect contrast.

---

## 💻 How to Launch the Project

### Option 1: Using Docker (Recommended)

This is the easiest way to run the project without installing Node.js locally.

1. Ensure [Docker](https://www.docker.com/) and Docker Compose are installed and running on your system.
2. Open a terminal in the root directory of the project (`pawn-broker-system`).
3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

To stop the application, press `Ctrl+C` or run:
```bash
docker-compose down
```

### Option 2: Running Locally (Node.js)

If you prefer to run the servers directly on your machine:

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Start the Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```
3. Access the frontend at [http://localhost:3000](http://localhost:3000).

---

## ⚠️ Troubleshooting & Frequently Occurred Problems

### 1. Database Data is Lost Every Time I Restart the App
**Cause**: The SQLite file (`pawn_broker.db`) was originally stored directly in the backend directory inside the Docker container, which is wiped out when containers restart.
**Solution**: This has been fixed in the current configuration. Ensure that your `docker-compose.yml` mounts a volume for the database. The database is now mapped to `./backend/data/pawn_broker.db` and preserved via a Docker named volume (`backend_data`).

### 2. White Screen or Invisible Text when Switching to Dark Mode
**Cause**: Material-UI's `AppBar` defaults to white text on primary colors, and `global.css` was missing from the React entry point, resulting in white text on a white browser background. Furthermore, MUI's color manipulation engine crashes if passed CSS variables like `var(--neu-text)` for typography.
**Solution**: 
- `global.css` is strictly imported in `index.js`.
- The AppBar is set to `color="transparent"` so it inherits standard text colors.
- CSS variables in `ThemeContext.js` were replaced with raw Hex codes (`#1a1a24` / `#d1d1d1`) to prevent MUI parser crashes.

### 3. Font Sizes are Too Small or Look Congested
**Cause**: The default browser text sizes (14px/16px) were too small for the user's preference on high-resolution monitors.
**Solution**: The global HTML `font-size` is locked at `20px` in `global.css`, and MUI's `fontSize` is scaled to `18` inside `ThemeContext.js`. This creates a perfectly readable, scaled-up layout without causing UI overlap.

### 4. "Port 3000 or 5000 is already in use"
**Cause**: Another application or a previous instance of Node/Docker is running in the background.
**Solution**: 
- Run `docker-compose down` to kill old containers.
- If running locally, check Task Manager for dangling `node.exe` processes and kill them.

### 5. Cannot Generate PDF / Validation Error on Bill Creation
**Cause**: Missing required fields or mismatched data types in the frontend form submission.
**Solution**: The forms have been updated to strictly validate inputs before submission. Ensure the Backend is running and connected (check the network tab for `5000/api/...` calls) when submitting a new bill.
