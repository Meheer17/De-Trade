package models

type User struct {
	ID           string `json:"id"`
	Email        string `json:"email"`
	Username     string `json:"username"`
	PasswordHash string `json:"passwordHash"`
	CreatedAt    string `json:"createdAt"`
}