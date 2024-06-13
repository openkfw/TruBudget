/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 894:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "performFsAudit": () => (/* binding */ performFsAudit),
  "performImageAudit": () => (/* binding */ performImageAudit)
});

// EXTERNAL MODULE: ./config.js
var config = __nccwpck_require__(467);
;// CONCATENATED MODULE: ./docker.js


const child_process = __nccwpck_require__(81);

async function pullImage(imageName, tag = "main") {
  console.info(`Pulling image trubudget/${imageName}:${tag}`);
  child_process.spawnSync("docker", ["pull", `trubudget/${imageName}:${tag}`], {
    encoding: 'utf-8',
    maxBuffer: config.Config.spawnProcessBufferSize
  });
  child_process.spawnSync("docker", ["save", `trubudget/${imageName}:${tag}`, "-o", `${imageName}.tar`], {
    encoding: 'utf-8',
    maxBuffer: config.Config.spawnProcessBufferSize
  });
}
// EXTERNAL MODULE: external "child_process"
var external_child_process_ = __nccwpck_require__(81);
var external_child_process_default = /*#__PURE__*/__nccwpck_require__.n(external_child_process_);
;// CONCATENATED MODULE: ./audit.js




async function performImageAudit(projectName, tag) {
  let image = projectName;
  if(image === "excel-export-service" || image === "email-notification-service") {
    image = image.replace("-service", "");
  }
  await pullImage(image, tag);
  const additionalArgs = ["image", "--input", `${image}.tar`, "--format", "json", "--exit-code", "1", "--vuln-type", "os"];
  additionalArgs.push("--severity", config.Config.severityLevels);

  if (!config.Config.includeUnfixed) {
    additionalArgs.push("--ignore-unfixed");
  }

  const result = external_child_process_default().spawnSync("trivy", additionalArgs, {
    encoding: 'utf-8',
    maxBuffer: config.Config.spawnProcessBufferSize
  });

  const outputJSON = JSON.parse(result.stdout);
  if(outputJSON.Results && outputJSON.Results.length > 0 && outputJSON.Results[0].Vulnerabilities && outputJSON.Results[0].Vulnerabilities.length > 0) {
    return outputJSON.Results[0].Vulnerabilities.map(value => {
      return {
        id: value.VulnerabilityID, 
        packageName: value.PkgName, 
        status: value.Status, 
        title: value.Title, 
        severity: value.Severity,
        fixedVersion: value.FixedVersion,
        links: value.References,
        publishedDate: value.PublishedDate
        }
    });
  }
  return [];
}

async function performFsAudit(projectName) {
  console.info(`\n Performing File System audit on Project ${projectName}...`);

  const additionalArgs = ["fs", `./${projectName}`, "--format", "json", "--exit-code", "1"];
  additionalArgs.push("--severity", config.Config.severityLevels);

  if (config.Config.includeDevDependencies) {
    additionalArgs.push("--include-dev-deps");
  }

  if (!config.Config.includeUnfixed) {
    additionalArgs.push("--ignore-unfixed");
  }

  const result = external_child_process_default().spawnSync("trivy", additionalArgs, {
    encoding: 'utf-8',
    maxBuffer: config.Config.spawnProcessBufferSize
  });

  const outputJSON = JSON.parse(result.stdout);
  if(outputJSON.Results && outputJSON.Results.length > 0 && outputJSON.Results[0].Vulnerabilities && outputJSON.Results[0].Vulnerabilities.length > 0) {
    return outputJSON.Results[0].Vulnerabilities.map(value => {
      return {
        id: value.VulnerabilityID, 
        packageName: value.PkgName, 
        status: value.Status, 
        title: value.Title, 
        severity: value.Severity,
        fixedVersion: value.FixedVersion,
        links: value.References,
        publishedDate: value.PublishedDate
        }
    });
  }
  return [];
}

/***/ }),

/***/ 467:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "Config": () => (/* binding */ Config),
/* harmony export */   "validateConfig": () => (/* binding */ validateConfig)
/* harmony export */ });
const core = __nccwpck_require__(919);
const github = __nccwpck_require__(619);

const Config = {
  projects: core.getInput('projects').split(','),
  includeDevDependencies: core.getInput('include-dev-dependencies') === 'true',
  includeUnfixed: core.getInput('include-unfixed') === 'true',
  severityLevels: core.getInput('severity-levels') || "CRITICAL,HIGH,MEDIUM",
  scanType: core.getInput('scan-type'),
  token: core.getInput('token'),
  issueTitlePrefix: core.getInput('issue_title_prefix') || 'Security Report:',
  octokit: github.getOctokit(core.getInput('token')),
  repo: github.context.repo,
  tag: core.getInput('tag'),
  spawnProcessBufferSize: 10485760 // 10MB
};


