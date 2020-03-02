# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

# Changelog

## Unreleased

### Added

- Added search feature for subprojects [#422](https://github.com/openkfw/TruBudget/issues/422)

<!-- ### Changed -->

<!-- ### Deprecated -->

<!-- ### Removed -->

<!-- ### Fixed -->

<!-- ### Changed -->

<!-- ### Security -->

# [1.8.0] - 2019-03-16

### Added

- Email notification service [#419](https://github.com/openkfw/TruBudget/issues/419)

<!-- ### Changed -->

<!-- ### Deprecated -->

<!-- ### Removed -->

### Fixed

- Implement group permissions correctly [#440](https://github.com/openkfw/TruBudget/issues/440)
- Fix permissions for viewing summary [#440](https://github.com/openkfw/TruBudget/issues/440)

<!-- ### Changed -->

<!-- ### Security -->

# [1.7.0] - 2019-02-10

### Added

- Support georgian language [#427](https://github.com/openkfw/TruBudget/issues/427)

<!-- ### Deprecated -->

<!-- ### Removed -->

### Fixed

- Remember language after logout [#420](https://github.com/openkfw/TruBudget/issues/420)

### Changed

- Format currencies and numbers according to the selected language or locale [#135](https://github.com/openkfw/TruBudget/issues/135)
  - History and notification timestamps only display year/month/day [#426](https://github.com/openkfw/TruBudget/issues/426)

<!-- ### Security -->

## [1.6.0] - 2019-01-07

### Added

- Search via URL query [#353](https://github.com/openkfw/TruBudget/issues/353)

### Changed

- The analytics total budget is shown whether the user has insufficient permissions or not [#410](https://github.com/openkfw/TruBudget/pull/410)
- Highlight matches when searching [#356](https://github.com/openkfw/TruBudget/issues/356)
- Projects can be searched via prefixes. Tag, display name and status are searched for matches. [#359](https://github.com/openkfw/TruBudget/issues/359)
- Tags can be searched via click on tag [#367](https://github.com/openkfw/TruBudget/issues/367)

### Fixed

- Users are properly logged out when clicking the logout button[#402](https://github.com/openkfw/TruBudget/issues/402)
- User are not created anymore if the passed organization does not exist[#358](https://github.com/openkfw/TruBudget/issues/358)

## [1.5.0] - 2019-11-27

### Changed

- Granting or revoking project/subproject/workflowitem permissions opens a confirmation dialog [#250](https://github.com/openkfw/TruBudget/pull/250)
- Assigning a user opens a confirmation dialog[#251](https://github.com/openkfw/TruBudget/pull/251)

### Fixed

- Multiple workflowitems can be edited and reordered [#397](https://github.com/openkfw/TruBudget/issues/397)
- The api endpoint "project.intent.listPermissions" checks for the right permission [#393](https://github.com/openkfw/TruBudget/issues/393)
- The edit button of a project/subproject shouldn't be shown when the user has no permissions to update [#395](https://github.com/openkfw/TruBudget/issues/395)

## [1.4.1] - 2019-10-11

### Fixed

- Root user cannot grant global permissions (admin permissions) to first user

### Known Issues

- Multiple workflowitems cannot be edited at once nor reordered #397

## [1.4.0] - 2019-09-04

### Changed

- A new user called 'root' cannot be added [#369](https://github.com/openkfw/TruBudget/issues/369)
- If a user changes his/her password, the new password has to follow security guidelines [#370](https://github.com/openkfw/TruBudget/issues/370)
- Disallow root to create projects [#375](https://github.com/openkfw/TruBudget/issues/375)
- Disallow root to create subprojects [#378](https://github.com/openkfw/TruBudget/issues/378)
- Disallow root to add workflowitems [#380](https://github.com/openkfw/TruBudget/issues/380)
- Allow user 'root' to change the passwords of all users [#366](https://github.com/openkfw/TruBudget/issues/366)
- Rework the editing of project/subproject/workflowitem/global permissions [#245](https://github.com/openkfw/TruBudget/issues/245)
- Improve project/subproject details-layout and handling of long names [#274](https://github.com/openkfw/TruBudget/issues/274)

### Fixed

- Check if assignee does exist when assigning to a project/subproject/workflowitem [#83](https://github.com/openkfw/TruBudget/issues/83)

## [1.3.0] - 2019-07-31

### Added

- Added search feature for overview page [#347](https://github.com/openkfw/TruBudget/issues/347)
- Added project tags [#342](https://github.com/openkfw/TruBudget/issues/342)

### Changed

- Organizations and currencies for projected budgets of subprojects can only be selected from values of the parent project [#228](https://github.com/openkfw/TruBudget/issues/228)
- Global permissions can only be granted/revoked to/from users within the same organizations [#340](https://github.com/openkfw/TruBudget/issues/340)
- Don't display edit/permission/close button if the user does not have the permissions for the action [#235](https://github.com/openkfw/TruBudget/issues/235)
- Updated postman collection including a postman environment[#199](https://github.com/openkfw/TruBudget/issues/199)

### Removed

- Permissions button is removed for groups [#345](https://github.com/openkfw/TruBudget/issues/345)

### Fixed

- Added backwards compatibility for future versions [#360](https://github.com/openkfw/TruBudget/issues/360)
- If a user has permissions to view subproject details, but not the permissions to see the parent project, he/she can still view the subproject details [#282](https://github.com/openkfw/TruBudget/issues/282)

## [1.2.0] - 2019-06-26

### Added

- UI feature to change a user's password [#325](https://github.com/openkfw/TruBudget/issues/325)

### Changed

- Every user can see the users and groups table [#333](https://github.com/openkfw/TruBudget/issues/333)

### Removed

- Removed permissions related to notifications [#316](https://github.com/openkfw/TruBudget/issues/316)

### Fixed

- Display correct currency when editing workflow items [#281](https://github.com/openkfw/TruBudget/issues/281)

## [1.1.0] - 2019-06-12

### Added

- New API endpoint to change a user's password [#79](https://github.com/openkfw/TruBudget/issues/79)
- New API endpoints to grant, revoke and list permissions [#310](https://github.com/openkfw/TruBudget/issues/310)
- Different background color for unread notifications [#300](https://github.com/openkfw/TruBudget/issues/300)

### Changed

- Notification displays name of parent project and subproject [#298](https://github.com/openkfw/TruBudget/issues/298)
- Move 'Read All' button to the left side [#301](https://github.com/openkfw/TruBudget/issues/301)
- Don't display view button if user is not allowed to see project/subproject [#302](https://github.com/openkfw/TruBudget/issues/302)

### Fixed

- Empty history displayed after API call is finished [#294](https://github.com/openkfw/TruBudget/issues/294)
- Last page of notifications displays correct number of items [#288](https://github.com/openkfw/TruBudget/issues/288)
- Prevent assignee selection from overflowing [#299](https://github.com/openkfw/TruBudget/issues/299)
- Display correct name in notifications [#292](https://github.com/openkfw/TruBudget/issues/292)
- Workflowitem amount is only displayed if amount and exchange rate are available [#297](https://github.com/openkfw/TruBudget/issues/297)
- User is not logged out when viewing a workflow item's history [#317](https://github.com/openkfw/TruBudget/issues/317)

## [1.0.1] - 2019-05-21

### Changed

- Increased Multichain Version to 2.0.1 [#273](https://github.com/openkfw/TruBudget/issues/273)

### Fixed

- Correct number of history items is displayed when history drawer/list is opened [#275](https://github.com/openkfw/TruBudget/issues/275)
- Display formatted string when user edits or deletes projected budget [#279](https://github.com/openkfw/TruBudget/issues/279)
- Previously added documents stay visible after addition of a new document [#268](https://github.com/openkfw/TruBudget/issues/268)
- Navigation on notifications page now works as expected [#287](https://github.com/openkfw/TruBudget/pull/287)
- The link to the project/subproject is now active when the user has permissions to see it [#284](https://github.com/openkfw/TruBudget/issues/284)
- The link to the project/subproject in fly-in notifications correctly redirects the user [#285](https://github.com/openkfw/TruBudget/issues/285)
- When a workflow item is assigned, the new assignee gets notified [#272](https://github.com/openkfw/TruBudget/issues/272)

## [1.0.0] - 2019-05-08

### Added

- Projected budget ratio on project analytics screen [#242](https://github.com/openkfw/TruBudget/pull/242)
- New endpoint `/workflowitem.viewHistory` that returns all changes that have been applied to a particular workflowitem in chronological order. [#252](https://github.com/openkfw/TruBudget/issues/252)
- Each workflowitem's history can now be displayed individually in the frontend. [#252](https://github.com/openkfw/TruBudget/issues/252)
- User gets notified when the projected budget of a project/subproject he/she is assigned to is updated or deleted [#283](https://github.com/openkfw/TruBudget/issues/283)

### Changed

- When adding subprojects, projected budgets are not mandatory anymore [#229](https://github.com/openkfw/TruBudget/issues/229)
- Added groups to provisioning [#57](https://github.com/openkfw/TruBudget/issues/57)
- In the frontend directory, the `.env_example` file was removed and the `.env` file is copied into the Docker container instead [#176](https://github.com/openkfw/TruBudget/issues/176)
- The `additional data` button is now available on all levels and is only displayed if additional data is available [#91](https://github.com/openkfw/TruBudget/issues/91)
- The frontend no longer displays workflowitem history events in a subproject's history; similarly, a project's history no longer contains the historic events of its subprojects. [#252](https://github.com/openkfw/TruBudget/issues/252)

### Deprecated

- `/project.viewHistory` deprecated in favor of `/project.viewHistory.v2`. [#252](https://github.com/openkfw/TruBudget/issues/252)
- `/subproject.viewHistory` deprecated in favor of `/subproject.viewHistory.v2`. [#252](https://github.com/openkfw/TruBudget/issues/252)

### Fixed

- Fixed line of YAML file for master deployments via docker-compose, so that image of excel export service is pulled correctly [#223](https://github.com/openkfw/TruBudget/issues/223)
- Backup/restore works again. [#237](https://github.com/openkfw/TruBudget/issues/237)
- Budgets on project analytics do not contain open workflow items [#230](https://github.com/openkfw/TruBudget/issues/230)
- Fixed a bug where on smaller screens the action buttons (create & cancel) are hidden and no item could be created [#240](https://github.com/openkfw/TruBudget/issues/240)
- Increase frontend stability [#263](https://github.com/openkfw/TruBudget/pull/263)

## [1.0.0-beta.9] - 2019-04-23

### Added

- Export all visible data for a certain user into an excel sheet [#67](https://github.com/openkfw/TruBudget/issues/67)
- Analytics dashboard on project/subproject level [#202](https://github.com/openkfw/TruBudget/pull/202)

### Changed

- Only allow the point character as the decimal sign for a workflowitems' amount and exchangeRate fields. While we generally try to avoid interpreting amounts, this change is important to ensure that values on the chain can be read without knowing the author's locale settings. [#216](https://github.com/openkfw/TruBudget/issues/216)

### Fixed

- `subproject.list` did not return `additionalData` [#214](https://github.com/openkfw/TruBudget/issues/214)

## [1.0.0-beta.8] - 2019-04-11

### Added

- Digit grouping when typing amount of projected budgets [#159](https://github.com/openkfw/TruBudget/issue/159)
- Edit projected budgets of projects and subprojects [#129](https://github.com/openkfw/TruBudget/issue/129)
- External Webhook [#158](https://github.com/openkfw/TruBudget/pull/158)

### Changed

- Reject workflowitem update when document would be overwritten [#205](https://github.com/openkfw/TruBudget/pull/205)

### Fixed

- Schema for workflowitem_update [#212](https://github.com/openkfw/TruBudget/pull/212)
- Sorting of Swagger documentation [#207](https://github.com/openkfw/TruBudget/issues/207)
- Editing of workflowitem when amount type is changed to allocated/disbursed [#171](https://github.com/openkfw/TruBudget/issues/171)
- Alignment of columns in workflowitem table [#141](https://github.com/openkfw/TruBudget/issues/141)
- Display of error snackbar after failed login [#170](https://github.com/openkfw/TruBudget/issues/170)
- Increased the stability of the event sourcing code by replacing the "immer" dependency with a custom implementation. [#196](https://github.com/openkfw/TruBudget/pull/196)
- Provisioning error related to readiness of blockchain/api [#193](https://github.com/openkfw/TruBudget/issue/193)

## [1.0.0-beta.7] - 2019-04-03

### Added

- [Code of conduct](./CODE_OF_CONDUCT.md) and [contributing guidelines](./CONTRIBUTING.md) [#156](https://github.com/openkfw/TruBudget/issues/156)
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

[unreleased]: https://github.com/openkfw/TruBudget/compare/v1.8.0...master
[1.8.0]: https://github.com/openkfw/TruBudget/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/openkfw/TruBudget/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/openkfw/TruBudget/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/openkfw/TruBudget/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/openkfw/TruBudget/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/openkfw/TruBudget/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/openkfw/TruBudget/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/openkfw/TruBudget/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/openkfw/TruBudget/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/openkfw/TruBudget/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.9...v1.0.0
[1.0.0-beta.9]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.8...v1.0.0-beta.9
[1.0.0-beta.8]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.7...v1.0.0-beta.8
[1.0.0-beta.7]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.6...v1.0.0-beta.7
[1.0.0-beta.6]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.5...v1.0.0-beta.6
[1.0.0-beta.5]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.4...v1.0.0-beta.5
[1.0.0-beta.4]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.3...v1.0.0-beta.4
[1.0.0-beta.3]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.2...v1.0.0-beta.3
[1.0.0-beta.2]: https://github.com/openkfw/TruBudget/compare/v1.0.0-beta.1...v1.0.0-beta.2
