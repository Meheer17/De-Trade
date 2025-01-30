package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"trading-platform-backend/internal/models"
	"trading-platform-backend/internal/repositories"
	"trading-platform-backend/internal/services"

	"github.com/google/uuid"
)

type AuthHandler struct {
	UserRepo *repositories.UserRepository
}

// Register User
func (h *AuthHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if user with the same email already exists
	_, err := h.UserRepo.GetUserByEmail(req.Email)
	if err == nil {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Hash the password
	hashedPassword, err := services.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create new user object
	user := models.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: hashedPassword,
		CreatedAt:    time.Now().Format(time.RFC3339),
	}

	// Store user in database
	err = h.UserRepo.CreateUser(&user)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
}

// Login User
func (h *AuthHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Get user by email
	user, err := h.UserRepo.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "User Doesn't Exist", http.StatusUnauthorized)
		return
	}

	// Check password
	if !services.CheckPassword(req.Password, user.PasswordHash) {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
