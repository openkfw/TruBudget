const { performFsAudit, performImageAudit } = require('./audit');
const { validateConfig, Config } = require('./config');
const { createOrUpdateIssues } = require('./issue');

const run = async function() {
  if(Config.scanType === 'fs') {
  await doFsAudit(Config.tag);
} else {
  await doImageAudit(Config.tag);
}
}


async function doImageAudit(tag) {
  console.info(`Performing image auditing of projects on tag ${tag}`);
  return await doAudit('image', tag);
}

async function doFsAudit(tag) {
  console.info(`Performing file system auditing on projects on tag ${tag}`);
  await doAudit('fs', tag);
}

async function doAudit(type, tag) {
  const vulnerabilityIdProjectMapping = new Map();
  const activeVulnerabilities = [];
  const projectsVulnerabilities = await Promise.all(Config.projects.map((project) => { return type==='fs' ? performFsAudit(project, tag) :  performImageAudit(project, tag)}));
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
  return await createOrUpdateIssues(vulnerabilityIdProjectMapping, activeVulnerabilities, type, tag);
}

validateConfig();

run();
