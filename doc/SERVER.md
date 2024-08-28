# Overview

This server is an REST server which return json for each route. This server is written in Go lang. Every request support CORS. The lifecycle of a request will go throught: controller -> middleware -> model. However, not all controller require a model, sometimes it do the database access itself.

There are 4 major controllers of this project: Authentication, Setting, Data and Workplace.
There are two middleware: Permission, Cache

## Controller

All controllers should place in a folder, which each controller stay in a seperate sub-folder. Depend on the logic, group or seperate each route into seperate files.

## Middleware

### Permission

This middleware protect most controller with correct permission. Every member of an organisation can change data within that organisation. For example, if a member in a orgnisation query tag or object, it will show everything belong to the organisation regardless of creator.
However, only admin role can add new member.

Except login and register, every route should be protected by authentication using the creator_session table. This middleware will read `creator_session` in the request header. If session is invalid then it will return a http code for invalid access.

### Cache

Everytime user make a request, they will provide a `creator_session` in the http header, the full url and its body. This middleware will cache the request for at least 2 minutes. It will also return a http error code if a client make a request more than 100 times per second. All of this to make sure an error in the front end will not kill the database.

## Model

All models should stay in the same folder and each model in a seperate file.
