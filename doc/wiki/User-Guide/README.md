# User Guide

This tutorial explains which functions Trubudget has and how they work.
The documentation is organized in following sections:

## Users/Groups

Learn how to create Users/Groups and how or when they are notified.

- [User](./Users-Groups/User.md)
- [Group](./Users-Groups/Group.md)
- [Notifications](./Notifications.md)

## Permissions

Learn which permissions exist in Trubudget and how to grant/revoke them.

- [Permissions](./Permissions.md)

## Projects

Learn how to create and work with projects and their components.

- [Project](./Projects/Project.md)
- [Subproject](./Projects/Subproject.md)
- [Workflow](./Projects/Workflowitem.md)

## Network

Learn how to approve other organizations or nodes to expand your Trubudget network.

- [Nodes](./Network/Nodes.md)

## Backups

Learn how to download or upload a backup of the current data (multichain instance) as a _root_ user.

- [Backup](./Backup.md)

## Versions

Learn where to find the versions of all Trubudget components

- [Versions](./Versions.md)

## FAQ

### How can I change the default project background images?

Changing these images is only possible by replacing the Thumbnail\_\*.jpg files in the `frontend/public` folder.

**Notes:**

Changes are only applied after restarting the frontend.
Filenames `Thumbnail_0001.jpg` - `Thumbnail_0024.jpg` have to stay the same.
`Thumbnail_0025.jpg` and above are ignored.
