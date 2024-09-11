# Architecture

## Implementation

### Library

The project use typescript, sass, ReactJS, chakra-ui, tailwindcss. For testing, please use mocha and chai for integration test. It is preferable for light weight like Context API, if possible then avoid state managemnt library. React Router is the prefer routing library. This project will be deployed on Netlify. Use Google Analytics to track user behavior.

### Branding

Project use clear and modern styling, learn from famous productivity app like Notion, Asana and ClickUp. The color palette use these colors: #8ecae6, #219ebc, #023047, #ffb703, #fb8500. Use the text "Muninn" as the logo for the app.

### Accessibility

This site use only English, no internationalization needed. This webapp is designed to run mainly on Desktop, however it should be able to show important information on Mobile.

## Layout

For `landing page`, `login` and `register` page use a web single column layout. The bottom is a footer showing contact and support.

The app use a webapp full-scren layout. On the top, there is a search bar in the middle, an user avatar on far right. User click on the user avatar can see a menu with option to go to Account page, Organisation page or Log out.

On the left, there is a panel which is 250px wide and full height. There is a burger button to collapse and reduce the left panel to just a list of icon. The left panel has following menu with the default selected is `Feed`.

```md
|- Feed
|- Tasks
|- My Views
|-- (show last 5 last_updated `creator_list` here)
|- All objects
|- Settings
|-- Object Type
|-- Funnel
|-- List
|-- Tag
```

On the right size of the screen, the content area is full width.

## Important component

### Rich text editor

There is a rich text editor with capability to link a task to object (in the task create & edit UI), object to object (in the fact create & edit UI) within the editor interface. User can typ `@` then an auto-suggestion box will help them to choose the correct object. To search for an object, the server will look for data in `name`, `description` of the `object` AND all data in the `object_type_value` that relate to the object. The display data will be order by `last_updated` desc.

### Table with complex filter

There is a table with complex filter, ranging from text search from all value of the object model and pagination. Most table will display object from a `creator_list` setup, and whenever a filter is modified then it will update the params data in database.

## Pages

### Landing page

Route `/`

This is the page people first see when they open the app. There is a heading in the middle of the screen "Not another CRM, it is manage your contact your way". The second line is two button: Login and Register. If user is already logged in, bring them to `feed`.

### Login

Route `/login`

There is login form with username and password. If user is already logged in, bring them to `feed`.
When user click login, send info to the route `/auth/login`. If server response with 200 and user information them redirect to `/feed`

### Register

Route `/register`

There is a register form with:

- organisation name
- username
- password

After user submit information, submit it to the server with the route `/auth/register`, show them a congrats dialog and when they close the dialog, redirect to `/on-boarding`.

### Onboarding

Route `/on-boarding`

This is a special page, only show once. There is a dialog that take up nearly the whole screen with multiple page to show instruction how to use this web app.

### Feeds

Route: `/feed`

User access this page by click the `feed` on the navigation. In this page, it will get data from the `/data/feed` both the seen and unseen data. The data will be grouped by date. Once user see the rows, it will post to `/data/feed` to make sure it is seen.

### Tasks

Route: `/task`

When user click on `Tasks` on the left panel, it will show the task list of the current user.

Tasks will be display in a list and group by their status. There is a dropbox to choose different status for a task.

There is a button to create a new task. In the task rich text editor, people can link the task with object. In a task, anyone can change the task assignee.

### My Views

Route: `/views`

Server will list all the `creator_list` that user created. User can click into each of the item to open the list and its content with the url `/views/:creator_list_id`. There is a button to go to `/list` where user can see `list` of the organisation.

### Each item in My Views sub-menu

Route: `/views/:creator_list_id`

Server will render the objects of the list in a rich table format.

## All Objects

Route: `/objects`

This section will show all objects in the a table format. Click on each of the object will show the detail, data come from the `object` data model.

Route for each object will be: `/object/:object_id`

In the object detail view, 60% on the left is the detail of the object coming from the `obj` table and all other linked data, like `tag`, `obj_type_value`, `obj_step`. 40% on the right is all `fact` and `task` orderby their `last_updated` desc. On the bottom of the screen, user can either add a task or a fact. User can also add link a new `obj_type` to the object and fill in the `obj_type_value`.

## Setting

There are 4 settings: Object Type, Funnel, List and Tag. User click on each of the setting and it will show a list of rows. In each of the screen there will be a button to create new item, along with `name` and `description` there will be custom attributes.

### Object Type

Route `/setting/object_type`

User can see a list of object type and a button to create an object type. If user click of a row, it will show the list of object with the object type.

In the new object type dialog, user has to provide list of properties and its data type.

### Funnel

Route `/setting/funnel`

User can see a list of funnel and a button to create a funnel. User can add new funnel with its step or order.

### List

Route `/setting/list`

User can see a list of list and a button to create a list. User has an option to create a new `creator_list` from the list. User can design a new list by adding filtering options like list of `tag`, `obj_type`, `step` and/or `funnel`.

### Tag

Route `/setting/tag`

User can see a list of tag and a button to create a tag.
