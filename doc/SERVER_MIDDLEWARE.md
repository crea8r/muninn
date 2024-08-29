# Middleware design

## Feed

This middleware will record in `feed` table any `fact` or `task` is created relate to the creator. The content will be a text explain what happened and a link to the fact and task. Format should be a json look like `{text:"...", url: "..."}`.

## Permission

This middleware protect most controller with correct permission. Every member of an organisation can change data within that organisation. For example, if a member in a orgnisation query tag or object, it will show everything belong to the organisation regardless of creator.
However, only admin role can add new member.

Except login and register, every route should be protected by authentication using the creator_session table. This middleware will read `creator_session` in the request header. If session is invalid then it will return a http code for invalid access.

## Cache

Everytime user make a request, they will provide a `creator_session` in the http header, the full url and its body. This middleware will cache the request for at least 2 minutes. It will also return a http error code if a client make a request more than 100 times per second. All of this to make sure an error in the front end will not kill the database.
