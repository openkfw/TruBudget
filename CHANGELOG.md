# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

### Added

- Add a warning in the workflowitem dialog for overwriting permissions [#1189](https://github.com/openkfw/TruBudget/issues/1189)

<!-- ### Changed -->

- Fixed a bug where the confirmation dialog remains frozen in case of error [#1105](https://github.com/openkfw/TruBudget/issues/1105)

<!-- ### Deprecated -->

<!-- ### Removed -->

## [2.0.1] - 2022-06-24

### Changed

- Use unicode properties for regex validation schemas [#1202](https://github.com/openkfw/TruBudget/issues/1202)

## [2.0.0] - 2022-06-08

<!-- ### Added -->

### Changed

- Replaced the master branch name and image tag with main [#1098](https://github.com/openkfw/TruBudget/pull/1098)
- Replaced master and slave terminology with alpha and beta [#1098](https://github.com/openkfw/TruBudget/issues/1068)
- All services use `PORT` environment variable to describe their own service port [#999](https://github.com/openkfw/TruBudget/issues/999)
- All services use `[SERVICE_NAME]_ENABLED=true` to describe an enabled service [#999](https://github.com/openkfw/TruBudget/issues/999)
- Renamed `RPC...` environment variables to `MULTICHAIN_RPC...` e.g. `RPC_PORT` to `MULTICHAIN_RPC_PORT` [#999](https://github.com/openkfw/TruBudget/issues/999)
- All services serve a liveness and readiness endpoint [#1122] (https://github.com/openkfw/TruBudget/issues/1122)
- Add stricter validation for strings, ids and passwords [#1029](https://github.com/openkfw/TruBudget/issues/1029)
- Additional check for backup version in backup endpoint [#1076](https://github.com/openkfw/TruBudget/issues/1076)
- Group.addUser supports more than one user [#725](https://github.com/openkfw/TruBudget/issues/725)
- Remove test/prod environment from frontend including environment variables `TEST_API_HOST`/`TEST_API_PORT` changed to `API_HOST`/`API_PORT` [#954](https://github.com/openkfw/TruBudget/issues/954)

### Deprecated

- Remove v1 of history endpoints [#1152](https://github.com/openkfw/TruBudget/issues/1152)

### Removed

- project.list and subproject.list do not contain the `log` property anymore (use history endpoint instead) [#1132](https://github.com/openkfw/TruBudget/issues/1132)
- Storing offchain documents using the multichain feature is removed, storage-service must be used instead [#1042](https://github.com/openkfw/TruBudget/issues/1042)

<!-- ### Fixed -->

## [1.30.0] - 2022-06-08

### Added

- Added a List-View for projects [#1127](https://github.com/openkfw/TruBudget/pull/1127)
- Added provisioning user to documentation [#1048](https://github.com/openkfw/TruBudget/pull/1048)

### Changed

- A root user can not modify users of other organizations
  anymore [#983](https://github.com/openkfw/TruBudget/issues/983)
- API readiness improvement: API waits for all connected services to be
  up [#1173](https://github.com/openkfw/TruBudget/pull/1173)

<!-- ### Deprecated -->

<!-- ### Removed -->

### Fixed

- Fixed date picker for setting dates in another timezone [#1082](https://github.com/openkfw/TruBudget/issues/1082)
- Fixed date picker to type a date with keyboard [#1081](https://github.com/openkfw/TruBudget/issues/1081)
- Fixed a bug where it was not possible to upload documents to a workflowitem if the file name contained special
  characters or accents [#1054](https://github.com/openkfw/TruBudget/issues/1054)
- Updated bare-metal documentation [#1156](https://github.com/openkfw/TruBudget/issues/1156)

## [2.0.0] -

<!-- ### Added -->

<!-- ### Changed -->

<!-- ### Deprecated -->

### Removed

- Removed the option to upload documents to the MultiChain offchain storage [#1042](https://github.com/openkfw/TruBudget/issues/1042)

<!-- ### Fixed -->

## [2.0.0] -

<!-- ### Added -->

<!-- ### Changed -->

<!-- ### Deprecated -->

### Removed

- Removed the option to upload documents to the MultiChain offchain storage [#1042](https://github.com/openkfw/TruBudget/issues/1042)

<!-- ### Fixed -->

## [1.29.0] - 2022-03-02

### Added

- Possibility to pass SSL certificate for blockchain network
  request [#1038](https://github.com/openkfw/TruBudget/pull/1038).

### Fixed

- Fixed the error log output of multichain errors which were not displayed in a readable
  format [#1037](https://github.com/openkfw/TruBudget/pull/1037)
- Fixed too strict input restrictions which led to unexpected
  errors [#1027](https://github.com/openkfw/TruBudget/issues/1027)

## [1.28.1] - 2021-12-16

### Fixed

- Validation issues for special chars in input fields [#1027](https://github.com/openkfw/TruBudget/issues/1027).
- Fixed document download for files not present in the cache [#1022](https://github.com/openkfw/TruBudget/issues/1022).

## [1.28.0] - 2021-12-10

### Changed

- Allow all apostrophe types for Trubudget fields [#1019](https://github.com/openkfw/TruBudget/pull/1019).

### Fixed

- Documents saved via Trubudget's default storage (offchain multichain) are not cached
  anymore [#1022](https://github.com/openkfw/TruBudget/issues/1022).
- Trubudget ignores not known Events or bad formatted Events instead of
  exiting [#1017](https://github.com/openkfw/TruBudget/issues/1017).

## [1.27.0] - 2021-11-10

### Added

- Add an option to setup two organizations (two 2 nodes) with the operation and developer docker
  setup [#932](https://github.com/openkfw/TruBudget/issues/932).
- Add Logging for Frontend: Log messages can now be displayed in
  backend [#1000](https://github.com/openkfw/TruBudget/pull/1000).

### Changed

- Require a password confirmation on user creation [#984](https://github.com/openkfw/TruBudget/issues/984).

## [1.26.0] - 2021-09-23

- Optional blockchain network configuration so user can sign transactions with their own
  address [#943](https://github.com/openkfw/TruBudget/issues/955).

### Changed

- The email-notificaiton-service environment variable MODE changed to AUTHENTICATION. The values are `jwt` for
  JWT-authentication and `none` to ignore authentication [#928](https://github.com/openkfw/TruBudget/issues/928).

### Fixed

- Fixed a bug where it was possible to create users and groups with the same id. This will not be allowed in the future.
  However, if a user and a group with the same id already exist in the same network the permission system will not work
  correctly, so the user should be disabled by the admin [#943](https://github.com/openkfw/TruBudget/issues/943).
- Fixed penetration-test results [#943](https://github.com/openkfw/TruBudget/pull/973).

## [1.25.0] - 2021-08-31

### Added

- Add a bash script for a quick and easy TruBudget setup [#905](https://github.com/openkfw/TruBudget/issues/905)
- Add possibility to reject a workflowitem [#845](https://github.com/openkfw/TruBudget/issues/845)
- Add Permission Required dialog [#933](https://github.com/openkfw/TruBudget/issues/933)
- Disable download option for documents that are not available
  anymore [#944](https://github.com/openkfw/TruBudget/issues/944)

### Fixed

- Fixed group permissions were not considered when checking permissions for an
  action [#907](https://github.com/openkfw/TruBudget/issues/907)
- Fixed exception when revoking and adding permissions in one
  step [#922](https://github.com/openkfw/TruBudget/issues/922)

## [1.24.0] - 2021-08-05

### Added

- Added currency swiss franc to TruBudget [#899](https://github.com/openkfw/TruBudget/issues/899)
- Added type of history to history list [#895](https://github.com/openkfw/TruBudget/issues/895)
- Added option to enable encryption of data saved on chain [#832](https://github.com/openkfw/TruBudget/issues/832)

### Changed

- Improved documentation for the document feature [#830](https://github.com/openkfw/TruBudget/issues/830)

## [1.23.0] - 2021-07-08

### Added

- Trubudget's documentation is now available on our [website](https://openkfw.github.io/trubudget-website/docs/README)
- [Trubudget boards](https://github.com/openkfw/TruBudget/projects) including
  the [roadmap](https://github.com/openkfw/TruBudget/projects/2) and easy to follow sprint boards which shows the
  current development.

### Changed

- The document id passed by the user on document creation in older versions may not be specified anymore. The filename
  of the uploaded document is used instead. [#837](https://github.com/openkfw/TruBudget/issues/837)
- The change above also affects previously uploaded documents. Only the file's names are shown not the passed ids.

### Deprecated

- We move our communication from gitter to [github discussions](https://github.com/openkfw/TruBudget/discussions)

### Fixed

- Fixed a bug where it was not possible to upload files bigger than ~10MB (current limit:
  50MB)[#843](https://github.com/openkfw/TruBudget/issues/843)

## [1.22.0] - 2021-06-02

### Added

- Add a document feature that allows users to share documents that are published on an external storage with other
  organizations if `workflowitem.view` permissions are shared. Additional configurations for activating the feature are
  needed. [#809](https://github.com/openkfw/TruBudget/pull/809)
- Add multichain feed documentation [#814](https://github.com/openkfw/TruBudget/issues/814)

## [1.21.0] - 2021-05-06

### Added

- Add currency tunisian dinar to TruBudget [#806](https://github.com/openkfw/TruBudget/issues/806)
- Add currency ethiopian birr to TruBudget [#813](https://github.com/openkfw/TruBudget/issues/813)
- Add currency norwegian krone to TruBudget [#817](https://github.com/openkfw/TruBudget/issues/817)

## [1.20.0] - 2021-03-15

### Added

- Extend confirmation dialog by showing all actions executed after workflowitem
  creation [#724](https://github.com/openkfw/TruBudget/issues/724)
- Added a decline option on the nodes page, which hides the request for everyone in an
  organization [#27](https://github.com/openkfw/TruBudget/issues/27)
- Update the network table to have two tabs, for approved and declined nodes. Show more info for each node in the
  approved list [785](https://github.com/openkfw/TruBudget/issues/785)
- Display connection status for each Multichain node [#746](https://github.com/openkfw/TruBudget/issues/746)
- Display a "last seen" timestamp that is updated once every 24h [#774](https://github.com/openkfw/TruBudget/issues/774)

### Fixed

- Fixed action counter in confirmation dialog [#697](https://github.com/openkfw/TruBudget/issues/697)

## [1.19.1] - 2021-03-15

### Fixed

- Fixed a bug documents cannot be downloaded across organizations [#761](https://github.com/openkfw/TruBudget/pull/802)

## [1.19.0] - 2021-02-10

### Added

- Display history for each workflow item [#236](https://github.com/openkfw/TruBudget/issues/236)
- Added attachmentfile icon in workflow table [#234](https://github.com/openkfw/TruBudget/issues/234)

### Fixed

- Fixed a bug in the confirmation dialog because of missing additional
  actions [#761](https://github.com/openkfw/TruBudget/issues/761)
- Prevent the background image from zooming in when open a dialog [#29](https://github.com/openkfw/TruBudget/issues/29)

### Changed

- Add Min.io to storage files [#757](https://github.com/openkfw/TruBudget/pull/757)

## [1.18.0] - 2021-01-14

### Fixed

- Fixed the width of dropdowns in workflowitem batch edit [#678](https://github.com/openkfw/TruBudget/issues/678)
- Fixed Actions table of confirmation dialog alignment [#677](https://github.com/openkfw/TruBudget/issues/677)

### Added

- Added multiple selection to user selection for groups [#679](https://github.com/openkfw/TruBudget/issues/679)

## [1.17.0] - 2020-12-10

### Added

- Added a close button in user selections [#614](https://github.com/openkfw/TruBudget/issues/614)
- Added a search field in the validator selection [#639](https://github.com/openkfw/TruBudget/issues/639)
- Added groups to batch permission assignment [#612](https://github.com/openkfw/TruBudget/issues/612)
- Added scroll back to top button [#579](https://github.com/openkfw/TruBudget/issues/579)

### Changed

- The assignee on project/subproject was renamed into owner [#643](https://github.com/openkfw/TruBudget/issues/643)

### Fixed

- Fixed a bug in checkbox and baseline aligment in workflowitem [#707](https://github.com/openkfw/TruBudget/issues/707)
- Fixed a bug in no due date set in workflowedit [#708](https://github.com/openkfw/TruBudget/issues/708)
- Restricted workflowitems are now working as expected [#643](https://github.com/openkfw/TruBudget/issues/643)
- Fixed a Bug where labels e.g. on login ID field were too large and not readable
  anymore [#625](https://github.com/openkfw/TruBudget/issues/625)
- Fixed some translations as specified in [#655](https://github.com/openkfw/TruBudget/issues/655)

## [1.16.0] - 2020-11-16

### Added

- The export of the excel file is now available in all TruBudget
  languages [#567](https://github.com/openkfw/TruBudget/issues/567)
- Added a validator field on the subproject level [#572](https://github.com/openkfw/TruBudget/issues/572)
- Added an option to set a fixed worklowitem type on subproject
  level [#572](https://github.com/openkfw/TruBudget/issues/572)

### Changed

- Update french translations [#588](https://github.com/openkfw/TruBudget/pull/588)
- Removed the close permissions on all levels. Now only the specific assignee is permitted to close
  these. [#572](https://github.com/openkfw/TruBudget/issues/572)
- Moved View permissions component from Admin section to View Permissions section in Permission dialog at project level,
  subproject level and workflow item level [#613](https://github.com/openkfw/TruBudget/issues/613)

### Fixed

- Fixed a bug where the user needed list-permissions that are not
  necessary [#562](https://github.com/openkfw/TruBudget/issues/562)
- Fixed a bug where the confirmation dialog persists after pressing the browser's back
  button [#544](https://github.com/openkfw/TruBudget/issues/544)
- Project tags now allow accents and upper and lowercase letters [#568](https://github.com/openkfw/TruBudget/issues/568)

## [1.15.0] - 2020-10-27

### Added

- Script for fixing invalid backup files, as a workaround to
  issue [#513](https://github.com/openkfw/TruBudget/issues/513)
- Status page to show connection quality of all Trubudget
  services [#553](https://github.com/openkfw/TruBudget/issues/553)

### Changed

- Changed some french translations [#566](https://github.com/openkfw/TruBudget/issues/566)

### Fixed

- The edit button is now only visible to the user that created
  it [#556](https://github.com/openkfw/TruBudget/issues/556)
- Fixed a bug where a user can disable himself [#554](https://github.com/openkfw/TruBudget/issues/554)
- Fixed a bug where multiple loading indicators are shown in the confirmation
  dialog [#555](https://github.com/openkfw/TruBudget/issues/555)
- Show the loading indicator while uploading a document [#558](https://github.com/openkfw/TruBudget/issues/558)
- Fixed a style bug for adding users to a group [#557](https://github.com/openkfw/TruBudget/issues/557)

## [1.14.0] - 2020-10-07

### Added

- Security FAQ [#542](https://github.com/openkfw/TruBudget/pull/542)

### Fixed

- Fixed a bug where the email field dissappears in the user
  profile [#551](https://github.com/openkfw/TruBudget/issues/551)
- Fixed a bug where opening the user profile resulted in an
  error [#549](https://github.com/openkfw/TruBudget/issues/549)
- Allow typing a comma separator when editing a projected budget [#517](https://github.com/openkfw/TruBudget/issues/517)
- Projected budgets are shown in the language specific format [#559](https://github.com/openkfw/TruBudget/issues/559)
- Fixed a bug where the workflowitem budget changes its value
  unexpectly [#563](https://github.com/openkfw/TruBudget/issues/563)

# [1.13.0] - 2020-09-16

### Added

- Added confirmation dialog for disabling and enabling users [#537](https://github.com/openkfw/TruBudget/pull/537)
- Added table of user assignments for disable users dialog [#537](https://github.com/openkfw/TruBudget/pull/537)

### Fixed

- Fixed the global permission list to set permissions to disable or enable
  users [#537](https://github.com/openkfw/TruBudget/pull/537)

# [1.12.0] - 2020-08-10

### Added

- Documentation of how to update/backup a node correctly [#19](https://github.com/openkfw/TruBudget/issues/19)
- Added feature to disable and enable users [#241](https://github.com/openkfw/TruBudget/issues/241)

### Fixed

- Fixed a bug where it was impossible to edit an email address of a
  user [#510](https://github.com/openkfw/TruBudget/issues/510)
- The excel sheet is now exported including the fields `dueDate`
  and `workflowitemType` [#511](https://github.com/openkfw/TruBudget/issues/511)
- Fixed a bug where all displayed versions disappeared after switching
  page [#512](https://github.com/openkfw/TruBudget/issues/512)
- Prevent a user from revoking a permission from him-/herself at workflowitem
  level [#514](https://github.com/openkfw/TruBudget/issues/514)
- Prevent creating a closed workflowitem, subproject or project [#411](https://github.com/openkfw/TruBudget/issues/411)

# [1.11.0] - 2020-06-26

### Added

- Add optional due-date for workflowitems [#71](https://github.com/openkfw/TruBudget/issues/71)
- Workflowitem are typed. New types: "general", "restricted" [#483](https://github.com/openkfw/TruBudget/issues/483)

### Changed

- Change field names for user creation [#498](https://github.com/openkfw/TruBudget/issues/498)
- Hide project search button instead of disabling it [#497](https://github.com/openkfw/TruBudget/issues/497)
- Hide badge of due date when sorting workflowitems [#505](https://github.com/openkfw/TruBudget/issues/505)

### Fixed

- Fixed a bug where the configuration of the Email notification service was not applied
  correctly [#496](https://github.com/openkfw/TruBudget/pull/496)
- Fixed a bug where the history of a workflowitem was duplicated by switching
  tabs[#504](https://github.com/openkfw/TruBudget/issues/504)

# [1.10.0] - 2020-06-08

### Added

- Show dialog before closing project, subproject or workflowitem [#430](https://github.com/openkfw/TruBudget/issues/430)
- Show privacy notice when creating a user or user group [#466](https://github.com/openkfw/TruBudget/issues/466)
- Added search feature for histories [#425](https://github.com/openkfw/TruBudget/issues/425)
- Documents can be uploaded and are shared via offchain-storage [#481](https://github.com/openkfw/TruBudget/issues/481)

### Changed

- Changed date format to DD.MM.YYYY [#480](https://github.com/openkfw/TruBudget/issues/480)

# [1.9.0] - 2020-05-06

### Added

- Added search feature for subprojects [#422](https://github.com/openkfw/TruBudget/issues/422)
- Show no permissions assigned warning on subproject/workflowitem
  create [#441](https://github.com/openkfw/TruBudget/issues/441)
- Placeholders are being shown in case of an empty state [#31](https://github.com/openkfw/TruBudget/issues/31)

# [1.8.0] - 2019-03-16

### Added

- Email notification service [#419](https://github.com/openkfw/TruBudget/issues/419)

### Fixed

- Implement group permissions correctly [#440](https://github.com/openkfw/TruBudget/issues/440)
- Fix permissions for viewing summary [#440](https://github.com/openkfw/TruBudget/issues/440)

# [1.7.0] - 2019-02-10

### Added

- Support georgian language [#427](https://github.com/openkfw/TruBudget/issues/427)

### Fixed

- Remember language after logout [#420](https://github.com/openkfw/TruBudget/issues/420)

### Changed

- Format currencies and numbers according to the selected language or
  locale [#135](https://github.com/openkfw/TruBudget/issues/135)
  - History and notification timestamps only display
    year/month/day [#426](https://github.com/openkfw/TruBudget/issues/426)

## [1.6.0] - 2019-01-07

### Added

- Search via URL query [#353](https://github.com/openkfw/TruBudget/issues/353)

### Changed

- The analytics total budget is shown whether the user has insufficient permissions or
  not [#410](https://github.com/openkfw/TruBudget/pull/410)
- Highlight matches when searching [#356](https://github.com/openkfw/TruBudget/issues/356)
- Projects can be searched via prefixes. Tag, display name and status are searched for
  matches. [#359](https://github.com/openkfw/TruBudget/issues/359)
- Tags can be searched via click on tag [#367](https://github.com/openkfw/TruBudget/issues/367)

### Fixed

- Users are properly logged out when clicking the logout button[#402](https://github.com/openkfw/TruBudget/issues/402)
- User are not created anymore if the passed organization does not
  exist[#358](https://github.com/openkfw/TruBudget/issues/358)

## [1.5.0] - 2019-11-27

### Changed

- Granting or revoking project/subproject/workflowitem permissions opens a confirmation
  dialog [#250](https://github.com/openkfw/TruBudget/pull/250)
- Assigning a user opens a confirmation dialog[#251](https://github.com/openkfw/TruBudget/pull/251)

### Fixed

- Multiple workflowitems can be edited and reordered [#397](https://github.com/openkfw/TruBudget/issues/397)
- The api endpoint "project.intent.listPermissions" checks for the right
  permission [#393](https://github.com/openkfw/TruBudget/issues/393)
- The edit button of a project/subproject shouldn't be shown when the user has no permissions to
  update [#395](https://github.com/openkfw/TruBudget/issues/395)

## [1.4.1] - 2019-10-11

### Fixed

- Root user cannot grant global permissions (admin permissions) to first user

### Known Issues

- Multiple workflowitems cannot be edited at once nor reordered #397

## [1.4.0] - 2019-09-04

### Changed

- A new user called 'root' cannot be added [#369](https://github.com/openkfw/TruBudget/issues/369)
- If a user changes his/her password, the new password has to follow security
  guidelines [#370](https://github.com/openkfw/TruBudget/issues/370)
- Disallow root to create projects [#375](https://github.com/openkfw/TruBudget/issues/375)
- Disallow root to create subprojects [#378](https://github.com/openkfw/TruBudget/issues/378)
- Disallow root to add workflowitems [#380](https://github.com/openkfw/TruBudget/issues/380)
- Allow user 'root' to change the passwords of all users [#366](https://github.com/openkfw/TruBudget/issues/366)
- Rework the editing of project/subproject/workflowitem/global
  permissions [#245](https://github.com/openkfw/TruBudget/issues/245)
- Improve project/subproject details-layout and handling of long
  names [#274](https://github.com/openkfw/TruBudget/issues/274)

### Fixed

- Check if assignee does exist when assigning to a
  project/subproject/workflowitem [#83](https://github.com/openkfw/TruBudget/issues/83)

## [1.3.0] - 2019-07-31

### Added

- Added search feature for overview page [#347](https://github.com/openkfw/TruBudget/issues/347)
- Added project tags [#342](https://github.com/openkfw/TruBudget/issues/342)

### Changed

- Organizations and currencies for projected budgets of subprojects can only be selected from values of the parent
  project [#228](https://github.com/openkfw/TruBudget/issues/228)
- Global permissions can only be granted/revoked to/from users within the same
  organizations [#340](https://github.com/openkfw/TruBudget/issues/340)
- Don't display edit/permission/close button if the user does not have the permissions for the
  action [#235](https://github.com/openkfw/TruBudget/issues/235)
- Updated postman collection including a postman environment[#199](https://github.com/openkfw/TruBudget/issues/199)

### Removed

- Permissions button is removed for groups [#345](https://github.com/openkfw/TruBudget/issues/345)

### Fixed

- Added backwards compatibility for future versions [#360](https://github.com/openkfw/TruBudget/issues/360)
- If a user has permissions to view subproject details, but not the permissions to see the parent project, he/she can
  still view the subproject details [#282](https://github.com/openkfw/TruBudget/issues/282)

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
- Don't display view button if user is not allowed to see
  project/subproject [#302](https://github.com/openkfw/TruBudget/issues/302)

### Fixed

- Empty history displayed after API call is finished [#294](https://github.com/openkfw/TruBudget/issues/294)
- Last page of notifications displays correct number of items [#288](https://github.com/openkfw/TruBudget/issues/288)
- Prevent assignee selection from overflowing [#299](https://github.com/openkfw/TruBudget/issues/299)
- Display correct name in notifications [#292](https://github.com/openkfw/TruBudget/issues/292)
- Workflowitem amount is only displayed if amount and exchange rate are
  available [#297](https://github.com/openkfw/TruBudget/issues/297)
- User is not logged out when viewing a workflow item's history [#317](https://github.com/openkfw/TruBudget/issues/317)

## [1.0.1] - 2019-05-21

### Changed

- Increased Multichain Version to 2.0.1 [#273](https://github.com/openkfw/TruBudget/issues/273)

### Fixed

- Correct number of history items is displayed when history drawer/list is
  opened [#275](https://github.com/openkfw/TruBudget/issues/275)
- Display formatted string when user edits or deletes projected
  budget [#279](https://github.com/openkfw/TruBudget/issues/279)
- Previously added documents stay visible after addition of a new
  document [#268](https://github.com/openkfw/TruBudget/issues/268)
- Navigation on notifications page now works as expected [#287](https://github.com/openkfw/TruBudget/pull/287)
- The link to the project/subproject is now active when the user has permissions to see
  it [#284](https://github.com/openkfw/TruBudget/issues/284)
- The link to the project/subproject in fly-in notifications correctly redirects the
  user [#285](https://github.com/openkfw/TruBudget/issues/285)
- When a workflow item is assigned, the new assignee gets
  notified [#272](https://github.com/openkfw/TruBudget/issues/272)

## [1.0.0] - 2019-05-08

### Added

- Projected budget ratio on project analytics screen [#242](https://github.com/openkfw/TruBudget/pull/242)
- New endpoint `/workflowitem.viewHistory` that returns all changes that have been applied to a particular workflowitem
  in chronological order. [#252](https://github.com/openkfw/TruBudget/issues/252)
- Each workflowitem's history can now be displayed individually in the
  frontend. [#252](https://github.com/openkfw/TruBudget/issues/252)
- User gets notified when the projected budget of a project/subproject he/she is assigned to is updated or
  deleted [#283](https://github.com/openkfw/TruBudget/issues/283)

### Changed

- When adding subprojects, projected budgets are not mandatory
  anymore [#229](https://github.com/openkfw/TruBudget/issues/229)
- Added groups to provisioning [#57](https://github.com/openkfw/TruBudget/issues/57)
- In the frontend directory, the `.env_example` file was removed and the `.env` file is copied into the Docker container
  instead [#176](https://github.com/openkfw/TruBudget/issues/176)
- The `additional data` button is now available on all levels and is only displayed if additional data is
  available [#91](https://github.com/openkfw/TruBudget/issues/91)
- The frontend no longer displays workflowitem history events in a subproject's history; similarly, a project's history
  no longer contains the historic events of its subprojects. [#252](https://github.com/openkfw/TruBudget/issues/252)

### Deprecated

- `/project.viewHistory` deprecated in favor of `/project.viewHistory.v2`
  . [#252](https://github.com/openkfw/TruBudget/issues/252)
- `/subproject.viewHistory` deprecated in favor of `/subproject.viewHistory.v2`
  . [#252](https://github.com/openkfw/TruBudget/issues/252)

### Fixed

- Fixed line of YAML file for master deployments via docker-compose, so that image of excel export service is pulled
  correctly [#223](https://github.com/openkfw/TruBudget/issues/223)
- Backup/restore works again. [#237](https://github.com/openkfw/TruBudget/issues/237)
- Budgets on project analytics do not contain open workflow
  items [#230](https://github.com/openkfw/TruBudget/issues/230)
- Fixed a bug where on smaller screens the action buttons (create & cancel) are hidden and no item could be
  created [#240](https://github.com/openkfw/TruBudget/issues/240)
- Increase frontend stability [#263](https://github.com/openkfw/TruBudget/pull/263)

## [1.0.0-beta.9] - 2019-04-23

### Added

- Export all visible data for a certain user into an excel sheet [#67](https://github.com/openkfw/TruBudget/issues/67)
- Analytics dashboard on project/subproject level [#202](https://github.com/openkfw/TruBudget/pull/202)

### Changed

- Only allow the point character as the decimal sign for a workflowitems' amount and exchangeRate fields. While we
  generally try to avoid interpreting amounts, this change is important to ensure that values on the chain can be read
  without knowing the author's locale settings. [#216](https://github.com/openkfw/TruBudget/issues/216)

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
- Editing of workflowitem when amount type is changed to
  allocated/disbursed [#171](https://github.com/openkfw/TruBudget/issues/171)
- Alignment of columns in workflowitem table [#141](https://github.com/openkfw/TruBudget/issues/141)
- Display of error snackbar after failed login [#170](https://github.com/openkfw/TruBudget/issues/170)
- Increased the stability of the event sourcing code by replacing the "immer" dependency with a custom
  implementation. [#196](https://github.com/openkfw/TruBudget/pull/196)
- Provisioning error related to readiness of blockchain/api [#193](https://github.com/openkfw/TruBudget/issue/193)

## [1.0.0-beta.7] - 2019-04-03

### Added

- [Code of conduct](./CODE_OF_CONDUCT.md)
  and [contributing guidelines](./CONTRIBUTING.md) [#156](https://github.com/openkfw/TruBudget/issues/156)
- Refined [getting-started guide](./README.md) [#185](https://github.com/openkfw/TruBudget/pull/185) and installation
  guides [#180](https://github.com/openkfw/TruBudget/pull/180)

### Changed

- Error message for user logging in on another organization's
  node [#174](https://github.com/openkfw/TruBudget/issues/174)
- JWT validity set to 8 hours [#160](https://github.com/openkfw/TruBudget/issue/160)

### Fixed

- notifications do not work according to wrong notification.list
  schema [#182](https://github.com/openkfw/TruBudget/issues/182) [#183](https://github.com/openkfw/TruBudget/issues/183)
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

[unreleased]: https://github.com/openkfw/TruBudget/compare/v2.0.1...main
[2.0.1]: https://github.com/openkfw/TruBudget/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/openkfw/TruBudget/compare/v1.30.0...v2.0.0
[1.30.0]: https://github.com/openkfw/TruBudget/compare/v1.29.0...v1.30.0
[1.29.0]: https://github.com/openkfw/TruBudget/compare/v1.28.1...v1.29.0
[1.28.1]: https://github.com/openkfw/TruBudget/compare/v1.28.0...v1.28.1
[1.28.0]: https://github.com/openkfw/TruBudget/compare/v1.27.0...v1.28.0
[1.27.0]: https://github.com/openkfw/TruBudget/compare/v1.26.0...v1.27.0
[1.26.0]: https://github.com/openkfw/TruBudget/compare/v1.25.0...v1.26.0
[1.25.0]: https://github.com/openkfw/TruBudget/compare/v1.24.0...v1.25.0
[1.24.0]: https://github.com/openkfw/TruBudget/compare/v1.23.0...v1.24.0
[1.23.0]: https://github.com/openkfw/TruBudget/compare/v1.22.0...v1.23.0
[1.22.0]: https://github.com/openkfw/TruBudget/compare/v1.21.0...v1.22.0
[1.21.0]: https://github.com/openkfw/TruBudget/compare/v1.20.0...v1.21.0
[1.20.0]: https://github.com/openkfw/TruBudget/compare/v1.19.1...v1.20.0
[1.19.1]: https://github.com/openkfw/TruBudget/compare/v1.19.0...v1.19.1
[1.19.0]: https://github.com/openkfw/TruBudget/compare/v1.18.0...v1.19.0
[1.18.0]: https://github.com/openkfw/TruBudget/compare/v1.17.0...v1.18.0
[1.17.0]: https://github.com/openkfw/TruBudget/compare/v1.16.0...v1.17.0
[1.16.0]: https://github.com/openkfw/TruBudget/compare/v1.15.0...v1.16.0
[1.15.0]: https://github.com/openkfw/TruBudget/compare/v1.14.0...v1.15.0
[1.14.0]: https://github.com/openkfw/TruBudget/compare/v1.13.0...v1.14.0
[1.13.0]: https://github.com/openkfw/TruBudget/compare/v1.12.0...v1.13.0
[1.12.0]: https://github.com/openkfw/TruBudget/compare/v1.11.0...v1.12.0
[1.11.0]: https://github.com/openkfw/TruBudget/compare/v1.10.0...v1.11.0
[1.10.0]: https://github.com/openkfw/TruBudget/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/openkfw/TruBudget/compare/v1.8.0...v1.9.0
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
