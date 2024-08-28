# Architecture

This server is an api server which return json for each route and written in go lang. This server serve as CRUD for the database.
Following are major module description:

## Authentication

Except login and register, every route should be protected by authentication using the creator_session table. Every member of an organisation can change data within that organisation. Only admin role can add new member.

### Register

Route: `/register`

User has to submit information on the new org and his login information. Password should be md5 encrypted.

### Login

Route: `/login`

User provide username and password. If the info match then server will create a new row in the creator_session table with a jwt is randomly generated string and expired_at is 30 days into the future.

### Logout

Route: `/logout`

Server will delete the current creator_session row.

## Object and Funnel

### Object Type

User can create object type, of which most important information is the fields which is a json file describe each field and its data type.
For example: given object type developer, the fields is `{email:"string", github: "string"}`.

### Object

One object can exist in multiple object type. There are routes to assign object type to object, hence update the detail in `obj_type_value` table.

### Funnel

A funnel consist of multple steps.

## Task
