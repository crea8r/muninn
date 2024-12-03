package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/crea8r/muninn/server/internal/api"
	"github.com/crea8r/muninn/server/internal/config"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/service"
	"github.com/crea8r/muninn/server/internal/task"
	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
			log.Fatalf("Failed to ping database: %v", err)
	}

	// Initialize services
	queries := database.New(db)
	automationSvc := service.NewAutomationService(queries)
	taskRunner := task.NewRunner(queries, automationSvc)

	// Setup router
	router := api.SetupRouter(queries, db)
	server := &http.Server{
		Addr:    ":" + getPort(),
		Handler: router,
	}

	// Start task runner
	taskRunner.Start()

	// Setup graceful shutdown
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Start server in goroutine
	go func() {
		fmt.Printf("Server is running on port %s\n", getPort())
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
				log.Fatalf("HTTP server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	<-shutdown
	log.Println("Shutting down server...")

	// Give outstanding operations a deadline for completion
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Stop task runner
	taskRunner.Stop()

	// Shutdown HTTP server
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}

	log.Println("Server gracefully stopped")
}

func getPort() string {
	if port := os.Getenv("PORT"); port != "" {
			return port
	}
	return "8080"
}