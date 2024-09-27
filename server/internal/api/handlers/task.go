package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/utils"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type TaskHandler struct {
	db *database.Queries
}

type BasicObject struct {
	ID uuid.UUID `json:"id"`
	Name string `json:"name"`
	Description string `json:"description"`
}

type ResponseTask struct {
	ID          uuid.UUID     `json:"id"`
	Content     string        `json:"content"`
	Deadline    utils.NullTime  `json:"deadline"`
	RemindAt    utils.NullTime  `json:"remindAt"`
	Status      string        `json:"status"`
	CreatorID   uuid.UUID     `json:"creatorId"`
	AssignedID  utils.NullUUID `json:"assignedId"`
	ParentID    utils.NullUUID `json:"parentId"`
	CreatedAt   time.Time     `json:"createdAt"`
	LastUpdated time.Time     `json:"lastUpdated"`
	DeletedAt   utils.NullTime  `json:"deletedAt"`
	CreatorName string        `json:"creatorName"`
	AssignedName string       `json:"assignedName"`
	Objects []BasicObject	 `json:"objects"`
}

func ConvertTask(task database.Task) ResponseTask {
	responseTask := ResponseTask{
		ID:          task.ID,
		Content:     task.Content,
		Deadline:    utils.NullTime{NullTime: task.Deadline},
		RemindAt:    utils.NullTime{NullTime: task.RemindAt},
		Status:      task.Status,
		CreatorID:   task.CreatorID,
		AssignedID:  utils.NullUUID{NullUUID: task.AssignedID},
		ParentID:    utils.NullUUID{NullUUID: task.ParentID},
		CreatedAt:   task.CreatedAt,
		DeletedAt:	 utils.NullTime{NullTime: task.DeletedAt},
	}
	return responseTask
}

func ConvertListRowTask(task database.ListTasksByOrgIDRow) ResponseTask {
	responseTask := ResponseTask{
		ID:          task.ID,
		Content:     task.Content,
		Deadline:    utils.NullTime{NullTime: task.Deadline},
		RemindAt:    utils.NullTime{NullTime: task.RemindAt},
		Status:      task.Status,
		CreatorID:   task.CreatorID,
		AssignedID:  utils.NullUUID{NullUUID: task.AssignedID},
		ParentID:    utils.NullUUID{NullUUID: task.ParentID},
		CreatedAt:   task.CreatedAt,
	}
	return responseTask
}

func ConvertIDRowTask(task database.GetTaskByIDRow) ResponseTask {
	assignedName := ""
	if task.AssignedID.Valid {
		assignedName = task.AssignedName.String
	}
	responseTask := ResponseTask{
		ID:          task.ID,
		Content:     task.Content,
		Deadline:    utils.NullTime{NullTime: task.Deadline},
		RemindAt:    utils.NullTime{NullTime: task.RemindAt},
		Status:      task.Status,
		CreatorID:   task.CreatorID,
		AssignedID:  utils.NullUUID{NullUUID: task.AssignedID},
		ParentID:    utils.NullUUID{NullUUID: task.ParentID},
		CreatedAt:   task.CreatedAt,
		LastUpdated: task.LastUpdated,
		DeletedAt:	 utils.NullTime{NullTime: task.DeletedAt},
		CreatorName: task.CreatorName,
		AssignedName: assignedName,
	}
	return responseTask
}

func ConvertFilterRowTask(task database.ListTasksWithFilterRow) ResponseTask {
	assignedName := ""
	if task.AssignedID.Valid {
		assignedName = task.AssignedName.String
	}
	var objects []BasicObject;
	objBytes, ok := task.Objects.([]byte);
	if !ok {
		fmt.Println("Cannot convert objects to bytes: ");
	}
	err := json.Unmarshal(objBytes, &objects);
	if err != nil {
		fmt.Println("Cannot marshal objects: ", err);
	}

	responseTask := ResponseTask{
		ID:          task.ID,
		Content:     task.Content,
		Deadline:    utils.NullTime{NullTime: task.Deadline},
		RemindAt:    utils.NullTime{NullTime: task.RemindAt},
		Status:      task.Status,
		CreatorID:   task.CreatorID,
		AssignedID:  utils.NullUUID{NullUUID: task.AssignedID},
		ParentID:    utils.NullUUID{NullUUID: task.ParentID},
		CreatedAt:   task.CreatedAt,
		LastUpdated: task.LastUpdated,
		CreatorName: task.CreatorName,
		AssignedName: assignedName,
		Objects: objects,
	}
	return responseTask
}


