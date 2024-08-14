# Wiki: TruBudget Upgrade Folder

## Overview

This folder is used to store files that are essential for communicating with a cron job that handles the upgrade process for the entire TruBudget application.

## Purpose

The primary purpose of this folder is to:

- Store configuration files
- Log upgrade activities

## Usage

1. Configuration Files: These files contain settings and parameters required for the upgrade process.
2. Logs: Logs generated during the upgrade process are stored here for auditing and troubleshooting purposes.

## Cron Job Communication

- The cron job periodically checks this folder for new files or updates.
- Based on the files present, the cron job initiates the necessary upgrade procedures.
- Ensure that all files are correctly formatted and placed in the appropriate subdirectories to avoid any issues during the upgrade process.

## Best Practices

- Regularly update and review the files in this folder.
- Maintain proper version control to track changes.

## Troubleshooting

- Check the logs in this folder if the upgrade process fails.
- Verify the integrity and format of configuration files.
- Ensure that the cron job has the necessary permissions to access and execute the scripts.
