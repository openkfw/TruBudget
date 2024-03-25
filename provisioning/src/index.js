const axios = require("axios");
const { provisionUsers, provisionGroups } = require("./users_and_groups");
const { readDirectory, readJsonFile } = require("./files");
const {
  isApiReady,
  authenticate,
  createProject,
  assignProject,
  closeProject,
  createSubproject,
  assignSubproject,
  updateProject,
  updateSubproject,
  closeSubproject,
  updateWorkflowitem,
  closeWorkflowitem,
  assignWorkflowitem,
  findProject,
  findSubproject,
  findWorkflowitem,
  grantPermissions,
  revokeProjectPermission,
  queryApiDoc,
  createWorkflowitem,
  queryProvisionState,
  setProvisionStartFlag,
  setProvisionEndFlag,
} = require("./api");
const log = require("./logger");

const DEFAULT_API_VERSION = "1.0";

// List all files here that do not contain project data
const projectBlacklist = ["users.json", "close_test.json", "groups.json"];

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

axios.interceptors.response.use(
  (response) => response,
  function (error) {
    if (!error.response) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        code: error.code,
        data: { error: { message: error.message } },
      });
    }
    if (error.response.status === 401) {
      // JWT Token is expired / invalid / not existing => refresh JWT Token
      log.info("Refresh of JWT Token needed");
      impersonate(currentUser);
    }
    return Promise.reject(error.response);
  }
);

const impersonate = async (user) => {
  const token = await authenticate(axios, user.id, user.password);
  log.info(`Now logged in as ${user.id}`);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const fmtList = (l) =>
  l
    .map((x) => (x.data.displayName === undefined ? x : x.data.displayName))
    .map((x) => `"${x}"`)
    .join(" > ");

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
    log.info(
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
      assignee: workflowitemTemplate.assignee,
      exchangeRate: workflowitemTemplate.exchangeRate,
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
    log.info(
      `Workflowitem ${fmtList([project, subproject, workflowitem])} created.`
    );
  }

  // Testing updates:
  if (workflowitem.data.status === "open") {
    log.info(`Updating workflowitem "${workflowitemTemplate.displayName}"`);
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
      log.info(`Closing workflowitem "${workflowitemTemplate.displayName}"`);
      // Only assigned user are allowed to close the workflowitem
      await assignWorkflowitem(
        axios,
        project.data.id,
        subproject.data.id,
        workflowitem.data.id,
        serviceUser.id
      );
      await closeWorkflowitem(
        axios,
        project.data.id,
        subproject.data.id,
        workflowitem.data.id
      );
    }
  }
};

const provisionSubproject = async (project, subprojectTemplate) => {
  const isToBeClosed = subprojectTemplate.status === "closed";
  let subproject = await findSubproject(axios, project, subprojectTemplate);
  try {
    if (subproject) {
      log.info(`Subproject already exists ${subprojectTemplate.displayName}`);
    } else {
      await createSubproject(axios, project, subprojectTemplate);

      subproject = await findSubproject(axios, project, subprojectTemplate);
    }
  } catch (err) {
    log.error({ err }, "Create Subproject call resulted in error");
  }
  await grantPermissions(
    axios,
    subprojectTemplate.permissions,
    project.data.id,
    subproject.data.id
  );
  if (
    subprojectTemplate.description !== undefined &&
    subproject.status === "open"
  ) {
    await updateSubproject(
      axios,
      project.data.id,
      subproject.data.id,
      subprojectTemplate.description
    );
  }

  for (const workflowitemTemplate of subprojectTemplate.workflows) {
    log.info(
      `Provisioning workflowitem "${workflowitemTemplate.displayName}" ....`
    );
    await provisionWorkflowitem(project, subproject, workflowitemTemplate);
  }

  if (isToBeClosed) {
    await assignSubproject(
      axios,
      project.data.id,
      subproject.data.id,
      serviceUser.id
    );
    await closeSubproject(axios, project.data.id, subproject.data.id);
  }

  log.info(`Subproject ${fmtList([project, subproject])} created.`);
};

