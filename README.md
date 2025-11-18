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

Install
```
$npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node

$npm install @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
$npm install @opentelemetry/instrumentation-mysql2
```

Start [LGTM Stack](https://hub.docker.com/r/grafana/otel-lgtm)
```
$docker compose up -d otel-collector
```

Start NodeJS Service
```
$docker compose up -d --build
```

List of URLs
* http://localhost:3000/products/1
* http://localhost:3000/products/4

Access to Grafana
* http://localhost:4000