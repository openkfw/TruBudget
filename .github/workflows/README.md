# CI / CD

The TruBudget CI-pipelines uses Github Actions. There are 6 steps which need to be successful in order to make the pipeline pass.

1. **Danger**: The codebase is inspected using [danger](https://danger.systems/js/). To automate common code review processes. Feedback is given in form of comments inside the PR.

2. **Lint**: Performs linting of the codebase.

3 **Audit**: Audit is performed on the codebase to scan for security vulnerabilities.

4. **Test**: Test are triggered as deployment on a private repository. Only executed if changes in one of the subprojects are detected.

5. **Build**: In this step the docker images are build, tagged and pushed to a private docker repository.

6. **Notification**: This step triggers the remote deployment.

### Deployments (CD)
As of now the both master and relase branch are deployed on a private server. Master and release deployments are acessible here: [master](https://a-trubudget-master.do4.sixmarkets.net/login) | [release](https://a-trubudget-1-x-x-release.do4.sixmarkets.net/login)