# Introduction

This is the document to interact with munin.

## Insert fact

### The api url is

`POST`

`https://api.usemuninn.xyz/external/facts`

#### Header

```header
Bearer {secret_token}
```

#### Body

```typescript
{
 "aliases": string[],
 "text": string,
 "happened_at": datetime, // format: 2024-11-21T12:00:00Z
 "location": string,
}
```

`aliases` can be wallet address, email, twitter id, etc. Multiple aliases can join a fact, e.g: if you have 10 people go to an event then it is up to you to create a fact that share among 10 people or create 10 seperate facts. My recommendation is if the text is exactly the same then keep folks in the same fact else split it.

`text` is the description of the fact you want to record, e.g: `{{name}}` join the `{{event_name}}`

`happened_at` is time moment the fact happened (timestamp with timezone) , sample data: 2024-11-21T12:00:00Z

`location` is where the fact happened, e.g: London, UK.

#### Response

```typescript
{
  "fact_id": string,
  "object_ids" string[],
  "text": string,
}
```

Error: HTTP STATUS 500
