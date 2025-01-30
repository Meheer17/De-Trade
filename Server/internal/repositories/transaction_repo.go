package repositories

import (
	"context"
	"fmt"
	"log"
	"time"

	"trading-platform-backend/internal/database"
	"trading-platform-backend/internal/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// TransactionRepository handles database operations for transactions
type TransactionRepository struct {
	db *dynamodb.Client
}

// NewTransactionRepository initializes a new repository
func NewTransactionRepository(db *dynamodb.Client) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// CreateTransaction inserts a new transaction into the DynamoDB table
func (r *TransactionRepository) CreateTransaction(transaction *models.Transaction) error {
	transaction.Timestamp = time.Now()

	input := &dynamodb.PutItemInput{
		TableName: aws.String(database.TransactionDB),
		Item: map[string]types.AttributeValue{
			"id":        &types.AttributeValueMemberS{Value: transaction.ID},
			"userId":   &types.AttributeValueMemberS{Value: transaction.UserID},
			"stockId":  &types.AttributeValueMemberS{Value: transaction.StockID},
			"quantity":  &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", transaction.Quantity)},
			"price":     &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", transaction.Price)},
			"type":      &types.AttributeValueMemberS{Value: transaction.Type},
			"timestamp": &types.AttributeValueMemberS{Value: transaction.Timestamp.Format(time.RFC3339)},
		},
	}

	_, err := r.db.PutItem(context.TODO(), input)
	if err != nil {
		return fmt.Errorf("failed to put transaction: %w", err)
	}

	log.Println("Transaction recorded successfully:", transaction.ID)
	return nil
}

// GetTransactionByID retrieves a transaction by ID
func (r *TransactionRepository) GetTransactionByID(transactionID string) (*models.Transaction, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(database.TransactionDB),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: transactionID},
		},
	}

	result, err := r.db.GetItem(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}

	if result.Item == nil {
		return nil, fmt.Errorf("transaction not found")
	}

	var transaction models.Transaction
	err = attributevalue.UnmarshalMap(result.Item, &transaction)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal transaction: %w", err)
	}

	return &transaction, nil
}

func (r *TransactionRepository) GetTransactionsByUserID(userID string) ([]models.Transaction, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(database.TransactionDB),
		IndexName:              aws.String("UserIdIndex"),
		KeyConditionExpression: aws.String("userId = :uid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":uid": &types.AttributeValueMemberS{Value: userID},
		},
	}

	result, err := r.db.Query(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to query transactions: %w", err)
	}

	var transactions []models.Transaction
	err = attributevalue.UnmarshalListOfMaps(result.Items, &transactions)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal transactions: %w", err)
	}

	return transactions, nil
}
