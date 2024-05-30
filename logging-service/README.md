# TruBudget Logging Config for Pino

This is module exports a pino logger instance with a common configuration for the TruBudget project

## API

### `createPinoLogger(name)`

Creates a Pino Logger instance that can be used to log messages.
`name` will be passed on to pino to describe the name of the process which is logging messages

### `createPinoExpressLogger(pino, [options])`

Creates a pino-http instance that can be used together with [express](https://expressjs.com/de/)
`pino` should be a pino logger instance that can be created beforehand with `createPinoLogger`

`options` optional object containing additional setting, e.g. `{ "shortRoutesLogging": true }`

* `silenceLoggingOnFrequentRoutes`: (boolean) if set to `true` it will ignore logs in routes "/readiness", "/liveliness" and "/version".
* `shortRoutesLogging`: (boolean) if set to `true` it will provide only shorter, one-line output for each HTTP call.

### `getLevel(level)`

Takes a string that should be a loglevel (info, debug, error...) and makes sure it is a known log level.
the validated string will be returned. If an invalid string is passed `undefined`will be returned

## Pino Log Levels

These are the supported Log Levels:

- trace
- debug
- info
- warn
- error
- fatal

Information about when to use which level can be found [here](https://www.section.io/engineering-education/how-to-choose-levels-of-logging/)
