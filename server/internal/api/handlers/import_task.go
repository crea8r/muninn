package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
)

type ImportTaskHandler struct {
	db *sql.DB
	queries *database.Queries
}

func NewImportTaskHandler(db *sql.DB) *ImportTaskHandler {
	return &ImportTaskHandler{
		db: db,
		queries: database.New(db),
	}
}

type ImportRequest struct {
	ObjTypeID string          `json:"obj_type_id"`
	FileName  string          `json:"file_name"`
	Rows      []ImportDataRow `json:"rows"`
	Tags 		  []string        `json:"tags"`
}

type ImportDataRow struct {
	IDString string            `json:"id_string"`
	Name		 string						 `json:"name"`
	Values   map[string]string `json:"values"`
	Fact 	   FactToCreate      `json:"fact"`
}

func (h *ImportTaskHandler) CreateImportTask(w http.ResponseWriter, r *http.Request) {
	var req ImportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
	}

	ctx := r.Context()
	params := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(params.OrgID)
	creatorID := uuid.MustParse(params.CreatorID)

	// Check if there's an ongoing import for this organization
	_, err := h.queries.GetOngoingImportTask(ctx, orgID)
	if err != nil && err != sql.ErrNoRows {
			http.Error(w, "Failed to check ongoing imports", http.StatusInternalServerError)
			return
	}
	
	// Create a new import task
	task, err := h.queries.CreateImportTask(ctx, database.CreateImportTaskParams{
		OrgID:     orgID,
		CreatorID: creatorID,
		ObjTypeID: uuid.MustParse(req.ObjTypeID),
		Status:    "pending",
		TotalRows: int32(len(req.Rows)),
		FileName:  req.FileName,
	})
	if err != nil {
		http.Error(w, "Failed to create import task", http.StatusInternalServerError)
		return
	}

	// Start asynchronous processing
	go h.processImportTask(task.ID, req, req.FileName, creatorID, orgID)

	// Return task ID to client
	json.NewEncoder(w).Encode(map[string]string{"task_id": task.ID.String()})
}

func (h *ImportTaskHandler) processImportTask(taskID uuid.UUID, req ImportRequest, fileName string, creatorId uuid.UUID, orgId uuid.UUID) {
	ctx := context.Background()
	
	// Update task status to processing
	_, err := h.queries.UpdateImportTaskStatus(ctx, database.UpdateImportTaskStatusParams{
		ID:     taskID,
		Status: "processing",
	})
	if err != nil {
		h.logImportError(ctx, taskID, "Failed to update task status", err)
		return
	}

	// Process the import in batches
	batchSize := 50
	totalRows := len(req.Rows)
	for i := 0; i < totalRows; i += batchSize {
		end := i + batchSize
		if end > totalRows {
			end = totalRows
		}
		batch := req.Rows[i:end]
		err := h.processBatch(ctx, taskID, req.ObjTypeID, batch, fileName, creatorId, orgId, req.Tags)
		if err != nil {
			h.logImportError(ctx, taskID, "Failed to process batch", err)
			return
		}

		// Update progress
		progress := (i + len(batch)) * 100 / totalRows
		_, err = h.queries.UpdateImportTaskProgress(ctx, database.UpdateImportTaskProgressParams{
			ID:             taskID,
			Progress:       sql.NullInt32{Int32: int32(progress), Valid: true},
			ProcessedRows:  sql.NullInt32{Int32: int32(i + len(batch)), Valid: true},
		})
		if err != nil {
			h.logImportError(ctx, taskID, "Failed to update progress", err)
			return
		}
	}

	// Update task status to completed
	summary := map[string]interface{}{
		"total_rows": totalRows,
		"imported_rows": totalRows,
	}
	summaryJSON, _ := json.Marshal(summary)
	_, err = h.queries.CompleteImportTask(ctx, database.CompleteImportTaskParams{
		ID:             taskID,
		Status:         "completed",
		ResultSummary:  pqtype.NullRawMessage{RawMessage: summaryJSON,},
	})
	if err != nil {
		h.logImportError(ctx, taskID, "Failed to complete import task", err)
		return
	}
}

