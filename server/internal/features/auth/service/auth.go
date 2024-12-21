package service

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/pkg/utils"
	"github.com/golang-jwt/jwt/v5"
)

func (s *Service) SignUp(c context.Context, OrgName string, UserName string, UserPassword string) (database.Creator, error) {
	// create organization
	db := s.db
	org, err := db.CreateOrganization(c, database.CreateOrganizationParams{
		Name: OrgName,
		Profile: json.RawMessage(`{}`), // Empty JSON object for now
	})
	if err != nil {
		return database.Creator{}, err
	}
	// hash password
	hashedPassword, err := utils.HashPassword(UserPassword)
	if err != nil {
		return database.Creator{}, err
	}
	// create admin user
	creator, err := db.CreateCreator(c, database.CreateCreatorParams{
		Username: UserName,
		Pwd:      string(hashedPassword),
		Profile:  json.RawMessage(`{}`), // Empty JSON object for now
		Role:     "admin",
		OrgID:    org.ID,
		Active:   true,
	})
	if err != nil {
		return database.Creator{}, err
	}
	return creator, err
}

func (s *Service) Login(c context.Context, Username string, Password string) (string, error) {
	// Get creator
	creator, err := s.getCreator(c, Username, Password)
	if err != nil {
		return "", err
	}
	// Create JWT token, expire in 30 days
	claims := createClaim(creator, jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)))
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

func (s *Service) RobotLogin(c context.Context, Username string, Password string) (string, error) {
	// Get creator
	creator, err := s.getCreator(c, Username, Password)
	if err != nil {
		return "", err
	}
	// Create JWT token, expire in 3650 days
	claims := createClaim(creator, jwt.NewNumericDate(time.Now().Add(100 * 365 * 24 * time.Hour)))
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", err
	}
	return signedToken, nil
}