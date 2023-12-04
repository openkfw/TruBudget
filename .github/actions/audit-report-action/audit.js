const child_process = require('child_process');

const SPAWN_PROCESS_BUFFER_SIZE = 10485760; // 10MB

function extractVulnerabilities(rawVulnerabilities) {
  return Object.values(rawVulnerabilities).filter(value => {
    return !value.isDirect && Array.isArray(value.via) && typeof value.via[0] === 'object';
  });
}

export async function runAudit(projectName) {
  if (!projectName) {
    throw new Error('A project name is required');
  }

  console.info(`\nAuditing ${projectName}...`);

  process.chdir(projectName);

  child_process.spawnSync("npm", ["ci", "--no-audit", "--legacy-peer-deps"], {
    encoding: 'utf-8',
    maxBuffer: SPAWN_PROCESS_BUFFER_SIZE
  });

  const result = child_process.spawnSync("npm", ["audit", "--json", "--omit=dev"], {
    encoding: 'utf-8',
    maxBuffer: SPAWN_PROCESS_BUFFER_SIZE
  });

  const auditRaw = JSON.parse(result.stdout);
  let vulnerabilityList = [];

  if (auditRaw.metadata?.vulnerabilities?.total > 0) {
    console.info("Vulnerabilities found");
    vulnerabilityList = extractVulnerabilities(auditRaw.vulnerabilities);
  } else {
    console.info("No vulnerabilities found");
  }

  process.chdir("..");

  return vulnerabilityList;
}