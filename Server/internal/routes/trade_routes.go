package routes

import (
	"trading-platform-backend/internal/handlers"
	"trading-platform-backend/internal/middleware"

	"github.com/gorilla/mux"
)

func SetupTradeRoutes(router *mux.Router, tradeHandler *handlers.TradeHandler) {
	tradeRouter := router.PathPrefix("/trade").Subrouter()
	tradeRouter.Use(middleware.AuthMiddleware) // Protect routes

	tradeRouter.HandleFunc("/buy", tradeHandler.BuyStock).Methods("POST")
	tradeRouter.HandleFunc("/sell", tradeHandler.SellStock).Methods("POST")
}