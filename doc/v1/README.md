# Introduction

This document layout potential improvement for the next version, whatver the first version ignore due to time constrait and under-explore context of this product.

## Database improvement

The v0 ignore these

- No table partitioning
- No ENUM type
- `creator` only ties to `task`, make it quite strict to use this project. Should we add more connection?
- Remove `creator_session` in database
- Create a task to create `obj_type_value`.`search_vector`
- Create a task to aggregate `obj_type_value`.`search_vector`, `fact`.`text`::tsvector into one vector in `obj`. This would make search and query much more efficient.
- Improve the text indexing function, e.g: email should only kept the handle and unpopular domain.
- Security issue for some of the query; e.g: any user from any org can update, delete obj_step

## Front-end improvement

Quesions left behind for the next version

- Implement WYSIWYG editor
- JWT stored in localStorage which poses big security risk. Move the jwt to cookie. This would change both the client and Permission middleware on server. Instruction [here](https://javascript.plainenglish.io/how-to-secure-jwt-in-a-single-page-application-6a46e69fc393)
- Each obj_type can create a form to input data
- Enable merge function
- Enable "object id" field to add relations among objects -> this might lead to muninn become the new Notion
- obj_type_value should store value type (string, number, array, object id)
