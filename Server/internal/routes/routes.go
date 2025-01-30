package routes

import (
	"trading-platform-backend/internal/handlers"
	"trading-platform-backend/internal/middleware"

	"github.com/gorilla/mux"
)

// RegisterRoutes defines API endpoints and their handlers.
func RegisterRoutes(authHandler *handlers.AuthHandler, tradeHandler *handlers.TradeHandler, transactionHandler *handlers.TransactionHandler, userHandler *handlers.UserHandler) *mux.Router {
	router := mux.NewRouter()

	// Apply Middleware
	router.Use(middleware.LoggingMiddleware)

	// Auth routes
	SetupAuthRoutes(router, authHandler)
	
	// Trade routes
	SetupTradeRoutes(router, tradeHandler)

	// Transaction routes
	SetupTransactionRoutes(router, transactionHandler)

	// User routes
	SetupUserRoutes(router, userHandler)

	// Health check route
	router.HandleFunc("/", handlers.HealthCheckHandler).Methods("GET")

	return router
}