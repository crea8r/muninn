package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ListHandler struct {
	db *database.Queries
}

func NewListHandler(db *database.Queries) *ListHandler {
	return &ListHandler{db: db}
}

func (h *ListHandler) CreateList(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	var input struct {
		Name          string          `json:"name"`
		Description   string          `json:"description"`
		FilterSetting json.RawMessage `json:"filterSetting"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	list, err := h.db.CreateList(r.Context(), database.CreateListParams{
		Name:          input.Name,
		Description:   input.Description,
		FilterSetting: input.FilterSetting,
		CreatorID: 	 uuid.MustParse(claims.CreatorID),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a creator_list with empty params
	creatorList, err := h.db.CreateCreatorList(r.Context(), database.CreateCreatorListParams{
		ListID:    list.ID,
		CreatorID: uuid.MustParse(claims.CreatorID),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := struct {
		ListId uuid.UUID `json:"listId"`
		CreatorListId uuid.UUID `json:"creatoListId"`
		ListName string `json:"listName"`
		FilterSetting json.RawMessage `json:"filterSetting"`
	} {
		ListId: list.ID,
		CreatorListId: creatorList.ID,
		ListName : list.Name,
		FilterSetting: list.FilterSetting,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *ListHandler) UpdateList(w http.ResponseWriter, r *http.Request) {
	listID := chi.URLParam(r, "id")

	var input struct {
		Name          string          `json:"name"`
		Description   string          `json:"description"`
		FilterSetting json.RawMessage `json:"filterSetting"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	list, err := h.db.UpdateList(r.Context(), database.UpdateListParams{
		ID:            uuid.MustParse(listID),
		Name:          input.Name,
		Description:   input.Description,
		FilterSetting: input.FilterSetting,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(list)
}

func (h *ListHandler) DeleteList(w http.ResponseWriter, r *http.Request) {
	listID := chi.URLParam(r, "id")

	err := h.db.DeleteList(r.Context(), uuid.MustParse(listID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ListHandler) UpdateCreatorList(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input struct {
		Params json.RawMessage `json:"params"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	creatorList, err := h.db.UpdateCreatorList(r.Context(), database.UpdateCreatorListParams{
		ID: 	 uuid.MustParse(id),
		Params:    input.Params,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(creatorList)
}

func (h *ListHandler) DeleteCreatorList(w http.ResponseWriter, r *http.Request) {
	creatorListID := chi.URLParam(r, "id")

	err := h.db.DeleteCreatorList(r.Context(), uuid.MustParse(creatorListID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ListHandler) ListListsByOrgID(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := claims.OrgID
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	lists, err := h.db.ListListsByOrgID(r.Context(), database.ListListsByOrgIDParams{
		OrgID:  uuid.MustParse(orgID),
		Limit:  int32(pageSize),
		Offset: int32((page - 1) * pageSize),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := h.db.CountListsByOrgID(r.Context(), uuid.MustParse(orgID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Lists      []database.ListListsByOrgIDRow `json:"lists"`
		TotalCount int64           `json:"totalCount"`
		Page       int             `json:"page"`
		PageSize   int             `json:"pageSize"`
	}{
		Lists:      lists,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *ListHandler) ListCreatorListsByCreatorID(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creatorLists, err := h.db.ListCreatorListsByCreatorID(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(creatorLists)
}

func (h *ListHandler) GetCreateListByID(w http.ResponseWriter, r *http.Request) {
	listID := chi.URLParam(r, "id")

	list, err := h.db.GetCreatorListByID(r.Context(), uuid.MustParse(listID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(list)
}

func (h *ListHandler) CreateCreatorList(w http.ResponseWriter, r *http.Request){
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	ListId := chi.URLParam(r, "id")

	creatorList, err := h.db.CreateCreatorList(r.Context(), database.CreateCreatorListParams{
		ListID:    uuid.MustParse(ListId),
		CreatorID: uuid.MustParse(claims.CreatorID),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(creatorList)
}