const core = require('@actions/core');
const github = require('@actions/github');

export const Config = {
  projects: core.getInput('projects').split(','),
  token: core.getInput('token'),
  issueTitlePrefix: core.getInput('issue_title_prefix') || 'Vulnerability Report:',
  octokit: github.getOctokit(core.getInput('token')),
  repo: github.context.repo
};


export function validateConfig() {
  const { projects, token } = Config;

  if (!projects) {
    throw new Error('Input project names are required');
  }

  if (!token) {
    throw new Error('Input token is required');
  }
}