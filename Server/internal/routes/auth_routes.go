package routes

import (
	"trading-platform-backend/internal/handlers"

	"github.com/gorilla/mux"
)

func SetupAuthRoutes(router *mux.Router, authHandler *handlers.AuthHandler) {
	router.HandleFunc("/auth/register", authHandler.RegisterUser).Methods("POST")
	router.HandleFunc("/auth/login", authHandler.LoginUser).Methods("POST")
}