func ConvertObjectIDRowTask(task database.ListTasksByObjectIDRow) ResponseTask {
	// LastUpdated  time.Time      `json:"last_updated"`
	// Objects      interface{}    `json:"objects"`
	assignedName := ""
	if task.AssignedID.Valid {
		assignedName = task.AssignedName.String
	}
	var objects []BasicObject;
	objBytes, ok := task.Objects.([]byte);
	if !ok {
		fmt.Println("Cannot convert objects to bytes: ");
	}
	err := json.Unmarshal(objBytes, &objects);
	if err != nil {
		fmt.Println("Cannot marshal objects: ", err);
	}
	responseTask := ResponseTask{
		ID:          task.ID,
		Content:     task.Content,
		Deadline:    utils.NullTime{NullTime: task.Deadline},
		RemindAt:    utils.NullTime{NullTime: task.RemindAt},
		Status:      task.Status,
		CreatorID:   task.CreatorID,
		CreatorName: task.CreatorName,
		AssignedID:  utils.NullUUID{NullUUID: task.AssignedID},
		AssignedName: assignedName,
		ParentID: 	utils.NullUUID{NullUUID: task.ParentID},
		CreatedAt:  task.CreatedAt,
		LastUpdated: task.LastUpdated,
		Objects: objects,
	}
	return responseTask
}

func NewTaskHandler(db *database.Queries) *TaskHandler {
	return &TaskHandler{db: db}
}

type createTaskRequest struct {
	Content   string    `json:"content"`
	Deadline  utils.NullTime `json:"deadline"`
	RemindAt  utils.NullTime `json:"remindAt"`
	Status    string    `json:"status"`
	AssignedID utils.NullUUID `json:"assignedId"`
	ParentID  utils.NullUUID `json:"parentId"`
	ObjectIDs []uuid.UUID `json:"objectIds"`
}

