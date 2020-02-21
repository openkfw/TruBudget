package main

// TODO: Error handling

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

// TYPES

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

type notificationData struct {
	Command string
	ID      string
}

// FUNCTIONS

func getRecipientFromFile(path string, fileName string) (string, error) {

	jsonFile, err := os.Open(path + "/" + fileName)
	if err != nil {
		return "", err
	}
	transactionJSON, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return "", err
	}
	var rawMessage json.RawMessage
	txRecipient, err := parseTransactionRecipient(&rawMessage, string(transactionJSON))
	if err != nil {
		return "", err
	}
	jsonFile.Close()
	return txRecipient, nil
}

func parseTransactionRecipient(rawMessage *json.RawMessage, payload string) (string, error) {
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

	txRecipient, err := getTransactionRecipient(rawMessage)
	if err != nil {
		fmt.Printf(payload)
		return "", fmt.Errorf("Failed to retrieve transaction recipient: %v", err)
	}

	return txRecipient, nil
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

func getTransactionRecipient(rawTx *json.RawMessage) (string, error) {
	baseTx := notificationTransaction{}
	json.Unmarshal(*rawTx, &baseTx)

	if baseTx.Recipient == "" {
		return "", fmt.Errorf("Event type not specified")
	}

	return baseTx.Recipient, nil
}

func main() {
	argsWithoutProg := os.Args[1:]
	if len(argsWithoutProg) != 2 {
		fmt.Printf("Error: Not enough arguments")
		fmt.Printf("Usage: %s pathToTransactionFiles", os.Args[0])
		return
	}
	path := argsWithoutProg[0]
	emailServiceSocketAddress := argsWithoutProg[1]

	for {
		sendData(path, emailServiceSocketAddress)
		time.Sleep(5 * time.Second)
	}
}

func sendData(path string, emailServiceSocketAddress string) {
	var files []os.FileInfo
	var err error
	files, err = ioutil.ReadDir(path)
	if err != nil {
		if os.IsNotExist(err) {
			os.Mkdir(path, os.ModePerm)
		}
		files, err = ioutil.ReadDir(path)
		if err != nil {
			fmt.Printf("Error: %v", err)
			return
		}
	}

	for _, file := range files {
		recipient, err := getRecipientFromFile(path, file.Name())
		if err != nil {
			fmt.Printf("Error: %v", err)
			break
		}

		nData, err := json.Marshal(map[string]string{
			"id": recipient,
		})
		if err != nil {
			fmt.Printf("Error: Failed creating JSON\n", err)
			return
		}
		// Start HTTP connection
		resp, err := http.Post("http://"+emailServiceSocketAddress+"/notification.send", "application/json", bytes.NewBuffer(nData))
		if err != nil {
			fmt.Printf("Error: Failed building a HTTP(S) connection\n", err)
			return
		}
		defer resp.Body.Close()
		// Delete file if message was sent
		if resp.StatusCode >= 200 && resp.StatusCode <= 499 {
			if os.Remove(path+"/"+file.Name()) != nil {
				fmt.Printf("INFO: Couldn't delete File %s\n", file.Name())
			}
		}
	}
}