function validateConfig() {
  const { projects, token } = Config;

  if (!projects) {
    throw new Error('Input project names are required');
  }

  if (!token) {
    throw new Error('Input token is required');
  }
}

/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "createOrUpdateIssues": () => (/* binding */ createOrUpdateIssues)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(467);
/* harmony import */ var node_html_parser__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(474);
/* harmony import */ var node_html_parser__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__nccwpck_require__.n(node_html_parser__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(919);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__nccwpck_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_2__);




const octokit = _config__WEBPACK_IMPORTED_MODULE_0__.Config.octokit;
const repo = _config__WEBPACK_IMPORTED_MODULE_0__.Config.repo;
const issueTitlePrefix = _config__WEBPACK_IMPORTED_MODULE_0__.Config.issueTitlePrefix;

async function createOrUpdateIssues(vulnerabilityIdProjectMapping, activeVulnerabilities, type, tag = "main") {
  console.info(`Creating or updating issues for ${type} vulnerabilities on tag ${tag}`);
  
  const issueTitle = type === "fs" ? `${issueTitlePrefix} Project Vulnerabilities` : `${issueTitlePrefix} Image Vulnerabilities`;
  const issueCategory = type === "fs" ? `npm audit` : `docker image audit`;

  if (tag === "main") {
    // Get all security labeled open issues
    const { data: securityOpenIssues } = await octokit.rest.issues.listForRepo({
      ...repo,
      state: 'open',
      labels: ['security']
    });
    const vulnerabilityIssue = securityOpenIssues.find(issue => issue.title === issueTitle);
    if(activeVulnerabilities.length > 0) {
        if(vulnerabilityIssue) {
          await updateExistingIssue(vulnerabilityIssue, activeVulnerabilities, vulnerabilityIdProjectMapping);
        } else {
          await createNewIssue(activeVulnerabilities, vulnerabilityIdProjectMapping, issueTitle);
        }
      } else {
        if(vulnerabilityIssue) {
          await closeIssue(vulnerabilityIssue.number);
        }
    } 
  }

  const markdown = createMarkdownList(activeVulnerabilities, vulnerabilityIdProjectMapping, issueCategory, tag);
  _actions_core__WEBPACK_IMPORTED_MODULE_2__.setOutput("markdown", markdown);
}

