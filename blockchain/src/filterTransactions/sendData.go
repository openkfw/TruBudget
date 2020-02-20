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
		fmt.Println("Start sending notifciation process...")
		sendData(path, emailServiceSocketAddress)
		time.Sleep(5 * time.Second)
	}
}

func sendData(path string, emailServiceSocketAddress string) {

	files, err := ioutil.ReadDir(path)
	if err != nil {
		fmt.Printf("Error: %v", err)
		return
	}

	for _, file := range files {
		fmt.Println("DEBUG: Parsing File", file.Name(), "...")
		recipient, err := getRecipientFromFile(path, file.Name())
		if err != nil {
			fmt.Printf("Error: %v", err)
			break
		}
		fmt.Println("DEBUG: Parsed Recipient is:", recipient)
		fmt.Println("DEBUG: Email-Service-Address:", emailServiceSocketAddress)

		nData, err := json.Marshal(map[string]string{
			"Command": "sendNotification",
			"ID":      recipient,
		})
		if err != nil {
			fmt.Printf("Error: Failed creating JSON\n", err)
			return
		}
		// Start HTTP connection
		resp, err := http.Post(emailServiceSocketAddress+"/notification.send", "application/json", bytes.NewBuffer(nData))
		if err != nil {
			fmt.Printf("Error: Failed building a HTTP connection\n", err)
			return
		}

		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			fmt.Printf("Error: Failed reading response\n", err)
			return
		}

		fmt.Println(string(body))

		if os.Remove(path+"/"+file.Name()) != nil {
			fmt.Printf("INFO: Couldn't delete File %s\n", file.Name())
		}

		// TODO: Delete the file if mail WAS SENT by the email service
		// // wait for reply
		// message, _ := bufio.NewReader(conn).ReadString('\n')
		// fmt.Print("Message from server: " + message)
		// if message == "Email sent" {
		// 	fmt.Print("Delete File")
		// }
	}
}
