package routes

import (
	"trading-platform-backend/internal/handlers"
	"trading-platform-backend/internal/middleware"

	"github.com/gorilla/mux"
)

func SetupTransactionRoutes(router *mux.Router, transactionHandler *handlers.TransactionHandler) {
	transactionRouter := router.PathPrefix("/transactions").Subrouter()
	transactionRouter.Use(middleware.AuthMiddleware) // Protect routes

	transactionRouter.HandleFunc("/create", transactionHandler.CreateTransaction).Methods("POST")
	transactionRouter.HandleFunc("/get", transactionHandler.GetTransaction).Methods("GET")
}