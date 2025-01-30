package models

type Trade struct {
	ID          string    `json:"id"`
	UserID      string    `json:"userId"`
	StockSymbol string    `json:"stockSymbol"`
	Quantity    int       `json:"quantity"`
	Price       float64   `json:"price"`
}
