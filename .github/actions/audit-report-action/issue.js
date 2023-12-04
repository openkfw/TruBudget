import { Config } from "./config";

const octokit = Config.octokit;
const repo = Config.repo;
const issueTitlePrefix = Config.issueTitlePrefix;

export async function createOrUpdateIssues(vulnerabilityIdProjectMapping, activeVulnerabilities) {
  // Get all security labeled open issues
  const { data: securityOpenIssues } = await octokit.rest.issues.listForRepo({
    ...repo,
    state: 'open',
    labels: ['security']
  });

  const vulnerabilityIssues = securityOpenIssues.filter(issue => issue.title.includes(issueTitlePrefix));

  await Promise.all(activeVulnerabilities.map((vulnerability) => {
    const { source: id, name } = vulnerability.via[0];
    const issueTitle = `${issueTitlePrefix} ${id} - ${name}`;
    const issue = vulnerabilityIssues.filter(issue => issue.title === issueTitle)[0];
    if (issue) {
      updateExistingIssue(issue, vulnerabilityIdProjectMapping.get(id));
    } else {
      createNewIssue(vulnerability, vulnerabilityIdProjectMapping.get(id), issueTitle);
    }
  }));

  // Close issues referencing fixed vulnerabilities if not closed manually.
  await closeOldIssues(vulnerabilityIssues, vulnerabilityIdProjectMapping);
}

async function updateExistingIssue(issue, affectedProjects) {
  const issueNumber = issue.number;
  let issueBody = issue.body.replace(/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/gm, new Date(Date.now()).toLocaleDateString());
  let appendClosingListTag = false;

  for (const affectedProject of affectedProjects) {
    const element = `<li>${affectedProject}</li>`;
    if (!issueBody.includes(element)) {
      issueBody = issueBody.replace(/\<\/ul\>/gm, element);
      appendClosingListTag = true;
    }
  }
  return octokit.rest.issues.update({
    ...repo,
    issue_number: issueNumber,
    body: appendClosingListTag ? issueBody.concat('</ul>') : issueBody
  });
}

async function createNewIssue(vulnerability, affectedProjects, issueTitle) {
  const { source: id, name, title, severity, url } = vulnerability.via[0];
  const effects = vulnerability.effects;
  const newIssueBody = `<h2 id="last-checked-date-">Last checked date:</h2>
    <p>${new Date(Date.now()).toLocaleDateString()}</p>
    <h2 id="vulnerability-information">Vulnerability Information</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Title</th>
          <th>Severity</th>
          <th>URL</th>
          <th>Effects</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${id}</td>
          <td>${name}</td>
          <td>${title}</td>
          <td>${severity}</td>
          <td><a href="${url}">${url}</a></td>
          <td>${effects.toString()}</td>
        </tr>
      </tbody>
    </table>
    <h2 id="affected-projects">Affected Projects</h2>
    <ul>
      ${affectedProjects.map(project => `<li>${project}</li>`).join('')}
    </ul>`;

  return octokit.rest.issues.create({
    ...repo,
    title: issueTitle,
    body: newIssueBody,
    labels: ["security"]
  });
}

async function closeOldIssues(vulnerabilityIssues, vulnerabilityIdProjectMapping) {
  const inactiveVulnerabilityIssues = vulnerabilityIssues.filter((vulnerabilityIssue) => {
    const id = Number(vulnerabilityIssue.title.split(": ")[1].split(" - ")[0]);
    return !vulnerabilityIdProjectMapping.has(id);
  });
  return Promise.all(inactiveVulnerabilityIssues.map((inactiveVulnerabilityIssue) => octokit.rest.issues.update({ ...repo, issue_number: inactiveVulnerabilityIssue.number, state: 'closed' })));
}