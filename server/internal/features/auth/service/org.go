package service

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/pkg/utils"
)

func (s *Service) ListOrgCreators(c context.Context, query string) ([]database.ListOrgMembersRow, error) {
	OrgID := utils.GetOrgIDFromContext(c)
	creators, err := s.db.ListOrgMembers(c, database.ListOrgMembersParams{
		OrgID: OrgID,
		Column2: query,
	})
	if err!=nil {
		return nil, err
	}
	return creators, nil
}

func (s *Service) UpdateOrgDetails(c context.Context,  Name string, Profile json.RawMessage) (database.Org, error) {
	OrgID := utils.GetOrgIDFromContext(c)
	if !utils.IsAdmin(c) {
		return database.Org{}, errors.New("Forbidden")
	}
	updatedOrg, err := s.db.UpdateOrgDetails(c, database.UpdateOrgDetailsParams{
		ID:      OrgID,
		Name:    Name,
		Profile: Profile,
	})
	if err != nil {
		return database.Org{}, err
	}
	return updatedOrg, nil
}

func (s *Service) AddNewOrgCreator(c context.Context, UserName string, Password string, Role string, Profile json.RawMessage) (database.Creator, error) {
	if !utils.IsAdmin(c) {
		return database.Creator{}, errors.New("Forbidden")
	}
	OrgID := utils.GetOrgIDFromContext(c)
	hashedPassword, err := utils.HashPassword(Password)
	if err != nil {
		return database.Creator{}, err
	}
	creator, err := s.db.CreateCreator(c, database.CreateCreatorParams{
		Username: UserName,
		Pwd:      string(hashedPassword),
		Profile:  Profile,
		Role:     Role,
		OrgID:    OrgID,
		Active:   true,
	})
	if err != nil {
		return database.Creator{}, err
	}
	return creator, nil
}