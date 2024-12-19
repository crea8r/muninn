package models

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/pkg/ctype"
	"github.com/google/uuid"
)

type Object struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	IDString    string            `json:"idString"`
	CreatorID   uuid.UUID         `json:"creatorId"`
	CreatedAt   time.Time         `json:"createdAt"`
	DeletedAt   ctype.NullTime      `json:"-"`
	Tags        []database.Tag             `json:"tags"`
	TypeValues  []ObjectTypeValue `json:"typeValues"`
}

type ListObjectsByOrgIdRow struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Photo			  string            `json:"photo"`
	Description string            `json:"description"`
	IDString    string            `json:"idString"`
	CreatedAt   time.Time         `json:"createdAt"`
	MatchSource       string      `json:"matchSource"`
	ObjHeadline       string 			`json:"objHeadline"`
	FactHeadline      string		  `json:"factHeadline"`
	TypeValueHeadline string      `json:"typeValueHeadline"`
	SearchRank        float64		  `json:"searchRank"`
	Tags              interface{} `json:"tags"`
	TypeValues        interface{} `json:"typeValues"`
}

type ObjectTypeValue struct {
	ID           uuid.UUID         `json:"id"`
	ObjectTypeID uuid.UUID         `json:"objectTypeId"`
	TypeValues       map[string]interface{} `json:"type_values"`
}

type ObjectModel struct {
	DB *database.Queries
}

type ObjectDetail struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	IDString    string            `json:"idString"`
	CreatorID   uuid.UUID         `json:"creatorId"`
	CreatedAt   time.Time         `json:"createdAt"`
	Tags        []database.Tag             `json:"tags"`
	TypeValues  []ObjectTypeValue `json:"typeValues"`
	Tasks       []Task            `json:"tasks"`
	StepsAndFunnels []StepAndFunnel `json:"stepsAndFunnels"`
	Facts       []Fact            `json:"facts"`
	Aliases		  []string				  `json:"aliases"`
}

type Task struct {
	ID        uuid.UUID      `json:"id"`
	Content   string         `json:"content"`
	Deadline  ctype.NullTime   `json:"deadline"`
	Status    string         `json:"status"`
	CreatedAt time.Time      `json:"createdAt"`
	AssignedID ctype.NullUUID `json:"assignedId"`
	DeletedAt ctype.NullTime  `json:"deletedAt"`
}

type StepAndFunnel struct {
	ID 			uuid.UUID `json:"id"`
	StepID    uuid.UUID `json:"stepId"`
	StepName  string    `json:"stepName"`
	FunnelID  uuid.UUID `json:"funnelId"`
	FunnelName string   `json:"funnelName"`
	SubStatus int32 		`json:"subStatus"`
	DeletedAt ctype.NullTime `json:"deletedAt"`
	CreatedAt time.Time `json:"createdAt"`
}

type Fact struct {
	ID         uuid.UUID    `json:"id"`
	Text       string       `json:"text"`
	HappenedAt ctype.NullTime `json:"happenedAt"`
	Location   string       `json:"location"`
	CreatedAt  time.Time    `json:"createdAt"`
}

func NewObjectModel(db *database.Queries) *ObjectModel {
	return &ObjectModel{DB: db}
}

func (m *ObjectModel) Create(ctx context.Context, name, description, idString string, creatorID uuid.UUID) (*Object, error) {
	obj, err := m.DB.CreateObject(ctx, database.CreateObjectParams{
		Name:        name,
		Description: description,
		IDString:    idString,
		CreatorID:   creatorID,
	})
	if err != nil {
		return nil, err
	}

	return &Object{
		ID:          obj.ID,
		Name:        obj.Name,
		Description: obj.Description,
		IDString:    obj.IDString,
		CreatorID:   obj.CreatorID,
		CreatedAt:   obj.CreatedAt,
	}, nil
}

func (m *ObjectModel) Update(ctx context.Context, id uuid.UUID, name, description, idString string, aliases []string) (*Object, error) {
	obj, err := m.DB.UpdateObject(ctx, database.UpdateObjectParams{
		ID:          id,
		Name:        name,
		Description: description,
		IDString:    idString,
		Aliases: 		 aliases,
	})
	if err != nil {
		return nil, err
	}

	return &Object{
		ID:          obj.ID,
		Name:        obj.Name,
		Description: obj.Description,
		IDString:    obj.IDString,
		CreatorID:   obj.CreatorID,
		CreatedAt:   obj.CreatedAt,
	}, nil
}

func (m *ObjectModel) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DB.DeleteObject(ctx, id)
}

