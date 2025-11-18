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
