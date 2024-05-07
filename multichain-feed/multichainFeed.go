package main

import (
	"encoding/json"
	"os"

	"github.com/op/go-logging"
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

	log.Info("multichain-feed: Starting program")

	// Check arguments
	arguments := os.Args[1:]
	if len(arguments) != 1 {
			log.Error("multichain-feed: Not enough arguments")
			log.Info("multichain-feed: Usage: %s JSONString", os.Args[0])
			os.Exit(1)
	}
	transactionJSONAsString := arguments[0]

	var rawMessage json.RawMessage

	log.Info("multichain-feed: Parsing transaction type")
	txType, err := parseTransactionType(&rawMessage, transactionJSONAsString)
	if err != nil {
			log.Error("multichain-feed: Error parsing transaction: %v", err)
			os.Exit(1)
	}

	emptydp := emptyDiskPersister{}
	var myPersister persister = &emptydp

	switch txType {
	case "notification_created":
			log.Info("multichain-feed: Creating new disk persister")
			myPersister = NewDiskPersister(notificationPath)
	default:
			// Unknown transaction types
			log.Info("multichain-feed: Unknown transaction type: %s", txType)
	}

	log.Info("multichain-feed: Persisting transaction")
	err = myPersister.persist(transactionJSONAsString)
	if err != nil {
			log.Error("multichain-feed: Error persisting transaction: %v", err)
			os.Exit(1)
	}

	log.Info("multichain-feed: Program completed successfully")
}