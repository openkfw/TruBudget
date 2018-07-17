const axios = require("axios");
const { provisionUsers } = require("./users");
const { readDirectory, readJsonFile } = require("./files");
const {
  authenticate,
  createProject,
  closeProject,
  createSubproject,
  updateProject,
  updateSubproject,
  closeSubproject,
  updateWorkflowitem,
  closeWorkflowitem,
  findProject,
  findSubproject,
  findWorkflowitem,
  grantPermissions,
  revokeProjectPermission,
  queryApiDoc,
  createWorkflowitem
} = require("./api");

const DEFAULT_API_VERSION = "1.0";

const projectBlacklist = ["users.json", "close_test.json"];
axios.defaults.transformRequest = [
  (data, headers) => {
    if (typeof data === "object") {
      return {
        apiVersion: DEFAULT_API_VERSION,
        data: { ...data }
      };
    } else {
      return data;
    }
  },
  ...axios.defaults.transformRequest
];

async function impersonate(userId, password) {
  const token = await authenticate(axios, userId, password);
  console.log(`Now logged in as ${userId}`);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

const provisionBlockchain = async (host, port, rootSecret) => {
  try {
    const folder =
      process.env.ENVIRONMENT_TYPE === "PROD"
        ? "./src/data/prod/"
        : "./src/data/test/";

    axios.defaults.baseURL = `http://${host}:${port}/api`;
    axios.defaults.timeout = 5000;

    await impersonate("root", rootSecret);
    console.log("Start to provision users");
    await provisionUsers(axios, folder);

    console.log("Starting to provision projects");
    await impersonate("mstein", "test");
    const files = readDirectory(folder);
    for (const fileName of files) {
      if (projectBlacklist.indexOf(fileName) === -1) {
        const project = readJsonFile(folder + fileName);
        await provisionFromData(project);
      }
    }
    if (process.env.ENVIRONMENT_TYPE !== "PROD") {
      await runIntegrationTests(rootSecret, folder);
    }
  } catch (err) {
    console.log(err);
    if (err.code && err.code === "MAX_RETRIES") {
      console.log(err.message);
      console.log(`Provisioning failed....`);
      process.exit(1);
    }
  }
};

const provisionFromData = async projectTemplate => {
  console.log(`Start provisioning project ${projectTemplate.displayName}....`);
  try {
    const projectExists = await findProject(axios, projectTemplate).then(
      existingProject => existingProject !== undefined
    );
    if (projectExists) {
      console.log(`${projectTemplate.displayName} project already exists.`);
    } else {
      await createProject(axios, projectTemplate);
    }

    console.log(`Create suprojects....`);
    const isToBeClosed = projectTemplate.status === "closed";

    const project = await findProject(axios, projectTemplate);

    console.log("Grant permissions");
    await grantPermissions(axios, projectTemplate.permissions, project.data.id);

    // Testing updates:
    await updateProject(axios, project.data.id, projectTemplate.description);

    for (const subprojectTemplate of projectTemplate.subprojects) {
      console.log(`Provision Subproject ${subprojectTemplate.displayName}`);
      await provisionSubproject(project, subprojectTemplate);
    }

    if (isToBeClosed) {
      await closeProject(axios, project);
    }

    console.log(`Project ${fmtList([project])} created.`);
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      console.log(
        `Failed to provision project ${
          projectTemplate.displayName
        } , max retries exceeded`
      );
    }
  }
};

const provisionSubproject = async (project, subprojectTemplate) => {
  const isToBeClosed = subprojectTemplate.status === "closed";
  let subproject = await findSubproject(axios, project, subprojectTemplate);
  try {
    if (subproject) {
      console.log(
        `Subproject already exists ${subprojectTemplate.displayName}`
      );
    } else {
      await createSubproject(axios, project, subprojectTemplate);

      subproject = await findSubproject(axios, project, subprojectTemplate);
    }
  } catch (err) {
    console.log(err);
  }
  await grantPermissions(
    axios,
    subprojectTemplate.permissions,
    project.data.id,
    subproject.data.id
  );

  await updateSubproject(
    axios,
    project.data.id,
    subproject.data.id,
    subprojectTemplate.description
  );

  for (const workflowitemTemplate of subprojectTemplate.workflows) {
    console.log(
      `Provisioning workflowitem "${workflowitemTemplate.displayName}" ....`
    );
    await provisionWorkflowitem(project, subproject, workflowitemTemplate);
  }

  if (isToBeClosed) {
    await closeSubproject(axios, project.data.id, subproject.data.id);
  }

  console.log(`Subproject ${fmtList([project, subproject])} created.`);
};