const provisionFromData = async (projectTemplate) => {
  log.info(`Start provisioning project ${projectTemplate.displayName}....`);
  try {
    const projectExists = await findProject(axios, projectTemplate).then(
      (existingProject) => existingProject !== undefined
    );
    if (projectExists) {
      log.info(`${projectTemplate.displayName} project already exists.`);
    } else {
      await createProject(axios, projectTemplate);
    }

    log.info("Create subprojects....");
    const isToBeClosed = projectTemplate.status === "closed";

    const project = await findProject(axios, projectTemplate);

    if (projectTemplate.permissions !== undefined) {
      log.info("Granting permissions..");
      await grantPermissions(
        axios,
        projectTemplate.permissions,
        project.data.id
      );
    }

    if (
      projectTemplate.description !== undefined &&
      project.status === "open"
    ) {
      log.info("Testing project update..");
      await updateProject(axios, project.data.id, projectTemplate.description);
    }

    for (const subprojectTemplate of projectTemplate.subprojects) {
      log.info(`Provision Subproject ${subprojectTemplate.displayName}`);
      await provisionSubproject(project, subprojectTemplate);
    }

    if (isToBeClosed) {
      await assignProject(axios, project.data.id, serviceUser.id);
      await closeProject(axios, project);
    }

    log.info(`Project ${fmtList([project])} created.`);
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      log.info(
        `Failed to provision project ${projectTemplate.displayName} , max retries exceeded`
      );
    }
  }
};

async function testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(
  rootSecret,
  folder
) {
  await impersonate(serviceUser);
  const closeProjectTest = readJsonFile(folder + "close_test.json");
  await provisionFromData(closeProjectTest);

  const project = await findProject(axios, closeProjectTest);
  if (project.data.status === "closed") {
    log.info(
      "skipped: test project close only works if all subprojects are closed"
    );
    return;
  }

  // This should fail as long as one subproject is still open:
  closeProject(axios, project)
    .then((result) => {
      throw Error(
        `Expected project.close to fail, got ${JSON.stringify(result.data)}`
      );
    })
    .catch(() => "expected!");

  await impersonate(serviceUser);
  const subprojectTemplate = closeProjectTest.subprojects[1];
  if (subprojectTemplate.status !== "open")
    throw Error("Unexpected test data.");
  const subproject = await findSubproject(axios, project, subprojectTemplate);
  await closeSubproject(axios, project.data.id, subproject.data.id);

  await impersonate(serviceUser);
  await closeProject(axios, project);

  await findProject(axios, closeProjectTest).then((x) => {
    if (x.data.status !== "closed") throw Error("failed");
  });

  await revokeProjectPermission(
    axios,
    project.data.id,
    "mstein",
    "project.list"
  );
}

