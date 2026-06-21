# 🏪 Store Rating Platform — Next.js Admin & User Frontend

> **Full-Stack Challenge Submission** | A modern, high-performance Next.js 16 frontend interface featuring progressive hydration, unified role-based authorization, and custom glassmorphic styling.
>
> Developed with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🚀 Key Highlights & Badges

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-1.21.0-ff69b4?style=flat-square)](https://lucide.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🎨 Visual Aesthetics & Design Language

The frontend uses a premium **Dark-Slate aesthetic** (`#090d16`) designed to look modern, clean, and professional. 

*   **Glassmorphism Engine:** Fully customized CSS blur-filter templates (`.glass` and `.glass-hover`) are used to create depth for dashboard cards, dialogs, and navigation panels.
*   **Tailwind CSS v4 Configuration:** Implements a modern custom theme mapping for consistent styling tokens (brand colors, dark cards, dark boundaries).
*   **Micro-Animations:** Fluid fade-in keyframes (`.animate-fade-in`) dynamically apply to view layouts on route navigation.
*   **Interactive Star Rating System:** Customized fractional-star calculations for read-only stores, and hover-lit interactive ratings for store evaluation.

---

## 🔐 Unified Authentication & Route Guards

Authentication is handled locally using stateless JSON Web Tokens (JWT) through a custom fetch-based API client:

*   **API Interceptor (`/lib/api.ts`):** Automatically injects the JWT token as a `Bearer` token inside the `Authorization` request headers.
*   **Dynamic Redirection Middleware (`/app/page.tsx`):** Decodes user token information (`sub`, `userId`, `role`) and automatically redirects authenticated users to their corresponding dashboard:
    *   `ADMIN` ➔ `/admin`
    *   `STORE_OWNER` ➔ `/owner`
    *   `USER` ➔ `/user`
*   **Automatic Handshake Expire Check:** Responds to `401 Unauthorized` backend responses by automatically clearing credentials from `localStorage` and redirecting back to `/login`.

---

## 📦 Workspace Features & Dashboards

### 1. 🛡️ System Admin Console (`/app/admin`)
A centralized management dashboard tailored for administrative oversight.
*   **Analytics Summary Cards:** High-impact tiles displaying **Total Users** (split into roles), **Total Registered Stores**, and **Total Reviews**.
*   **Users & Stores Dynamic Directories:** Datatable tabs equipped with:
    *   Dynamic table sorting triggers (using sorting hooks for name, email, roles, ratings, and IDs).
    *   Real-time multi-criteria filtering fields (name search, email query, role options).
*   **Creation Modals:** Responsive overlay dialogs for setting up new User Profiles, Store Owners, and registering physical Storefronts with assigned owners.

### 2. 🏪 Store Owner Workspace (`/app/owner`)
An analytics panel for shop managers to monitor customer reviews.
*   **Store Metrics Panel:** Visual representation of average ratings and distribution counters.
*   **Review Submission Log:** Real-time feedback timeline showing customer reviews, timestamps, and rating stars.
*   **Credential Update Security:** Access-controlled forms to update password credentials.

### 3. 👤 Normal User Area (`/app/user`)
An interactive portal for discovering and evaluating stores.
*   **Store Browser:** Dynamic grid layout showing stores, locations, and overall metrics.
*   **Search & Sort Panel:** Filter businesses by name/address and sort by lowest-rated, highest-rated, or total reviews.
*   **Interactive Rating System:** Submit a rating on any store with a single click. If you've already rated a store, your active rating is pre-loaded and can be updated instantly.

---

## 📂 Project Directory Structure

```
myadmin/
├── app/                                 # Next.js 16 App Router
│   ├── admin/                           # Admin Dashboard Page & Forms
│   │   └── page.tsx                     
│   ├── login/                           # Unified login form
│   │   └── page.tsx                     
│   ├── owner/                           # Store Owner Analytics & Feedback
│   │   └── page.tsx                     
│   ├── register/                        # Normal user signup page
│   │   └── page.tsx                     
│   ├── user/                            # User Storebrowser & Star rating
│   │   └── page.tsx                     
│   ├── globals.css                      # Tailwind v4 import + custom animations
│   ├── layout.tsx                       # Root view shell & providers
│   └── page.tsx                         # Router-guard entry (role redirections)
├── components/                          # Shared interface widgets
│   ├── Navbar.tsx                       # Contextual top navigation bar
│   └── StarRating.tsx                   # Fractional + Interactive star rendering
├── lib/                                 # Helper libraries & APIs
│   └── api.ts                           # Global API handler & token wrapper
├── public/                              # Static public assets
├── package.json                         # Build scripts & node dependencies
└── tsconfig.json                        # TypeScript settings
```

---

## 🛠️ Build and Local Development Setup

### Prerequisites
*   **Node.js 18+** (with `npm` or `yarn`)
*   **Store Rating Backend API** running on `http://localhost:8080/api`

### 1. Install Dependencies
Navigate to the project root and install node packages:
```bash
npm install
```

### 2. Launch Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to access the portal.

### 3. Production Compilation
Compile the project for production environment:
```bash
npm run build
```
Start the production build server:
```bash
npm run start
```

---

## 🔑 Default Accounts (For Testing & Evaluation)

You can log in to the client interface using the pre-seeded credentials (configured to load automatically on the backend's first launch):

| Role | Email Address | Password | Workspace |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@storerating.com` | `AdminPassword123!` | `/admin` |
| **Store Owner** | `owner1@storerating.com` | `OwnerPassword123!` | `/owner` |
| **Normal User** | `user1@storerating.com` | `UserPassword123!` | `/user` |

---

## 📞 Support & Contacts
If you encounter any issues during local deployment, verify that the Spring Boot Backend server is running successfully at `http://localhost:8080/api`. 

For inquiries, please contact: `siddharth90750@example.com`
