package services

import (
	"context"
	"errors"
	"fmt"
	"log"

	aptos "github.com/aptos-labs/aptos-go-sdk"
	"github.com/aptos-labs/aptos-go-sdk/bcs"
	crypto "github.com/aptos-labs/aptos-go-sdk/crypto"
	// api "github.com/aptos-labs/aptos-go-sdk/api"
)

type AptosService struct {
	client *aptos.Client
}

func NewAptosService() (*AptosService, error) {
	// Choose the network configuration you want to use
	// For example, using DevnetConfig
	config := aptos.DevnetConfig

	// Create a new Aptos client with the chosen configuration
	client, err := aptos.NewClient(config)
	if err != nil {
		return nil, err
	}
	// account := "0fd6dc927b2eb23943bab1d22c5d9dadbae16e05b5969dc51130bb1d22a3285f"
	// account := [32]byte{0x0f, 0xd6, 0xdc, 0x92, 0x7b, 0x2e, 0xb2, 0x39, 0x43, 0xba, 0xb1, 0xd2, 0x2c, 0x5d, 0x9d, 0xad, 0xba, 0xe1, 0x6e, 0x05, 0xb5, 0x96, 0x9d, 0xc5, 0x11, 0x30, 0xbb, 0x1d, 0x22, 0xa3, 0x28, 0x5f}
	// fmt.Println(client.AccountAPTBalance(account))

	// Log the successful creation of the client
	log.Println("Aptos client created successfully")

	// Return the new AptosService instance
	return &AptosService{client: client}, nil
}

func convertToUserAddress(s string) aptos.AccountAddress {
	address := aptos.AccountAddress{}
	err := address.ParseStringRelaxed(s)
	if err != nil {
		panic("Failed to parse address:" + err.Error())
	}
	return address
}

func parseAddress(input string) *aptos.AccountAddress {
	address := &aptos.AccountAddress{}
	err := address.ParseStringRelaxed(input)
	if err != nil {
		panic(fmt.Sprintf("invalid address input %s", input))
	}
	return address
}

func (s *AptosService) MintStockToken(ctx context.Context, stockSymbol string, quantity int, ownerAddress string, privateKeyHex string) error {
	if quantity <= 0 {
		return errors.New("quantity must be greater than zero")
	}
	// user := convertToUserAddress(ownerAddress)

	privateKey := &crypto.Ed25519PrivateKey{}
	err := privateKey.FromHex(privateKeyHex)
	if err != nil {
		fmt.Println("failed to parse private key" + err.Error())
		return fmt.Errorf("failed to parse private key: %w", err)
	}
	fmt.Println(privateKey)
	account, err := aptos.NewAccountFromSigner(privateKey)

	// accountBytes, err := bcs.Serialize(&user)
	// if err != nil {
	// 	return fmt.Errorf("failed to serialize user's address: %w", err)
	// }

	amountBytes, err := bcs.SerializeU64(uint64(quantity))
	if err != nil {
		fmt.Println("failed to serialize quantity" + err.Error())
		return fmt.Errorf("failed to serialize quantity: %w", err)
	}
	symbolBytes := []byte(stockSymbol)

	rawTxn, err := s.client.BuildTransaction(
		account.AccountAddress(),
		aptos.TransactionPayload{
			Payload: &aptos.EntryFunction{
				Module: aptos.ModuleId{
					Address: aptos.AccountOne,
					Name:    "TradingPlatform",
				},
				Function: "create_stock",
				ArgTypes: []aptos.TypeTag{},
				Args: [][]byte{
					symbolBytes,
					amountBytes,
				},
			},
		},
	)
	if err != nil {
		fmt.Println("failed to build transaction" + err.Error())
		return fmt.Errorf("failed to build transaction: %w", err)
	}

	simulationResult, err := s.client.SimulateTransaction(rawTxn, account)
	if err != nil {
		fmt.Println("failed to simulate transaction" + err.Error())
		return fmt.Errorf("failed to simulate transaction: %w", err)
	}
	fmt.Printf("\n=== Simulation ===\n")
	fmt.Printf("Gas unit price: %d\n", simulationResult[0].GasUnitPrice)
	fmt.Printf("Gas used: %d\n", simulationResult[0].GasUsed)
	fmt.Printf("Total gas fee: %d\n", simulationResult[0].GasUsed*simulationResult[0].GasUnitPrice)
	fmt.Printf("Status: %s\n", simulationResult[0].VmStatus)

	signedTxn, err := rawTxn.SignedTransaction(account)
	if err != nil {
		fmt.Println("failed to sign transaction" + err.Error())
		return fmt.Errorf("failed to sign transaction: %w", err)
	}

	res, err := s.client.SubmitTransaction(signedTxn)
	if err != nil {
		fmt.Println("failed to submit transaction" + err.Error())
		return fmt.Errorf("failed to submit transaction: %w", err)
	}

	txn, err := s.client.WaitForTransaction(res.Hash)
	if err != nil {
		fmt.Println("failed to wait transaction" + err.Error())
		return fmt.Errorf("failed to wait for transaction: %w", err)
	}

	if txn.Success {
		log.Printf("Successfully minted %d %s tokens to %s", quantity, stockSymbol, ownerAddress)
		return nil
	}
	
	return fmt.Errorf("transaction failed with status: %s", txn.VmStatus)
}

