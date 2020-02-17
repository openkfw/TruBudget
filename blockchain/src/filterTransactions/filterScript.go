package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"
)

type request struct {
	Vout []vout `json:"vout"`
}
type vout struct {
	Items []item `json:"items"`
}
type item struct {
	Data data `json:"data"`
}
type data struct {
	JSON interface{} `json:"json"`
}

type transaction struct {
	Type string `json:"type"`
}

type notificationTransaction struct {
	Type      string `json:"type"`
	Recipient string `json:"recipient"`
}

type message struct {
	Command string
	ID      string
}

func validateTransaction(tx request) error {
	if len(tx.Vout) == 0 {
		return fmt.Errorf("Error: Vout not found")
	}

	if len(tx.Vout[0].Items) == 0 {
		return fmt.Errorf("Error: No Items found")
	}

	return nil
}

func getTransactionType(rawTx *json.RawMessage) (string, error) {
	baseTx := transaction{}
	json.Unmarshal(*rawTx, &baseTx)

	if baseTx.Type == "" {
		return "", fmt.Errorf("Event type not specified")
	}

	return baseTx.Type, nil
}

func parseTransactionType(rawMessage *json.RawMessage, payload string) (string, error) {
	transaction := request{
		Vout: []vout{
			vout{
				Items: []item{
					item{
						Data: data{
							JSON: rawMessage,
						},
					},
				},
			},
		},
	}
	// parse JSON
	err := json.Unmarshal([]byte(payload), &transaction)

	if err != nil {
		return "", fmt.Errorf("Failed to parse JSON: %v", err)
	}

	// validate JSON
	if err := validateTransaction(transaction); err != nil {
		return "", fmt.Errorf("Failed to validate transaction: %v", err)
	}

	txType, err := getTransactionType(rawMessage)
	if err != nil {
		fmt.Printf(payload)
		return "", fmt.Errorf("Failed to retrieve transaction type: %v", err)
	}

	return txType, nil
}

func main() {
	// Check arguments
	argsWithoutProg := os.Args[1:]
	if len(argsWithoutProg) != 2 {
		fmt.Printf("Error: Not enough arguments")
		fmt.Printf("Usage: %s JSON mailServiceAPIURL", os.Args[0])
		os.Exit(1)
	}
	transactionJSONAsString := argsWithoutProg[0]
	notificationPath := argsWithoutProg[1]

	var rawMessage json.RawMessage

	txType, err := parseTransactionType(&rawMessage, transactionJSONAsString)
	if err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
	}

	switch txType {
	case "notification_created":
		unixTimestamp := strconv.FormatInt(time.Now().UnixNano(), 10)
		_ = os.Mkdir(notificationPath, 0600)
		file, err := os.Create(notificationPath + unixTimestamp + ".json")
		if err != nil {
			fmt.Println(err)
		} else {
			file.WriteString(argsWithoutProg[0])
		}
		file.Close()

	default:
		fmt.Printf("Unknown transaction type new: %s\n", txType)
	}
}
