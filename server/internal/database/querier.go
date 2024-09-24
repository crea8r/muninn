// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package database

import (
	"context"

	"github.com/google/uuid"
)

type Querier interface {
	AddObjectTypeValue(ctx context.Context, arg AddObjectTypeValueParams) (ObjTypeValue, error)
	AddObjectsToTask(ctx context.Context, arg AddObjectsToTaskParams) error
	AddTagToObject(ctx context.Context, arg AddTagToObjectParams) error
	CountFunnels(ctx context.Context, arg CountFunnelsParams) (int64, error)
	CountObjectTypes(ctx context.Context, arg CountObjectTypesParams) (int64, error)
	CountObjectsByOrgID(ctx context.Context, arg CountObjectsByOrgIDParams) (int64, error)
	CountTags(ctx context.Context, arg CountTagsParams) (int64, error)
	CountTasksByObjectID(ctx context.Context, arg CountTasksByObjectIDParams) (int64, error)
	CountTasksByOrgID(ctx context.Context, arg CountTasksByOrgIDParams) (int64, error)
	CountTasksWithFilter(ctx context.Context, arg CountTasksWithFilterParams) (int64, error)
	CreateCreator(ctx context.Context, arg CreateCreatorParams) (Creator, error)
	CreateFeed(ctx context.Context, arg CreateFeedParams) (Feed, error)
	CreateFunnel(ctx context.Context, arg CreateFunnelParams) (Funnel, error)
	CreateObjStep(ctx context.Context, arg CreateObjStepParams) (CreateObjStepRow, error)
	CreateObject(ctx context.Context, arg CreateObjectParams) (Obj, error)
	CreateObjectType(ctx context.Context, arg CreateObjectTypeParams) (ObjType, error)
	CreateOrganization(ctx context.Context, arg CreateOrganizationParams) (Org, error)
	CreateStep(ctx context.Context, arg CreateStepParams) (Step, error)
	// Setting/Tag section
	CreateTag(ctx context.Context, arg CreateTagParams) (Tag, error)
	// Existing queries...
	CreateTask(ctx context.Context, arg CreateTaskParams) (Task, error)
	DeleteCreator(ctx context.Context, id uuid.UUID) error
	DeleteFunnel(ctx context.Context, id uuid.UUID) error
	DeleteObject(ctx context.Context, id uuid.UUID) error
	DeleteObjectType(ctx context.Context, id uuid.UUID) (int64, error)
	DeleteStep(ctx context.Context, id uuid.UUID) error
	DeleteTag(ctx context.Context, id uuid.UUID) (int64, error)
	DeleteTask(ctx context.Context, id uuid.UUID) error
	GetCreator(ctx context.Context, id uuid.UUID) (Creator, error)
	GetCreatorByID(ctx context.Context, id uuid.UUID) (Creator, error)
	GetCreatorByUsername(ctx context.Context, arg GetCreatorByUsernameParams) (GetCreatorByUsernameRow, error)
	GetFeed(ctx context.Context, creatorID uuid.UUID) ([]Feed, error)
	GetFunnel(ctx context.Context, id uuid.UUID) (GetFunnelRow, error)
	GetObjStep(ctx context.Context, id uuid.UUID) (ObjStep, error)
	GetObjectDetails(ctx context.Context, arg GetObjectDetailsParams) (GetObjectDetailsRow, error)
	GetObjectTypeByID(ctx context.Context, id uuid.UUID) (ObjType, error)
	GetOrgDetails(ctx context.Context, id uuid.UUID) (Org, error)
	GetStep(ctx context.Context, id uuid.UUID) (GetStepRow, error)
	GetTagByID(ctx context.Context, id uuid.UUID) (Tag, error)
	GetTaskByID(ctx context.Context, id uuid.UUID) (GetTaskByIDRow, error)
	HardDeleteObjStep(ctx context.Context, id uuid.UUID) error
	ListFunnels(ctx context.Context, arg ListFunnelsParams) ([]ListFunnelsRow, error)
	ListObjectTypes(ctx context.Context, arg ListObjectTypesParams) ([]ListObjectTypesRow, error)
	ListObjectsByOrgID(ctx context.Context, arg ListObjectsByOrgIDParams) ([]ListObjectsByOrgIDRow, error)
	ListObjectsByTaskID(ctx context.Context, taskID uuid.UUID) ([]ListObjectsByTaskIDRow, error)
	ListOrgMembers(ctx context.Context, orgID uuid.UUID) ([]ListOrgMembersRow, error)
	ListStepsByFunnel(ctx context.Context, funnelID uuid.UUID) ([]ListStepsByFunnelRow, error)
	ListTags(ctx context.Context, arg ListTagsParams) ([]ListTagsRow, error)
	ListTasksByObjectID(ctx context.Context, arg ListTasksByObjectIDParams) ([]ListTasksByObjectIDRow, error)
	ListTasksByOrgID(ctx context.Context, arg ListTasksByOrgIDParams) ([]ListTasksByOrgIDRow, error)
	// Add this new query to your existing queries.sql file
	ListTasksWithFilter(ctx context.Context, arg ListTasksWithFilterParams) ([]ListTasksWithFilterRow, error)
	MarkFeedAsSeen(ctx context.Context, dollar_1 []uuid.UUID) error
	RemoveObjectTypeValue(ctx context.Context, arg RemoveObjectTypeValueParams) error
	RemoveObjectsFromTask(ctx context.Context, arg RemoveObjectsFromTaskParams) error
	RemoveTagFromObject(ctx context.Context, arg RemoveTagFromObjectParams) error
	SoftDeleteObjStep(ctx context.Context, id uuid.UUID) error
	UpdateFunnel(ctx context.Context, arg UpdateFunnelParams) (Funnel, error)
	UpdateObjStep(ctx context.Context, arg UpdateObjStepParams) error
	UpdateObjStepSubStatus(ctx context.Context, arg UpdateObjStepSubStatusParams) error
	UpdateObject(ctx context.Context, arg UpdateObjectParams) (Obj, error)
	UpdateObjectType(ctx context.Context, arg UpdateObjectTypeParams) (ObjType, error)
	UpdateObjectTypeValue(ctx context.Context, arg UpdateObjectTypeValueParams) (ObjTypeValue, error)
	UpdateOrgDetails(ctx context.Context, arg UpdateOrgDetailsParams) (Org, error)
	UpdateStep(ctx context.Context, arg UpdateStepParams) (Step, error)
	UpdateTag(ctx context.Context, arg UpdateTagParams) (Tag, error)
	UpdateTask(ctx context.Context, arg UpdateTaskParams) (Task, error)
	UpdateUserPassword(ctx context.Context, arg UpdateUserPasswordParams) error
	UpdateUserProfile(ctx context.Context, arg UpdateUserProfileParams) (Creator, error)
	UpdateUserRoleAndStatus(ctx context.Context, arg UpdateUserRoleAndStatusParams) (Creator, error)
}

var _ Querier = (*Queries)(nil)
