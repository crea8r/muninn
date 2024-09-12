# Introduction

This document layout potential improvement for the next version, whatver the first version ignore due to time constrait and under-explore context of this product.

## Database improvement

The v0 ignore these

- No table partitioning
- No ENUM type
- `creator` only ties to `task`, make it quite strict to use this project. Should we add more connection?
- Remove `creator_session` in database

## Front-end improvement

Quesions left behind for the next version

- Implement WYSIWYG editor
- JWT stored in localStorage which poses big security risk. Move the jwt to cookie. This would change both the client and Permission middleware on server. Instruction [here](https://javascript.plainenglish.io/how-to-secure-jwt-in-a-single-page-application-6a46e69fc393)
