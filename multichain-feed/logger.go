package main

import (
	"github.com/op/go-logging"
)

var log = logging.MustGetLogger("example")

// Everything except the message has a custom color
// which is dependent on the log level. Many fields have a custom output
// formatting too, eg. the time returns the hour down to the milli second.
var format = logging.MustStringFormatter(
	`%{color} %{shortfunc} ▶ %{level:.4s} %{id:03x}%{color:reset} %{message}`,
)

func configureLogger(logLevel logging.Level) {
	logging.SetFormatter(format)
	logging.SetLevel(logLevel, "")
}