async function testWorkflowitemUpdate(folder) {
  currentUser.id = "mstein";
  currentUser.password = "test";
  await impersonate(currentUser);
  const amazonFundProject = readJsonFile(folder + "amazon_fund.json");
  await provisionFromData(amazonFundProject);

  const project = await findProject(axios, amazonFundProject);

  const subprojectTemplate = amazonFundProject.subprojects.find(
    (x) => x.displayName === "Furniture"
  );
  const subproject = await findSubproject(axios, project, subprojectTemplate);

  const workflowitemTemplate = subprojectTemplate.workflows.find(
    (x) => x.displayName === "Payment final installment"
  );
  const workflowitem = await findWorkflowitem(
    axios,
    project,
    subproject,
    workflowitemTemplate
  );

  const { amountType, amount, currency } = workflowitem.data;
  if (amountType === "N/A" || !amount || !currency) {
    throw Error(
      `unexpected test data: ${JSON.stringify(workflowitem, null, 2)}`
    );
  }

  // Setting the amountType to N/A and passing a currency should only cause an error when the workflow item gets closed
  await axios.post("/workflowitem.update", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    workflowitemId: workflowitem.data.id,
    amountType: "N/A",
    amount: amount + 1,
    currency,
  });
  try {
    await axios.post("/workflowitem.close", {
      projectId: project.data.id,
      subprojectId: subproject.data.id,
      workflowitemId: workflowitem.data.id,
    });
    throw Error("This should not happen");
  } catch (error) {
    // ignoring
  }
  // Worked as expected, resetting the workflow item
  await axios.post("/workflowitem.update", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    workflowitemId: workflowitem.data.id,
    amountType,
    amount,
    currency,
  });

  const updatedWorkflowitem = await findWorkflowitem(
    axios,
    project,
    subproject,
    workflowitemTemplate
  );

  // make sure the workflow item has been reset and is still open
  if (
    updatedWorkflowitem.data.amountType !== amountType ||
    updatedWorkflowitem.data.amount !== amount ||
    updatedWorkflowitem.data.currency !== currency ||
    updatedWorkflowitem.data.status !== "open"
  ) {
    throw Error(
      "The update should not have had any effect on the workflowitem"
    );
  }

  if (workflowitem.data.documents.length !== 0) {
    // throw new Error(
    log.info(
      `workflowitem ${workflowitem.data.id} is not expected to already have documents attached. No further documents will be attached.`
    );
  } else {
    // Adding a document:
    const randomId = `id-${Math.floor(Math.random() * 1000000)}`;
    await axios.post("/workflowitem.update", {
      projectId: project.data.id,
      subprojectId: subproject.data.id,
      workflowitemId: workflowitem.data.id,

      documents: [
        {
          // "That's our first contract." in base64: VGhhdCdzIG91ciBmaXJzdCBjb250cmFjdC4=
          base64: "VGhhdCdzIG91ciBmaXJzdCBjb250cmFjdC4=",
          fileName: "document1-" + randomId + ".txt",
        },
        {
          // "That's our second contract." in base64: VGhhdCdzIG91ciBzZWNvbmQgY29udHJhY3Qu
          base64: "VGhhdCdzIG91ciBzZWNvbmQgY29udHJhY3Qu",
          fileName: "document2-" + randomId + ".txt",
        },
      ],
    });

    const itemWithDocuments = await findWorkflowitem(
      axios,
      project,
      subproject,
      workflowitemTemplate
    );
    if (
      !Array.isArray(itemWithDocuments.data.documents) ||
      itemWithDocuments.data.documents.length !== 2
    ) {
      log.warn(
        { documentsCount: itemWithDocuments.data.documents.length },
        "Number of documents"
      );
      log.warn(
        { isArray: Array.isArray(itemWithDocuments.data.documents) },
        "Is Documents object actually an array?"
      );
      throw Error("Adding documents to a workflowitem failed :(");
    }
  }

  const stillTheItemWithDocuments = await findWorkflowitem(
    axios,
    project,
    subproject,
    workflowitemTemplate
  );
  if (
    stillTheItemWithDocuments.data.documents[0].hash !==
    "657fa2f1a088db531144752b5b3a6c1de5edd5aa823cab99884143361f5d0470"
  ) {
    throw Error(
      "The document has changed but shouldn't (or the ordering was not preserved) :("
    );
  }

  // Restoring the original (test) data (except documents, which cannot be removed):
  await axios.post("/workflowitem.update", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    workflowitemId: workflowitem.data.id,
    amountType,
    amount,
    currency,
  });
}

