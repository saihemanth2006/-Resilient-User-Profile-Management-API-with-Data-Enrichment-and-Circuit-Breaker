# Resilient User Profile Management API

A production-style backend API for managing user profiles with CRUD endpoints, MySQL persistence, repository/unit-of-work layering, and resilient enrichment calls through retry and circuit breaker protection.

## Features

- CRUD for user profiles
- Enriched user lookup via external mock service
- Repository pattern and Unit of Work pattern
- Retry with exponential backoff
- Circuit breaker with CLOSED, OPEN, and HALF-OPEN states
- Structured JSON error responses
- Docker Compose stack with MySQL and mock enrichment service
- OpenAPI documentation

## Setup

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Build and start the stack:

```bash
docker-compose up -d --build
```

3. Verify the app health:

```bash
curl http://localhost:8080/health
```

## Run Without Docker

1. Install Node.js 20+ locally.
2. Copy `.env.example` to `.env` and set `DB_ENGINE=memory` for the local no-Docker mode.
3. Update `EXTERNAL_SERVICE_URL` to `http://localhost:8081/enrich`.
4. Install dependencies:

```bash
npm install
```

5. Start the mock enrichment service in a separate terminal:

```bash
cd mock-service
npm install
npm start
```

6. Start the main API in the project root:

```bash
npm start
```

7. Confirm both services are running:

```bash
curl http://localhost:8080/health
curl http://localhost:8081/health
```

## API Endpoints

- `GET /health`
- `POST /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`
- `GET /api/users/{id}/enriched`

### Example create request

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'
```

### Example error response

```json
{
  "errorCode": "INVALID_INPUT",
  "message": "Validation failed",
  "details": ["email must be a valid email address"]
}
```

## Architectural Decisions

The service layer depends on repository and unit-of-work abstractions rather than the database driver directly. That keeps business logic testable and lets transactional work be coordinated in one place. Enrichment calls are wrapped in retry and circuit breaker behavior so temporary failures do not cascade into full API outages. When enrichment is unavailable, the API returns the base profile plus a fallback status instead of failing the request.

## Testing

Run all tests inside the container or locally:

```bash
npm test
```

Or via Docker Compose:

```bash
docker-compose exec app npm test
```
