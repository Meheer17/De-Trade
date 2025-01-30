package models

import "time"

// Transaction represents a stock trade transaction
type Transaction struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	StockID   string    `json:"stockId"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
	Type      string    `json:"type"` // "buy" or "sell"
	Timestamp time.Time `json:"timestamp"`
}
