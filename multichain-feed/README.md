# Multichain-Feed

This project provides a script that can be passed to multichain's runtime variable `walletnotify` in the [blockchain project](https://github.com/openkfw/TruBudget/tree/master/blockchain) of Trubudget. The script is executed when a transaction is done. More information how `walletnotify` works can be found in the [runtime-parameter-list](https://www.multichain.com/developers/runtime-parameters/) of multichain.
The script checks the transaction type and executes sideEffects programmed for each recognized type.

## Transaction Types

All of Trubudget's events have a certain type. For each event a transaction is created on the blockchain. The multichain feed can perform side effects for specific transactions. An Example for a side effect is the notification_created transaction. On each notification_created transaction a file is saved locally. The different types can be found in Trubudget's [api project](https://github.com/openkfw/TruBudget/tree/master/api). In the [domain layer](https://github.com/openkfw/TruBudget/tree/master/api/src/service/domain#events) of the api all events which create transactions can be found.

The following list shows all recognized transactions with side effects:

- notification_created

### Type: notification_created

This type of event/transaction defines the creation of one notification. The notification id and the recipient can be found in the event defined by Trubudget's api. The [notification_transaction_example.json](./notification_transaction_example.json) file shows how the structure of such a transaction looks like.

#### Side Effect

Saves the transactions as json file locally. Notification transactions are saved locally into the notifications directory as json files. The files have a timestamp as name. Details about all environment variables can be found in the [configuration section](https://github.com/openkfw/TruBudget/tree/master/blockchain#configuration) of the blockchain project.

## Testing

To test the multichainFeed.go

- Navigate into the root directory of the mutlichain-feed project.
- Build the go project.
- Execute the generated binary with a valid transaction

Type in following commands:

```bash
cd multichain-feed
go build .
./multichain-feed "$(cat ./examples/notification_transaction_example.json)"
```
