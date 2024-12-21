package service

import (
	"context"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/pkg/utils"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db *database.Queries
}

func NewService(db *database.Queries) *Service {
	return &Service{db: db}
}

func (s *Service) getCreator(c context.Context, Username string, Password string) (database.GetCreatorByUsernameRow, error) {
	db := s.db
	// Get creator
	creator, err := db.GetCreatorByUsername(c, database.GetCreatorByUsernameParams{
		Username: Username,
		Active:   true,
	})
	if err != nil {
		return database.GetCreatorByUsernameRow{}, err
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(creator.Pwd), []byte(Password)); err != nil {
		return database.GetCreatorByUsernameRow{}, err
	}
	return creator, nil
}

func createClaim(creator database.GetCreatorByUsernameRow, expiresAt *jwt.NumericDate) *middleware.Claims {
	return &middleware.Claims{
		CreatorID: creator.ID.String(),
		Name:      creator.Username,
		OrgID:     creator.OrgID.String(),
		OrgName:  creator.Orgname,
		Role:      creator.Role,
		Profile:  creator.Profile,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: expiresAt,
		},
	}
}

func (s *Service) isAdminOfTheSameOrg(ctx context.Context, UserID uuid.UUID) bool {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	adminOrgID := uuid.MustParse(claims.OrgID)
	c, errr:= s.db.GetCreatorByID(ctx, UserID)
	if errr != nil {
		return false
	}
	return c.OrgID == adminOrgID && utils.IsAdmin(ctx)
}