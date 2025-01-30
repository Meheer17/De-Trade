package database

import (
	"context"
	"log"
	localConfig "trading-platform-backend/config"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func InitDynamoDB() *dynamodb.Client {
	// Load AWS Config
	awsConfig := localConfig.LoadAWSConfig()

	if awsConfig.AccessKey == "" || awsConfig.SecretKey == "" || awsConfig.Region == "" {
		log.Fatal("AWS credentials are missing. Set environment variables.")
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(awsConfig.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			awsConfig.AccessKey,
			awsConfig.SecretKey,
			"",
		)),
	)

	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db := dynamodb.NewFromConfig(cfg)
	log.Println("Connected to DynamoDB!")
	return db
}