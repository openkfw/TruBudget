const { performFsAudit, performImageAudit } = require('./audit');
const { validateConfig, Config } = require('./config');
const { createOrUpdateIssues } = require('./issue');

const run = async function() {
  if(Config.scanType === 'fs') {
    await doFsAudit();
  } else {
    await doImageAudit();
  }
}

async function doImageAudit() {
  console.info("Performing image auditing on projects");
  await doAudit('image');
}

async function doFsAudit() {
  console.info("Performing file system auditing on projects");
  await doAudit('fs');
}

async function doAudit(type) {
  const vulnerabilityIdProjectMapping = new Map();
  const activeVulnerabilities = [];
  const projectsVulnerabilities = await Promise.all(Config.projects.map(type==='fs' ? performFsAudit : performImageAudit));
  for (let i = 0; i < projectsVulnerabilities.length; i++) {
    const projectName = Config.projects[i];
    const projectVulnerabilities = projectsVulnerabilities[i];
    for (const projectVulnerability of projectVulnerabilities) {
      const id = projectVulnerability.id;
      if (vulnerabilityIdProjectMapping.has(id)){
        vulnerabilityIdProjectMapping.get(id).push(projectName);
      } else {
        activeVulnerabilities.push(projectVulnerability);
        vulnerabilityIdProjectMapping.set(id, [projectName]);
      }
    }
  }
  await createOrUpdateIssues(vulnerabilityIdProjectMapping, activeVulnerabilities, type);
}

validateConfig();

run();
