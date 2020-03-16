package main

import (
	"encoding/json"
	"fmt"
)

type request struct {
	Vout   []vout      `json:"vout"`
	Create interface{} `json:"create"`
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

type orgPrivkeyTransaction struct {
	Address string `json:"address"`
	Privkey string `json:"privkey"`
}

type notificationTransaction struct {
	Type      string `json:"type"`
	Recipient string `json:"recipient"`
}

type message struct {
	Command string
	ID      string
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
		log.Debug(payload)
		return "", fmt.Errorf("Failed to parse JSON: %v", err)
	}

	// if create stream return stream_created

	txType, err := getTransactionType(rawMessage)
	if err != nil {
		return "", fmt.Errorf("Failed to retrieve transaction type: %v", err)
	}

	return txType, nil
}
