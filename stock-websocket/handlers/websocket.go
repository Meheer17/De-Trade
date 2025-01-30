package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// HandleWebSocket handles WebSocket connections
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	// Read the CSV data once before starting to stream
	data, err := ReadCSV("stockdata.csv")
	if err != nil {
		log.Println("Error reading CSV:", err)
		return
	}

	// Stream data every second
	for _, stock := range data {
		// Send the stock data entry to the WebSocket client
		err = conn.WriteJSON(stock) // Send JSON-encoded stock data
		if err != nil {
			log.Println("WebSocket write error:", err)
			return
		}

		// Wait for 1 second before sending the next stock entry
		time.Sleep(1 * time.Second)
	}
}

