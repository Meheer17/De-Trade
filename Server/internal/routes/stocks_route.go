package routes

import (
	"trading-platform-backend/internal/handlers"
	"trading-platform-backend/internal/middleware"

	"github.com/gorilla/mux"
)

func SetupUserRoutes(router *mux.Router, userHandler *handlers.UserHandler) {
	userRouter := router.PathPrefix("/user").Subrouter()
	userRouter.Use(middleware.AuthMiddleware) // Protect routes

	userRouter.HandleFunc("/stocks", userHandler.GetUserStocks).Methods("GET")
}