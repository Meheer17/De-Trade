package config

import (
	"log"

	"github.com/joho/godotenv"
)

// AWSConfig holds the AWS credentials and region.
type AWSConfig struct {
	AccessKey string
	SecretKey string
	Region    string
}

// LoadAWSConfig initializes the AWS configuration from environment variables.
func LoadAWSConfig() *AWSConfig {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("AWS credentials are missing. Set environment variables.")
	}

	return &AWSConfig{
		AccessKey: "",                     //os.Getenv("AWS_ACCESS_KEY_ID"),
		SecretKey: "", //os.Getenv("AWS_SECRET_ACCESS_KEY"),
		Region:    "ap-south-1",                               //    os.Getenv("AWS_REGION"),
	}
}

func LoadJWT() string {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("JWT credentials are missing. Set environment variables.")
	}

	return "/9R93VTrayztsdf9Q=" //os.Getenv("JWT")
}
