# First checklist for IT infrastructure

To engage in the discussion with a typical IT team for the installation of TruBudget, the following questions are relevant:

- Which infrastructure is preferred in the existing IT landscape? Is it an installation on bare metal servers, on virtual machines or is there a container runtime (e.g. via docker) available?
- Are there any specific networking requirements to host an application that is available to the users and connects through the internet (e.g. DMZ)
- Would TruBudget be run in a cloud environment and if so which one (e.g. Amazon Web Services, Microsoft Azure or Google cloud platform)
- How are SSL certificate provisioned to ensure an `https` connection
- What are existing firewalls to connect TruBudget to other nodes and what is the effort to update them?
- TruBudget provides pre-cooked operations scripts to start the environment, would these be used or are there existing standards to run software?
- Which of the services would be used in addition to the core TruBudget service for the user interface, the API and the blockchain/data? In particular there are optional services like:
  - Excel export service to download data in Excel format
  - eMail notification service to send out email notification via SMTP
  - User directory integration service to connect existing user directories
- Is an integration of TruBudget with existing systems planned via API?
- How many environments are the standard for new software, e.g. `test` and `production` environments are separated?
- How are updates to TruBudget managed, e.g. what are the release cycles and the effort to update?

Using this list, a first high level view on the effort from the IT department for the installation can be derived.