// TODO: this will fail
type updateTaskRequest struct {
	Content   string    `json:"content"`
	Deadline  time.Time `json:"deadline"`
	RemindAt  time.Time `json:"remindAt"`
	Status    string    `json:"status"`
	AssignedID uuid.UUID `json:"assignedId"`
	ParentID  uuid.UUID `json:"parentId"`
	ToAddObjectIDs []uuid.UUID `json:"toAddObjectIds"`
	ToRemoveObjectIDs []uuid.UUID `json:"toRemoveObjectIds"`
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req createTaskRequest
	fmt.Println("Request: ", req);
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("Error: ", err);
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	OrgID := uuid.MustParse(claims.OrgID)
	CreatorID := uuid.MustParse(claims.CreatorID)
	
	// Check if assigned_id is in the same organization
	if req.AssignedID.Valid {
		assigned, err := h.db.GetCreatorByID(r.Context(), req.AssignedID.UUID)
		if err != nil || assigned.OrgID != OrgID {
			http.Error(w, "Invalid assigned_id", http.StatusBadRequest)
			return
		}
	}
	fmt.Println("Deadline: ", req.Deadline);
	task, err := h.db.CreateTask(r.Context(), database.CreateTaskParams{
		Content:    req.Content,
		Deadline:   sql.NullTime{Time: req.Deadline.Time, Valid: req.Deadline.Valid},
		RemindAt:   sql.NullTime{Time: req.RemindAt.Time, Valid: req.RemindAt.Valid},
		Status:     req.Status,
		CreatorID:  CreatorID,
		AssignedID: uuid.NullUUID{UUID: req.AssignedID.UUID, Valid: req.AssignedID.Valid},
		ParentID:   uuid.NullUUID{UUID: req.ParentID.UUID, Valid: req.ParentID.Valid},
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Associate objects with the task
	if len(req.ObjectIDs) > 0 {
		err = h.db.AddObjectsToTask(r.Context(), database.AddObjectsToTaskParams{
			Column1: req.ObjectIDs,
			TaskID: task.ID,
			OrgID: OrgID,
		})
		if err != nil {
			http.Error(w, "Error associating objects with task", http.StatusInternalServerError)
			return
		}
	}
	taskResponse := ConvertTask(task)

	json.NewEncoder(w).Encode(taskResponse)
}

func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	taskID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	var req updateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	OrgID := uuid.MustParse(claims.OrgID)

	// Check if assigned_id is in the same organization
	if req.AssignedID != uuid.Nil {
		assigned, err := h.db.GetCreatorByID(r.Context(), req.AssignedID)
		if err != nil || assigned.OrgID != OrgID {
			http.Error(w, "Invalid assigned_id", http.StatusBadRequest)
			return
		}
	}

	task, err := h.db.UpdateTask(r.Context(), database.UpdateTaskParams{
		ID:         taskID,
		Content:    req.Content,
		Deadline:   sql.NullTime{Time: req.Deadline, Valid: !req.Deadline.IsZero()},
		RemindAt:   sql.NullTime{Time: req.RemindAt, Valid: !req.RemindAt.IsZero()},
		Status:     req.Status,
		AssignedID: uuid.NullUUID{UUID: req.AssignedID, Valid: req.AssignedID != uuid.Nil},
		ParentID:   uuid.NullUUID{UUID: req.ParentID, Valid: req.ParentID != uuid.Nil},
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update associated objects
	if len(req.ToRemoveObjectIDs) > 0 {
		// Remove existing associations
		err = h.db.RemoveObjectsFromTask(r.Context(), database.RemoveObjectsFromTaskParams{
			TaskID: taskID,
			Column2: req.ToRemoveObjectIDs,
		})
		if err != nil {
			http.Error(w, "Error removing existing object associations", http.StatusInternalServerError)
			return
		}
	}
	if len(req.ToAddObjectIDs) > 0 {
		// Add new associations
		err = h.db.AddObjectsToTask(r.Context(), database.AddObjectsToTaskParams{
			Column1: req.ToAddObjectIDs,
			TaskID: taskID,
			OrgID: OrgID,
		})
		if err != nil {
			http.Error(w, "Error associating objects with task", http.StatusInternalServerError)
			return
		}
	}
	taskResponse := ConvertTask(task)
	json.NewEncoder(w).Encode(taskResponse)
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	taskID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(middleware.Claims)
	CreatorId := uuid.MustParse(claims.CreatorID)

	// Validate that the task belongs to the organization
	task, err := h.db.GetTaskByID(r.Context(), taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Task not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	if task.CreatorID != CreatorId {
		http.Error(w, "Only owner can delete the task", http.StatusForbidden)
		return
	}

	err = h.db.DeleteTask(r.Context(), taskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

/**
* Not a common route
* Only admin use this function to see all organization tasks
*/
func (h *TaskHandler) ListAllTasksInOrg(w http.ResponseWriter, r *http.Request) {
	orgID := r.Context().Value("orgID").(uuid.UUID)

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	search := r.URL.Query().Get("search")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	tasks, err := h.db.ListTasksByOrgID(r.Context(), database.ListTasksByOrgIDParams{
		OrgID:    orgID,
		Column2:   search,
		Limit:    int32(pageSize),
		Offset:   int32((page - 1) * pageSize),
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := h.db.CountTasksByOrgID(r.Context(), database.CountTasksByOrgIDParams{
		OrgID:  orgID,
		Column2: search,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	responseTasks := make([]ResponseTask, len(tasks))
	for i, task := range tasks {
		responseTasks[i] = ConvertListRowTask(task)
	}
	response := struct {
		Tasks      []ResponseTask `json:"tasks"`
		TotalCount int64           `json:"totalCount"`
		Page       int             `json:"page"`
		PageSize   int             `json:"pageSize"`
	}{
		Tasks:      responseTasks,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *TaskHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	taskID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	task, err := h.db.GetTaskByID(r.Context(), taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Task not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Fetch associated objects
	objects, err := h.db.ListObjectsByTaskID(r.Context(), taskID)
	if err != nil {
		http.Error(w, "Error fetching associated objects", http.StatusInternalServerError)
		return
	}

	responseTask := ConvertIDRowTask(task)

	response := struct {
		Task    ResponseTask `json:"task"`
		Objects []database.ListObjectsByTaskIDRow `json:"objects"`
	}{
		Task:    responseTask,
		Objects: objects,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *TaskHandler) ListByObjectID(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "objectID"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	search := r.URL.Query().Get("search")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	tasks, err := h.db.ListTasksByObjectID(r.Context(), database.ListTasksByObjectIDParams{
		ID: objectID,
		Column2: search,
		Limit:   int32(pageSize),
		Offset:  int32((page - 1) * pageSize),
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := h.db.CountTasksByObjectID(r.Context(), database.CountTasksByObjectIDParams{
		ObjID: objectID,
		Column2: search,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responseTasks := make([]ResponseTask, len(tasks))
	for i, task := range tasks {
		responseTasks[i] = ConvertObjectIDRowTask(task)
	}

	response := struct {
		Tasks      []ResponseTask `json:"tasks"`
		TotalCount int64                             `json:"totalCount"`
		Page       int                               `json:"page"`
		PageSize   int                               `json:"pageSize"`
	}{
		Tasks:      responseTasks,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *TaskHandler) ListWithFilter(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	query := r.URL.Query().Get("query")
	status := r.URL.Query().Get("status")
	creatorId := r.URL.Query().Get("creatorId")
	assignedId := r.URL.Query().Get("assignedId")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var creatorUUID uuid.UUID
	if creatorId != "" {
		parsed, err := uuid.Parse(creatorId)
		if err != nil {
			http.Error(w, "Invalid creatorId", http.StatusBadRequest)
			return
		}
		creatorUUID = parsed
	}

	var assignedUUID uuid.UUID
	if assignedId != "" {
		parsed, err := uuid.Parse(assignedId)
		if err != nil {
			http.Error(w, "Invalid assignedId", http.StatusBadRequest)
			return
		}
		assignedUUID = parsed
	}
	tasks, err := h.db.ListTasksWithFilter(r.Context(), database.ListTasksWithFilterParams{
		Column1: creatorUUID,
		Column2: assignedUUID,
		Column3: query,
		Column4: status,
		Limit:   int32(pageSize),
		Offset:  int32((page - 1) * pageSize),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := h.db.CountTasksWithFilter(r.Context(), database.CountTasksWithFilterParams{
		Column1: creatorUUID,
		Column2: assignedUUID,
		Column3: query,
		Column4: status,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	reponseTasks := make([]ResponseTask, len(tasks))
	for i, task := range tasks {
		reponseTasks[i] = ConvertFilterRowTask(task)
	}

	response := struct {
		Tasks      []ResponseTask `json:"tasks"`
		TotalCount int64          `json:"totalCount"`
		Page       int            `json:"page"`
		PageSize   int            `json:"pageSize"`
	}{
		Tasks:      reponseTasks,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}