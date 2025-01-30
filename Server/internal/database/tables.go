package database

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var UsersDB = "Go-Users"
var TransactionDB = "Go-Transactions"
var TradeDB = "Go-Trades"
var EmailVerification = "Go-EmailVerify"

func CreateTables(db *dynamodb.Client) {
	tables := []struct {
		name   string
		schema *dynamodb.CreateTableInput
	}{
		{
			name: UsersDB,
			schema: &dynamodb.CreateTableInput{
				TableName: aws.String(UsersDB),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("id"), KeyType: types.KeyTypeHash},
				},
				AttributeDefinitions: []types.AttributeDefinition{
					{AttributeName: aws.String("id"), AttributeType: types.ScalarAttributeTypeS},
					{AttributeName: aws.String("email"), AttributeType: types.ScalarAttributeTypeS}, // Add email attribute definition
				},
				GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
					{
						IndexName: aws.String("EmailIndex"),
						KeySchema: []types.KeySchemaElement{
							{AttributeName: aws.String("email"), KeyType: types.KeyTypeHash},
						},
						Projection: &types.Projection{
							ProjectionType: types.ProjectionTypeAll,
						},
						ProvisionedThroughput: &types.ProvisionedThroughput{
							ReadCapacityUnits:  aws.Int64(5),
							WriteCapacityUnits: aws.Int64(5),
						},
					},
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
		},
		{
			name: TradeDB,
			schema: &dynamodb.CreateTableInput{
				TableName: aws.String(TradeDB),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("id"), KeyType: types.KeyTypeHash},
				},
				AttributeDefinitions: []types.AttributeDefinition{
					{AttributeName: aws.String("id"), AttributeType: types.ScalarAttributeTypeS},
					{AttributeName: aws.String("userId"), AttributeType: types.ScalarAttributeTypeS}, // Add user_id attribute definition
					{AttributeName: aws.String("stockSymbol"), AttributeType: types.ScalarAttributeTypeS}, // Add stockSymbol attribute definition
				},
				GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
					{
						IndexName: aws.String("UserIndex"),
						KeySchema: []types.KeySchemaElement{
							{AttributeName: aws.String("userId"), KeyType: types.KeyTypeHash},
						},
						Projection: &types.Projection{
							ProjectionType: types.ProjectionTypeAll,
						},
						ProvisionedThroughput: &types.ProvisionedThroughput{
							ReadCapacityUnits:  aws.Int64(5),
							WriteCapacityUnits: aws.Int64(5),
						},
					},
					{
						IndexName: aws.String("StockSymbolIndex"),
						KeySchema: []types.KeySchemaElement{
							{AttributeName: aws.String("stockSymbol"), KeyType: types.KeyTypeHash},
						},
						Projection: &types.Projection{
							ProjectionType: types.ProjectionTypeAll,
						},
						ProvisionedThroughput: &types.ProvisionedThroughput{
							ReadCapacityUnits:  aws.Int64(5),
							WriteCapacityUnits: aws.Int64(5),
						},
					},
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
		},
		{
			name: TransactionDB,
			schema: &dynamodb.CreateTableInput{
				TableName: aws.String(TransactionDB),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("id"), KeyType: types.KeyTypeHash},
				},
				AttributeDefinitions: []types.AttributeDefinition{
					{AttributeName: aws.String("id"), AttributeType: types.ScalarAttributeTypeS},
					{AttributeName: aws.String("userId"), AttributeType: types.ScalarAttributeTypeS}, // Add userId attribute definition
				},
				GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
					{
						IndexName: aws.String("UserIdIndex"),
						KeySchema: []types.KeySchemaElement{
							{AttributeName: aws.String("userId"), KeyType: types.KeyTypeHash},
						},
						Projection: &types.Projection{
							ProjectionType: types.ProjectionTypeAll,
						},
						ProvisionedThroughput: &types.ProvisionedThroughput{
							ReadCapacityUnits:  aws.Int64(5),
							WriteCapacityUnits: aws.Int64(5),
						},
					},
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
		},
		{
			name: EmailVerification,
			schema: &dynamodb.CreateTableInput{
				TableName: aws.String(EmailVerification),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("token"), KeyType: types.KeyTypeHash},
				},
				AttributeDefinitions: []types.AttributeDefinition{
					{AttributeName: aws.String("token"), AttributeType: types.ScalarAttributeTypeS},
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
		},
	}

	for _, table := range tables {
		_, err := db.CreateTable(context.TODO(), table.schema)
		if err != nil {
			log.Printf("Failed to create table %s: %v", table.name, err)
		} else {
			log.Printf("Table %s created successfully", table.name)
		}
	}
}