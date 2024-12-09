# Introduction

This is the document to interact with munin.

## Insert fact

### The api url is

`POST`

`https://api.usemuninn.xyz/external/facts`

#### Header

```header
Bearear {secret_token}
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

#### Response

```typescript
{
  "fact_id": string,
  "object_ids" string[],
  "text": string,
}
```

Error: HTTP STATUS 500