func (h *ImportTaskHandler) processBatch(ctx context.Context, taskID uuid.UUID, objTypeID string, batch []ImportDataRow, 
	fileName string, creatorId uuid.UUID, OrgId uuid.UUID, tagIds []string) error {
    // Start a transaction
	tx, err := h.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create a new Queries instance that uses this transaction
	qtx := h.queries.WithTx(tx)

	// Process each row in the batch
	for _, row := range batch {
		// Check if object exists
		obj, err := qtx.GetObjectByIDString(ctx, row.IDString)
		if err != nil && err != sql.ErrNoRows {
			return fmt.Errorf("failed to check existing object: %w", err)
		}

		if err == sql.ErrNoRows {
			// Create new object
			obj, err = qtx.CreateObject(ctx, database.CreateObjectParams{
				Name: 	row.Name,
				IDString:    row.IDString,
				Description: fmt.Sprintf("Imported from %s", fileName),
				CreatorID:  creatorId,
			})
			if err != nil {
				return fmt.Errorf("failed to create object: %w", err)
			}
		}

		// Fetch existing object type value
		existingOTV, err := qtx.GetObjectTypeValue(ctx, database.GetObjectTypeValueParams{
			ObjID: obj.ID,
			TypeID: uuid.MustParse(objTypeID),
		})
		
		var existingValues map[string]interface{}
		if err == nil {
			// If existing value found, unmarshal it
			err = json.Unmarshal(existingOTV.TypeValues, &existingValues)
			if err != nil {
				return fmt.Errorf("failed to unmarshal existing type values: %w", err)
			}
		} else if err != sql.ErrNoRows {
			return fmt.Errorf("failed to fetch existing object type value: %w", err)
		}

		// If existingValues is nil, initialize it
		if existingValues == nil {
			existingValues = make(map[string]interface{})
		}

		// Merge new values with existing values
		for k, v := range row.Values {
			existingValues[k] = v
		}

		// Marshal merged values back to JSON
		mergedValuesJSON, err := json.Marshal(existingValues)
		if err != nil {
			return fmt.Errorf("failed to marshal merged values: %w", err)
		}

		// Create or update obj_type_value
		_, err = qtx.UpsertObjectTypeValue(ctx, database.UpsertObjectTypeValueParams{
			ObjID:    obj.ID,
			TypeID:   uuid.MustParse(objTypeID),
			TypeValues: mergedValuesJSON,
		})
		if err != nil {
			return fmt.Errorf("failed to upsert object type value: %w", err)
		}
		fact := row.Fact
		newFact, err := qtx.CreateFact(ctx, database.CreateFactParams{
			Text:       fact.Text,
			HappenedAt: sql.NullTime{
				Time:  fact.HappenedAt.Time,
				Valid: fact.HappenedAt.Valid,
			},
			Location:   fact.Location,
			CreatorID:  creatorId,
		})
		if err != nil {
			return fmt.Errorf("failed to create fact: %w", err)
		}
		
		objectIds := make([]uuid.UUID, len(fact.ObjectIDs) + 1)
		// loop through fact.ObjectIDs and convert them to uuid.UUID
		for i, id := range fact.ObjectIDs {
			objectIds[i] = uuid.MustParse(id)
		}
		objectIds[len(fact.ObjectIDs)] = obj.ID
		
		err = qtx.AddObjectsToFact(ctx, database.AddObjectsToFactParams{
			Column1: objectIds,
			FactID: newFact.ID,
			OrgID: OrgId,
		})

		for _, id := range tagIds {
			tagUUID := uuid.MustParse(id)
			qtx.AddTagToObject(ctx, database.AddTagToObjectParams{
				ObjID: obj.ID,
				TagID: tagUUID,
				OrgID: OrgId,
			})
		}
		
		if err != nil {
			return fmt.Errorf("failed to add objects to fact: %w", err)
		}
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (h *ImportTaskHandler) logImportError(ctx context.Context, taskID uuid.UUID, message string, err error) {
	fullMessage := fmt.Sprintf("%s: %v", message, err)
	_, updateErr := h.queries.UpdateImportTaskError(ctx, database.UpdateImportTaskErrorParams{
		ID:           taskID,
		Status:       "failed",
		ErrorMessage: sql.NullString{String: fullMessage, Valid: true},
	})
	if updateErr != nil {
		// If we can't update the task, log the error
		fmt.Printf("Failed to update import task error: %v\n", updateErr)
	}
}

func (h *ImportTaskHandler) GetImportTaskStatus(w http.ResponseWriter, r *http.Request) {
    taskID := uuid.MustParse(r.URL.Query().Get("task_id"))
	ctx := r.Context()

	task, err := h.queries.GetImportTask(ctx, taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Import task not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to get import task status", http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         task.Status,
		"progress":       task.Progress.Int32,
		"total_rows":     task.TotalRows,
		"processed_rows": task.ProcessedRows.Int32,
		"error_message":  task.ErrorMessage.String,
		"result_summary": task.ResultSummary.RawMessage,
	})
}

func (h *ImportTaskHandler) GetImportHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(params.OrgID)

	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("page_size"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10 // Default page size
	}

	offset := (page - 1) * pageSize

	tasks, err := h.queries.GetImportTaskHistory(ctx, database.GetImportTaskHistoryParams{
		OrgID:  orgID,
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, "Failed to get import history", http.StatusInternalServerError)
		return
	}

	totalCount, err := h.queries.CountImportTasks(ctx, orgID)
	if err != nil {
		http.Error(w, "Failed to get total count", http.StatusInternalServerError)
		return
	}

	type ReturingImportTask struct {
		ID            uuid.UUID             `json:"id"`
		OrgID         uuid.UUID             `json:"org_id"`
		CreatorID     uuid.UUID             `json:"creator_id"`
		ObjTypeID     uuid.UUID             `json:"obj_type_id"`
		Status        string                `json:"status"`
		Progress      int         `json:"progress"`
		TotalRows     int32                 `json:"total_rows"`
		ProcessedRows int         `json:"processed_rows"`
		ErrorMessage  string        `json:"error_message"`
		ResultSummary json.RawMessage `json:"result_summary"`
		FileName      string                `json:"file_name"`
		CreatedAt     time.Time          `json:"created_at"`
		UpdatedAt     time.Time         `json:"updated_at"`
	}
	returingTasks := make([]ReturingImportTask, len(tasks))
	// loop throught tasks and convert all the null time, null string, null int32 to normal type
	for i, task := range tasks {
		returingTasks[i].ID = task.ID
		returingTasks[i].OrgID = task.OrgID
		returingTasks[i].CreatorID = task.CreatorID
		returingTasks[i].ObjTypeID = task.ObjTypeID
		returingTasks[i].Status = task.Status
		returingTasks[i].TotalRows = task.TotalRows
		returingTasks[i].FileName = task.FileName
		if task.CreatedAt.Valid {
			returingTasks[i].CreatedAt = task.CreatedAt.Time
		}
		if task.UpdatedAt.Valid {	
			returingTasks[i].UpdatedAt = task.UpdatedAt.Time
		}
		if task.Progress.Valid {
			returingTasks[i].Progress = int(task.Progress.Int32)
		}
		if task.ProcessedRows.Valid {
			returingTasks[i].ProcessedRows = int(task.ProcessedRows.Int32)
		}
		if task.ErrorMessage.Valid {
			returingTasks[i].ErrorMessage = task.ErrorMessage.String
		}
	}

	response := struct {
		Tasks      []ReturingImportTask `json:"tasks"`
		TotalCount int64                 `json:"total_count"`
		Page       int                   `json:"page"`
		PageSize   int                   `json:"page_size"`
	}{
		Tasks:      returingTasks,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}