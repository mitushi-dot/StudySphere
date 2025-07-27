# StudySphere - Educational Platform

## Overview

StudySphere is a full-stack educational platform built with React, Express, and PostgreSQL. It enables teachers to create courses, upload educational content, and manage students, while providing students with a dashboard to browse courses, enroll, and access learning materials. The application features role-based authentication, file upload capabilities, and a modern responsive UI built with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (minimal usage per user preference)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (preferred over complex React)
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript (primary focus)
- **Database**: File-based storage simulating MongoDB behavior
- **Session Management**: Express sessions with in-memory store
- **File Handling**: Multer for file uploads with 100MB limit
- **Authentication**: Express-based session authentication with bcrypt password hashing
- **Security**: Rate limiting, input validation, secure headers

### Key Design Decisions

**Frontend State Management**: TanStack Query was chosen over Redux/Zustand because the application primarily deals with server state (courses, users, content). This reduces boilerplate and provides excellent caching, background updates, and error handling out of the box.

**Database ORM**: Drizzle ORM was selected for its TypeScript-first approach and excellent performance. It provides type safety while maintaining SQL-like queries, making it easier to optimize database operations.

**Authentication Strategy**: Express-based session authentication with bcrypt password hashing. No password strength requirements per user request. Simple 6-character minimum password validation only. Rate limiting prevents brute force attacks.

**File Upload Strategy**: Files are stored locally in an uploads directory. This approach was chosen for simplicity but could be easily migrated to cloud storage (S3, etc.) later.

## Key Components

### Data Storage Schema
- **Users**: JSON file storage with bcrypt hashed passwords, roles (student/teacher)
- **Courses**: Course information with teacher associations
- **Content**: Educational materials linked to courses with metadata
- **Enrollments**: Many-to-many relationship between students and courses
- **Storage**: File-based JSON storage simulating MongoDB collections

### Authentication System
- Role-based access control (student/teacher)
- Protected routes with middleware
- Session persistence with PostgreSQL storage
- Automatic role-based dashboard redirection

### File Management
- Multer configuration for handling uploads
- File metadata storage in database
- Content type categorization (document/video/assignment)
- View tracking for analytics

### UI Components
- Responsive design with mobile-first approach
- Custom color scheme with academic branding
- Reusable components with consistent styling
- Loading states and error handling throughout

## Data Flow

### Authentication Flow
1. User submits login/registration form
2. Server validates credentials and creates session
3. Client receives user data and stores in React Query cache
4. Navigation component conditionally renders based on auth state
5. Protected routes check session validity

### Content Management Flow
1. Teacher uploads content through modal form
2. Multer processes file upload to local storage
3. File metadata stored in database with course association
4. React Query invalidates relevant caches
5. UI updates to show new content

### Student Learning Flow
1. Student browses available courses on dashboard
2. Enrollment creates database relationship
3. Student accesses course content pages
4. View tracking updates content statistics
5. Progress reflected in student analytics

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **express-session**: Session management
- **multer**: File upload handling

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **typescript**: Type safety across the stack
- **vite**: Fast development server and build tool
- **drizzle-kit**: Database migration and introspection tools

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with tsx for TypeScript execution
- Automatic database migrations with Drizzle Kit
- File uploads stored in local uploads directory

### Production Build Process
1. Vite builds optimized frontend bundle
2. esbuild compiles server TypeScript to JavaScript
3. Static files served from dist/public
4. Server runs compiled JavaScript with Node.js

### Database Management
- Drizzle migrations stored in ./migrations directory
- Schema definitions in shared/schema.ts
- Push command for development schema updates
- Environment variable for database connection string

### Session Storage
- PostgreSQL-backed session store for persistence
- Configurable session duration (24 hours default)
- Secure cookie settings for production deployment

## Recent Changes

### July 26, 2025
- **Removed Password Strength Validation**: Simplified password requirements to 6-character minimum per user request
- **Migrated to Express Authentication**: Implemented Express-based authentication with bcrypt password hashing
- **File-Based Storage**: Replaced in-memory storage with file-based JSON storage simulating MongoDB behavior
- **Enhanced Security**: Added rate limiting, comprehensive input validation, and secure session management
- **Sample Data**: Created demo accounts (teacher@example.com / student@example.com, password: password123)

### User Preferences Updated
- Prefer Express backend with minimal React usage
- Use HTML, CSS, JavaScript, and Tailwind for simplicity over complex React components  
- Remove all password strength validation requirements
- Focus on server-side functionality over client-side complexity

The application follows a traditional MPA (Multi-Page Application) pattern with client-side routing, making it easy to deploy on various platforms while maintaining good SEO and performance characteristics.