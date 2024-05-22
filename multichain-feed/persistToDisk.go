package main

import (
	"fmt"
	"os"
	"strconv"
	"syscall"
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

	// Create directory if not existing
if _, err := os.Stat(p.path); os.IsNotExist(err) {
			os.Mkdir(p.path, os.ModePerm)
	}

	var file *os.File
	var err error
	for {
			file, err = os.Create(p.path + unixTimestamp + ".json")
			if err != nil {
					if isInterrupted(err) {
							continue
					}
					return fmt.Errorf("multichain-feed: Error persisting to disk: %v", err)
			}
			break
	}
	defer file.Close()

	_, err = file.WriteString(message)
	if err != nil {
			return fmt.Errorf("multichain-feed: Error writing to file: %v", err)
	}
	return nil
}

func isInterrupted(err error) bool {
	pathErr, ok := err.(*os.PathError)
	return ok && pathErr.Err == syscall.EINTR
}
