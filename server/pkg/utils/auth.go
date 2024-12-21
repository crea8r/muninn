package utils

import (
	"context"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/google/uuid"
)

func IsAdmin(ctx context.Context) bool {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	return claims.Role == "admin"
}

func GetOrgIDFromContext(ctx context.Context) (uuid.UUID) {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	return uuid.MustParse(claims.OrgID)
}

func IsCreator(ctx context.Context, creatorID uuid.UUID) bool {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	return uuid.MustParse(claims.CreatorID)  == creatorID
}