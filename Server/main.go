package main

import (
	"log"
	"net/http"
	"os"
	"trading-platform-backend/internal/database"
	"trading-platform-backend/internal/handlers"
	"trading-platform-backend/internal/logging"
	"trading-platform-backend/internal/repositories"
	"trading-platform-backend/internal/routes"
	"trading-platform-backend/internal/services"
)

func enableCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        // Handle preflight requests
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func main() {
	logging.InitLogger()

	// Initialize Database
	db := database.InitDynamoDB()

	// Initialize Tables
	// Uncomment the following line if you need to create tables
	// database.CreateTables(db)

	// Initialize Repositories
	userRepo := repositories.NewUserRepository(db)
	tradeRepo := repositories.NewTradeRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)

	// Initialize Aptos Service
	aptosService, err := services.NewAptosService()
	if err != nil {
		log.Fatalf("Failed to initialize Aptos service: %v", err)
	}

	// Initialize Handlers
	authHandler := &handlers.AuthHandler{UserRepo: userRepo}
	tradeHandler := &handlers.TradeHandler{TradeRepo: tradeRepo, AptosService: aptosService}
	transactionHandler := &handlers.TransactionHandler{TransactionRepo: transactionRepo, TradeRepo: tradeRepo}
	userHandler := &handlers.UserHandler{TradeRepo: tradeRepo}

	// Register Routes
	router := routes.RegisterRoutes(authHandler, tradeHandler, transactionHandler, userHandler)
 corsRouter := enableCORS(router)
	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsRouter))
}
