# Introduction

This is the CRM project that employ two important concepts that most CRM is missing or underserved:

- One generic object can existed in multiple object type form. For example, a human can be both a developer, an entrepreneur and an artist. A team can both run a startup and a hackathon project.
- Operation team works evolve around moving objects in funnels. The funnel can be sale conversion, hackathon submission, etc.
- Within a team, data is shared while data view (saved filters) is personalized.

This is the bird eye view design
![System design](https://i.imgur.com/tqMJ6uyl.png)

## Structure

This project use mono-repo approach. There are 2 project

- server, using go lang
- webapp, using reactjs

## How to install?

### Server

- [ ] Step 1: Install [Postgresql](https://hub.docker.com/_/postgres)
- [ ] Step 2: Run `server/migrations/001_intial_schema.sql`
- [ ] Step 3: Install `go`
- [ ] Step 4: Create .env

```env
DATABASE_URL=postgres://[user name]:[password]@[host]:[port]/[db name]?sslmode=disable
JWT_SECRET=[your secret]
PORT=[port | 8080]
```

- [ ] Step 5: run `server/.start-web.sh`
- [ ] Step 6: Test with `[your server| http://localhost:8080]/stats`

### Webapp

- [ ] Step 1: Install packages: `npm i`
- [ ] Step 2: Create .env file

```env
REACT_APP_API_URL=[your server | http://localhost:8080]
```

- [ ] Step 3: Run `npm start`

### How big is the project?

Run this command `git ls-files --exclude-standard -- ':!:**/*.[pjs][npv]g' ':!:**/*.ai' ':!:.idea' ':!:**/*.eslintrc' ':!:*.json' | xargs wc -l`
