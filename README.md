# Demo with DevOps course

## Technology stack
* NodeJS 25 + express
* MySQL 8 database
* Redis 8 for caching data


## 1. Build and run
```
$docker compose build nodejs

$docker compose up -d nodejs
$docker compose ps
```

List of URLs
* http://localhost:3000/products/1
* http://localhost:3000/products/4

## 2. API Testing with Postman and [newman](https://www.npmjs.com/package/newman)
```
$docker compose up nodejs-api-test --abort-on-container-exit
```

## 3. API Testing with [Jest](https://jestjs.io/) and [SuperTest](https://www.npmjs.com/package/supertest)
```
$cd nodejs

$npm test                    # Run all tests
$npm test product_test.js    # Run integration tests only
$npm test product.unit.test.js # Run unit tests only
```

## 4. Observability of service :: Distributed tracing
* [OpenTelemetry](https://opentelemetry.io/)
* [Jaeger](https://www.jaegertracing.io/)

Install dependencies
```
$npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node

$npm install @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
$npm install @opentelemetry/instrumentation-mysql2
```

Start [Jaeger](https://www.jaegertracing.io/)
```
$docker compose up -d jaeger
$docker compose ps
```

Access to Jaeger server
* http://localhost:16686

Start NodeJS Service
```
$docker compose up -d nodejs --build
$docker compose ps
```

List of URLs
* http://localhost:3000/products/1
* http://localhost:3000/products/4

Access to Jaeger server again !!
* http://localhost:16686