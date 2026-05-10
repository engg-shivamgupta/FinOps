# FinOps - Finance Dashboard Backend

A role-based finance data processing and access control backend built with **FastAPI**, **MySQL**, and **SQLAlchemy**.

## Tech Stack

- **Framework:** FastAPI (Python 3.12)
- **Database:** MySQL 8.0
- **ORM:** SQLAlchemy 2.0
- **Auth:** JWT (python-jose) + bcrypt password hashing
- **Containerization:** Docker & Docker Compose

## Project Structure

```
FinOps/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings (MySQL, JWT config)
│   ├── database.py             # SQLAlchemy engine & session
│   ├── models/
│   │   ├── user.py             # User model with RoleEnum
│   │   └── financial.py        # FinancialRecord model with CategoryEnum
│   ├── schemas/
│   │   ├── user.py             # Pydantic schemas for users & auth
│   │   └── financial.py        # Pydantic schemas for records & dashboard
│   ├── roles/
│   │   ├── interfaces.py       # IRoleInterface (abstract base)
│   │   ├── registry.py         # RoleRegistrar - maps roles to interfaces
│   │   ├── viewer.py           # Viewer role implementation
│   │   ├── analyst.py          # Analyst role implementation
│   │   └── admin.py            # Admin role implementation
│   ├── services/
│   │   └── auth.py             # JWT, password hashing, auth dependencies
│   └── api/
│       ├── auth.py             # AuthController (register, login)
│       ├── users.py            # UserController (CRUD, deactivate)
│       ├── records.py          # RecordController (CRUD, filter, search)
│       └── dashboard.py        # DashboardController (summary, insights)
├── seed.py                     # Database seed script
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd FinOps

# Start MySQL and the API
docker compose up --build

# In a separate terminal, seed the database with sample data
docker compose exec api python seed.py

# Or seed with a custom number of records
docker compose exec api python seed.py --count 500
```

The API will be available at **http://localhost:8000**

### Run Locally (Without Docker)

```bash
# Ensure MySQL is running and a database named 'finops' exists

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create a .env file)
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=finops
export DB_PASSWORD=finops_secret
export DB_NAME=finops

# Start the server
uvicorn app.main:app --reload

# Seed the database
python seed.py
```

## API Documentation

Once the server is running, interactive docs are available at:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Default Users (After Seeding)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| analyst | analyst123 | Analyst |
| viewer | viewer123 | Viewer |

## Role Registrar Pattern

The core access control uses a **Registrar** that maps each role to an **interface** (a set of permissions). On login, the role's interface is returned alongside the JWT token.

```
RoleRegistrar._registry = {
    "viewer"  -> ViewerRole()    # implements IRoleInterface
    "analyst" -> AnalystRole()   # implements IRoleInterface
    "admin"   -> AdminRole()     # implements IRoleInterface
}
```

**How it works:**
1. Each role has a class implementing `IRoleInterface` with methods like `can_create_record()`, `can_view_dashboard()`, etc.
2. `RoleRegistrar.get(role)` returns the interface instance for that role.
3. Every API endpoint calls the relevant permission method via the injected interface — if denied, a `403 Forbidden` is raised.
4. On login, the full permissions map is returned so the frontend knows what the user can do.

### Permissions Matrix

| Permission | Viewer | Analyst | Admin |
|------------|--------|---------|-------|
| View Records | Yes | Yes | Yes |
| Create Record | No | No | Yes |
| Update Record | No | No | Yes |
| Delete Record | No | No | Yes |
| View Dashboard | Yes | Yes | Yes |
| View Insights | No | Yes | Yes |
| Manage Users | No | No | Yes |

### Adding a New Role

1. Create a new class in `app/roles/` implementing `IRoleInterface`
2. Register it in `RoleRegistrar._registry` in `app/roles/registry.py`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token + role interface |

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| PATCH | `/api/users/{id}` | Update user (role, status, name) |
| DELETE | `/api/users/{id}` | Deactivate user (soft delete) |

### Financial Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records/` | List records (with filters & pagination) |
| GET | `/api/records/{id}` | Get single record |
| POST | `/api/records/` | Create record (Admin only) |
| PUT | `/api/records/{id}` | Update record (Admin only) |
| DELETE | `/api/records/{id}` | Soft delete record (Admin only) |

**Query Parameters for listing:**
- `type` — filter by `income` or `expense`
- `category` — filter by category enum value
- `date_from` / `date_to` — date range filter
- `search` — search in description
- `page` / `size` — pagination (default: page=1, size=20)

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance, category totals, recent activity, monthly trends |
| GET | `/api/dashboard/insights` | Top expense categories, top income sources, record count (Analyst & Admin) |
| GET | `/api/dashboard/roles` | Public endpoint — returns the role registrar's permission map for all roles |

## Categories

Financial records use a fixed set of categories:

`salary`, `freelance`, `investment`, `rent`, `utilities`, `groceries`, `transport`, `entertainment`, `healthcare`, `education`, `shopping`, `food_dining`, `insurance`, `taxes`, `other`

## Data Model

### User
- `id`, `username`, `email`, `hashed_password`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`

### FinancialRecord
- `id`, `amount`, `type` (income/expense), `category` (enum), `date`, `description`, `created_by`, `status` (created/deleted), `created_at`, `updated_at`

## Design Decisions & Assumptions

- **Class-based endpoints:** All API handlers are organized as static methods inside controller classes (`AuthController`, `UserController`, `RecordController`, `DashboardController`).
- **Registrar pattern for RBAC:** Instead of decorators or middleware-only checks, each role maps to a concrete interface via `RoleRegistrar`. This makes permissions explicit, testable, and easy to extend.
- **JWT auth:** Stateless token-based authentication. The login response includes the role's full permission interface so the frontend can render UI accordingly.
- **MySQL:** Used as the primary database with Docker Compose for easy setup.
- **Seed script:** Generates realistic random data across all categories for testing and demo purposes.
