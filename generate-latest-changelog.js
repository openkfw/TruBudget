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
    q: `is:closed is:issue milestone:"TruBudget ${version}"`,
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
  console.log(issues[0]);
  issues.forEach(issue => {
    changelogText += `- ${issue.title} [#${issue.number}](${issue.html_url})\n`;
  });

  const file = fs.readFileSync(changelogPath, 'utf-8');

  const today = new Date();
  const newReleaseChangelog = template.replace('<!-- ## [x.x.x] - YYYY-MM-DD -->',`
## [${version}] - ${today.toISOString().split('T')[0]}`).replace('<!-- ### Added -->',`### Added
  
${changelogText}`);

  const newText = file.replace(template, `${template}
  
  ${newReleaseChangelog}`)
    .replace(/\[unreleased\]: https:\/\/github\.com\/openkfw\/TruBudget\/compare\/v(\d+\.\d+\.\d+)\.\.\.main[\r\n]\[(\d+\.\d+\.\d+)\]/m,
    `[unreleased]: https://github.com/openkfw/TruBudget/compare/v${version}...main\n[${version}]: https://github.com/openkfw/TruBudget/compare/v$1...v${version}\n[$1]`
    );

  fs.writeFileSync(changelogPath, newText, 'utf-8');
}

run();