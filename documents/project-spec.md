# Project Spec

![Cover](/public/documentation/banner.png)

## Project Overview

**Tasky AI** is a project and task management application that uses AI to help users generate tasks. Users can create projects, manage tasks, and use AI to generate task suggestions from natural language prompts.
The application uses a Backend-as-a-Service (BaaS) architecture with third-party services for authentication, data storage, and AI capabilities.

## Tasky AI Software System

_This section describes the entire Tasky AI software system, including the users, applications, and external services that make up the system._

### System Context

_This is a high-level view of the Tasky AI system and its context. The system context diagram follows the guidelines of the C4 Model for visualizing software architecture._

#### System Users

- **👤 User** — A person who manages projects and tasks, and can generate tasks using AI. Users can create multiple projects, organize tasks within projects, track progress, and leverage AI to generate task suggestions.

#### External Systems

- **Clerk Auth** — Third-party authentication service that handles user authentication, session management, and user profile data. Provides secure login/signup flows with support for email, social authentication, and magic links.
- **Appwrite** — Backend-as-a-Service platform that provides API for database operations, manages projects and tasks data, and handles backend business logic. Stores all application data including user information, projects, and tasks.
- **Gemini AI** — Google's AI service that generates intelligent task suggestions based on user prompts and project context. Analyzes natural language input to create relevant, actionable tasks.

#### System Context Diagram

![System Context Diagram](/public/documentation/system-context-diagram.png)

### System Architecture

_Due to the BaaS architecture, Tasky AI does not have multiple internal containers. The system consists of a single web application that communicates directly with external services.._

- **Tasky AI Web Application** [React.js]
- Single-page web application.
- Handles all UI rendering and user interactions.
- Communicates directly with Clerk for authentication.
- Uses Appwrite SDK for data operations.
- Integrates with Gemini AI for task generation.
- Manages client-side state and routing.

---

## Tasky AI Web Application

_This section describes the web application in detail, including its features, components, and architectural requirements._

### Functional Requirements

_This section lists some of the main functional requirements of Tasky AI web app. This is more of a functionality overview to help guide some of your architectural decisions._

#### Authentication & User Management

- Users can sign up for a new account using email or social authentication.
- Users can sign in to their existing accounts.
- Users can view and update their profile information.
- Users can reset their password if forgotten.
- Authentication state persists across sessions.
- Protected routes redirect unauthenticated users to sign-in page.

#### Project Management

- Authenticated users can create new projects with a title and description.
- Users can view a list of all their projects.
- Users can view individual project details.
- Users can edit project information (title, description).
- Users can delete projects (with confirmation).
- Users can search their projects.
- Projects display associated task counts and completion status.
- Users can archive completed projects.

#### Task Management

- Users can create tasks within a project.
- Each task has a title, description, status.
- Users can view all tasks within a project.
- Users can edit task details.
- Users can delete tasks.
- Users can change task status (e.g., To Do or Completed).
- Users can add due dates to tasks.
- Users can reorder tasks within a project.
- Users can filter tasks by project type.
- Users can search tasks by title or description.

#### AI Task Generation

- Users can access an AI task generator interface.
- Users can provide a natural language prompt describing their project or goals.
- Users can specify project context for more relevant suggestions.
- The AI generates multiple task suggestions based on the prompt.

#### Dashboard & Overview

- Users see a dashboard with an overview of all projects.
- Dashboard shows statistics (total projects, active tasks, completion rate).
- Users can see recent activity and upcoming deadlines.
- Dashboard displays quick actions (create project, generate tasks).
- Users can access their most recently viewed projects.