// func (s *AptosService) MintStockToken(ctx context.Context, stockSymbol string, quantity int, ownerAddress string, privateKey string) error {
//     // Input validation
//     if quantity <= 0 {
//         return errors.New("quantity must be greater than zero")
//     }

//     // Create account from private key
//     privateKey := &aptos.Ed25519PrivateKey{}
//     err := privateKey.FromHex(privateKeyHex)
//     if err != nil {
//       panic("Failed to parse private key:" + err.Error())
//     }
//     account := aptos.NewAccountFromSigner(privateKey)
//     account, err := aptos.
//     if err != nil {
//         return fmt.Errorf("failed to create account from private key: %w", err)
//     }

//     // Parse owner address
//     owner := parseAddress(ownerAddress)
//     if err != nil {
//         return fmt.Errorf("failed to parse owner address: %w", err)
//     }

//     // Prepare transaction arguments
//     symbolBytes := []byte(stockSymbol)
//     amountBytes, err := bcs.SerializeU64(uint64(quantity))
//     if err != nil {
//         return fmt.Errorf("failed to serialize amount: %w", err)
//     }

//     // Build transaction
//     rawTxn, err := s.client.BuildTransaction(
//         account.AccountAddress(),  // Use the account from private key
//         aptos.TransactionPayload{
//             Payload: &aptos.EntryFunction{
//                 Module: aptos.ModuleId{
//                     Address: owner,  // Use the owner's address for the module
//                     Name:    "stock_token",  // Your actual module name
//                 },
//                 Function: "create_stock",
//                 ArgTypes: []aptos.TypeTag{},
//                 Args: [][]byte{
//                     symbolBytes,
//                     amountBytes,
//                 },
//             },
//         },
//     )
//     if err != nil {
//         return fmt.Errorf("failed to build transaction: %w", err)
//     }

//     // Simulate transaction
//     simulationResult, err := s.client.SimulateTransaction(rawTxn, account)
//     if err != nil {
//         return fmt.Errorf("failed to simulate transaction: %w", err)
//     }

//     // Log simulation results
//     fmt.Printf("\n=== Simulation ===\n")
//     fmt.Printf("Gas unit price: %d\n", simulationResult[0].GasUnitPrice)
//     fmt.Printf("Gas used: %d\n", simulationResult[0].GasUsed)
//     fmt.Printf("Total gas fee: %d\n", simulationResult[0].GasUsed*simulationResult[0].GasUnitPrice)
//     fmt.Printf("Status: %s\n", simulationResult[0].VmStatus)

