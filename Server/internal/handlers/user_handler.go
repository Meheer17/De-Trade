package handlers

import (
	"encoding/json"
	"net/http"

	"trading-platform-backend/internal/repositories"
)

type UserHandler struct {
	TradeRepo *repositories.TradeRepository
}

// GetUserStocks handles retrieving stocks owned by a user
func (h *UserHandler) GetUserStocks(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID") // Retrieved from AuthMiddleware

	stocks, err := h.TradeRepo.GetTradesByUserID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stocks)
}