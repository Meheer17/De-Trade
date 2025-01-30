package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"trading-platform-backend/internal/models"
	"trading-platform-backend/internal/repositories"

	"github.com/google/uuid"
)

type TransactionHandler struct {
	TransactionRepo *repositories.TransactionRepository
	TradeRepo       *repositories.TradeRepository
}

// CreateTransaction handles creating a new transaction
func (h *TransactionHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID") // Retrieved from AuthMiddleware

	var req struct {
		StockID  string  `json:"stock_id"`
		Quantity int     `json:"quantity"`
		Price    float64 `json:"price"`
		Type     string  `json:"type"` // "buy" or "sell"
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Create new transaction object
	transaction := models.Transaction{
		ID:        uuid.New().String(),
		UserID:    userID,
		StockID:   req.StockID,
		Quantity:  req.Quantity,
		Price:     req.Price,
		Type:      req.Type,
		Timestamp: time.Now(),
	}

	trade := models.Trade{
		ID:          uuid.New().String(),
		UserID:      userID,
		StockSymbol: req.StockID,
		Quantity:    req.Quantity,
		Price:       req.Price,
	}
	
	fmt.Println(transaction.ID, trade.ID)
	var wg sync.WaitGroup

	// Store transaction in database
	//
	wg.Add(2)

	go func() {
		defer wg.Done()
		// h.TransactionRepo.CreateTransaction(&transaction)
	}()

	go func() {
		defer wg.Done()
		// h.TradeRepo.CreateTrade(&trade, req.Type)
	}()

	wg.Wait()

	w.WriteHeader(http.StatusOK)
	defer json.NewEncoder(w).Encode(map[string]string{"message": "Transaction created successfully"})
}

// GetTransaction handles retrieving a transaction by ID
func (h *TransactionHandler) GetTransaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	transaction, err := h.TransactionRepo.GetTransactionsByUserID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(transaction)
}