async function testWorkflowitemReordering(folder) {
  await impersonate(serviceUser);
  const amazonFundProject = readJsonFile(folder + "amazon_fund.json");
  await provisionFromData(amazonFundProject);

  const project = await findProject(axios, amazonFundProject);
  const projectId = project.data.id;

  const subprojectTemplate = amazonFundProject.subprojects.find(
    (x) => x.displayName === "Furniture"
  );
  const subproject = await findSubproject(axios, project, subprojectTemplate);
  const subprojectId = subproject.data.id;

  // We choose two adjacent workflowitems:

  const interimInstallmentTemplate = subprojectTemplate.workflows.find(
    (x) => x.displayName === "Payment interim installment"
  );
  const interimInstName = interimInstallmentTemplate.displayName;
  const interimInstallment = await findWorkflowitem(
    axios,
    project,
    subproject,
    interimInstallmentTemplate
  );

  const finalInstallmentTemplate = subprojectTemplate.workflows.find(
    (x) => x.displayName === "Payment final installment"
  );
  const finalInstName = finalInstallmentTemplate.displayName;
  const finalInstallment = await findWorkflowitem(
    axios,
    project,
    subproject,
    finalInstallmentTemplate
  );

  // We check that the ordering is as expected:
  const getOrderingAsMap = () =>
    axios
      .get(
        `/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}`
      )
      .then((res) => res.data.data.workflowitems)
      .then((items) =>
        items
          .map((x) => x.data)
          .reduce((acc, x, index) => {
            acc[x.displayName] = index;
            return acc;
          }, {})
      );

  const originalOrdering = await getOrderingAsMap();
  if (originalOrdering[interimInstName] >= originalOrdering[finalInstName]) {
    throw Error(
      `unexpected test data: ${JSON.stringify(originalOrdering, null, 2)}`
    );
  }

  // Let's also check that at least one workflowitem of that subproject is closed:
  if (!subprojectTemplate.workflows.some((x) => x.status === "closed")) {
    throw Error(
      `unexpected at least one *closed* workflowitem (subproject ${subprojectTemplate.displayName})`
    );
  }

  // If we explicitly order them differently, they should show up reversed right after the last closed workflowitem:
  await axios.post("/subproject.reorderWorkflowitems", {
    projectId,
    subprojectId,
    ordering: [finalInstallment.data.id, interimInstallment.data.id],
  });
  const changedOrdering = await getOrderingAsMap();
  if (changedOrdering[finalInstName] === 0) {
    throw Error(
      "The ordering seems to affect closed items too, which shouldn't happen"
    );
  }
  if (changedOrdering[finalInstName] >= originalOrdering[finalInstName]) {
    throw Error(
      "The final installment workflowitem should have moved to an earlier position." +
        ` Instead, it has moved from ${originalOrdering[finalInstName]} to ${
          changedOrdering[finalInstName]
        }. original ordering = ${JSON.stringify(
          originalOrdering
        )}; changed ordering = ${JSON.stringify(changedOrdering)}`
    );
  }
  if (changedOrdering[finalInstName] >= changedOrdering[interimInstName]) {
    throw Error(
      "The final installment workflowitem should have move before the interim installment workflowitem." +
        ` Instead, final installment has moved from ${originalOrdering[finalInstName]} to ${changedOrdering[finalInstName]},` +
        ` while interim installment has moved from ${originalOrdering[interimInstName]} to ${changedOrdering[interimInstName]}`
    );
  }

  // Let's clear the ordering:
  await axios.post("/subproject.reorderWorkflowitems", {
    projectId,
    subprojectId,
    ordering: [],
  });

  // Now the ordering should be restored:
  const restoredOrdering = await getOrderingAsMap();
  if (restoredOrdering[interimInstName] >= restoredOrdering[finalInstName]) {
    throw Error("Failed to restore original ordering");
  }
}

async function testApiDocIsAvailable() {
  queryApiDoc(axios).then(() => log.info("api/documentation OK"));
}

async function runIntegrationTests(rootSecret, folder) {
  await testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(rootSecret, folder);
  await testWorkflowitemUpdate(folder);
  await testWorkflowitemReordering(folder);
  await testApiDocIsAvailable();
  log.info("Integration tests complete.");
}

