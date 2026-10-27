# FinOps Frontend

A React + Vite dashboard for the FinOps financial management system, integrated with a FastAPI backend.

## Features

- **Authentication:** Login, registration, and session management using JWT.
- **Dashboard:** Financial summaries, category breakdowns, trends, and recent activity.
- **Transaction Management:** Create, view, update, delete, filter, and paginate financial records according to user permissions.
- **Insights:** View financial insights based on available backend data.
- **User Management:** View and manage users based on role-based permissions.
- **Role-Based Access Control:** Supports Admin, Analyst, and Viewer roles.
- **API Integration:** Communicates with the existing FastAPI backend.

## Tech Stack

- React
- Vite
- JavaScript
- Axios
- React Router
- Vitest

## Prerequisites

- Node.js 18.18 or later
- npm
- FinOps FastAPI backend running locally or on a configured server

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/engg-shivamgupta/FinOps.git
cd FinOps/finops-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `finops-frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Update the URL if your backend is hosted elsewhere.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

http://localhost:5173

Ensure the backend is running and configured to allow requests from the frontend origin.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build |
| `npm test` | Run tests |

## Backend Integration

The frontend integrates with the existing FastAPI backend for:

- Authentication and registration
- User profile and permissions
- Dashboard summaries and insights
- Financial record CRUD operations
- User management

All financial data is retrieved through the backend API.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend |

**Important:** Never store backend secrets, database credentials, or JWT signing keys in frontend environment variables. Variables prefixed with `VITE_` are exposed to client-side code.

## Production Build

Create a production build:

```bash
npm run build
```

The generated static files will be available in the `dist/` directory.

Configure your hosting platform with the correct backend API URL and ensure the backend CORS settings allow the deployed frontend origin.

## Repository

GitHub: https://github.com/engg-shivamgupta/FinOps
