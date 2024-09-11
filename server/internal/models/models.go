package models

import (
	"github.com/google/uuid"
	"github.com/yourusername/crm-backend/internal/db"
)

type Object struct {
	db.Obj
	Tags []string
	ObjectTypes []ObjectType
}

type ObjectType struct {
	db.ObjType
	Values map[string]interface{}
}

type Funnel struct {
	db.Funnel
	Steps []db.Step
}

type Creator struct {
	db.Creator
	OrgName string
}

func (o *Object) AddTag(tagID uuid.UUID) error {
	// Implementation for adding a tag to an object
	return nil
}

func (f *Funnel) AddStep(step db.Step) error {
	// Implementation for adding a step to a funnel
	return nil
}

func (c *Creator) ChangeRole(newRole string) error {
	// Implementation for changing a creator's role
	return nil
}