func (m *ObjectModel) List(ctx context.Context, orgID uuid.UUID, search string, limit, offset int32) ([]ListObjectsByOrgIdRow, int64, error) {
	objects, err := m.DB.ListObjectsByOrgID(ctx, database.ListObjectsByOrgIDParams{
		OrgID:  orgID,
		Column2: search,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, err
	}
	count, err := m.DB.CountObjectsByOrgID(ctx, database.CountObjectsByOrgIDParams{
		OrgID:  orgID,
		Column2: search,
	})
	if err != nil {
		return nil, 0, err
	}
	result := make([]ListObjectsByOrgIdRow, len(objects))
	for i,obj := range objects {
		var tags []database.Tag
		var typeValues []ObjectTypeValue
		
		tagBytes,_ := obj.Tags.([]byte)
		typeValuesBytes,_ := obj.TypeValues.([]byte)

		// Unmarshal the byte slices into their respective types
		if len(tagBytes) > 0 {
			if err := json.Unmarshal(tagBytes, &tags); err != nil {
				return nil, 0, err
			}
		}
		if len(typeValuesBytes) > 0 {
			if err := json.Unmarshal(typeValuesBytes, &typeValues); err != nil {
				return nil, 0, err
			}
		}
		finalSearchRank := 0.0
		if obj.SearchRank != nil {
			finalSearchRank = obj.SearchRank.(float64)
		}
		result[i] = ListObjectsByOrgIdRow{
			ID: 				obj.ID,
			Name: 				obj.Name,
			Photo: 				obj.Photo,
			Description: 		obj.Description,
			IDString: 			obj.IDString,
			CreatedAt: 			obj.CreatedAt,
			MatchSource: 		obj.MatchSource,
			ObjHeadline: 		obj.ObjHeadline.(string),
			FactHeadline: 		obj.FactHeadline.(string),
			TypeValueHeadline: 	obj.TypeValueHeadline.(string),
			SearchRank: 		finalSearchRank,
			Tags: 				tags,
			TypeValues: 		typeValues,
		}
	}

	return result, count, nil
}

func (m *ObjectModel) GetDetails(ctx context.Context, id, orgID uuid.UUID) (*ObjectDetail, error) {
	data, err := m.DB.GetObjectDetails(ctx, database.GetObjectDetailsParams{
		ID:    id,
		OrgID: orgID,
	})
	if err != nil {
		fmt.Println("error getting object details:", err)
		return nil, err
	}
	var tags []database.Tag
	var typeValues []ObjectTypeValue
	var tasks []Task
	var stepsAndFunnels []StepAndFunnel
	var facts []Fact

	tagsBytes, ok := data.Tags.([]byte)
	if !ok {
		return nil, fmt.Errorf("expected []byte for Tags, got %T", data.Tags)
	}
	err = json.Unmarshal(tagsBytes, &tags)
	if err != nil {
		return nil, err
	}

	typeValuesBytes, ok := data.TypeValues.([]byte)
	if !ok {
		return nil, fmt.Errorf("expected []byte for TypeValues, got %T", data.TypeValues)
	}
	err = json.Unmarshal(typeValuesBytes, &typeValues)
	if err != nil {
		fmt.Println("Error unmarshalling type values:", err)
		return nil, err
	}

	tasksBytes, ok := data.Tasks.([]byte)
	if !ok {
		return nil, fmt.Errorf("expected []byte for Tasks, got %T", data.Tasks)
	}
	err = json.Unmarshal(tasksBytes, &tasks)
	if err != nil {
		return nil, err
	}
	
	stepsAndFunnelsBytes, ok := data.StepsAndFunnels.([]byte)
	if !ok {
		return nil, fmt.Errorf("expected []byte for StepsAndFunnels, got %T", data.StepsAndFunnels)
	}
	err = json.Unmarshal(stepsAndFunnelsBytes, &stepsAndFunnels)
	if err != nil {
		fmt.Println("Error: ",err)
		return nil, err
	}

	factsBytes, ok := data.Facts.([]byte)
	if !ok {
		return nil, fmt.Errorf("expected []byte for Facts, got %T", data.Facts)
	}
	err = json.Unmarshal(factsBytes, &facts)
	if err != nil {
		return nil, err
	}

	return &ObjectDetail{
		ID:          data.ID,
		Name:        data.Name,
		Description: data.Description,
		IDString:    data.IDString,
		CreatorID:   data.CreatorID,
		CreatedAt:   data.CreatedAt,
		Tags:        tags,
		TypeValues:  typeValues,
		Tasks:       tasks,
		StepsAndFunnels: stepsAndFunnels,
		Facts:       facts,
		Aliases: 	   data.Aliases,
	}, nil
}

func (m *ObjectModel) AddTag(ctx context.Context, objectID, tagID, orgID uuid.UUID) error {
	return m.DB.AddTagToObject(ctx, database.AddTagToObjectParams{
		ObjID:  objectID,
		TagID:  tagID,
		OrgID:  orgID,
	})
}

func (m *ObjectModel) RemoveTag(ctx context.Context, objectID, tagID, orgID uuid.UUID) error {
	return m.DB.RemoveTagFromObject(ctx, database.RemoveTagFromObjectParams{
		ObjID:  objectID,
		TagID:  tagID,
		OrgID:  orgID,
	})
}

func (m *ObjectModel) AddObjectTypeValue(ctx context.Context, objectID, typeID uuid.UUID, values json.RawMessage, orgID uuid.UUID) (*ObjectTypeValue, error) {
	result, err := m.DB.AddObjectTypeValue(ctx, database.AddObjectTypeValueParams{
		ObjID:  objectID,
		TypeID: typeID,
		Column3: values,
	})
	if err != nil {
		return nil, err
	}
	var parsedValues map[string]interface{}
	err = json.Unmarshal(result.TypeValues, &parsedValues)
	if err != nil {
		return nil, err
	}

	return &ObjectTypeValue{
		ID:           result.ID,
		ObjectTypeID: result.TypeID,
		TypeValues:       parsedValues,
	}, nil
}

func (m *ObjectModel) RemoveObjectTypeValue(ctx context.Context, typeValueID, orgID uuid.UUID) error {
	return m.DB.RemoveObjectTypeValue(ctx, database.RemoveObjectTypeValueParams{
		ID:    typeValueID,
		OrgID: orgID,
	})
}

func (m *ObjectModel) UpdateObjectTypeValue(ctx context.Context, typeValueID, orgID uuid.UUID, values json.RawMessage) (*ObjectTypeValue, error) {
	result, err := m.DB.UpdateObjectTypeValue(ctx, database.UpdateObjectTypeValueParams{
		ID:         typeValueID,
		OrgID:      orgID,
		Column3: values,
	})
	if err != nil {
		return nil, err
	}

	var parsedValues map[string]interface{}
	err = json.Unmarshal(result.TypeValues, &parsedValues)
	if err != nil {
		return nil, err
	}

	return &ObjectTypeValue{
		ID:           result.ID,
		ObjectTypeID: result.TypeID,
		TypeValues:       parsedValues,
	}, nil
}

type ObjStep struct {
	ID        uuid.UUID
	ObjID     uuid.UUID
	StepID    uuid.UUID
	CreatorID uuid.UUID
	CreatedAt time.Time
	DeletedAt ctype.NullTime
}

func (m *ObjectModel) CreateObjStep(ctx context.Context, objID, stepID, creatorID uuid.UUID) (*ObjStep, error) {
	row, err := m.DB.CreateObjStep(ctx, database.CreateObjStepParams{
		ObjID:     objID,
		StepID:    stepID,
		CreatorID: creatorID,
	})
	if err != nil {
		return nil, err
	}

	return &ObjStep{
		ID:        row.ID,
		ObjID:     row.ObjID,
		StepID:    row.StepID,
		CreatorID: row.CreatorID,
		CreatedAt: row.CreatedAt,
		DeletedAt: ctype.NullTime{
			NullTime: row.DeletedAt,
		},
	}, nil
}

func (m *ObjectModel) SoftDeleteObjStep(ctx context.Context, id uuid.UUID) error {
	return m.DB.SoftDeleteObjStep(ctx, id)
}

func (m *ObjectModel) HardDeleteObjStep(ctx context.Context, id uuid.UUID) error {
	return m.DB.HardDeleteObjStep(ctx, id)
}

type ObjStepResponse struct {
	ID        uuid.UUID `json:"id"`
	ObjID     uuid.UUID `json:"objId"`
	StepID    uuid.UUID `json:"stepId"`
	CreatorID uuid.UUID `json:"creatorId"`
	CreatedAt time.Time 	`json:"createdAt"`
	StepName  string `json:"stepName"`
	FunnelName string `json:"funnelName"`
}

func (m *ObjectModel) GetObjStep(ctx context.Context, id uuid.UUID) (*ObjStepResponse, error) {
	row, err := m.DB.GetObjStep(ctx, id)
	if err != nil {
		return nil, err
	}
	stepDetail, err := m.DB.GetStep(ctx, row.ID)
	if err != nil {
		return nil, err
	}

	return &ObjStepResponse{
		ID:        row.ID,
		ObjID:     row.ObjID,
		StepID:    row.StepID,
		CreatorID: row.CreatorID,
		CreatedAt: row.CreatedAt,
		StepName: stepDetail.Name,
		FunnelName: stepDetail.FunnelName,
	}, nil
}

func (m *ObjectModel) UpdateObjStepSubStatus(ctx context.Context, id uuid.UUID, subStatus int32) error {
	return m.DB.UpdateObjStepSubStatus(ctx, database.UpdateObjStepSubStatusParams{
		ID:         id,
		SubStatus:  subStatus,
	})
}
