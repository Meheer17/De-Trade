package main

import (
	"log"
	"net/http"
//	"time"

	"stock-websocket/handlers"
)

func main() {
	// Handle WebSocket connections
	http.HandleFunc("/ws", handlers.HandleWebSocket)

	// Log server startup
	log.Println("WebSocket server started at ws://localhost:8080/ws")

	// Start the HTTP server
	log.Fatal(http.ListenAndServe(":8080", nil))
}

