# Overview

This server is an REST server which return json for each route. This server is written in Go lang. Every request support CORS. The lifecycle of a request will go throught: controller -> middleware -> model. However, not all controller require a model, sometimes it do the database access itself.

There are 4 major controllers of this project: Authentication, Setting, Data and Workplace.
There are two middleware: Permission, Cache.

## Technology

The prefer framework is something straight forward and precise like standard net/http, Chi or Echo over Gin. For database access, use sqlc or sqlx, do not use ORM. If possible, create additional view to make sql simple and take advantage of postgresql opimization. For jwt, use `golang-jwt/jwt`. This project will be deployed on Digital Ocean. I prefer Swagger for API documentation.

## Controller

All controllers should place in a folder, which each controller stay in a seperate sub-folder. Depend on the logic, group or seperate each route into seperate files.

## Middleware

All middleware should place in a folder, which each middleware stay in a seperate sub-folder.

## Model

All models should stay in the same folder and each model in a seperate file.
