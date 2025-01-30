package handlers

import (
	"encoding/csv"
	"os"
	"strconv"
)

// StockData represents a single stock data entry
type StockData struct {
	Date       string  `json:"date"`
	Open       float64 `json:"open"`
	High       float64 `json:"high"`
	Low        float64 `json:"low"`
	Close      float64 `json:"close"`
	ShareTrade int     `json:"share_trade"`
	Turnover   float64 `json:"turnover"`
}

// ReadCSV reads the stock data from a CSV file
func ReadCSV(filename string) ([]StockData, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var stockData []StockData
	for _, record := range records[1:] { // Skip the header row
		open, _ := strconv.ParseFloat(record[1], 64)
		high, _ := strconv.ParseFloat(record[2], 64)
		low, _ := strconv.ParseFloat(record[3], 64)
		close, _ := strconv.ParseFloat(record[4], 64)
		shareTrade, _ := strconv.Atoi(record[5])
		turnover, _ := strconv.ParseFloat(record[6], 64)

		stockData = append(stockData, StockData{
			Date:       record[0],
			Open:       open,
			High:       high,
			Low:        low,
			Close:      close,
			ShareTrade: shareTrade,
			Turnover:   turnover,
		})
	}

	return stockData, nil
}

