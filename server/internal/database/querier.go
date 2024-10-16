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
	AddObjectsToFact(ctx context.Context, arg AddObjectsToFactParams) error
	AddObjectsToTask(ctx context.Context, arg AddObjectsToTaskParams) error
	AddTagToObject(ctx context.Context, arg AddTagToObjectParams) error
	CompleteImportTask(ctx context.Context, arg CompleteImportTaskParams) (ImportTask, error)
	CountFactsByOrgID(ctx context.Context, arg CountFactsByOrgIDParams) (int64, error)
	CountFunnels(ctx context.Context, arg CountFunnelsParams) (int64, error)
	CountImportTasks(ctx context.Context, orgID uuid.UUID) (int64, error)
	CountListsByOrgID(ctx context.Context, orgID uuid.UUID) (int64, error)
	CountObjectTypes(ctx context.Context, arg CountObjectTypesParams) (int64, error)
	CountObjectsByOrgID(ctx context.Context, arg CountObjectsByOrgIDParams) (int64, error)
	CountObjectsByTypeWithAdvancedFilter(ctx context.Context, arg CountObjectsByTypeWithAdvancedFilterParams) (int64, error)
	CountObjectsForStep(ctx context.Context, arg CountObjectsForStepParams) (int64, error)
	CountOngoingTask(ctx context.Context, assignedID uuid.NullUUID) (int64, error)
	CountTags(ctx context.Context, arg CountTagsParams) (int64, error)
	CountTasksByObjectID(ctx context.Context, arg CountTasksByObjectIDParams) (int64, error)
	CountTasksByOrgID(ctx context.Context, arg CountTasksByOrgIDParams) (int64, error)
	CountTasksWithFilter(ctx context.Context, arg CountTasksWithFilterParams) (int64, error)
	CountUnseenFeed(ctx context.Context, creatorID uuid.UUID) (int64, error)
	CreateCreator(ctx context.Context, arg CreateCreatorParams) (Creator, error)
	CreateCreatorList(ctx context.Context, arg CreateCreatorListParams) (CreatorList, error)
	// Add these new queries to your existing queries.sql file
	CreateFact(ctx context.Context, arg CreateFactParams) (Fact, error)
	CreateFeed(ctx context.Context, arg CreateFeedParams) (Feed, error)
	CreateFunnel(ctx context.Context, arg CreateFunnelParams) (Funnel, error)
	CreateImportTask(ctx context.Context, arg CreateImportTaskParams) (ImportTask, error)
	CreateList(ctx context.Context, arg CreateListParams) (List, error)
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
	DeleteCreatorList(ctx context.Context, id uuid.UUID) error
	DeleteFact(ctx context.Context, id uuid.UUID) error
	DeleteFunnel(ctx context.Context, id uuid.UUID) error
	DeleteList(ctx context.Context, id uuid.UUID) error
	DeleteObject(ctx context.Context, id uuid.UUID) error
	DeleteObjectType(ctx context.Context, id uuid.UUID) (int64, error)
	DeleteStep(ctx context.Context, id uuid.UUID) error
	DeleteTag(ctx context.Context, id uuid.UUID) (int64, error)
	DeleteTask(ctx context.Context, id uuid.UUID) error
	GetCreator(ctx context.Context, id uuid.UUID) (Creator, error)
	GetCreatorByID(ctx context.Context, id uuid.UUID) (Creator, error)
	GetCreatorByUsername(ctx context.Context, arg GetCreatorByUsernameParams) (GetCreatorByUsernameRow, error)
	GetCreatorListByID(ctx context.Context, id uuid.UUID) (GetCreatorListByIDRow, error)
	GetFactByID(ctx context.Context, id uuid.UUID) (GetFactByIDRow, error)
	GetFeed(ctx context.Context, creatorID uuid.UUID) ([]Feed, error)
	GetFunnel(ctx context.Context, id uuid.UUID) (GetFunnelRow, error)
	GetImportTask(ctx context.Context, id uuid.UUID) (ImportTask, error)
	GetImportTaskHistory(ctx context.Context, arg GetImportTaskHistoryParams) ([]ImportTask, error)
	GetListByID(ctx context.Context, id uuid.UUID) (uuid.UUID, error)
	GetObjStep(ctx context.Context, id uuid.UUID) (ObjStep, error)
	GetObjectByIDString(ctx context.Context, idString string) (Obj, error)
	GetObjectDetails(ctx context.Context, arg GetObjectDetailsParams) (GetObjectDetailsRow, error)
	GetObjectTypeByID(ctx context.Context, id uuid.UUID) (ObjType, error)
	GetObjectTypeValue(ctx context.Context, arg GetObjectTypeValueParams) (ObjTypeValue, error)
	GetObjectsForStep(ctx context.Context, arg GetObjectsForStepParams) ([]GetObjectsForStepRow, error)
	GetOngoingImportTask(ctx context.Context, orgID uuid.UUID) (ImportTask, error)
	GetOrgDetails(ctx context.Context, id uuid.UUID) (Org, error)
	GetStep(ctx context.Context, id uuid.UUID) (GetStepRow, error)
	GetTagByID(ctx context.Context, id uuid.UUID) (Tag, error)
	GetTaskByID(ctx context.Context, id uuid.UUID) (GetTaskByIDRow, error)
	HardDeleteObjStep(ctx context.Context, id uuid.UUID) error
	HealthCheck(ctx context.Context) (int32, error)
	ListCreatorListsByCreatorID(ctx context.Context, creatorID uuid.UUID) ([]ListCreatorListsByCreatorIDRow, error)
	ListFactsByOrgID(ctx context.Context, arg ListFactsByOrgIDParams) ([]ListFactsByOrgIDRow, error)
	ListFunnels(ctx context.Context, arg ListFunnelsParams) ([]ListFunnelsRow, error)
	ListListsByOrgID(ctx context.Context, arg ListListsByOrgIDParams) ([]ListListsByOrgIDRow, error)
	ListObjectTypes(ctx context.Context, arg ListObjectTypesParams) ([]ListObjectTypesRow, error)
	ListObjectsByOrgID(ctx context.Context, arg ListObjectsByOrgIDParams) ([]ListObjectsByOrgIDRow, error)
	ListObjectsByTaskID(ctx context.Context, taskID uuid.UUID) ([]ListObjectsByTaskIDRow, error)
	ListObjectsByTypeWithAdvancedFilter(ctx context.Context, arg ListObjectsByTypeWithAdvancedFilterParams) ([]ListObjectsByTypeWithAdvancedFilterRow, error)
	ListOrgMembers(ctx context.Context, arg ListOrgMembersParams) ([]ListOrgMembersRow, error)
	ListStepsByFunnel(ctx context.Context, funnelID uuid.UUID) ([]ListStepsByFunnelRow, error)
	ListTags(ctx context.Context, arg ListTagsParams) ([]ListTagsRow, error)
	ListTasksByObjectID(ctx context.Context, arg ListTasksByObjectIDParams) ([]ListTasksByObjectIDRow, error)
	ListTasksByOrgID(ctx context.Context, arg ListTasksByOrgIDParams) ([]ListTasksByOrgIDRow, error)
	// Add this new query to your existing queries.sql file
	ListTasksWithFilter(ctx context.Context, arg ListTasksWithFilterParams) ([]ListTasksWithFilterRow, error)
	MarkFeedAsSeen(ctx context.Context, dollar_1 []uuid.UUID) error
	RemoveObjectTypeValue(ctx context.Context, arg RemoveObjectTypeValueParams) error
	RemoveObjectsFromFact(ctx context.Context, arg RemoveObjectsFromFactParams) error
	RemoveObjectsFromTask(ctx context.Context, arg RemoveObjectsFromTaskParams) error
	RemoveTagFromObject(ctx context.Context, arg RemoveTagFromObjectParams) error
	SoftDeleteObjStep(ctx context.Context, id uuid.UUID) error
	UpdateCreatorList(ctx context.Context, arg UpdateCreatorListParams) (CreatorList, error)
	UpdateFact(ctx context.Context, arg UpdateFactParams) (Fact, error)
	UpdateFunnel(ctx context.Context, arg UpdateFunnelParams) (Funnel, error)
	UpdateImportTaskError(ctx context.Context, arg UpdateImportTaskErrorParams) (ImportTask, error)
	UpdateImportTaskProgress(ctx context.Context, arg UpdateImportTaskProgressParams) (ImportTask, error)
	UpdateImportTaskStatus(ctx context.Context, arg UpdateImportTaskStatusParams) (ImportTask, error)
	UpdateList(ctx context.Context, arg UpdateListParams) (List, error)
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
	UpsertObjectTypeValue(ctx context.Context, arg UpsertObjectTypeValueParams) (ObjTypeValue, error)
}

var _ Querier = (*Queries)(nil)
