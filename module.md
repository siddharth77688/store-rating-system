# Store Rating Platform — FullStack Application

> **Interview Submission** | End-to-end Store Rating System with Role-Based Access Control
> 
> **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
> **Backend:** Spring Boot 3 + Java 17 + Spring Security + JPA/Hibernate  
> **Database:** MySQL 8.0  
> **Authentication:** JWT (JSON Web Tokens)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Project Structure](#project-structure)
   - [Frontend (Next.js)](#frontend-nextjs)
   - [Backend (Spring Boot)](#backend-spring-boot)
5. [API Endpoints](#api-endpoints)
6. [Authentication Flow](#authentication-flow)
7. [Role-Based Access Matrix](#role-based-access-matrix)
8. [Build & Run Instructions](#build--run-instructions)
9. [Environment Configuration](#environment-configuration)
10. [Key Implementation Decisions](#key-implementation-decisions)

---

## Project Overview

A fullstack web application enabling users to submit ratings (1-5) for registered stores. Features three user roles with distinct capabilities, real-time rating calculations, and comprehensive admin dashboards.

### Core Features
- 🔐 **Unified Authentication** — Single login system with role-based redirection
- 👤 **Normal Users** — Sign up, browse stores, submit/modify ratings
- 🏪 **Store Owners** — View store analytics, see rating submissions
- 🛡️ **System Administrator** — Full CRUD operations, dashboards, filters
- 📊 **Sorting & Filtering** — All tables support multi-column sort and filter
- ✅ **Form Validation** — Strict client + server-side validation rules

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Next.js 14  │  │  Tailwind   │  │  shadcn/ui   │       │
│  │  App Router  │  │    CSS      │  │  Components  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  • React Server Components (RSC) for data fetching        │
│  • Client Components for interactive UI (ratings, forms)    │
│  • TanStack Query for server state & caching                │
│  • Zod for form validation schema                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST + JWT Bearer
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│                    Spring Boot 3.2+                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Spring     │  │   Spring     │  │   Spring     │       │
│  │   Security   │  │   Data JPA   │  │   Validation │       │
│  │   (JWT)      │  │   (Hibernate)│  │   (Jakarta)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  • Role-based authorization with @PreAuthorize            │
│  • Global exception handling (@ControllerAdvice)          │
│  • DTO pattern for request/response mapping                │
│  • Custom validators for business rules                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ JDBC
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                             │
│                      PostgreSQL 15+                        │
│                                                              │
│  Tables: users, stores, ratings (see schema below)         │
│  • Indexes on email, name, role for filtering/sorting      │
│  • Composite unique constraint: (user_id, store_id)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Users Table (Single table for all roles)
CREATE TABLE users (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(60) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,  -- BCrypt hashed
    address         VARCHAR(400) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stores Table
CREATE TABLE stores (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    address         VARCHAR(400) NOT NULL,
    owner_id        BIGINT,
    overall_rating  DECIMAL(2,1) DEFAULT 0.0,
    total_ratings   INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ratings Table (Junction with metadata)
CREATE TABLE ratings (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    store_id        BIGINT NOT NULL,
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
```

---

## Project Structure

### Frontend (Next.js)

```
store-rating-frontend/
├── app/                                    # Next.js 14 App Router
│   ├── (auth)/                             # Route group: Auth pages
│   │   ├── login/
│   │   │   └── page.tsx                    # Unified login form
│   │   └── register/
│   │       └── page.tsx                    # Normal user signup
│   │
│   ├── (dashboard)/                         # Route group: Protected routes
│   │   ├── admin/                          # Admin role routes
│   │   │   ├── page.tsx                    # Admin dashboard (stats cards)
│   │   │   ├── stores/
│   │   │   │   └── page.tsx                # Store listing with filters
│   │   │   ├── users/
│   │   │   │   └── page.tsx                # User listing with filters
│   │   │   └── layout.tsx                  # Admin sidebar layout
│   │   │
│   │   ├── user/                           # Normal user routes
│   │   │   ├── page.tsx                    # User home (store browser)
│   │   │   ├── stores/
│   │   │   │   └── page.tsx                # All stores with my ratings
│   │   │   ├── profile/
│   │   │   │   └── page.tsx                # Update password
│   │   │   └── layout.tsx                  # User navbar layout
│   │   │
│   │   └── owner/                          # Store owner routes
│   │       ├── page.tsx                    # Owner dashboard (analytics)
│   │       ├── ratings/
│   │       │   └── page.tsx                # Users who rated my store
│   │       ├── profile/
│   │       │   └── page.tsx                # Update password
│   │       └── layout.tsx                  # Owner sidebar layout
│   │
│   ├── api/                                # Next.js API routes (optional proxy)
│   │   └── auth/
│   │       └── [...nextauth]/              # If using NextAuth.js (optional)
│   │
│   ├── layout.tsx                          # Root layout (providers, fonts)
│   ├── page.tsx                            # Landing page / redirect to login
│   └── globals.css                         # Global styles + Tailwind
│
├── components/                             # Reusable UI components
│   ├── ui/                                 # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   └── toast.tsx
│   │
│   ├── auth/                               # Auth-specific components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── password-input.tsx
│   │
│   ├── shared/                             # Shared across all roles
│   │   ├── data-table/                     # Reusable sortable/filterable table
│   │   │   ├── data-table.tsx
│   │   │   ├── column-header.tsx           # Sortable column header
│   │   │   ├── filter-input.tsx            # Column filter input
│   │   │   └── pagination.tsx
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── logout-button.tsx
│   │   └── role-gate.tsx                   # Role-based access wrapper
│   │
│   ├── admin/                              # Admin-specific components
│   │   ├── stats-cards.tsx                 # Dashboard stat cards
│   │   ├── add-user-dialog.tsx             # Modal to add users/stores
│   │   ├── add-store-dialog.tsx
│   │   └── user-detail-dialog.tsx
│   │
│   ├── user/                               # User-specific components
│   │   ├── store-card.tsx                  # Store card with rating UI
│   │   ├── rating-stars.tsx                # Interactive 5-star rating
│   │   └── store-search.tsx                # Search by name/address
│   │
│   └── owner/                              # Owner-specific components
│       ├── rating-list.tsx                 # List of users who rated
│       └── average-rating-card.tsx
│
├── hooks/                                  # Custom React hooks
│   ├── use-auth.ts                         # Auth state & JWT management
│   ├── use-api.ts                          # Generic API fetch wrapper
│   ├── use-stores.ts                       # Store data fetching
│   ├── use-ratings.ts                      # Rating CRUD operations
│   └── use-users.ts                        # User data fetching (admin)
│
├── lib/                                    # Utilities & configurations
│   ├── api-client.ts                       # Axios/fetch instance with interceptors
│   ├── auth.ts                             # JWT decode, token storage
│   ├── constants.ts                        # App constants (roles, routes)
│   ├── utils.ts                            # cn() helper, formatters
│   └── validations/                        # Zod schemas
│       ├── auth-schema.ts                  # Login/register validation
│       ├── user-schema.ts                  # User CRUD validation
│       ├── store-schema.ts                 # Store validation
│       └── rating-schema.ts                # Rating validation (1-5)
│
├── types/                                  # TypeScript interfaces
│   ├── auth.ts                             # User, LoginRequest, RegisterRequest
│   ├── store.ts                            # Store, StoreWithRating
│   ├── rating.ts                           # Rating, RatingSubmission
│   └── api.ts                              # ApiResponse, PaginatedResponse
│
├── public/                                 # Static assets
│   └── logo.svg
│
├── middleware.ts                           # Route protection & role redirection
├── next.config.js                          # Next.js config (API proxy)
├── tailwind.config.ts                      # Tailwind + shadcn theme
├── tsconfig.json
└── package.json
```

### Backend (Spring Boot)

```
store-rating-backend/
├── src/
│   ├── main/
│   │   ├── java/com/storerating/
│   │   │   ├── StoreRatingApplication.java          # Entry point
│   │   │   │
│   │   │   ├── config/                              # Configuration classes
│   │   │   │   ├── SecurityConfig.java               # Spring Security + JWT filter
│   │   │   │   ├── JwtConfig.java                    # JWT properties
│   │   │   │   ├── CorsConfig.java                   # CORS for Next.js frontend
│   │   │   │   ├── MapperConfig.java                 # ModelMapper/MapStruct
│   │   │   │   └── WebConfig.java                    # Interceptors, formatters
│   │   │   │
│   │   │   ├── controller/                          # REST API controllers
│   │   │   │   ├── AuthController.java               # POST /api/auth/login, /register
│   │   │   │   ├── UserController.java               # Admin user CRUD
│   │   │   │   ├── StoreController.java              # Store CRUD + search
│   │   │   │   └── RatingController.java             # Rating submit/modify
│   │   │   │
│   │   │   ├── service/                             # Business logic layer
│   │   │   │   ├── AuthService.java                  # Login, register, JWT generation
│   │   │   │   ├── UserService.java                  # User CRUD + filtering
│   │   │   │   ├── StoreService.java                 # Store CRUD + search + avg rating
│   │   │   │   └── RatingService.java                # Rating CRUD + avg calculation
│   │   │   │
│   │   │   ├── repository/                          # Data access layer
│   │   │   │   ├── UserRepository.java               # JPA + custom queries
│   │   │   │   ├── StoreRepository.java              # JPA + search queries
│   │   │   │   └── RatingRepository.java             # JPA + aggregation queries
│   │   │   │
│   │   │   ├── entity/                              # JPA Entities
│   │   │   │   ├── User.java                         # Users table entity
│   │   │   │   ├── Store.java                        # Stores table entity
│   │   │   │   └── Rating.java                       # Ratings table entity
│   │   │   │
│   │   │   ├── dto/                                 # Data Transfer Objects
│   │   │   │   ├── request/                          # Incoming request DTOs
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── CreateUserRequest.java        # Admin creates user
│   │   │   │   │   ├── CreateStoreRequest.java
│   │   │   │   │   ├── UpdatePasswordRequest.java
│   │   │   │   │   └── SubmitRatingRequest.java
│   │   │   │   │
│   │   │   │   └── response/                         # Outgoing response DTOs
│   │   │   │       ├── AuthResponse.java             # JWT token + user info
│   │   │   │       ├── UserResponse.java
│   │   │   │       ├── StoreResponse.java
│   │   │   │       ├── StoreDetailResponse.java      # With owner + ratings
│   │   │   │       ├── RatingResponse.java
│   │   │   │       ├── DashboardStatsResponse.java   # Admin dashboard
│   │   │   │       └── ApiResponse.java              # Generic wrapper
│   │   │   │
│   │   │   ├── mapper/                              # Entity <-> DTO mapping
│   │   │   │   ├── UserMapper.java
│   │   │   │   ├── StoreMapper.java
│   │   │   │   └── RatingMapper.java
│   │   │   │
│   │   │   ├── security/                            # Security components
│   │   │   │   ├── JwtTokenProvider.java             # Generate/validate JWT
│   │   │   │   ├── JwtAuthenticationFilter.java      # Filter for JWT validation
│   │   │   │   ├── UserDetailsServiceImpl.java       # Load user by email
│   │   │   │   └── CustomUserDetails.java            # UserDetails implementation
│   │   │   │
│   │   │   ├── exception/                           # Exception handling
│   │   │   │   ├── GlobalExceptionHandler.java       # @ControllerAdvice
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   └── UnauthorizedException.java
│   │   │   │
│   │   │   ├── validator/                           # Custom validators
│   │   │   │   ├── PasswordValidator.java            # 8-16, uppercase, special char
│   │   │   │   ├── NameValidator.java                # 20-60 chars
│   │   │   │   └── RatingValidator.java              # 1-5 range
│   │   │   │
│   │   │   └── enums/                               # Enums
│   │   │       └── UserRole.java                     # ADMIN, USER, STORE_OWNER
│   │   │
│   │   └── resources/
│   │       ├── application.yml                     # Main config (profiles)
│   │       ├── application-dev.yml                   # Development profile
│   │       ├── application-prod.yml                  # Production profile
│   │       ├── db/
│   │       │   ├── migration/
│   │       │   │   ├── V1__init_schema.sql           # Flyway/Liquibase migration
│   │       │   │   └── V2__add_indexes.sql
│   │       │   └── seed/
│   │       │       └── admin_seed.sql                # Default admin account
│   │       └── logback-spring.xml                    # Logging config
│   │
│   └── test/
│       ├── java/com/storerating/
│       │   ├── controller/                           # Integration tests (@WebMvcTest)
│       │   ├── service/                              # Unit tests (@Mockito)
│       │   ├── repository/                           # Data layer tests (@DataJpaTest)
│       │   └── security/                             # JWT tests
│       └── resources/
│           └── application-test.yml                  # H2 in-memory config
│
├── pom.xml                                           # Maven dependencies
└── README.md
```

---

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/register` | Normal user signup | `RegisterRequest` |
| `POST` | `/api/auth/login` | Universal login | `LoginRequest` |

### Admin (ROLE_ADMIN required)
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/dashboard/stats` | Dashboard statistics | — |
| `GET` | `/api/admin/users` | List all users | `name`, `email`, `address`, `role`, `sort`, `order` |
| `POST` | `/api/admin/users` | Create user/store owner | `CreateUserRequest` |
| `GET` | `/api/admin/users/{id}` | User details | — |
| `GET` | `/api/admin/stores` | List all stores | `name`, `email`, `address`, `sort`, `order` |
| `POST` | `/api/admin/stores` | Create new store | `CreateStoreRequest` |

### Normal User (ROLE_USER required)
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/stores` | List all stores | `search`, `sort`, `order` |
| `GET` | `/api/stores/{id}` | Store detail | — |
| `POST` | `/api/ratings` | Submit rating | `SubmitRatingRequest` |
| `PUT` | `/api/ratings/{id}` | Modify rating | `SubmitRatingRequest` |
| `PUT` | `/api/users/password` | Update password | `UpdatePasswordRequest` |

### Store Owner (ROLE_STORE_OWNER required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/owner/dashboard` | Store analytics | — |
| `GET` | `/api/owner/ratings` | Users who rated | — |
| `PUT` | `/api/users/password` | Update password | `UpdatePasswordRequest` |

---

## Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js     │────▶│  Spring Boot      │────▶│  PostgreSQL │
│  (Frontend) │     │  (Frontend)  │     │  (Backend)        │     │  (Database) │
└─────────────┘     └──────────────┘     └─────────────────┘     └─────────────┘
       │                   │                      │                      │
       │  1. Login Form    │                      │                      │
       │──────────────────▶                      │                      │
       │                   │  2. POST /api/auth/login                │
       │                   │─────────────────────▶│                      │
       │                   │                      │  3. Validate credentials
       │                   │                      │─────────────────────▶│
       │                   │                      │                      │
       │                   │                      │◀─────────────────────│
       │                   │                      │  4. Generate JWT      │
       │                   │◀─────────────────────│                      │
       │                   │  5. Return {token, user}                 │
       │◀──────────────────│                      │                      │
       │  6. Store JWT in httpOnly cookie / localStorage              │
       │                   │                      │                      │
       │  7. Subsequent requests with Authorization: Bearer <token>  │
       │                   │─────────────────────▶│                      │
       │                   │                      │  8. JWT Filter validates
       │                   │                      │  9. @PreAuthorize checks role
       │                   │◀─────────────────────│  10. Return data       │
       │◀──────────────────│                      │                      │
       │  11. Render UI based on role            │                      │
```

### JWT Token Structure
```json
{
  "sub": "user@email.com",
  "userId": 123,
  "role": "ADMIN",
  "iat": 1718726400,
  "exp": 1718812800
}
```

---

## Role-Based Access Matrix

| Feature | Admin | Normal User | Store Owner |
|---------|:-----:|:-----------:|:-----------:|
| Login | ✅ | ✅ | ✅ |
| Register | ❌ | ✅ | ❌ |
| Update Password | ❌ | ✅ | ✅ |
| View All Stores | ✅ | ✅ | ❌ |
| Submit/Modify Rating | ❌ | ✅ | ❌ |
| Search Stores | ✅ | ✅ | ❌ |
| View Store Ratings | ✅ | ✅ | ✅ (own only) |
| View Dashboard Stats | ✅ | ❌ | ✅ (own store) |
| Add Users | ✅ | ❌ | ❌ |
| Add Stores | ✅ | ❌ | ❌ |
| View All Users | ✅ | ❌ | ❌ |
| Filter/Sort Tables | ✅ | ✅ (stores) | ❌ |
| Logout | ✅ | ✅ | ✅ |

---

## Build & Run Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **Java** 17+ or 21+ and Maven 3.9+
- **MySQL** 8.0+

### Option 1: Local Development

#### 1. Database Setup
```bash
# Connect to MySQL and create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS store_rating;"
```

#### 2. Backend (Spring Boot)
```bash
cd Backend

# Run with Maven (Seeds database automatically on first startup)
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/store-rating-0.0.1-SNAPSHOT.jar

# Backend runs on: http://localhost:8080/api
```

#### 3. Frontend (Next.js)
```bash
cd Frontend/myadmin

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend runs on: http://localhost:3000
```

## Environment Configuration

### Frontend Config
The Next.js frontend is configured to call the API Gateway directly at:
`http://localhost:8080/api`

### Backend `application.yml`
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/store_rating?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: Sac@placement47
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect

jwt:
  secret: this-is-a-very-secure-jwt-secret-key-for-store-rating-platform
  expiration: 86400000  # 24 hours in milliseconds

cors:
  allowed-origins: http://localhost:3000
```

### Backend `application-prod.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:store_rating}
    username: ${DB_USER:store_user}
    password: ${DB_PASSWORD:store_pass}

  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

cors:
  allowed-origins: ${FRONTEND_URL}
```

---

## Key Implementation Decisions

### 1. Single Table Inheritance for Users
- **Decision:** One `users` table with `role` enum instead of separate tables
- **Rationale:** Simplifies authentication, reduces joins, easier admin management
- **Trade-off:** Nullable fields for store-specific data (handled via DTOs)

### 2. Computed Average Rating Strategy
- **Decision:** Calculate on-the-fly via SQL AVG() + cache in `stores` table
- **Rationale:** Real-time accuracy with performance optimization
- **Implementation:** `@Formula` annotation in JPA or trigger-based update

### 3. JWT over Session
- **Decision:** Stateless JWT authentication
- **Rationale:** Scalability, works with Next.js SSR/CSR, simpler API design
- **Security:** Short expiration, refresh token rotation, httpOnly cookie option

### 4. Next.js App Router + RSC
- **Decision:** Server Components for data fetching, Client Components for interactivity
- **Rationale:** Reduced client-side JS, better SEO, improved performance
- **Pattern:** "Use the server" for initial data, hydrate interactivity progressively

### 5. Validation Strategy
- **Decision:** Zod (frontend) + Jakarta Validation (backend) + custom validators
- **Rationale:** Defense in depth, immediate UX feedback, server-side integrity
- **Rules:**
  - Name: 20-60 characters
  - Address: max 400 characters
  - Password: 8-16 chars, 1 uppercase, 1 special character
  - Email: RFC 5322 compliant regex
  - Rating: 1-5 integer

### 6. Sorting & Filtering Architecture
- **Decision:** Server-side pagination, sorting, filtering via Spring Data JPA Specifications
- **Rationale:** Handles large datasets, consistent UX, reduces frontend complexity
- **Implementation:** `JpaSpecificationExecutor` + dynamic query building

---


## Screenshots & Demo Flow

### 1. Normal User Flow
```
Register → Login → Browse Stores → Search by Name/Address 
→ View Store Rating → Submit 1-5 Stars → Modify Rating → Logout
```

### 2. Store Owner Flow
```
Login (pre-created by admin) → Dashboard (Avg Rating) 
→ View Rating Submissions → Update Password → Logout
```

### 3. Admin Flow
```
Login → Dashboard (Stats Cards) → Add Store/Add User 
→ View All Users (Filter by Role) → View All Stores (Filter by Name) 
→ View User Details → Logout
```

---

## License

This project is submitted as part of a FullStack Intern Coding Challenge.

---

## Contact

For questions or issues, please contact: [siddharth90750@gmail.com]

##  Log In with Default Seed Accounts:

  • System Admin: Email:  admin@storerating.com  | Password:  AdminPassword123! 
  • Store Owner: Email:  owner1@storerating.com  | Password:  OwnerPassword123! 
  • Normal User: Email:  user1@storerating.com  | Password:  UserPassword123! 
