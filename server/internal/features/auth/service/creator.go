package service

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/pkg/utils"
	"github.com/google/uuid"
)

// This function to update the creator password
func (s *Service) UpdateCreatorPassword(c context.Context, UserID uuid.UUID, NewPassword string) (bool, error) {	
	if !utils.IsCreator(c, UserID) {
		if !s.isAdminOfTheSameOrg(c, UserID) {
			return false, errors.New("Forbidden")
		}
	}
	
	// Hash the new password
	hashedPassword, err := utils.HashPassword(NewPassword)
	if err != nil {
		return false, err
	}
	err = s.db.UpdateCreatorPassword(c, database.UpdateCreatorPasswordParams{
		ID: UserID,
		Pwd: hashedPassword,
	})
	if err != nil {
		return false, err
	}

	return true, nil
}

func (s *Service) UpdateCreatorProfile(c context.Context, UserID uuid.UUID, Profile json.RawMessage) (database.Creator, error) {
	if !utils.IsCreator(c, UserID) {
		if !s.isAdminOfTheSameOrg(c, UserID) {
			return database.Creator{}, errors.New("Forbidden")
		}
	}
	updatedUser, err := s.db.UpdateCreatorProfile(c, database.UpdateCreatorProfileParams{
		ID:      UserID,
		Profile: Profile,
	})
	if err != nil {
		return database.Creator{}, err
	}
	return updatedUser, nil
}

func (s *Service) UpdateCreatorRoleAndStatus(c context.Context, UserID uuid.UUID, Role string, Active bool) (database.Creator, error) {
	if !utils.IsCreator(c, UserID) {
		if !s.isAdminOfTheSameOrg(c, UserID) {
			return database.Creator{}, errors.New("Forbidden")
		}
	}
	OrgID := utils.GetOrgIDFromContext(c)
	updatedUser, err := s.db.UpdateCreatorRoleAndStatus(c, database.UpdateCreatorRoleAndStatusParams{
		ID:     UserID,
		Role:   Role,
		Active: Active,
		OrgID:  OrgID,
	})
	if err != nil {
		return database.Creator{}, err
	}
	return updatedUser, nil
}