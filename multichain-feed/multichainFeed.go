package main

import (
	"encoding/json"
	"github.com/op/go-logging"
	"os"
)

type persister interface {
	persist(string) error
}

type emptyDiskPersister struct {
	path string
}

func (p *emptyDiskPersister) persist(message string) error {
	return nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

func main() {
	// Environment Variables
	logLevel := getEnv("LOG_LEVEL", "INFO")
	notificationPath := "./notifications/"

	// Logger
	configureLogger(logging.GetLevel(logLevel))

	// Check arguments
	arguments := os.Args[1:]
	if len(arguments) != 1 {
		log.Error("Not enough arguments")
		log.Info("Usage: %s JSONString", os.Args[0])
		os.Exit(1)
	}
	transactionJSONAsString := arguments[0]

	var rawMessage json.RawMessage

	txType, err := parseTransactionType(&rawMessage, transactionJSONAsString)
	if err != nil {
		// log.Debug("Error parsing transaction",err)
		os.Exit(1)
	}

	emptydp := emptyDiskPersister{}
	var myPersister persister = &emptydp

	switch txType {
	case "notification_created":
		myPersister = NewDiskPersister(notificationPath)
	default:
		// Unknown transaction types
	}

	err = myPersister.persist(transactionJSONAsString)
	if err != nil {
		log.Error("%v", err)
		os.Exit(1)
	}
}
