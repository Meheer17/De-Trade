package repositories

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"
	"trading-platform-backend/internal/database"
	"trading-platform-backend/internal/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type TradeRepository struct {
	db *dynamodb.Client
}

func NewTradeRepository(db *dynamodb.Client) *TradeRepository {
	return &TradeRepository{db: db}
}

func (r *TradeRepository) CreateTrade(trade *models.Trade, action string) error {
    if trade == nil || trade.StockSymbol == "" {
        return fmt.Errorf("invalid trade: trade or stock symbol is nil")
    }

    // Validate action
    action = strings.ToUpper(action)
    if action != "BUY" && action != "SELL" {
        return fmt.Errorf("invalid action: must be BUY or SELL")
    }

    // Check if trade already exists based on stockSymbol
    existingTrade, err := r.GetTradeByStockSymbol(trade.StockSymbol)
    if err != nil && err.Error() != "trade not found" {
        return fmt.Errorf("failed to check existing trade: %w", err)
    }

    if existingTrade != nil {
        // Handle BUY action
        if action == "BUY" {
            // Calculate new average price and total quantity
            totalQuantity := existingTrade.Quantity + trade.Quantity
            totalValue := (existingTrade.Price * float64(existingTrade.Quantity)) +
                         (trade.Price * float64(trade.Quantity))
            averagePrice := totalValue / float64(totalQuantity)

            trade.Quantity = totalQuantity
            trade.Price = averagePrice
        } else { // Handle SELL action
            // Check if there are enough stocks to sell
            if trade.Quantity > existingTrade.Quantity {
                return fmt.Errorf("insufficient quantity: trying to sell %d but only have %d",
                    trade.Quantity, existingTrade.Quantity)
            }

            // Calculate remaining quantity
            remainingQuantity := existingTrade.Quantity - trade.Quantity

            // If no stocks remain, delete the trade
            if remainingQuantity == 0 {
                deleteInput := &dynamodb.DeleteItemInput{
                    TableName: aws.String(database.TradeDB),
                    Key: map[string]types.AttributeValue{
                        "id": &types.AttributeValueMemberS{Value: existingTrade.ID},
                    },
                }
                _, err := r.db.DeleteItem(context.TODO(), deleteInput)
                if err != nil {
                    return fmt.Errorf("failed to delete existing trade: %w", err)
                }
                return nil
            }

            // Update quantity for remaining stocks
            trade.Quantity = remainingQuantity
            trade.Price = existingTrade.Price // Keep the original average price
        }

        // Use the existing trade ID to maintain the single record
        trade.ID = existingTrade.ID
    }

    // Create or update the trade with the latest data
    input := &dynamodb.PutItemInput{
        TableName: aws.String(database.TradeDB),
        Item: map[string]types.AttributeValue{
            "id":           &types.AttributeValueMemberS{Value: trade.ID},
            "userId":       &types.AttributeValueMemberS{Value: trade.UserID},
            "stockSymbol":  &types.AttributeValueMemberS{Value: trade.StockSymbol},
            "quantity":     &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", trade.Quantity)},
            "price":        &types.AttributeValueMemberN{Value: fmt.Sprintf("%.2f", trade.Price)},
            "lastAction":   &types.AttributeValueMemberS{Value: action},
            "updatedAt":    &types.AttributeValueMemberS{Value: time.Now().UTC().Format(time.RFC3339)},
        },
    }

    _, err = r.db.PutItem(context.TODO(), input)
    if err != nil {
        return fmt.Errorf("failed to put trade: %w", err)
    }

    log.Printf("Trade %s processed successfully: %s, Quantity: %d, Price: %.2f",
        action, trade.ID, trade.Quantity, trade.Price)
    return nil
}

func (r *TradeRepository) GetTradeByStockSymbol(stockSymbol string) (*models.Trade, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(database.TradeDB),
		IndexName:              aws.String("StockSymbolIndex"),
		KeyConditionExpression: aws.String("stockSymbol = :stock_symbol"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":stock_symbol": &types.AttributeValueMemberS{Value: stockSymbol},
		},
	}

	result, err := r.db.Query(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to query trade: %w", err)
	}

	if len(result.Items) == 0 {
		return nil, fmt.Errorf("trade not found")
	}

	var trade models.Trade
	err = attributevalue.UnmarshalMap(result.Items[0], &trade)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal trade: %w", err)
	}

	return &trade, nil
}

func (r *TradeRepository) GetTradeByID(tradeID string) (*models.Trade, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(database.TradeDB),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: tradeID},
		},
	}

	result, err := r.db.GetItem(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to get trade: %w", err)
	}

	if result.Item == nil {
		return nil, fmt.Errorf("trade not found")
	}

	var trade models.Trade
	err = attributevalue.UnmarshalMap(result.Item, &trade)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal trade: %w", err)
	}

	return &trade, nil
}

func (r *TradeRepository) GetTradesByUserID(userID string) ([]models.Trade, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(database.TradeDB),
		IndexName:              aws.String("UserIndex"),
		KeyConditionExpression: aws.String("userId = :user_id"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":user_id": &types.AttributeValueMemberS{Value: userID},
		},
	}

	result, err := r.db.Query(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to query trades: %w", err)
	}

	var trades []models.Trade
	err = attributevalue.UnmarshalListOfMaps(result.Items, &trades)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal trades: %w", err)
	}

	return trades, nil
}
