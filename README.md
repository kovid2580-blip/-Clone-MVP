# Reddit Clone

A full-stack Reddit-style community app built with Spring Boot, PostgreSQL-ready persistence, JWT authentication, and a Next.js + Tailwind frontend.

## Features

- Register and login with JWT authentication
- BCrypt password hashing
- Protected create, vote, and comment endpoints
- Public community and post browsing
- Communities, posts, one-vote-per-user voting, and comments
- Responsive Reddit-like UI with loading and empty states

## Tech Stack

- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA, Hibernate, Maven
- Database: H2 for local default, PostgreSQL through environment variables
- Frontend: Next.js, React, Tailwind CSS, lucide-react

## Run Locally

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend uses `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8080/api`.

## PostgreSQL Configuration

Set these environment variables before starting the backend:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/reddit_clone
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
SPRING_JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
JWT_SECRET=replace-with-a-long-random-secret
APP_CORS_ALLOWED_ORIGIN=http://localhost:3000
```

## Core API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/subreddits`
- `POST /api/subreddits`
- `GET /api/subreddits/{subredditId}/posts`
- `GET /api/posts?sort=latest|popular`
- `POST /api/posts`
- `POST /api/posts/{postId}/vote`
- `GET /api/posts/{postId}/comments`
- `POST /api/posts/{postId}/comments`

## Development Plan

Week 1 focuses on the backend: project setup, entities, repositories, JWT security, communities, posts, voting, and comments.

Week 2 focuses on frontend and integration: Next.js + Tailwind setup, community pages, post creation and listing, vote and comment integration, auth screens, testing, deployment, and documentation.

## Future Enhancements

- Nested comments
- Notifications
- Real-time updates with WebSockets
- Admin moderation
- Search functionality