//     // Sign transaction
//     signedTxn, err := s.client.SignTransaction(account, rawTxn)
//     if err != nil {
//         return fmt.Errorf("failed to sign transaction: %w", err)
//     }

//     // Submit transaction
//     res, err := s.client.SubmitTransaction(signedTxn)
//     if err != nil {
//         return fmt.Errorf("failed to submit transaction: %w", err)
//     }

//     // Wait for transaction
//     txn, err := s.client.WaitForTransaction(res.Hash)
//     if err != nil {
//         return fmt.Errorf("failed to wait for transaction: %w", err)
//     }

//     // Check final status
//     if txn.Success() {
//         log.Printf("Successfully minted %d %s tokens to %s", quantity, stockSymbol, ownerAddress)
//         return nil
//     }

//     return fmt.Errorf("transaction failed with status: %s", txn.VmStatus)
// }

func (s *AptosService) TransferStockToken(ctx context.Context, senderAddress, receiverAddress, stockSymbol string, quantity int, privateKeyHex string) error {
	if quantity <= 0 {
		return errors.New("quantity must be greater than zero")
	}

	privateKey := &crypto.Ed25519PrivateKey{}
	err := privateKey.FromHex(privateKeyHex)
	if err != nil {
		return fmt.Errorf("failed to parse private key: %w", err)
	}

	account, err := aptos.NewAccountFromSigner(privateKey)
	if err != nil {
		return fmt.Errorf("failed to create account from private key: %w", err)
	}

	receiver := convertToUserAddress(receiverAddress)
	symbolBytes := []byte(stockSymbol)
	amountBytes, err := bcs.SerializeU64(uint64(quantity))
	if err != nil {
		return fmt.Errorf("failed to serialize quantity: %w", err)
	}

	rawTxn, err := s.client.BuildTransaction(
		account.AccountAddress(),
		aptos.TransactionPayload{
			Payload: &aptos.EntryFunction{
				Module: aptos.ModuleId{
					Address: aptos.AccountOne,
					Name:    "TradingPlatform",
				},
				Function: "transfer_stock",
				ArgTypes: []aptos.TypeTag{},
				Args: [][]byte{
					receiver[:],
					symbolBytes,
					amountBytes,
				},
			},
		},
	)
	if err != nil {
		return fmt.Errorf("failed to build transaction: %w", err)
	}

	simulationResult, err := s.client.SimulateTransaction(rawTxn, account)
	if err != nil {
		return fmt.Errorf("failed to simulate transaction: %w", err)
	}
	fmt.Printf("\n=== Simulation ===\n")
	fmt.Printf("Gas unit price: %d\n", simulationResult[0].GasUnitPrice)
	fmt.Printf("Gas used: %d\n", simulationResult[0].GasUsed)
	fmt.Printf("Total gas fee: %d\n", simulationResult[0].GasUsed*simulationResult[0].GasUnitPrice)
	fmt.Printf("Status: %s\n", simulationResult[0].VmStatus)

	signedTxn, err := rawTxn.SignedTransaction(account)
	if err != nil {
		return fmt.Errorf("failed to sign transaction: %w", err)
	}

	res, err := s.client.SubmitTransaction(signedTxn)
	if err != nil {
		return fmt.Errorf("failed to submit transaction: %w", err)
	}

	txn, err := s.client.WaitForTransaction(res.Hash)
	if err != nil {
		return fmt.Errorf("failed to wait for transaction: %w", err)
	}

	if txn.Success {
		log.Printf("Successfully transferred %d %s tokens from %s to %s", quantity, stockSymbol, senderAddress, receiverAddress)
		return nil
	}

	return fmt.Errorf("transaction failed with status: %s", txn.VmStatus)
}

func StringToByte32(input string) ([32]byte, error) {
	var byteArray [32]byte
	if len(input) > 32 {
		return byteArray, errors.New("input string is too long")
	}
	copy(byteArray[:], input)
	return byteArray, nil
}
