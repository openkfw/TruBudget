const axios = require("axios");
import logger from "../lib/logger";
import { MultichainClient } from "../multichain";
import { amazonasFundProject, closeProjectTest, schoolProject } from "./data";
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

// const isReady = async () => {
//   const delaySec = 10;
//   let isHealthEndpointReady = false;
//   while (!isHealthEndpointReady) {
//     try {
//       await axios.get("/health");
//       isHealthEndpointReady = true;
//     } catch (_err) {
//       logger.info(`The TruBudget API is not ready yet, trying again in ${delaySec}`);
//       await sleep(delaySec * 1000);
//     }
//   }
//   logger.info(`The TruBudget API is now ready.`);
// };

const authenticate = async (userId: string, password: string) => {
  const response = await axios.post("/user.authenticate", {
    user: { id: userId, password },
  });
  const body = response.data;
  if (body.apiVersion !== "1.0") throw Error("unexpected API version");
  return body.data.user.token;
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function impersonate(userId, password) {
  const token = await authenticate(userId, password);
  logger.debug(`Now logged in as ${userId}`);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export const provisionBlockchain = async (
  port: number,
  rootSecret: string,
  multichainClient: MultichainClient,
) => {
  axios.defaults.baseURL = `http://localhost:${port}/api`;
  axios.defaults.timeout = 5000;

  await impersonate("root", rootSecret);
  await provisionUsers(axios);
  await impersonate("mstein", "test");
  // const projectId = await provisionProjects(axios);
  // const subprojectId = await provisionSubprojects(axios, projectId);
  // await provisionWorkflowitems(axios, projectId, subprojectId);
  await provisionFromData(amazonasFundProject);
  await provisionFromData(schoolProject);
  await runIntegrationTests(rootSecret);
};

export const provisionFromData = async projectTemplate => {
  // Don't continue if the project already exists:
  const projectExists = await findProject(projectTemplate).then(
    existingProject => existingProject !== undefined,
  );
  if (projectExists) {
    logger.warn(`${projectTemplate.displayName} project already exists.`);
    return;
  }

  const isToBeClosed = projectTemplate.status === "closed";

  await axios.post("/global.createProject", {
    project: {
      displayName: projectTemplate.displayName,
      description: "FAILED UPDATE?",
      amount: projectTemplate.amount,
      assignee: projectTemplate.assignee,
      currency: projectTemplate.currency,
    },
  });
  const project = await findProject(projectTemplate);

  await grantPermissions(projectTemplate.permissions, project.data.id);

  // Testing updates:
  await axios.post("/project.update", {
    projectId: project.data.id,
    description: projectTemplate.description || "",
  });

  for (const subprojectTemplate of projectTemplate.subprojects) {
    await provisionSubproject(project, subprojectTemplate);
  }

  if (isToBeClosed) {
    await axios.post("/project.close", {
      projectId: project.data.id,
    });
  }

  logger.info(`Project ${fmtList([project])} created.`);
};

const findProject = async projectTemplate => {
  return axios
    .get("/project.list")
    .then(res => res.data.data.items)
    .then(projects => projects.find(p => p.data.displayName === projectTemplate.displayName));
};

const provisionSubproject = async (project, subprojectTemplate) => {
  const isToBeClosed = subprojectTemplate.status === "closed";

  await axios.post("/project.createSubproject", {
    projectId: project.data.id,
    subproject: {
      displayName: subprojectTemplate.displayName,
      description: "FAILED UPDATE?",
      status: "open", // otherwise we won't be able to add workflowitems
      amount: subprojectTemplate.amount,
      currency: subprojectTemplate.currency,
      assignee: subprojectTemplate.assignee,
    },
  });
  const subproject = await findSubproject(project, subprojectTemplate);

  await grantPermissions(subprojectTemplate.permissions, project.data.id, subproject.data.id);

  // Testing updates:
  await axios.post("/subproject.update", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    description: subprojectTemplate.description || "",
  });

  for (const workflowitemTemplate of subprojectTemplate.workflows) {
    await provisionWorkflowitem(project, subproject, workflowitemTemplate);
  }

  if (isToBeClosed) {
    await axios.post("/subproject.close", {
      projectId: project.data.id,
      subprojectId: subproject.data.id,
    });
  }

  logger.info(`Subproject ${fmtList([project, subproject])} created.`);
};

const findSubproject = async (project, subprojectTemplate) => {
  return axios
    .get(`/subproject.list?projectId=${project.data.id}`)
    .then(res => res.data.data.items)
    .then(subprojects =>
      subprojects.find(x => x.data.displayName === subprojectTemplate.displayName),
    );
};

const provisionWorkflowitem = async (project, subproject, workflowitemTemplate) => {
  const isToBeClosed = workflowitemTemplate.status === "closed";
  const data = {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    displayName: workflowitemTemplate.displayName,
    description: "FAILED UPDATE?",
    amountType: workflowitemTemplate.amountType,
    status: "open",
    assignee: workflowitemTemplate.assignee,
  };
  const amount = workflowitemTemplate.amount ? workflowitemTemplate.amount.toString() : undefined;
  const currency = workflowitemTemplate.currency;
  const body = data.amountType === "N/A" ? data : { ...data, amount, currency };
  await axios.post("/subproject.createWorkflowitem", body);

  const workflowitem = await findWorkflowitem(project, subproject, workflowitemTemplate);

  // Testing updates:
  await axios.post("/workflowitem.update", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    workflowitemId: workflowitem.data.id,
    description: workflowitemTemplate.description || "",
  });

  await grantPermissions(
    workflowitemTemplate.permissions,
    project.data.id,
    subproject.data.id,
    workflowitem.data.id,
  );

  if (isToBeClosed) {
    await axios.post("/workflowitem.close", {
      projectId: project.data.id,
      subprojectId: subproject.data.id,
      workflowitemId: workflowitem.data.id,
    });
  }

  logger.info(`Workflowitem ${fmtList([project, subproject, workflowitem])} created.`);
};

