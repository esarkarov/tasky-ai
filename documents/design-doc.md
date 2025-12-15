# Tasky AI Web Application High-Level Design Doc

## Overview

This document outlines the architecture design for Tasky AI, a task management application with AI-powered task generation. The application enables users to organize tasks into projects, set due dates, and automatically generate task lists using AI based on project descriptions.

## Context

**Tasky AI** is a single-user task management system that helps users organize their work through projects and tasks. The application leverages AI to help users quickly populate new projects with relevant tasks, reducing the initial effort required to start organizing work.
The system consists of a web application that interacts with Appwrite for backend services and Google Gemini for AI-powered task generation.

## Goals and Non-Goals

### Goals

- **Performance**: Ensure fast loading and smooth user interactions.
- **Accessibility**: Follow basic WCAG accessibility practices.
- **Maintainability**: Keep the codebase organized and easy to update.
- **Scalability**: Use a modular structure that supports future features.

### Non-Goals

- **Backend Development**: No custom backend will be built; the app relies on Clerk and Appwrite.
- **Mobile Apps**: Native mobile applications are not included.
- **Collaborative Features**: Multi-user collaboration or team features are out of scope.

## High Level Design

Tasky AI is built as a single-page application (SPA) using React with TypeScript. The application communicates with Appwrite for authentication and data storage, and integrates with Google Gemini API for AI task generation.

### System Context Diagram

![System Context Diagram](/public/documentation/system-context-diagram.png)

### Architectural Style

- **Atomic UI Design**: React components organized by atomic design principles.
- **Feature-Based Structure**: Code organized by domain (projects, tasks, ai).
- **Repository Pattern**: Database operations abstracted through repositories.
- **Service Layer**: Business logic separated from data access.
- **TypeScript end-to-end**: Full TypeScript implementation for type safety.

### Key Komponents

1. **Project Module**

2. **Task Module**

3. **AI Module**

### Technology Stack

- **Frontend**: React.js, TypeScript, React Router, Tailwind CSS, Shadcn UI
- **Testing & Quality**: Vitest, React Testing Library, Playwright, ESLint, Prettier
- **Backend Services**: Appwrite DB, Gemini API, Clerk
- **CI/CD & Tooling**: Pnpm, GitHub, GitHub Actions, Vite, Vercel

## Folder Structure

```bash
src/
├── core/                  # Infrastructure: app config, env, lib etc.
├── features/
│ ├── projects/
│ │ ├── components/        # UI for projects
│ │ ├── hooks/             # Project-specific custom hooks
│ │ ├── repositories/      # Appwrite integration
│ │ ├── services/          # Business logic
│ │ ├── router/            # Project routes
│ │ └── types/             # Type definitions
│ ├── tasks/               # Same structure for tasks
│ └── ai/                  # Same structure for ai
│ └── analytics/           # Same structure for analytics
├── shared/                # UI elements, utils, constants, custom hooks etc.
├── pages/                 # Route-level screens
```