const provisionWorkflowitem = async (
  project,
  subproject,
  workflowitemTemplate
) => {
  const isToBeClosed = workflowitemTemplate.status === "closed";
  let workflowitem = await findWorkflowitem(
    axios,
    project,
    subproject,
    workflowitemTemplate
  );
  if (workflowitem) {
    console.log(
      `Workflowitem "${workflowitemTemplate.displayName}" already exists `
    );
  } else {
    const data = {
      projectId: project.data.id,
      subprojectId: subproject.data.id,
      displayName: workflowitemTemplate.displayName,
      description: "FAILED UPDATE?",
      amountType: workflowitemTemplate.amountType,
      status: "open",
      assignee: workflowitemTemplate.assignee
    };
    const amount = workflowitemTemplate.amount
      ? workflowitemTemplate.amount.toString()
      : undefined;
    const currency = workflowitemTemplate.currency;
    const body =
      data.amountType === "N/A" ? data : { ...data, amount, currency };
    await createWorkflowitem(axios, body);
    workflowitem = await findWorkflowitem(
      axios,
      project,
      subproject,
      workflowitemTemplate
    );
    console.log(
      `Workflowitem ${fmtList([project, subproject, workflowitem])} created.`
    );
  }

  // Testing updates:
  console.log(`Updating workflowitem "${workflowitemTemplate.displayName}"`);
  await updateWorkflowitem(
    axios,
    project.data.id,
    subproject.data.id,
    workflowitem.data.id,
    workflowitemTemplate.description
  );

  await grantPermissions(
    axios,
    workflowitemTemplate.permissions,
    project.data.id,
    subproject.data.id,
    workflowitem.data.id
  );

  if (isToBeClosed) {
    console.log(`Closing workflowitem "${workflowitemTemplate.displayName}"`);
    await closeWorkflowitem(
      axios,
      project.data.id,
      subproject.data.id,
      workflowitem.data.id
    );
  }
};

const fmtList = l =>
  l
    .map(x => (x.data.displayName === undefined ? x : x.data.displayName))
    .map(x => `"${x}"`)
    .join(" > ");

async function runIntegrationTests(rootSecret, folder) {
  await testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(rootSecret, folder);
  await testApiDocIsAvailable();
  console.log(`Integration tests complete.`);
}

async function testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(
  rootSecret,
  folder
) {
  await impersonate("mstein", "test");
  const closeProjectTest = readJsonFile(folder + "close_test.json");
  await provisionFromData(closeProjectTest);

  const project = await findProject(axios, closeProjectTest);
  if (project.data.status === "closed") {
    console.log(
      "skipped: test project close only works if all subprojects are closed"
    );
    return;
  }
  // This should fail as long as one subproject is still open:
  closeProject(axios, project)
    .then(result => {
      throw Error(
        `Expected project.close to fail, got ${JSON.stringify(result.data)}`
      );
    })
    .catch(() => "expected!");

  // Let's close the subproject (as root, because not visible to mstein):
  await impersonate("root", rootSecret);
  const subprojectTemplate = closeProjectTest.subprojects[1];
  if (subprojectTemplate.status !== "open")
    throw Error("Unexpected test data.");
  const subproject = await findSubproject(axios, project, subprojectTemplate);
  await closeSubproject(axios, project.data.id, subproject.data.id);

  // Now closing the project should work:
  await impersonate("mstein", "test");
  await closeProject(axios, project);

  await findProject(axios, closeProjectTest).then(x => {
    if (x.data.status !== "closed") throw Error("failed");
  });

  // Hide the test project
  await impersonate("root", rootSecret);
  await revokeProjectPermission(
    axios,
    project.data.id,
    "mstein",
    "project.viewSummary"
  );
  await revokeProjectPermission(
    axios,
    project.data.id,
    "mstein",
    "project.viewDetails"
  );
}

async function testApiDocIsAvailable() {
  queryApiDoc(axios).then(() => console.log("/api/doc OK"));
}

const port = process.env.API_PORT || 8080;
const host = process.env.API_HOST || "localhost";
const rootSecret = process.env.ROOT_SECRET || "asdf";

provisionBlockchain(host, port, rootSecret);
