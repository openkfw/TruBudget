import fs from 'fs';
import { Octokit } from '@octokit/core';
import * as dotenv from 'dotenv';
dotenv.config();

const changelogPath = './CHANGELOG.md';
const template = `<!-- ## [x.x.x] - YYYY-MM-DD -->

<!-- ## Unreleased -->

<!-- ### Added -->

<!-- ### Changed -->

<!-- ### Deprecated -->

<!-- ### Removed -->

<!-- ### Fixed -->`;

const run = async () => {
  const version = process.argv[2];
  if (!version) {
    console.error('Version not defined. Run command as `npm run generate-changelog 2.9.0`');

    return;
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })

  const response = await octokit.request('GET /search/issues', {
    q: 'is:closed is:issue milestone:"TruBudget 2.9.0"',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (response.data.incomplete_results) {
    console.log('INCOMPLETE RESULTS');

    return;
  } 

  const issues = response.data.items;

  let changelogText = '';
  issues.forEach(issue => {
    changelogText += `- ${issue.title} [#${issue.number}](${issue.url})\n`;
  });

  const file = fs.readFileSync(changelogPath, 'utf-8');

  const today = new Date();
  const newReleaseChangelog = template.replace('<!-- ## [x.x.x] - YYYY-MM-DD -->',`
## [${version}] - ${today.toISOString().split('T')[0]}`).replace('<!-- ### Added -->',`### Added
  
${changelogText}`);

  const newText = file.replace(template, `${template}
  
  ${newReleaseChangelog}`);

  fs.writeFileSync(changelogPath, newText, 'utf-8');
}

run();