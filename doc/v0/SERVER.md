# Overview

This server is an REST server which return json for each route. This server is written in Go lang. Every request support CORS. The lifecycle of a request will go throught: controller -> middleware -> model. However, not all controller require a model, sometimes it do the database access itself.

There are 4 major controllers of this project: Authentication, Setting, Data and Workplace.
There are two middleware: Permission, Cache.

## Technology

Some of the framework and library:

- Go lang server: Chi.
- Go lang database access: sqlc
- JWT: use `golang-jwt/jwt`
- API documentation: Swagger, can be implemented later.
- Logging: logrus
- Testing: only write integration test.

If possible, create additional view to make sql simple and take advantage of postgresql opimization. Most table with a `creator_id` should have a view that include `org_id` for the easy of data filtering. Some of view should be handy:

- A view extend `step` with its `funnel`.
- A view extend `creator_list` with its `list`.
- A view extend `task` with all of its related `creator`.

This project will be deployed on Digital Ocean. These are environment variable for database access: PG_USER, PG_PASSWORD, PG_PORT, PG_SERVER, PG_DB.

## Controller

All controllers should place in a folder, which each controller stay in a seperate sub-folder. Depend on the logic, group or seperate each route into seperate files.

## Middleware

All middleware should place in a folder, which each middleware stay in a seperate sub-folder.

## Model

All models should stay in the same folder and each model in a seperate file.
