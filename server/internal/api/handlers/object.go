package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"fmt"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ObjectHandler struct {
	ObjectModel *models.ObjectModel
	DB *database.Queries
}

func NewObjectHandler(objectModel *models.ObjectModel, db *database.Queries) *ObjectHandler {
	return &ObjectHandler{ObjectModel: objectModel, DB: db}
}

func (h *ObjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IDString    string `json:"idString"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	object, err := h.ObjectModel.Create(r.Context(), input.Name, input.Description, input.IDString, creator.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)
}

func (h *ObjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IDString    string `json:"idString"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	object, err := h.ObjectModel.Update(r.Context(), id, input.Name, input.Description, input.IDString)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)
}

func (h *ObjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	err = h.ObjectModel.Delete(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := int32((page - 1) * pageSize)
	limit := int32(pageSize)
	
	objects, totalCount, err := h.ObjectModel.List(r.Context(), creator.OrgID, search, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := struct {
		Objects    []models.Object `json:"objects"`
		TotalCount int64           `json:"totalCount"`
		Page       int             `json:"page"`
		PageSize   int             `json:"pageSize"`
	}{
		Objects:    objects,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ObjectHandler) GetDetails(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	objectDetails, err := h.ObjectModel.GetDetails(r.Context(), id, creator.OrgID)
	if err != nil {
		http.Error(w, "Object not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(objectDetails)
}

func (h *ObjectHandler) AddTag(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		TagID uuid.UUID `json:"tagId"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	err = h.ObjectModel.AddTag(r.Context(), objectID, input.TagID, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) RemoveTag(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	tagID, err := uuid.Parse(chi.URLParam(r, "tagId"))
	if err != nil {
		http.Error(w, "Invalid tag ID", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	err = h.ObjectModel.RemoveTag(r.Context(), objectID, tagID, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) AddObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	d,_ := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		TypeID uuid.UUID          `json:"typeId"`
		Values json.RawMessage    `json:"values"`
	}

	err = json.Unmarshal(d, &input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}
	
	typeValue, err := h.ObjectModel.AddObjectTypeValue(r.Context(), objectID, input.TypeID, input.Values, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(typeValue)
}

func (h *ObjectHandler) RemoveObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	typeValueID, err := uuid.Parse(chi.URLParam(r, "typeValueId"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	err = h.ObjectModel.RemoveObjectTypeValue(r.Context(), typeValueID, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) UpdateObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	_, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	typeValueID, err := uuid.Parse(chi.URLParam(r, "typeValueId"))
	if err != nil {
		http.Error(w, "Invalid type value ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Values json.RawMessage `json:"type_values"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	OrgID := uuid.MustParse(claims.OrgID)

	updatedTypeValue, err := h.ObjectModel.UpdateObjectTypeValue(r.Context(), typeValueID, OrgID, input.Values)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTypeValue)
}

type ObjectWithTagsAndTypeValues struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Tags        json.RawMessage `json:"tags"`
	TypeValues json.RawMessage `json:"typeValues"`
}

type AdvancedFilterParams struct {
	TypeValues map[string]interface{} `json:"typeValues"`
	Tags       []uuid.UUID            `json:"tags"`
	Search     string                 `json:"search"`
	SortOrder  string                 `json:"sortOrder"`
}

func (h *ObjectHandler) ListObjectsByTypeWithAdvancedFilter(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	typeID, err := uuid.Parse(chi.URLParam(r, "typeID"))
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// Parse advanced filter params
	var filterParams AdvancedFilterParams
	err = json.NewDecoder(r.Body).Decode(&filterParams)
	if err != nil {
		http.Error(w, "Invalid filter parameters", http.StatusBadRequest)
		return
	}

	// Get the organization ID from the context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)
	
	// Prepare type values filter
	typeValuesFilter, err := json.Marshal(filterParams.TypeValues)
	if err != nil {
		http.Error(w, "Invalid type values filter", http.StatusBadRequest)
		return
	}

	// Fetch objects
	objects, err := h.DB.ListObjectsByTypeWithAdvancedFilter(ctx, database.ListObjectsByTypeWithAdvancedFilterParams{
		TypeID:     typeID,
		OrgID:      orgID,
		Column3: typeValuesFilter,
		Column4:       filterParams.Tags,
		Column5:     filterParams.Search,
		Column6:  filterParams.SortOrder,
		Limit:      int32(pageSize),
		Offset:     int32((page - 1) * pageSize),
	})
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to fetch objects", http.StatusInternalServerError)
		return
	}
	// Count total objects
	totalCount, err := h.DB.CountObjectsByTypeWithAdvancedFilter(ctx, database.CountObjectsByTypeWithAdvancedFilterParams{
		TypeID:     typeID,
		OrgID:      orgID,
		Column3: typeValuesFilter,
		Column4:       filterParams.Tags,
		Column5:     filterParams.Search,
	})
	if err != nil {
		http.Error(w, "Failed to count objects", http.StatusInternalServerError)
		return
	}

	// convert database.ListObjectsByTypeWithAdvancedFilterRow to ObjectWithTagsAndTypeValues
	var objectsWithTagsAndTypeValues []ObjectWithTagsAndTypeValues
	for _, object := range objects {
		objTagsBytes := object.Tags.([]byte)
		objectTags := json.RawMessage(objTagsBytes)
		
		objectWithTagsAndTypeValues := ObjectWithTagsAndTypeValues{
			ID:          object.ID,
			Name:        object.Name,
			Description: object.Description,
			Tags:        objectTags,
			TypeValues: object.TypeValues,
		}
		objectsWithTagsAndTypeValues = append(objectsWithTagsAndTypeValues, objectWithTagsAndTypeValues)
	}

	// get the object type
	objectType, err := h.DB.GetObjectTypeByID(ctx, typeID)
	if err != nil {
		http.Error(w, "Failed to get object type", http.StatusInternalServerError)
		return
	}


	// Prepare response
	response := struct {
		Objects    []ObjectWithTagsAndTypeValues `json:"objects"`
		TotalCount int64                                             `json:"totalCount"`
		Page       int                                               `json:"page"`
		PageSize   int                                               `json:"pageSize"`
		ObjectType database.ObjType `json:"objectType"`
	}{
		Objects:    objectsWithTagsAndTypeValues,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		ObjectType: objectType,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}