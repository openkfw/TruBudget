# TruBudget Operation Setup

This setup helps operation teams to setup TruBudget in a easy way, with a pre-configured `.env` file.

## Getting started

To setup TruBudget, you need to install [Docker](https://www.docker.com/community-edition#/download) (version 20.10.7 or higher) and [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29.2 or higher).

First, to make sure the `.env` file is set, run `cp env_example .env`

To start the slim setup (only blockchain, api, frontend), run `bash start-trubudget.sh` or `bash start-trubudget.sh --slim`.

To start the full setup, run `bash start-trubudget.sh --full`.

For further information, run `bash start-trubudget.sh --help`.

### Environment Variables

The environmental variables are located in the file `.env`. You can change them directly.