const findWorkflowitem = async (project, subproject, workflowitemTemplate) => {
  return axios
    .get(`/workflowitem.list?projectId=${project.data.id}&subprojectId=${subproject.data.id}`)
    .then(res => res.data.data.workflowitems)
    .then(items => items.find(item => item.data.displayName === workflowitemTemplate.displayName));
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
  } else if (projectId !== undefined) {
    url = "/project.intent.grantPermission";
    body = { projectId };
  } else {
    throw Error("not even projectId is given..");
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
    .map(x => (x.data.displayName === undefined ? x : x.data.displayName))
    .map(x => `"${x}"`)
    .join(" > ");

async function runIntegrationTests(rootSecret: string) {
  await testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(rootSecret);
  await testApiDocIsAvailable();
  logger.info(`Integration tests complete.`);
}

async function testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(rootSecret: string) {
  await impersonate("mstein", "test");
  await provisionFromData(closeProjectTest);

  const project = await findProject(closeProjectTest);
  if (project.data.status === "closed") {
    logger.info("skipped: test project close only works if all subprojects are closed");
    return;
  }

  // This should fail as long as one subproject is still open:
  await axios
    .post("/project.close", {
      projectId: project.data.id,
    })
    .then(result => {
      throw Error(`Expected project.close to fail, got ${JSON.stringify(result.data)}`);
    })
    .catch(() => "expected!");

  // Let's close the subproject (as root, because not visible to mstein):
  await impersonate("root", rootSecret);
  const subprojectTemplate = closeProjectTest.subprojects[1];
  if (subprojectTemplate.status !== "open") throw Error("Unexpected test data.");
  const subproject = await findSubproject(project, subprojectTemplate);
  await axios.post("/subproject.close", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
  });

  // Now closing the project should work:
  await impersonate("mstein", "test");
  await axios.post("/project.close", {
    projectId: project.data.id,
  });
  await findProject(closeProjectTest).then(x => {
    if (x.data.status !== "closed") throw Error("failed");
  });

  // Hide the test project
  await impersonate("root", rootSecret);
  await axios.post("/project.intent.revokePermission", {
    projectId: project.data.id,
    userId: "mstein",
    intent: "project.viewSummary",
  });
  await axios.post("/project.intent.revokePermission", {
    projectId: project.data.id,
    userId: "mstein",
    intent: "project.viewDetails",
  });
}

async function testApiDocIsAvailable() {
  await axios.get("/doc").then(() => logger.info("/api/doc OK"));
}
