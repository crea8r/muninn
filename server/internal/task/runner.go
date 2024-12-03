// task/runner.go
package task

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/service"
)

const automationInterval = 10 * time.Minute

// Runner handles periodic task execution
type Runner struct {
    db              *database.Queries
    automationSvc   *service.AutomationService
    wg              sync.WaitGroup
    shutdown        chan struct{}
    log             *log.Logger
}

// NewRunner creates a new task runner
func NewRunner(db *database.Queries, automationSvc *service.AutomationService) *Runner {
    return &Runner{
        db:            db,
        automationSvc: automationSvc,
        shutdown:      make(chan struct{}),
        log:          log.New(log.Writer(), "[TaskRunner] ", log.LstdFlags),
    }
}

// Start begins the periodic execution of tasks
func (r *Runner) Start() {
    r.wg.Add(1)
    go r.runAutomationLoop()
}

// Stop gracefully shuts down the task runner
func (r *Runner) Stop() {
    close(r.shutdown)
    r.wg.Wait()
}

func (r *Runner) runAutomationLoop() {
    defer r.wg.Done()

    ticker := time.NewTicker(automationInterval)
    defer ticker.Stop()

    // Run immediately on start
    r.executeAutomatedActions()

    for {
        select {
        case <-ticker.C:
            r.executeAutomatedActions()
        case <-r.shutdown:
            r.log.Println("Shutting down automation runner")
            return
        }
    }
}

func (r *Runner) executeAutomatedActions() {
	// Create context with timeout for the entire batch
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Get pending automated actions
	
	actions, err := r.db.GetPendingActions(ctx)
	if err != nil {
		r.log.Printf("Error fetching automated actions: %v", err)
		return
	}

	// Use semaphore to limit concurrent executions
	sem := make(chan struct{}, 5) // Process max 5 actions concurrently
	var wg sync.WaitGroup

	for _, action := range actions {
		// Check for shutdown signal
		select {
		case <-r.shutdown:
			return
		default:
		}

		wg.Add(1)
		sem <- struct{}{} // Acquire semaphore

		go func(action database.AutomatedAction) {
			defer wg.Done()
			defer func() { <-sem }() // Release semaphore

			// Create action-specific context
			actionCtx, actionCancel := context.WithTimeout(ctx, 2*time.Minute)
			defer actionCancel()

			// Execute the action
			var filterConfig service.FilterConfig
			var actionConfig service.ActionConfig
			if err := json.Unmarshal(action.FilterConfig, &filterConfig); err != nil {
				r.log.Printf("Error unmarshalling filter config for action %s: %v", action.ID, err)
				return
			}
			if err := json.Unmarshal(action.ActionConfig, &actionConfig); err != nil {
				r.log.Printf("Error unmarshalling action config for action %s: %v", action.ID, err)
				return
			}

			if err := r.automationSvc.ExecuteAction(actionCtx, action, filterConfig, actionConfig); err != nil {
				r.log.Printf("Error executing action %s: %v", action.ID, err)
			}
		}(action)
	}

	wg.Wait()
}