package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type Object struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	IDString    string            `json:"idString"`
	CreatorID   uuid.UUID         `json:"creatorId"`
	CreatedAt   time.Time         `json:"createdAt"`
	DeletedAt   sql.NullTime      `json:"-"`
	Tags        []database.Tag             `json:"tags"`
	TypeValues  []ObjectTypeValue `json:"typeValues"`
}

type ObjectTypeValue struct {
	ID           uuid.UUID         `json:"id"`
	ObjectTypeID uuid.UUID         `json:"objectTypeId"`
	Values       map[string]string `json:"values"`
}

type ObjectModel struct {
	DB *database.Queries
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

func (m *ObjectModel) Update(ctx context.Context, id uuid.UUID, name, description, idString string) (*Object, error) {
	obj, err := m.DB.UpdateObject(ctx, database.UpdateObjectParams{
		ID:          id,
		Name:        name,
		Description: description,
		IDString:    idString,
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

func (m *ObjectModel) List(ctx context.Context, orgID uuid.UUID, search string, limit, offset int32) ([]Object, int64, error) {
	fmt.Println("in ObjectModel.List")
	objects, err := m.DB.ListObjectsByOrgID(ctx, database.ListObjectsByOrgIDParams{
		OrgID:  orgID,
		Column2: search,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, err
	}
	fmt.Println("in ObjectModel.CountObjectsByOrgID")
	count, err := m.DB.CountObjectsByOrgID(ctx, database.CountObjectsByOrgIDParams{
		OrgID:  orgID,
		Column2: search,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]Object, len(objects))
	for i, obj := range objects {
		var tags []database.Tag
		var typeValues []ObjectTypeValue

		err = json.Unmarshal(obj.Tags, &tags)
		if err != nil {
			return nil, 0, err
		}

		typeValuesBytes, ok := obj.TypeValues.([]byte)
		if !ok {
			return nil, 0, fmt.Errorf("expected []byte for TypeValues, got %T", obj.TypeValues)
		}
		err = json.Unmarshal(typeValuesBytes, &typeValues)
		if err != nil {
			return nil, 0, err
		}

		result[i] = Object{
			ID:          obj.ID,
			Name:        obj.Name,
			Description: obj.Description,
			IDString:    obj.IDString,
			CreatedAt:   obj.CreatedAt,
			Tags:        tags,
			TypeValues:  typeValues,
		}
	}

	return result, count, nil
}