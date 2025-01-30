package repositories

import (
	"context"
	"errors"
	"fmt"
	"log"

	"trading-platform-backend/internal/database"
	"trading-platform-backend/internal/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type UserRepository struct {
	DB *dynamodb.Client
}

func NewUserRepository(db *dynamodb.Client) *UserRepository {
	return &UserRepository{DB: db}
}

func (repo *UserRepository) CreateUser(user *models.User) error {
	_, err := repo.DB.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(database.UsersDB),
		Item: map[string]types.AttributeValue{
			"id":           &types.AttributeValueMemberS{Value: user.ID},
			"email":        &types.AttributeValueMemberS{Value: user.Email},
			"username":     &types.AttributeValueMemberS{Value: user.Username},
			"passwordHash": &types.AttributeValueMemberS{Value: user.PasswordHash},
			"createdAt":    &types.AttributeValueMemberS{Value: user.CreatedAt},
		},
	})
	return err
}

func (repo *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(database.UsersDB),
		IndexName:              aws.String("EmailIndex"),
		KeyConditionExpression: aws.String("email = :email"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":email": &types.AttributeValueMemberS{Value: email},
		},
	}

	result, err := repo.DB.Query(context.TODO(), input)
	if err != nil || len(result.Items) == 0 {
		return nil, errors.New("user not found")
	}

	var user models.User
	err = attributevalue.UnmarshalMap(result.Items[0], &user)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}

	return &user, nil
}

// CreateUser inserts a new user into the DynamoDB table
// func (r *UserRepository) CreateUser(user *models.User) error {
// 	item, err := attributevalue.MarshalMap(user)
// 	if err != nil {
// 		return fmt.Errorf("failed to marshal user: %w", err)
// 	}

// 	input := &dynamodb.PutItemInput{
// 		TableName: aws.String("Users"),
// 		Item:      item,
// 	}

// 	_, err = r.DB.PutItem(context.TODO(), input)
// 	if err != nil {
// 		return fmt.Errorf("failed to put item: %w", err)
// 	}

// 	log.Println("User created successfully:", user.ID)
// 	return nil
// }

// GetUserByID retrieves a user from DynamoDB by ID
func (r *UserRepository) GetUserByID(userID string) (*models.User, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(database.UsersDB),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: userID},
		},
	}

	result, err := r.DB.GetItem(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if result.Item == nil {
		return nil, fmt.Errorf("user not found")
	}

	var user models.User
	err = attributevalue.UnmarshalMap(result.Item, &user)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}

	return &user, nil
}

// UpdateUser modifies an existing user record
func (r *UserRepository) UpdateUser(userID string, updatedFields map[string]interface{}) error {
	expression := "set"
	values := map[string]types.AttributeValue{}
	i := 0

	for key, value := range updatedFields {
		fmt.Println(key)
		placeholder := fmt.Sprintf("#attr%d", i)
		expression += fmt.Sprintf(" %s = :val%d,", placeholder, i)

		values[fmt.Sprintf(":val%d", i)] = &types.AttributeValueMemberS{Value: fmt.Sprintf("%v", value)}
		i++
	}

	expression = expression[:len(expression)-1] // Remove trailing comma

	input := &dynamodb.UpdateItemInput{
		TableName: aws.String(database.UsersDB),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: userID},
		},
		UpdateExpression:          aws.String(expression),
		ExpressionAttributeValues: values,
		ReturnValues:              types.ReturnValueUpdatedNew,
	}

	_, err := r.DB.UpdateItem(context.TODO(), input)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	log.Println("User updated successfully:", userID)
	return nil
}

// DeleteUser removes a user from DynamoDB
func (r *UserRepository) DeleteUser(userID string) error {
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(database.UsersDB),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: userID},
		},
	}

	_, err := r.DB.DeleteItem(context.TODO(), input)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	log.Println("User deleted successfully:", userID)
	return nil
}

// func (r *UserRepository) GetUserByEmail(userID string) (*models.User, error) {
// 	input := &dynamodb.GetItemInput{
// 		TableName: aws.String("Users"),
// 		Key: map[string]types.AttributeValue{
// 			"email": &types.AttributeValueMemberS{Value: userID},
// 		},
// 	}

// 	result, err := r.DB.GetItem(context.TODO(), input)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get user: %w", err)
// 	}

// 	if result.Item == nil {
// 		return nil, fmt.Errorf("user not found")
// 	}

// 	var user models.User
// 	err = attributevalue.UnmarshalMap(result.Item, &user)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
// 	}

// 	return &user, nil
// }