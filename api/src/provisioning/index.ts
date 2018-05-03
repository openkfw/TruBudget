const axios = require("axios");

import * as winston from "winston";
import { MultichainClient } from "../multichain";
import { amazonasFundProject } from "./data";
import { sleep } from "./lib";
import { provisionUsers } from "./users";

const DEFAULT_API_VERSION = "1.0";

axios.defaults.transformRequest = [
  (data, headers) => {
    if (typeof data === "object") {
      return {
        apiVersion: DEFAULT_API_VERSION,
        data: { ...data },
      };
    } else {
      return data;
    }
  },
  ...axios.defaults.transformRequest,
];

const isReady = async () => {
  const delaySec = 10;
  let hasHealthEndpointUp = false;
  while (!hasHealthEndpointUp) {
    try {
      await axios.get("/health");
      hasHealthEndpointUp = true;
    } catch (_err) {
      console.log(`The TruBudget API is not ready yet, trying again in ${delaySec}`);
      await sleep(delaySec * 1000);
    }
  }
  console.log(`The TruBudget API is now ready.`);
};

const authenticate = async (userId: string, rootSecret: string) => {
  const response = await axios.post("/user.authenticate", {
    user: { id: userId, password: rootSecret },
  });
  const body = response.data;
  if (body.apiVersion !== "1.0") throw Error("unexpected API version");
  return body.data.user.token;
};

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}

export const provisionBlockchain = async (
  port: number,
  rootSecret: string,
  multichainClient: MultichainClient,
) => {
  axios.defaults.baseURL = `http://localhost:${port}`;
  axios.defaults.timeout = 5000;

  let connected = false;
  while (!connected) {
    try {
      winston.info("Checking multichain availability...");
      let info = await multichainClient.getInfo();
      winston.info(`Connected to ${info.nodeaddress}`);
      connected = true;
    } catch (err) {
      winston.error("Error while checking multichain, retrying after pause...");
      await timeout(5000);
    }
  }

  let token = await authenticate("root", rootSecret);
  console.log("Authentication as root done");
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionUsers(axios);
  token = await authenticate("mstein", "test");
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  // const projectId = await provisionProjects(axios);
  // const subprojectId = await provisionSubprojects(axios, projectId);
  // await provisionWorkflowitems(axios, projectId, subprojectId);
  await provisionFromData();
};

const provisionFromData = async () => {
  // Don't continue if the project already exists:
  const projectTemplate = amazonasFundProject;
  const projectExists = await findProject(projectTemplate).then(
    existingProject => existingProject !== undefined,
  );
  if (projectExists) {
    console.log(`${projectTemplate.displayName} project already exists.`);
    return;
  }

  await axios.post("/global.createProject", {
    project: {
      displayName: projectTemplate.displayName,
      description: projectTemplate.description,
      amount: projectTemplate.amount,
      currency: projectTemplate.currency,
    },
  });
  const project = await findProject(projectTemplate);

  await grantPermissions(projectTemplate.permissions, project.id);

  for (const subprojectTemplate of projectTemplate.subprojects) {
    await provisionSubproject(project, subprojectTemplate);
  }
  console.log(`Project ${fmtList([project])} created.`);
};

const findProject = async project => {
  return axios
    .get("/project.list")
    .then(res => res.data.data.items)
    .then(projects => projects.find(p => p.displayName === project.displayName));
};

const provisionSubproject = async (project, subprojectTemplate) => {
  await axios.post("/project.createSubproject", {
    projectId: project.id,
    subproject: {
      displayName: subprojectTemplate.displayName,
      description: subprojectTemplate.description,
      status: subprojectTemplate.status,
      amount: subprojectTemplate.amount,
      currency: subprojectTemplate.currency,
      assignee: subprojectTemplate.assignee,
    },
  });
  const subproject = await findSubproject(project, subprojectTemplate);

  await grantPermissions(subprojectTemplate.permissions, project.id, subproject.id);

  for (const workflowitemTemplate of subprojectTemplate.workflows) {
    await provisionWorkflowitem(project, subproject, workflowitemTemplate);
  }
  console.log(`Subproject ${fmtList([project, subproject])} created.`);
};

const findSubproject = async (project, subproject) => {
  return axios
    .get(`/subproject.list?projectId=${project.id}`)
    .then(res => res.data.data.items)
    .then(subprojects => subprojects.find(x => x.displayName === subproject.displayName));
};

const provisionWorkflowitem = async (project, subproject, workflowitemTemplate) => {
  const data = {
    projectId: project.id,
    subprojectId: subproject.id,
    displayName: workflowitemTemplate.displayName,
    description: workflowitemTemplate.description,
    amountType: workflowitemTemplate.amountType,
    status: workflowitemTemplate.status,
    assignee: workflowitemTemplate.assignee,
  };
  const amount = workflowitemTemplate.amount ? workflowitemTemplate.amount.toString() : undefined;
  const currency = workflowitemTemplate.currency;
  const body = data.amountType === "N/A" ? data : { ...data, amount, currency };
  await axios.post("/subproject.createWorkflowitem", body);

  const workflowitem = await findWorkflowitem(project, subproject, workflowitemTemplate);

  await grantPermissions(
    workflowitemTemplate.permissions,
    project.id,
    subproject.id,
    workflowitem.id,
  );

  console.log(`Workflowitem ${fmtList([project, subproject, workflowitem])} created.`);
};

const findWorkflowitem = async (project, subproject, workflowitem) => {
  return axios
    .get(`/workflowitem.list?projectId=${project.id}&subprojectId=${subproject.id}`)
    .then(res => res.data.data.workflowitems)
    .then(items => items.find(item => item.displayName === workflowitem.displayName));
};

const grantPermissions = async (permissions: object, projectId, subprojectId?, workflowitemId?) => {
  if (permissions === undefined) return;

  let url;
  let body;
  if (workflowitemId !== undefined) {
    url = "/workflowitem.intent.grantPermission";
    body = { projectId, subprojectId, workflowitemId };
  } else if (subprojectId !== undefined) {
    url = "/subproject.intent.grantPermission";
    body = { projectId, subprojectId };
  } else {
    url = "/project.intent.grantPermission";
    body = { projectId };
  }

  for (const [intent, users] of Object.entries(permissions)) {
    for (const userId of users) {
      await axios.post(url, {
        ...body,
        intent,
        userId,
      });
    }
  }
};

const fmtList = l =>
  l
    .map(x => (x.displayName === undefined ? x : x.displayName))
    .map(x => `"${x}"`)
    .join(" > ");
