# 5-Minute Video Script

Hello everyone. In this video, I’m presenting the Resilient User Profile Management API. This project is a backend service built to manage user profiles with standard CRUD operations, while also enriching user data from an external service that may fail or become slow. The main goal was to design the system so it stays stable, maintainable, and testable even when external dependencies are unreliable.

## Project Introduction

This API stores user profile data in MySQL and exposes REST endpoints for creating, reading, updating, and deleting users. It also includes an `/enriched` endpoint that calls a mock external service to fetch extra profile details such as recent activity and loyalty score. To make that external integration safe, the project uses both Retry and Circuit Breaker patterns.

The reason this project matters is that real backend systems usually depend on databases and third-party services. If those dependencies fail, the whole application should not collapse. This project demonstrates how to handle those failures cleanly with layered architecture, validation, and fallback behavior.

## Important Files

The first important file is [src/app.js](src/app.js). This is the main entry point of the API. It creates the Express app, sets up the database, seeds initial users, registers the routes, and starts the server.

Next is [src/services/UserService.js](src/services/UserService.js). This is the business logic layer. It handles user creation, update, deletion, and enriched lookups, and it decides when to call the repository and when to call the enrichment client.

The file [src/repositories/impl/MySqlUserRepository.js](src/repositories/impl/MySqlUserRepository.js) is the data access layer. It hides SQL details from the rest of the app and gives the service a clean interface for CRUD operations.

The file [src/repositories/impl/MySqlUnitOfWork.js](src/repositories/impl/MySqlUnitOfWork.js) manages transactions. It makes sure database changes happen in an atomic way, so operations either complete fully or are rolled back safely.

The file [src/external/EnrichmentClient.js](src/external/EnrichmentClient.js) handles calls to the external enrichment API. It wraps those calls with retry logic and a circuit breaker so repeated failures do not overload the system.

The file [src/utils/circuitBreaker.js](src/utils/circuitBreaker.js) contains the circuit breaker implementation. It supports the CLOSED, OPEN, and HALF-OPEN states, which lets the app stop calling a failing service, then test recovery later.

The file [src/utils/retry.js](src/utils/retry.js) contains exponential backoff retry logic. This helps recover from temporary network or service issues before the circuit breaker needs to open.

The file [src/middleware/errorHandler.js](src/middleware/errorHandler.js) keeps error responses consistent. It returns structured JSON with `errorCode`, `message`, and `details`, which makes the API easier to consume.

The file [src/routes/userRoutes.js](src/routes/userRoutes.js) defines the HTTP endpoints and validation rules. It ensures bad input is blocked early before it reaches the service layer.

The file [mock-service/app.js](mock-service/app.js) is the mock enrichment service. It simulates healthy responses, random failures, and configurable delays so the resilience features can be tested realistically.

The files [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile) are for containerized setup. They let the API, MySQL database, and mock service start together with one command.

The file [openapi.yaml](openapi.yaml) documents the API contract. It describes every endpoint, request body, and error response in a format that tools and humans can read.

Finally, the test files under [tests/unit](tests/unit) and [tests/integration](tests/integration) verify the behavior of the circuit breaker, retry logic, service layer, and the API flow.

## How the Project Works

When a request comes into the API, Express sends it through validation middleware first. If the input is valid, the request reaches the controller, which passes it to the service layer. The service layer then uses the repository through the unit of work to read or write user data in MySQL.

For the `/enriched` endpoint, the service first loads the base user profile from the database. Then it calls the external enrichment client. If the mock service responds successfully, the API returns the user plus enrichment data. If the service fails temporarily, the retry logic tries again with increasing delays. If failures continue, the circuit breaker opens and the API returns the base profile with an `enrichedDataStatus: unavailable` response instead of timing out or crashing.

This design keeps the API responsive, protects the external dependency from overload, and gives clients a predictable fallback response.

## How to Run Without Docker

To run the project locally without Docker, install Node.js 20+ on your machine. Copy `.env.example` to `.env`, set `DB_ENGINE=memory`, and update `EXTERNAL_SERVICE_URL` to `http://localhost:8081/enrich`.

Then install dependencies in the project root with `npm install`. In this mode, the API uses an in-memory user store with seeded sample users, so no MySQL server is needed.

In a second terminal, go into the `mock-service` folder, run `npm install`, and start the mock service with `npm start`. Then return to the project root and start the main API with `npm start`.

After both services are running, you can verify them with `curl http://localhost:8080/health` and `curl http://localhost:8081/health`.

## Conclusion

This project shows how to build a practical backend API that is not only functional, but also resilient and maintainable. It combines layered architecture, transactional data access, validation, and external-service protection in a way that mirrors real production systems. The result is a strong portfolio project that demonstrates solid backend engineering judgment.
