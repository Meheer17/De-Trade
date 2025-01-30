package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go/aws"
)

func GenerateVerificationToken() (string, error) {
	token := make([]byte, 16)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(token), nil
}

func StoreVerificationToken(db *dynamodb.Client, userID string, token string) error {
	_, err := db.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("EmailVerifications"),
		Item: map[string]types.AttributeValue{
			"user_id": &types.AttributeValueMemberS{Value: userID},
			"token":   &types.AttributeValueMemberS{Value: token},
			"expires": &types.AttributeValueMemberS{Value: time.Now().Add(24 * time.Hour).Format(time.RFC3339)},
		},
	})
	return err
}

func VerifyToken(db *dynamodb.Client, token string) (string, error) {
	result, err := db.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("EmailVerifications"),
		Key: map[string]types.AttributeValue{
			"token": &types.AttributeValueMemberS{Value: token},
		},
	})
	if err != nil || result.Item == nil {
		return "", errors.New("invalid or expired token")
	}

	// Check if the token has expired
	expiryTime, err := time.Parse(time.RFC3339, result.Item["expires"].(*types.AttributeValueMemberS).Value)
	if err != nil || time.Now().After(expiryTime) {
		return "", errors.New("token expired")
	}

	return result.Item["user_id"].(*types.AttributeValueMemberS).Value, nil
}
