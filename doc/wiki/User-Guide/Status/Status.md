# Service-Status

The "Service-Status" section is used to show all connected Trubudget services, their versions and connection quality. The Status page shows every service which is meant to be connected. The check what services shall be connected is done on login. So note if a service shall be connected but isn't, the status page shows the servicec as "not connected", but if a service is not meant to be connected, the status page is never going to show this service.

## Service-Status and Versions

The core/mandatory Trubudget set consists of 4 different components (Frontend, API, Blockchain, Multichain). Trubudget also offers a set of optional services (e.g. Email-notification, excel-export). All of these services have their own version which can be viewed on the status page in the frontend.

### View all Status and Version Info

**Description:**

These section describes how to view the status of all components of Trubudget.

**Notes:**

- Every component has its own version
- The api version shows the version of the api where the frontend is connected to.
- The blockchain version shows the version of the blockchain where the master api is connected to.

**Instructions:**

1. Login into the frontend
1. Click the button in the upper left corner to open the side-navigation-bar
1. Click "Service-Status"-button to open the status page

![show status page](../../uploads/Screenshots/status_page.jpg)

### Ping Evaluation

**Description:**

This section describes how the different pings are calculated:

| Service/Component         | Ping Calculation Description                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| frontend                  | The ping to the frontend would be a normal internet speed test and is not shown in Trubudget |
| api                       | The ping is calculated from frontend to api                                                  |
| blockchain                | The ping is calculated from api to blockchain                                                |
| multichain                | The ping is calculated from api to multichain                                                |
| email-service [optional]  | The ping is calculated from frontend to email-service                                        |
| export-service [optional] | The ping is calculated from frontend to export-service                                       |
