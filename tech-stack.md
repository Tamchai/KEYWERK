# KEYWERK — Technology Stack & Architecture Reference

> **Project:** KEYWERK (Mechanical Keyboard E-Commerce Platform)  
> **Status:** Active Development  
> **Note:** The active backend is `backend2/`. The `backend/` folder is legacy and ignored.

---

## 1. Executive Summary

KEYWERK is built using a modern decoupled architecture:
- **Frontend SPA**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4
- **Backend API**: Go 1.25 + Fiber v2 with Hexagonal Architecture (Ports & Adapters)
- **Database**: Neon Serverless PostgreSQL (Cloud)
- **Object Storage**: SeaweedFS (S3-compatible distributed storage via Docker)

---

## 2. Frontend Technology Stack (`frontend/`)

| Category | Technology | Version | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [React](https://react.dev/) | `^19.2.7` | UI component rendering with React 19 concurrent features |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `~6.0.2` | Static type safety and developer productivity |
| **Build Tool & Dev Server** | [Vite](https://vitejs.dev/) | `^8.1.1` | Ultra-fast Hot Module Replacement (HMR) and bundling |
| **Styling Framework** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.2` | Next-generation engine with `@tailwindcss/vite` plugin |
| **Animation Library** | [Motion](https://motion.dev/) | `^12.42.2` | Modern declarative animations and micro-interactions |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^7.18.1` | Client-side routing, protected routes, URL hash navigation |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^1.24.0` | Clean, customizable vector icons |
| **Linter** | [Oxlint](https://oxc.rs/) | `^1.71.0` | High-performance Rust-based JavaScript/TypeScript linter |
| **Utility** | [clsx](https://github.com/lukeed/clsx) | `^2.1.1` | Conditional class name concatenation |

### Design System & Theme Engine
- **Aesthetic:** Cyberpunk / Industrial Luxury Mechanical Keyboard theme.
- **Palette Tokens (CSS Variables):**
  - `--bg`: `#0e0c08` (Deep dark background)
  - `--bg-alt`: `#17140d` (Secondary background)
  - `--surface`: `#1f1b12` (Card and modal surfaces)
  - `--surface-top`: `#292319` (Elevated elements)
  - `--line`: `#35301f` (Borders and dividers)
  - `--text`: `#f2ede0` (Warm primary text)
  - `--text-dim`: `#a89f8a` (Muted secondary text)
  - `--accent`: `#e8b923` (Signature Gold/Amber brand accent)
- **Typography:**
  - Code/Accent: `'JetBrains Mono', monospace`
  - Body/Interface: `'Inter', system-ui, sans-serif`

---

## 3. Backend Technology Stack (`backend2/`)

| Category | Technology | Version | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Language** | [Go](https://go.dev/) | `1.25.1` | High-performance compiled language for backend APIs |
| **Web Framework** | [Fiber v2](https://gofiber.io/) | `v2.52.14` | Express-inspired web framework built on Fasthttp |
| **Database Library** | [sqlx](https://github.com/jmoiron/sqlx) | `v1.4.0` | Extensions to Go's standard `database/sql` for struct scanning |
| **Database Driver** | [lib/pq](https://github.com/lib/pq) | `v1.12.3` | Pure Go PostgreSQL driver for database connections |
| **Storage SDK** | [AWS SDK for Go v2](https://github.com/aws/aws-sdk-go-v2) | `v1.43.5` (S3: `v1.107.1`) | S3 API integration for SeaweedFS media management |
| **Configuration** | [Viper](https://github.com/spf13/viper) | `v1.21.0` | Complete configuration solution for YAML & environment variables |
| **Authentication** | [golang-jwt/jwt/v5](https://github.com/golang-jwt/jwt) & [gofiber/jwt/v4](https://github.com/gofiber/jwt) | `v5.3.1` / `v4.0.0` | JWT token generation, parsing, and route protection middleware |
| **Cryptography** | [golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto) | `v0.54.0` | Secure password hashing using `bcrypt` |
| **Validation** | [validator/v10](https://github.com/go-playground/validator) | `v10.30.3` | Struct and field validation for incoming DTOs |
| **Identifier** | [google/uuid](https://github.com/google/uuid) | `v1.6.0` | UUID v4 generation for entity identifiers |

---

## 4. Infrastructure & Database

| Service | Technology | Details |
| :--- | :--- | :--- |
| **Relational Database** | **Neon PostgreSQL** | Serverless PostgreSQL in AWS `ap-southeast-1` with connection pooling |
| **Object Storage** | **SeaweedFS** | Self-hosted S3-compatible distributed storage for product images & assets (Docker container) |
| **Cache (Prepared)** | **Redis** | In-memory key-value store configured for session/cache scaling |
| **Containerization** | **Docker & Docker Compose** | Multi-container setup for local development (SeaweedFS storage cluster) |

---

## 5. Architectural Patterns & Decisions

### 5.1 Hexagonal Architecture (Ports & Adapters) in `backend2/`
The backend adopts Hexagonal Architecture to isolate domain logic from external dependencies:

```text
               ┌────────────────────────────────────────────────────────┐
               │                        backend2                        │
               │                                                        │
HTTP Client ───┼─► Inbound HTTP Adapters (Fiber Handlers)               │
               │                 │                                      │
               │                 ▼                                      │
               │         Core Domain Services (Business Rules)          │
               │                 │                                      │
               │                 ▼                                      │
               │         Core Port Interfaces (Repository Contracts)    │
               │                 │                                      │
               │                 ▼                                      │
Database / S3 ◄┼── Outbound Adapters (Neon PostgreSQL / SeaweedFS S3)  │
               └────────────────────────────────────────────────────────┘
```

**Benefits:**
- **Testability:** Core domain services can be unit-tested by mocking repository ports.
- **Maintainability:** Swapping databases or storage providers (e.g. SeaweedFS to AWS S3 or MinIO) requires modifying only the outbound adapter layer without touching business logic.
- **Clear Separation of Concerns:** HTTP routing/serialization is decoupled from domain entities and persistence queries.

### 5.2 Tailwind CSS v4 + Zero-Runtime Styling
The frontend adopts Tailwind CSS v4 with Vite integration:
- Uses the unified `@import "tailwindcss";` directive in CSS.
- Integrates seamlessly with CSS custom properties (variables) for theme switching and consistency.
- Drastically reduced build times compared to previous Tailwind versions.

---

## 6. Directory and Responsibility Mapping

```text
KEYWERK
├── frontend/
│   ├── src/
│   │   ├── components/layout/   # Global UI shell (Navbar, Footer, SearchModal)
│   │   ├── components/hero/     # Promotional hero banner and animated highlights
│   │   ├── components/products/ # Reusable product cards and category grids
│   │   ├── context/             # Global states (AuthContext, user session)
│   │   ├── pages/               # Routed views (Home, Keyboard, Switches, Keycaps, Cart, Profile, etc.)
│   │   └── index.css            # Core color system, CSS variables & typography
│
├── backend2/
│   ├── cmd/
│   │   ├── main.go              # Entry point, config loader, DB connector, server bootstrap
│   │   └── router/v1/           # API v1 endpoint mapping
│   ├── internal/
│   │   ├── core/domain/dto/     # Input/Output DTO structs with tags
│   │   ├── core/domain/service/ # Pure business logic layer
│   │   ├── core/port/           # Repository and storage interface definitions
│   │   ├── adapter/inbound/     # Fiber HTTP handlers & controllers
│   │   ├── adapter/outbound/    # Neon DB implementations (SQL queries) & S3 storage
│   │   ├── infrastructure/      # DB connection setup
│   │   └── middleware/          # JWT authentication and Admin role enforcement
│   └── docker-compose.yml       # SeaweedFS local storage configuration
│
└── backend/                     # [DEPRECATED] Ignored by development workflows
```
