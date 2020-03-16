package main

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// DiskPersister Implements func persist
type DiskPersister struct {
	path string
}

// NewDiskPersister Constructor
func NewDiskPersister(p string) *DiskPersister {
	return &DiskPersister{
		path: p,
	}
}

func (p *DiskPersister) persist(message string) error {
	unixTimestamp := strconv.FormatInt(time.Now().UnixNano(), 10)
	file, err := os.Create(p.path + unixTimestamp + ".json")
	defer file.Close()

	if err != nil {
		return fmt.Errorf("Error persisting to disk: %v", err)
	}

	_, err = file.WriteString(message)
	if err != nil {
		return fmt.Errorf("Error writing to file: %v", err)
	}
	return nil
}
