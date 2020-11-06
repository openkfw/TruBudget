const axios = require("axios");
const { provisionUsers, provisionGroups } = require("./users_and_groups");
const { readDirectory, readJsonFile } = require("./files");
const {
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
} = require("./api");

const DEFAULT_API_VERSION = "1.0";

// List all files here that do not contain project data
const projectBlacklist = ["users.json", "close_test.json", "groups.json"];

// Executing admin user
const serviceUser = {
  id: "mstein",
  password: "test",
};

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
  (response) => {
    return response;
  },
  function (error) {
    if (!error.response) {
      return Promise.reject({
        code: error.code,
        data: { error: { message: error.message } },
      });
    }
    return Promise.reject(error.response);
  }
);

async function impersonate(userId, password) {
  const token = await authenticate(axios, userId, password);
  console.log(`Now logged in as ${userId}`);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

const provisionBlockchain = async (host, port, rootSecret, organization) => {
  try {
    const folder =
      process.env.ENVIRONMENT_TYPE === "PROD"
        ? "./src/data/prod/"
        : "./src/data/test/";

    axios.defaults.baseURL = `http://${host}:${port}/api`;
    axios.defaults.timeout = 10000;

    await impersonate("root", rootSecret);
    console.log("Start to provision users");
    await provisionUsers(axios, folder, organization);
    await provisionGroups(axios, folder);

    console.log("Starting to provision projects");
    await impersonate(serviceUser.id, serviceUser.password);
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

const provisionFromData = async (projectTemplate) => {
  console.log(`Start provisioning project ${projectTemplate.displayName}....`);
  try {
    const projectExists = await findProject(axios, projectTemplate).then(
      (existingProject) => existingProject !== undefined
    );
    if (projectExists) {
      console.log(`${projectTemplate.displayName} project already exists.`);
    } else {
      await createProject(axios, projectTemplate);
    }

    console.log(`Create subprojects....`);
    const isToBeClosed = projectTemplate.status === "closed";

    const project = await findProject(axios, projectTemplate);

    if (projectTemplate.permissions !== undefined) {
      console.log("Granting permissions..");
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
      console.log("Testing project update..");
      await updateProject(axios, project.data.id, projectTemplate.description);
    }

    for (const subprojectTemplate of projectTemplate.subprojects) {
      console.log(`Provision Subproject ${subprojectTemplate.displayName}`);
      await provisionSubproject(project, subprojectTemplate);
    }

    if (isToBeClosed) {
      await assignProject(axios, project.data.id, serviceUser.id);
      await closeProject(axios, project);
    }

    console.log(`Project ${fmtList([project])} created.`);
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      console.log(
        `Failed to provision project ${projectTemplate.displayName} , max retries exceeded`
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
    console.log(
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
    console.log(
      `Workflowitem ${fmtList([project, subproject, workflowitem])} created.`
    );
  }

  // Testing updates:
  if (workflowitem.data.status === "open") {
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

const fmtList = (l) =>
  l
    .map((x) => (x.data.displayName === undefined ? x : x.data.displayName))
    .map((x) => `"${x}"`)
    .join(" > ");

async function runIntegrationTests(rootSecret, folder) {
  await testProjectCloseOnlyWorksIfAllSubprojectsAreClosed(rootSecret, folder);
  await testWorkflowitemUpdate(folder);
  await testWorkflowitemReordering(folder);
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
    .then((result) => {
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

  await findProject(axios, closeProjectTest).then((x) => {
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

async function testWorkflowitemUpdate(folder) {
  await impersonate("mstein", "test");
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

  if (workflowitem.data.documents.length !== 0) {
    throw new Error(
      `workflowitem ${workflowitem.data.id} is not expected to already have documents attached. Note that the provisioning script shouldn't run more than once.`
    );
  }

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

  // Adding a document:
  const now = new Date().toISOString();
  const documentId1 = `${now} first contract`;
  const documentId2 = `${now} second contract`;
  await axios.post("/workflowitem.update", {
    projectId: project.data.id,
    subprojectId: subproject.data.id,
    workflowitemId: workflowitem.data.id,
    documents: [
      {
        id: documentId1,
        base64: "VGhhdCdzIG91ciBmaXJzdCBjb250cmFjdC4=",
      },
      {
        id: documentId2,
        base64: "VGhhdCdzIG91ciBzZWNvbmQgY29udHJhY3Qu",
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
    throw Error(`Adding documents to a workflowitem failed :(`);
  }

  // Updating an existing document shouldn't be allowed:
  try {
    await axios.post("/workflowitem.update", {
      projectId: project.data.id,
      subprojectId: subproject.data.id,
      workflowitemId: workflowitem.data.id,
      documents: [
        {
          id: documentId1,
          base64:
            "VGhhdCdzIG91ciBmaXJzdCBjb250cmFjdC4gSnVzdCBraWRkaW5nLCBJJ3ZlIGNoYW5nZWQgaXQhIG11YWhhaGE=",
        },
      ],
    });
    throw Error(
      `Updated an existing document, but that isn't supposed to work :(`
    );
  } catch (_err) {}
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
      `The document has changed but shouldn't (or the ordering was not preserved) :(`
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
  await impersonate("mstein", "test");
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
  await axios.post(`/subproject.reorderWorkflowitems`, {
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
  await axios.post(`/subproject.reorderWorkflowitems`, {
    projectId,
    subprojectId,
    ordering: [],
  });

  // Now the ordering should be restored:
  const restoredOrdering = await getOrderingAsMap();
  if (restoredOrdering[interimInstName] >= restoredOrdering[finalInstName]) {
    throw Error(`Failed to restore original ordering`);
  }
}

async function testApiDocIsAvailable() {
  queryApiDoc(axios).then(() => console.log("api/documentation OK"));
}

const port = process.env.API_PORT || 8080;
const host = process.env.API_HOST || "localhost";
const rootSecret = process.env.ROOT_SECRET || "asdf";
const organization = process.env.ORGANIZATION;

if (!organization) {
  console.log("ORGANIZATION not set");
  process.exit(1);
}

provisionBlockchain(host, port, rootSecret, organization);
