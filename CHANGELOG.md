# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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

### Known Issues (Subjects to be fixed in the upcoming releases)

- Updating Projected Budgets on project/subproject level is going to be enabled in the next release
- Multiple Projected Budgets lead to hiding Assignee field on Detailsview of project/subproject
- Notifications do not include displayname of resource, do not show redaction and are not flyin in from the side

## [1.0.0-beta.4] - 2019-03-08

### Added

- Show versions of Trubudget components (frontend, api, blockchain, multichain) in frontend [#33](https://github.com/openkfw/TruBudget/issues/33)
- Add "read all notification" button + pagination [#199](https://github.com/openkfw/TruBudget/issues/199)
- Add Pagination for History [#216](https://github.com/openkfw/TruBudget/issues/216)
- Run audit in Pipeline [#235](https://github.com/openkfw/TruBudget/issues/235)
- Write User-guide [#166](https://github.com/openkfw/TruBudget/issues/166)
- UI: Add currency for Burkina Faso [#232](https://github.com/openkfw/TruBudget/issues/232)
- Add currencies FCFA and DKK [#375](https://github.com/openkfw/TruBudget/issues/375)
- Add batch-edit permissions and assignee [#339](https://github.com/openkfw/TruBudget/issues/339)

### Changed

- Don't show "Internal Server Error" snackbar after failed user login [#227](https://github.com/openkfw/TruBudget/issues/227)
- UI: Don't display error when no users/projects exist yet [#228](https://github.com/openkfw/TruBudget/issues/228)
- Show loading indicator for "Read All" button [#223](https://github.com/openkfw/TruBudget/issues/223)
- Increase RPC timeout [#220](https://github.com/openkfw/TruBudget/issues/220)
- Improve french translations [#376](https://github.com/openkfw/TruBudget/issues/376)

### Resolved

### Removed

### Fixed

- Poll new notifications even if there are no notifications yet [#230](https://github.com/openkfw/TruBudget/issues/230)
- Fix display of badge number after fly-in notifications [#229](https://github.com/openkfw/TruBudget/issues/229)
- Group IDs are not checked against user IDs [#217](https://github.com/openkfw/TruBudget/issues/217)
- When clicking on an unread message, no loading indicator is displayed [#221](https://github.com/openkfw/TruBudget/issues/221)
- Fix permissions for users and groups [#212](https://github.com/openkfw/TruBudget/issues/212)
- Notifications to groups don't work [#215](https://github.com/openkfw/TruBudget/issues/215)
- Enhance performance of getProject [#234](https://github.com/openkfw/TruBudget/issues/234)
- Fix fastify's validation of requests[#353](https://github.com/openkfw/TruBudget/issues/353)
- Show an uppercase letter as Avatar in notification fly in instead of lowercase[#358](https://github.com/openkfw/TruBudget/issues/358)
- Wrong number of connected peers displayed [#222](https://github.com/openkfw/TruBudget/issues/222)
- Redacted Workflowitems lead to Gauges displaying NAN [#355](https://github.com/openkfw/TruBudget/issues/355)
- Impossible to close subproject [#374](https://github.com/openkfw/TruBudget/issues/374)

## [1.0.0-beta.3] - 2018-12-14

### Added

- Developer Guide [#156](https://github.com/openkfw/TruBudget/issues/156)
- Auto Refresh for project & subproject details [#165](https://github.com/openkfw/TruBudget/issues/165)
- Prometheus Metrics Endpoint [#169](https://github.com/openkfw/TruBudget/issues/169)
- Docs for create and restore backup endpoints [#184](https://github.com/openkfw/TruBudget/issues/184)
- Support running multiple multichain instances on one host [#178](https://github.com/openkfw/TruBudget/issues/178)
- Installation guide for bare metal & Docker Compose installation [#155](https://github.com/openkfw/TruBudget/issues/155)
- Fine grain selection of global permissions [#183](https://github.com/openkfw/TruBudget/issues/183)
- Introduce unified logging format [#198](https://github.com/openkfw/TruBudget/issues/198)
- French translations [#194](https://github.com/openkfw/TruBudget/issues/194)
- Add exchange rate and billing date as fields for subprojects & workflowitems [#203](https://github.com/openkfw/TruBudget/issues/203)
- Replace the organizations' vault with a dedicated stream [#205](https://github.com/openkfw/TruBudget/issues/205)
- User with global grant/revoke permissions should not be able to grant/revoke permissions for him/herself [#209](https://github.com/openkfw/TruBudget/issues/209)
- Make use of "organization" stream [#197](https://github.com/openkfw/TruBudget/issues/197)

### Changed

- Changed data-structure of multichain [#18](https://github.com/openkfw/TruBudget/issues/18)
- Show Snackbar only after request successful [#117](https://github.com/openkfw/TruBudget/issues/117)
- Modify nginx.conf for bare metal installation [#153](https://github.com/openkfw/TruBudget/issues/153)
- Update material-ui version [#158](https://github.com/openkfw/TruBudget/issues/158)
- Move schema declaration into separate file(s) [#181](https://github.com/openkfw/TruBudget/issues/181)
- Add prometheus labels to helm charts [#172](https://github.com/openkfw/TruBudget/issues/172)
- Upgrade multichain and reduce docker image size [#188](https://github.com/openkfw/TruBudget/issues/188)
- Improve logging of api [#164](https://github.com/openkfw/TruBudget/issues/164)
- Further improve API logging [#202](https://github.com/openkfw/TruBudget/issues/202)

### Resolved

- Prevent outdated nodes to connect and corrupt chain [#131](https://github.com/openkfw/TruBudget/issues/131)

### Removed

- Cleanup unused intents [#182](https://github.com/openkfw/TruBudget/issues/182)

### Fixed

- Add missing intent which caused a visual bug in the project history of the ui
  [#174](https://github.com/openkfw/TruBudget/issues/174)
- network.registerNode error cause of unhandled invalid address [#149](https://github.com/openkfw/TruBudget/issues/149)
- Validate wallet address before adding the node to `node` stream [#152](https://github.com/openkfw/TruBudget/issues/152)
- Budget bubbles get misaligned on lower resolution [#36](https://github.com/openkfw/TruBudget/issues/36]
- Multichain vaul secret syntax [#175](https://github.com/openkfw/TruBudget/issues/175)
- Windows multichain startup [#179](https://github.com/openkfw/TruBudget/issues/179)
- project.assign not defined in history [#174](https://github.com/openkfw/TruBudget/issues/174)
- Provisioning handle 404 [#177](https://github.com/openkfw/TruBudget/issues/177)
- Update getActiveNodes endpoint [#195](https://github.com/openkfw/TruBudget/issues/195)
- Update logging for stream already exists[#196](https://github.com/openkfw/TruBudget/issues/196)

## [1.0.0-beta.2] - 2018-09-26

### Added

- Add Create and Restore of multichain backups
  [#146](https://github.com/openkfw/TruBudget/issues/146)
- CreateWorkflowitem-Test if assignee exists
  [#60](https://github.com/openkfw/TruBudget/issues/60)
- Support attaching documents to a workflow item.
  [#59](https://github.com/openkfw/TruBudget/issues/59)
- Login: after a failed login attempt, the username field is no longer cleared.
  [#77](https://github.com/openkfw/TruBudget/issues/77)
- Changing the ordering among workflow items is now visible in the subproject history.
  [#143](https://github.com/openkfw/TruBudget/issues/143)
- Added subprojects permission for re-ordering workflow items.
  [#134](https://github.com/openkfw/TruBudget/issues/134)

### Changed

- Replace express and apidoc.js with fastify for better validation and documentation
  [#121](https://github.com/openkfw/TruBudget/issues/121)
- Api documentation is up to date now.
  [#147](https://github.com/openkfw/TruBudget/issues/147)
- For closed subprojects, adding workflow items is now disabled.
  [#118](https://github.com/openkfw/TruBudget/issues/118)
- Smaller layout and formatting changes.
  [#132](https://github.com/openkfw/TruBudget/issues/132)
  [#108](https://github.com/openkfw/TruBudget/issues/108)

### Fixed

- Fixed bug where the api-documentation tries to connect to localhost
  [#161](https://github.com/openkfw/TruBudget/issues/161)
- Fixed bug where workflowitems could not be displayed if a closed one was redacted
  [#142](https://github.com/openkfw/TruBudget/issues/142)
- Workflow item creation dialog: "allocated" requires an "amount" to be set.
  [#139](https://github.com/openkfw/TruBudget/issues/139)
- Workflow items: no longer show edit and close actions for closed items.
  [#136](https://github.com/openkfw/TruBudget/issues/136)
- Updated translation keys and language-specific formatting.
  [#137](https://github.com/openkfw/TruBudget/issues/137)
- Fixed bug where the subproject permissions dialog would break the details view of another project.
  [#123](https://github.com/openkfw/TruBudget/issues/123)

## [1.0.0-beta.1] - 2018-08-10

-

## [1.0.0-alpha.4] - 2018-06-26

-

[unreleased]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.1...master
[1.0.0-beta.1]: https://github.com/openkfw/TruBudget/compare/v1.0.0-alpha.4...v1.0.0-beta.1
[1.0.0-alpha.4]: https://github.com/openkfw/TruBudget/compare/v1.0.0-alpha.3...v1.0.0-alpha.4
