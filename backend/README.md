# Shadow Companion - Backend

## Overview

This directory is reserved for the future Spring Boot backend implementation.

## Planned Tech Stack

- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Features**:
  - User authentication and authorization
  - Task persistence and management
  - Workflow automation storage
  - User preferences sync

## Current Status

🚧 **Not yet implemented** - The frontend currently uses local storage for data persistence.

## Future Implementation

When implementing the backend, it will:

1. **Provide REST APIs** for:
   - User management (signup, login, logout)
   - Task CRUD operations
   - Workflow management
   - Preferences storage

2. **Database Schema**:
   - `users` table
   - `tasks` table
   - `workflows` table
   - `preferences` table

3. **Integration**:
   - Frontend will call backend APIs instead of using local storage
   - Docker Compose will orchestrate both frontend and backend services

## Getting Started (Future)

```bash
# Navigate to backend directory
cd backend

# Build and run with Docker
docker-compose up --build

# Or run locally
./mvnw spring-boot:run
```

The backend API will be available at `http://localhost:8080`.

## Development Notes

- Keep backend stateless where possible
- Use JWT for authentication
- Implement proper error handling and validation
- Add API documentation with Swagger/OpenAPI
