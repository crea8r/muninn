package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/utils"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type FactHandler struct {
	db *database.Queries
}

func NewFactHandler(db *database.Queries) *FactHandler {
	return &FactHandler{db: db}
}

func (h *FactHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Text       string    `json:"text"`
		HappenedAt utils.NullTime`json:"happenedAt"`
		Location   string    `json:"location"`
		ObjectIDs  []string  `json:"objectIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creatorID := claims.CreatorID

	fact, err := h.db.CreateFact(r.Context(), database.CreateFactParams{
		Text:       input.Text,
		HappenedAt: sql.NullTime{
			Time:  input.HappenedAt.Time,
			Valid: input.HappenedAt.Valid,
		},
		Location:   input.Location,
		CreatorID:  uuid.MustParse(creatorID),
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(input.ObjectIDs) > 0 {
		objectIDs := make([]uuid.UUID, len(input.ObjectIDs))
		for i, id := range input.ObjectIDs {
			objectIDs[i] = uuid.MustParse(id)
		}

		orgID := claims.OrgID
		err = h.db.AddObjectsToFact(r.Context(), database.AddObjectsToFactParams{
			Column1: objectIDs,
			FactID: fact.ID,
			OrgID: uuid.MustParse(orgID),
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(fact)
}

func (h *FactHandler) Update(w http.ResponseWriter, r *http.Request) {
	factID := chi.URLParam(r, "id")

	var input struct {
		Text       string    `json:"text"`
		HappenedAt utils.NullTime `json:"happenedAt"`
		Location   string    `json:"location"`
		ToAddObjectIDs  []string  `json:"toAddObjectIDs"`
		ToRemoveObjectIDs  []string  `json:"toRemoveObjectIDs"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fact, err := h.db.UpdateFact(r.Context(), database.UpdateFactParams{
		ID:         uuid.MustParse(factID),
		Text:       input.Text,
		HappenedAt: sql.NullTime{
			Time:  input.HappenedAt.Time,
			Valid: input.HappenedAt.Valid,
		},
		Location:   input.Location,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := claims.OrgID

	if(len(input.ToRemoveObjectIDs) > 0) {
		removingObjectIDs := make([]uuid.UUID, len(input.ToRemoveObjectIDs))
		for i, id := range input.ToRemoveObjectIDs {
			removingObjectIDs[i] = uuid.MustParse(id)
		}
		err = h.db.RemoveObjectsFromFact(r.Context(), database.RemoveObjectsFromFactParams{
			FactID: fact.ID,
			Column2: removingObjectIDs,
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if(len(input.ToAddObjectIDs) > 0) {
		addingObjectIDs := make([]uuid.UUID, len(input.ToAddObjectIDs))
		for i, id := range input.ToAddObjectIDs {
			addingObjectIDs[i] = uuid.MustParse(id)
		}
		err = h.db.AddObjectsToFact(r.Context(), database.AddObjectsToFactParams{
			Column1: addingObjectIDs,
			FactID: fact.ID,
			OrgID: uuid.MustParse(orgID),
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(fact)
}

func (h *FactHandler) Delete(w http.ResponseWriter, r *http.Request) {
	factID := chi.URLParam(r, "id")

	err := h.db.DeleteFact(r.Context(), uuid.MustParse(factID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FactHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := claims.OrgID
	
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	search := r.URL.Query().Get("search")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	facts, err := h.db.ListFactsByOrgID(r.Context(), database.ListFactsByOrgIDParams{
		OrgID:  uuid.MustParse(orgID),
		Column2:   search,
		Limit:  int32(pageSize),
		Offset: int32((page - 1) * pageSize),
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := h.db.CountFactsByOrgID(r.Context(), database.CountFactsByOrgIDParams{
		OrgID: uuid.MustParse(orgID),
		Column2:  search,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	type FactType struct {
		ID             uuid.UUID    `json:"id"`
		Text           string       `json:"text"`
		HappenedAt     utils.NullTime `json:"happenedAt"`
		Location       string       `json:"location"`
		CreatorID      uuid.UUID    `json:"creatorId"`
		CreatorName    string       `json:"creatorName"`
		CreatedAt      time.Time    `json:"createdAt"`
		RelatedObjects interface{}  `json:"relatedObjects"`
	}
	returningFacts := make([]FactType, len(facts))
	for i, fact := range facts {
		returningFacts[i] = FactType{
			ID:             fact.ID,
			Text:           fact.Text,
			HappenedAt:     utils.NullTime{
				NullTime:  fact.HappenedAt,
			},
			Location:       fact.Location,
			CreatorID:      fact.CreatorID,
			CreatorName:    fact.CreatorName,
			CreatedAt:      fact.CreatedAt,
			RelatedObjects: fact.RelatedObjects,
		}
	}

	response := struct {
		Facts      []FactType `json:"facts"`
		TotalCount int64      `json:"totalCount"`
		Page       int        `json:"page"`
		PageSize   int        `json:"pageSize"`
	}{
		Facts:      returningFacts,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}