async function updateExistingIssue(vulnerabilityIssue, activeVulnerabilities, vulnerabilityIdProjectMapping) {
  const issueNumber = vulnerabilityIssue.number;
  const root = (0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(vulnerabilityIssue.body);
  root.querySelector('#last-scan-date').set_content(new Date(Date.now()).toLocaleDateString());
  const currentIds = root.querySelectorAll('tr').filter(elem => elem.id && elem.id !== '').map(elem => elem.id);

  currentIds.forEach(id => {
    if(vulnerabilityIdProjectMapping.has(id)) {
      const affectedProjects = vulnerabilityIdProjectMapping.get(id);
      
      root.querySelector(`#${id}-projects`).childNodes.forEach(node => {
        if(!affectedProjects.includes(node.innerText)) {
          root.querySelector(`#${id}-projects`).removeChild(node);
        }
      });
      const issueProjects = root.querySelector(`#${id}-projects`).childNodes.map(node => node.innerText);
      affectedProjects.forEach(proj => {
        if(!issueProjects.includes(proj)) {
          root.querySelector(`#${id}-projects`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<li>${proj}</li>`));
        }
      });
    } 
    else {
      root.querySelector(`#${id}`).remove();
    }
  });
  activeVulnerabilities.forEach(vulnerability => {
    if(!currentIds.includes(vulnerability.id)) {
      const row = `<tr id="${vulnerability.id}"><td>${vulnerability.id}</td><td>${vulnerability.packageName}</td><td>${vulnerability.title}</td><td>${vulnerability.severity}</td><td>${vulnerability.status}</td><td>${vulnerability.fixedVersion ? vulnerability.fixedVersion : '-'}</td><td>${vulnerability.publishedDate ? vulnerability.publishedDate : '-'}</td><td><ul id="${vulnerability.id}-projects">${vulnerabilityIdProjectMapping.get(vulnerability.id).map(project => `<li>${project}</li>`).join("")}</ul></td><td><ul>${vulnerability.links.filter(link => link.includes("GHSA" || 0)).map(link => `<li><a href="${link}">${link}</a></li>`).join('')}</ul></td></tr>`;
      const parent = root.querySelector("#table-body");
      parent.appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(row));
    }
  });

  await octokit.rest.issues.update({
    ...repo,
    issue_number: issueNumber,
    body: root.toString()
  });
}

async function createNewIssue(vulnerabilities, vulnerabilityIdProjectMapping, issueTitle) {
  const root = (0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)('');
  root.appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)('<h2>Last scan date</h2>'));
  root.appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<p id="last-scan-date">${new Date(Date.now()).toLocaleDateString()}</p>`));
  root.appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)('<h2 id="vulnerability-header">Present Vulnerabilities</h2>'));
  root.appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)('<table></table>'));

  root.querySelector('table').appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)('<thead><tr><th>Vulnerability ID</th><th>PkgName</th><th>Title</th><th>Severity</th><th>Status</th><th>Fixed Version</th><th>Published Date</th><th>Affects</th><th>Links</th></tr></thead>'));
  root.querySelector('table').appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)('<tbody id="table-body"></tbody>'));

  for(const vulnerability of vulnerabilities) {
    if(vulnerability.links && Array.isArray(vulnerability.links) && vulnerability.links.length > 0) {
      root.querySelector('#table-body').appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<tr id="${vulnerability.id}"></tr>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.id}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.packageName}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.title}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.severity}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.status}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.fixedVersion ? vulnerability.fixedVersion : '-'}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td>${vulnerability.publishedDate ? vulnerability.publishedDate : '-'}</td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td><ul id="${vulnerability.id}-projects">${[...new Set(vulnerabilityIdProjectMapping.get(vulnerability.id))].map(project => `<li>${project}</li>`).join("")}</ul></td>`));
      root.querySelector(`#${vulnerability.id}`).appendChild((0,node_html_parser__WEBPACK_IMPORTED_MODULE_1__.parse)(`<td><ul>${vulnerability.links.filter(link => link.includes("GHSA" || 0)).map(link => `<li><a href="${link}">${link}</a></li>`).join('')}</ul></td>`));
    }
  }

  await octokit.rest.issues.create({
    ...repo,
    title: issueTitle,
    body: root.toString(),
    labels: ["security"]
  });
}


function createMarkdownList(vulnerabilities, vulnerabilityIdProjectMapping, category, tag) {
  let md = '';
  md += `## Present Vulnerabilities (${category}) in version: ${tag}\n\n`;

  md += '| SUBSCRIPTIONID | RESOURCEGROUP | VULNID | IDENTIFICATIONDATE | CATEGORY | CVE | CVSS |	SEVERITY | DISPLAYNAME | RESOURCEID | RESOURCEID_SINGLE | AKTIV | HOST | OSDETAILS |\n';
  md += '|----------------|---------------|--------|--------------------|----------|-----|------|----------|-------------|------------|-------------------|-------|------|-----------|\n';

  for(const vulnerability of vulnerabilities) {
    if(vulnerability.links && Array.isArray(vulnerability.links) && vulnerability.links.length > 0) {
      for (const project of [...new Set(vulnerabilityIdProjectMapping.get(vulnerability.id))]) {
        md += `| - | - | ${vulnerability.id} | ${vulnerability.publishedDate ? vulnerability.publishedDate : '-'} | ${category} | ${vulnerability.id} | | ${vulnerability.severity} | ${vulnerability.title} | ${project}-${tag} | ${project}-${tag} | Yes |  | package: ${vulnerability.packageName}, status: ${vulnerability.status}, fixedVersion: ${vulnerability.fixedVersion ? vulnerability.fixedVersion : '-'} |\n`;
      }
    }
  }

  const currentDate = new Date;
  const currentDateFormatted = [
    currentDate.getFullYear(),
    currentDate.getMonth()+1,
    currentDate.getDate()
  ].join('-')+' '+
  [
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds()
  ].join(':');
  md += `\nLast scan date: ${currentDateFormatted}\n\n\n`;

  return md;
}

async function closeIssue(issueNumber) {
  await octokit.rest.issues.update({ ...repo, issue_number: issueNumber, state: 'closed' });
}

/***/ }),

/***/ 919:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 619:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 474:
/***/ ((module) => {

module.exports = eval("require")("node-html-parser");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const { performFsAudit, performImageAudit } = __nccwpck_require__(894);
const { validateConfig, Config } = __nccwpck_require__(467);
const { createOrUpdateIssues } = __nccwpck_require__(507);

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

})();

module.exports = __webpack_exports__;
/******/ })()
;