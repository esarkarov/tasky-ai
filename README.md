<div align="center">
  <div>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge" />
    <img src="https://img.shields.io/badge/Clerk-Auth-5A67D8?logo=clerk&logoColor=white&style=for-the-badge" />
    <img src="https://img.shields.io/badge/-Shadcn-black?style=for-the-badge&logoColor=white&logo=shadcnui&color=black"/>
<img src="https://img.shields.io/badge/-Appwrite-black?style=for-the-badge&logoColor=white&logo=appwrite&color=FD366E"/><br/>

<img src="https://img.shields.io/badge/-Vitest-black?style=for-the-badge&logoColor=white&logo=vitest&color=00A35C"/>
<img src="https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white&style=for-the-badge" />
<img src="https://img.shields.io/badge/-TailwindCSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=38B2AC"/>
<img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6"/>

  </div>
</div>

# 📋 Tasky AI

**Tasky AI** is an AI-assisted task management platform built with **React**, **TypeScript**, and **Vite**.  
It combines **Clerk authentication**, **Appwrite persistence**, and **Google Gemini–powered task generation** to help individuals and teams plan and manage work efficiently across multiple productivity views — Inbox, Today, Upcoming, Completed, and Project-focused sections.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Author](#author)

---

## 🚀 Features

- **Secure authentication & theming** — powered by Clerk with a global router shell, dark theme, and toast notifications.
- **Multiple productivity workspaces** — Inbox, Today, Upcoming, Completed, and Project detail pages, each delivered through lazy-loaded protected routes.
- **AI-generated project task scaffolding** — converts natural language prompts into structured tasks using Google Gemini, automatically persisted via Appwrite when AI assistance is enabled.
- **Appwrite-backed data layer** — provides reusable query builders for counting, filtering, and scheduling tasks.
- **Responsive, accessible UI** — optimized for different devices, highlighting AI workflows and session-based navigation states.

---

## 🧰 Tech Stack

| Category                 | Technologies                                                |
| ------------------------ | ----------------------------------------------------------- |
| **Framework**            | React + TypeScript                                          |
| **Authentication**       | Clerk React SDK                                             |
| **Backend-as-a-Service** | Appwrite SDK                                                |
| **AI Integration**       | Google Gemini                                               |
| **Styling**              | Tailwind CSS, Shadcn UI                                     |
| **Testing & Quality**    | Vitest, React Testing Library, Playwright, ESLint, Prettier |
| **CI/CD & Tooling**      | Pnpm, GitHub, GitHub Actions, Vite                          |

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Tasky-ai
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` (or `.env.local`) file at the project root and provide the required keys:

```bash
VITE_CLERK_PUBLISHABLE_KEY="..."
VITE_CLERK_USER_STORAGE_KEY="..."
VITE_APPWRITE_PROJECT_ID="..."
VITE_APPWRITE_TASKS_COLLECTION_ID="..."
VITE_APPWRITE_PROJECTS_COLLECTION_ID="..."
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
VITE_APPWRITE_DATABASE_ID="..."
VITE_GEMINI_API_KEY="..."
```

These values are validated at runtime to prevent misconfiguration.

### 4. Start the development server

```bash
pnpm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Usage

### Run the test suite

```bash
pnpm run test
```

### Build for production

```bash
pnpm run build
```

### Lint & format source

```bash
pnpm run lint
pnpm run prettier:check
```

Additional scripts are available for coverage, lint fixing, and auto-formatting.

---

## 🏗️ Folder Structure

```bash
src/
├── core/          # Infrastructure
├── features/      # Business features
├── pages/         # Route-level pages
├── shared/        # Shared resources
```

## 👨‍💻 Author

Developed by **Elvin Sarkarov**  
📎 [GitHub @Elvin Sarkarov](https://github.com/esarkarov)
