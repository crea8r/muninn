# Model Design

There are {x} models in this project: Creator, Object, Funnel.

## Creator

The `creator` model has access to following data (that relate to it)

- `org`
- `creator_list` and the `list` that creator_list refer to.
- `task` that the creator owned or assigned
- `fact` that the creator created

## Object

The `object` model has access to following data (that relate to it):

- `tag`
- `object_type_value`
- `step` and the `funnel` that the step belong to.
- `fact`
- `task`

## Funnel

The `funnel` model has access to:

- All `step` belong to the funnel.
- All `obj` that relates to step of the funnel.