async function checkProvisionState(axios) {
  const { isProvisioned, message } = await queryProvisionState(axios);
  log.info(message);
  if (isProvisioned) {
    log.info("The blockchain is already provisioned, skip provisioning ...");
    process.exit(0);
  }
}

const provisionBlockchain = async (host, port, rootSecret, organization) => {
  try {
    const folder =
      process.env.PROVISIONING_TYPE === "PROD"
        ? "./src/data/prod/"
        : "./src/data/test/";

    axios.defaults.baseURL = `http://${host}:${port}/api`;
    log.info("Axios baseURL is set to " + axios.defaults.baseURL);
    axios.defaults.timeout = 10000;

    await isApiReady(axios);

    currentUser.id = "root";
    currentUser.password = rootSecret;
    await impersonate(currentUser);

    await checkProvisionState(axios);

    log.info("Set provision_started flag on multichain");
    await setProvisionStartFlag(axios);
    log.info("Start to provision users");
    await provisionUsers(axios, folder, organization);
    log.info("Start to provision groups");
    await provisionGroups(axios, folder);

    log.info("Starting to provision projects");
    await impersonate(serviceUser);
    const files = readDirectory(folder);
    for (const fileName of files) {
      if (projectBlacklist.indexOf(fileName) === -1) {
        const project = readJsonFile(folder + fileName);
        await provisionFromData(project);
      }
    }
    if (process.env.PROVISIONING_TYPE !== "PROD") {
      await runIntegrationTests(rootSecret, folder);
    }

    currentUser.id = "root";
    currentUser.password = rootSecret;
    await impersonate(currentUser);
    log.info("Set provision_ended flag on multichain");
    await setProvisionEndFlag(axios);
  } catch (err) {
    log.warn({ err }, "Provisioning failed");
    process.exit(1);
  }
};

const provisionBetaNode = async (host, port, rootSecret, organization) => {
  try {
    const folder =
      process.env.PROVISIONING_TYPE === "PROD"
        ? "./src/data/prod/"
        : "./src/data/test/";

    axios.defaults.baseURL = `http://${host}:${port}/api`;
    log.info("Axios baseURL is set to " + axios.defaults.baseURL);
    axios.defaults.timeout = 10000;

    await isApiReady(axios);

    currentUser.id = "root";
    currentUser.password = rootSecret;
    await impersonate(currentUser);

    log.info("Start to beta-provisioning users");
    await provisionUsers(axios, folder, organization);
    log.info("Start to beta-provisioning groups");
    await provisionGroups(axios, folder);
  } catch (err) {
    log.warn({ err }, "Beta-provisioning failed");
    process.exit(1);
  }
};

const port = process.env.API_PORT || 8080;
const host = process.env.API_HOST || "localhost";
const rootSecret = process.env.ROOT_SECRET || "root-secret";
const organization = process.env.ORGANIZATION;
const isBeta = process.env.PROVISIONING_BETA === "true" || false;
let currentUser = { id: "root", password: rootSecret };

// Executing admin user
const serviceUser = {
  id: process.env.PROVISIONING_SERVICE_USER || "mstein",
  password: process.env.PROVISIONING_SERVICE_PASSWORD || "test",
};

if (!organization) {
  log.info("ORGANIZATION not set");
  process.exit(1);
}
if (!rootSecret) {
  log.info("ROOT_SECRET not set");
  process.exit(1);
}

if (isBeta) {
  provisionBetaNode(host, port, rootSecret, organization).then(() => {
    log.info("\x1b[32m%s\x1b[0m", "Successfully beta-provisioned Trubudget!");
    process.exit(0);
  });
} else {
  provisionBlockchain(host, port, rootSecret, organization).then(() => {
    log.info("\x1b[32m%s\x1b[0m", "Successfully provisioned Trubudget!");
    process.exit(0);
  });
}
