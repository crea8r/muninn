# Controller Design

There are 4 major controllers of this project: Authentication, Setting, Data and Workplace.

There are conventions for GET request that filter and list data:

- All listing query with come with a `q` parameter to filter the `name` field.
- Support pagination in the request and response.

## Authentication

Authentication is the controller where all organisation and user registration happen. This controller also handle login provide session jwt.

### Register

Route: POST `/auth/register`

User has to submit information on the new org and his login information. Password should be md5 encrypted. Whoever register will be the `admin`.

### Login

Route: POST `/auth/login`

User provide username and password. If the info match then server will create a new row in the creator_session table with a jwt is randomly generated string and expired_at is 30 days into the future.

### Logout

Route: POST `/auth/logout`

Server will delete the current creator_session row.

### Creator (or user)

#### Route: POST `/auth/creator/`

The request contains information of the new user add this user to the current organisation. Only `admin` role can interact with this route.

#### Route: PUT `/auth/creator/:creator_id`

This route help creator to change their password and profile. `admin` role can change other member into `admin` and change himself into `member`. `admin` can also set a member to active again.

#### Route: DELETE `/auth/creator/:creator_id`

This route deactive a member, not an admin. An `admin` can never be deactivated. Only `admin` role can interact with this route. If a member is deactivated, all sessions are deleted.

## Setting

This controller holds data structure and meta data. This consists of tag, object type, funnel and its steps, list or view configuration.

### Tag

Tag is a piece of text that attach to object to compliment its meaning. A tag has color schema, which is a json with two field: primary color and secondary color.

#### Route: GET `/setting/tag`

The request will contain `q` param to filter tags. The return order is `created_at` desc.

#### Route: POST `/setting/tag`

The request will create a tag. If there is no color scheme is specify, use a default.

### Object Type

User can create object type, of which most important information is the fields which is a json file describe each field and its data type.
For example: given object type developer, the fields is `{email:"string", github: "string"}`.

#### Route: GET `/setting/type`

Server will list all object type, filtering with `q` parameter to match text in the `name` field.

#### Route: POST `/setting/type`

Server will create an object type.

#### Route: DELETE `/setting/type/:obj_type_id`

Server will delete the obj_type.

### Funnel

A funnel consists of multiple steps. Each step has a (nullable) parent. The first step has null parent. Object moving in the funnel must go step-by-step.

#### Route: GET `/setting/funnel`

Serve all funnels with `q` as name filtering.

#### Route: GET `/setting/funnel/:funnel_id`

Serve the detail of a funnel

#### Route: POST `/setting/funnel`

Create funnel and its steps.

#### Route: PUT `/setting/funnel/:funnel_id`

Edit a funnel and its steps.

### List

A list is a view on objects with the json hold condition such as: funnel (and steps), tags and object type.

#### Route: GET `/setting/list`

Serve all list of an organisation.

#### Route: POST `/setting/list`

Create a list.

#### Route: PUT `/setting/list`

Edit a list.

#### Route: GET `/setting/list/:list_id`

Serve the detail of a list and all object belong to this list. There is `q` to filter object by name.

## Data

This controller hold access to all tasks, objects and creator lists which is saved filter setting of generic lists.

### Object

One object can exist in multiple object type. There are routes to assign object type to object, hence update the detail in `obj_type_value` table.

#### Route: GET `/data/obj/:obj_id`

Return detail of an object, including all of its `obj_type_value`,`obj_step`, `obj_tag`, `obj_fact` and `obj_task`.

#### Route: PUT `/data/obj/:obj_id/tag`

Update tag list of an object.

#### Route: GET `/data/obj/tag/:tag_id/`

The request will list every `object` that carry `tag_id` with a `q` parameter to filter the `name` of the object. Order by `created_at` desc.

#### Route: GET `/data/obj/funnel/:funnel_id/`

Serve all object attached to a funnel. Order by `last_updated` desc.

#### Route: GET `/data/obj/funnel/:funnel_id/:step_id`

Serve all object attached to a step of a funnel. Order by `last_updated` desc.

#### Route: GET `/data/obj/type/:obj_type_id/`

Server will list all objects having this type, coming with a `q` paramenter to filter the `name` of the object. Order by `last_updated` desc.

#### Route: POST `/data/object/type/:obj_type_id`

Link an object with an object_type and insert the detail data.

#### Route: PUT `/data/object/object_type/:obj_type_value_id`

Edit value of `object_type_value`.

#### Route: DETELE `/data/object/object_type/:obj_type_value_id`

Delete a row in `object_type_value`.

## Workplace

This controller handle the view (creator_list) of a creator, his task and facts relating to an object.

### Creator List

A creator list is a list with saved parameters, such as current page, name searching parameter, object type and funnel steps.

#### Route: GET `/workplace/list/`

Return all `creator_list` of a creator. Using `q` to filter by the list name.

#### Route: POST `/workplace/list`

Create new `creator_list` from an existing list.

#### Route: GET `/workplace/list/:creator_list_id`

List objects in a creator_list. Using `q` to search by object name, order by `last_updated` desc.

### Task

User can create a task and assign to anyone in the organisation. A task can relate to multiple object.

#### Route: GET `/workplace/task/`

Serve all task that a creator owned or assigned. Coming with an optional `q` parameter to filter by task content. Order by `last_updated` desc. By default, skip status `completed`.

There is a parameter `status` which is the list of status that the api will query.

#### Route: GET `/workplace/task/:creator_id`

Serve all task that `creator_id` owned or assigned. Coming with an optional `q` parameter to filter by task content. Order by `last_updated` desc. By default, skip status `completed`.

There is a parameter `status` which is the list of status that the api will query.

There is a parameter `relationshop` which is `own` and/or `assigned` to show the appropriate relationship.
