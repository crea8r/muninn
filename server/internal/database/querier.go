// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type Querier interface {
	CreateCreator(ctx context.Context, arg CreateCreatorParams) (Creator, error)
	CreateFunnel(ctx context.Context, arg CreateFunnelParams) (Funnel, error)
	CreateObject(ctx context.Context, arg CreateObjectParams) (Obj, error)
	DeleteCreator(ctx context.Context, id pgtype.UUID) error
	DeleteFunnel(ctx context.Context, id pgtype.UUID) error
	DeleteObject(ctx context.Context, id pgtype.UUID) error
	GetCreator(ctx context.Context, id pgtype.UUID) (Creator, error)
	GetFunnel(ctx context.Context, id pgtype.UUID) (Funnel, error)
	GetObject(ctx context.Context, id pgtype.UUID) (Obj, error)
	ListCreators(ctx context.Context, arg ListCreatorsParams) ([]Creator, error)
	ListFunnels(ctx context.Context, arg ListFunnelsParams) ([]Funnel, error)
	ListObjects(ctx context.Context, arg ListObjectsParams) ([]Obj, error)
	UpdateCreator(ctx context.Context, arg UpdateCreatorParams) (Creator, error)
	UpdateFunnel(ctx context.Context, arg UpdateFunnelParams) (Funnel, error)
	UpdateObject(ctx context.Context, arg UpdateObjectParams) (Obj, error)
}

var _ Querier = (*Queries)(nil)
