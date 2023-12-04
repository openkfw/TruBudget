const { runAudit } = require('./audit');
const { validateConfig, Config } = require('./config');
const { createOrUpdateIssues } = require('./issue');

const run = async function() {
  const vulnerabilityIdProjectMapping = new Map();
  const activeVulnerabilities = [];

  const projectsVulnerabilities = await Promise.all(Config.projects.map(runAudit));

  for (let i = 0; i < projectsVulnerabilities.length; i++) {
    const projectName = Config.projects[i];
    const projectVulnerabilities = projectsVulnerabilities[i];

    for (const projectVulnerability of projectVulnerabilities) {
      const vulnerabilityId = projectVulnerability.via[0].source;

      if (vulnerabilityIdProjectMapping.has(vulnerabilityId)){
        vulnerabilityIdProjectMapping.get(vulnerabilityId).push(projectName);
      } else {
        activeVulnerabilities.push(projectVulnerability);
        vulnerabilityIdProjectMapping.set(vulnerabilityId, [projectName]);
      }
    }
  }

  await createOrUpdateIssues(vulnerabilityIdProjectMapping, activeVulnerabilities);
}

validateConfig();

run();
