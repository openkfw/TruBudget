# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- [API] Increased the stability of the event sourcing code by replacing the "immer" dependency with a custom implementation.

## [1.0.0-beta.7] - 2019-04-03

### Added

- [Code of conduct](./CODE_OF_CONDUCT.md) and [contributing guidelines](./CONTRIBUTING.md) [#156](https://github.com/openkfw/TruBudget/issues/174)
- Refined [getting-started guide](./README.md) [#185](https://github.com/openkfw/TruBudget/pull/185) and installation guides [#180](https://github.com/openkfw/TruBudget/pull/180)

### Changed

- Error message for user logging in on another organization's node [#174](https://github.com/openkfw/TruBudget/issues/174)
- JWT validity set to 8 hours [#160](https://github.com/openkfw/TruBudget/issue/160)

### Fixed

- notifications do not work according to wrong notification.list schema [#182](https://github.com/openkfw/TruBudget/issues/182) [#183](https://github.com/openkfw/TruBudget/issues/183)
- uploading document does not produce history output [#85](https://github.com/openkfw/TruBudget/issues/85)
- display of user names in history [#87](https://github.com/openkfw/TruBudget/issues/87)
- not authorized HTTP status code [#177](https://github.com/openkfw/TruBudget/pull/177)
- Swagger documentation [#146](https://github.com/openkfw/TruBudget/issue/146)
- upload documents using Firefox [#121](https://github.com/openkfw/TruBudget/issue/121)
- provisioning script [#149](https://github.com/openkfw/TruBudget/issue/149)
- e2e test for updated display of organization [#145](https://github.com/openkfw/TruBudget/issue/145)

## [1.0.0-beta.6] - 2019-03-22

### Changed

- Comment field is no longer mandatory for project / subproject creation.
- Notification.list API response format

### Removed

- Notification.poll

### Fixed

- Notifications include displayname of resource and show redaction.

## [1.0.0-beta.5] - 2019-03-14

### Added

- Show Projected Budgets including organization, amount and currency code on project/subproject page
- Convert allocations and disbursements of workflowitems to contract currency
- Contract currency is shown on subproject page
- Various UI/Performance improvements

### Fixed

- Title of additional Data dialog
- Pretty print Additional Data
- Add Additional Data to test projects
- Notifications are shown (but not in full functionality)

## [1.0.0-beta.4] - 2019-03-08

### Added

- Show versions of Trubudget components (frontend, api, blockchain, multichain) in frontend
- Add "read all notification" button + pagination
- Add Pagination for History
- Run audit in Pipeline
- Write User-guide
- UI: Add currency for Burkina Faso
- Add currencies FCFA and DKK
- Add batch-edit permissions and assignee

### Changed

- Don't show "Internal Server Error" snackbar after failed user login
- UI: Don't display error when no users/projects exist yet
- Show loading indicator for "Read All" button
- Increase RPC timeout
- Improve french translations

### Fixed

- Poll new notifications even if there are no notifications yet
- Fix display of badge number after fly-in notifications
- Group IDs are not checked against user IDs
- When clicking on an unread message, no loading indicator is displayed
- Fix permissions for users and groups
- Notifications to groups don't work
- Enhance performance of getProject
- Fix fastify's validation of requests
- Show an uppercase letter as Avatar in notification fly in instead of lowercase
- Wrong number of connected peers displayed
- Redacted Workflowitems lead to Gauges displaying NAN
- Impossible to close subproject

## [1.0.0-beta.3] - 2018-12-14

### Added

- Developer Guide
- Auto Refresh for project & subproject details
- Prometheus Metrics Endpoint
- Docs for create and restore backup endpoints
- Support running multiple multichain instances on one host
- Installation guide for bare metal & Docker Compose installation
- Fine grain selection of global permissions
- Introduce unified logging format
- French translations
- Add exchange rate and billing date as fields for subprojects & workflowitems
- Replace the organizations' vault with a dedicated stream
- User with global grant/revoke permissions should not be able to grant/revoke permissions for him/herself
- Make use of "organization" stream

### Changed

- Changed data-structure of multichain
- Show Snackbar only after request successful
- Modify nginx.conf for bare metal installation
- Update material-ui version
- Move schema declaration into separate file(s)
- Add prometheus labels to helm charts
- Upgrade multichain and reduce docker image size
- Improve logging of api
- Further improve API logging

### Resolved

- Prevent outdated nodes to connect and corrupt chain

### Removed

- Cleanup unused intents

### Fixed

- Add missing intent which caused a visual bug in the project history of the ui
- network.registerNode error cause of unhandled invalid address
- Validate wallet address before adding the node to `node` stream
- Budget bubbles get misaligned on lower resolution
- Multichain vaul secret syntax
- Windows multichain startup
- project.assign not defined in history
- Provisioning handle 404
- Update getActiveNodes endpoint
- Update logging for stream already exists

## [1.0.0-beta.2] - 2018-09-26

### Added

- Add Create and Restore of multichain backups
- CreateWorkflowitem-Test if assignee exists
- Support attaching documents to a workflow item.
- Login: after a failed login attempt, the username field is no longer cleared.
- Changing the ordering among workflow items is now visible in the subproject history.
- Added subprojects permission for re-ordering workflow items.

### Changed

- Replace express and apidoc.js with fastify for better validation and documentation
- Api documentation is up to date now.
- For closed subprojects, adding workflow items is now disabled.
- Smaller layout and formatting changes.

### Fixed

- Fixed bug where the api-documentation tries to connect to localhost
- Fixed bug where workflowitems could not be displayed if a closed one was redacted
- Workflow item creation dialog: "allocated" requires an "amount" to be set.
- Workflow items: no longer show edit and close actions for closed items.
- Updated translation keys and language-specific formatting.
- Fixed bug where the subproject permissions dialog would break the details view of another project.

[unreleased]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.7...master
[1.0.0-beta.7]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.6...v1.0.0-beta.7
[1.0.0-beta.6]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.5...v1.0.0-beta.6
[1.0.0-beta.5]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.4...v1.0.0-beta.5
[1.0.0-beta.4]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.3...v1.0.0-beta.4
[1.0.0-beta.3]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.2...v1.0.0-beta.3
[1.0.0-beta.2]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.1...v1.0.0-beta.2
