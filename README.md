# 📚 Digital Library Management System

A full-stack library management application powered by **GraphQL**, **Node.js**, **PostgreSQL**, and **Docker**.

## Architecture

```
┌─────────────────┐     GraphQL      ┌──────────────────┐     Sequelize     ┌─────────────────┐
│   Frontend      │ ──────────────── │   Apollo Server  │ ──────────────── │   PostgreSQL    │
│   (HTML/JS)     │   POST /graphql  │   (Express)      │   ORM Queries    │   (Docker)      │
│   Port: file    │                  │   Port: 4000     │                  │   Port: 5432    │
└─────────────────┘                  └──────────────────┘                  └─────────────────┘
```

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| Backend    | Node.js, Apollo Server 4, Express |
| Database   | PostgreSQL 15                     |
| ORM        | Sequelize 6                       |
| API        | GraphQL                           |
| Container  | Docker, Docker Compose            |

## Project Structure

```
library-app/
├── backend/
│   ├── src/
│   │   ├── schema/          # GraphQL SDL schemas
│   │   │   ├── book.graphql
│   │   │   ├── user.graphql
│   │   │   └── loan.graphql
│   │   ├── resolvers/       # GraphQL resolvers
│   │   │   ├── bookResolver.js
│   │   │   ├── userResolver.js
│   │   │   └── loanResolver.js
│   │   ├── models/          # Sequelize models
│   │   │   └── index.js
│   │   └── index.js         # Apollo Server entry point
│   ├── Dockerfile
│   └── package.json
├── client/
│   ├── index.html           # Admin dashboard (single-page)
│   └── user.html            # User portal (login by User ID)
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed

### Run the Application

```bash
# Clone or navigate to the project directory
cd library-app

# Build and start all services
docker-compose up --build
```

This will:
1. Start a **PostgreSQL 15** database container
2. Build and start the **Node.js/Apollo Server** backend
3. Automatically create the database tables

### Access the Application

| Service          | URL                                   |
|------------------|---------------------------------------|
| GraphQL API      | http://localhost:4000/graphql          |
| Admin Dashboard  | Open `client/index.html` in a browser |
| User Portal      | Open `client/user.html` in a browser  |
| Health Check     | http://localhost:4000/health           |

## Database Schema

### Books
| Column    | Type    | Constraints     |
|-----------|---------|-----------------|
| id        | INTEGER | PK, Auto-incr   |
| title     | STRING  | NOT NULL         |
| author    | STRING  | NOT NULL         |
| isbn      | STRING  | NOT NULL, UNIQUE |
| year      | INTEGER | NOT NULL         |
| available | BOOLEAN | DEFAULT true     |

### Users
| Column    | Type    | Constraints     |
|-----------|---------|-----------------|
| id        | INTEGER | PK, Auto-incr   |
| name      | STRING  | NOT NULL         |
| email     | STRING  | NOT NULL, UNIQUE |
| phone     | STRING  | NULL             |
| createdAt | DATE    | Auto             |

### Loans
| Column     | Type    | Constraints   |
|------------|---------|---------------|
| id         | INTEGER | PK, Auto-incr |
| userId     | INTEGER | FK → Users    |
| bookId     | INTEGER | FK → Books    |
| loanDate   | DATE    | NOT NULL      |
| returnDate | DATE    | NULL          |

## GraphQL API

### Queries

```graphql
# Get all books
query {
  books { id title author isbn year available }
}

# Get a single book
query {
  book(id: 1) { id title author isbn year available }
}

# Get all users
query {
  users { id name email phone createdAt }
}

# Get all loans with details
query {
  loans { id loanDate returnDate user { name } book { title } }
}
```

### Mutations

```graphql
# Add a new book
mutation {
  addBook(title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", year: 1925) {
    id title
  }
}

# Register a new user
mutation {
  registerUser(name: "John Doe", email: "john@example.com", phone: "+1234567890") {
    id name
  }
}

# Borrow a book (sets available = false)
mutation {
  borrowBook(userId: 1, bookId: 1) {
    id loanDate book { title available }
  }
}

# Return a book (sets available = true)
mutation {
  returnBook(loanId: 1) {
    id returnDate book { title available }
  }
}
```

## Environment Variables

| Variable    | Default    | Description              |
|-------------|------------|--------------------------|
| DB_HOST     | db         | PostgreSQL host          |
| DB_USER     | admin      | Database username        |
| DB_PASSWORD | secret     | Database password        |
| DB_NAME     | library_db | Database name            |
| PORT        | 4000       | Backend server port      |

## Stopping the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove data volumes
docker-compose down -v
```

## License

MIT
