import Intent from "../authz/intents";

const { sleep } = require("./lib");

const futureSubproject = {
  displayName: "Set up the platform",
  description: "The first step is to set up a tracking platform.",
  amount: "1000",
  currency: "BRL"
};

const grantPermissionsToUser = async (axios, projectId, subprojectId, userId) => {
  return Promise.all(
    [
      "subproject.viewDetails",
      "subproject.viewSummary",
      "subproject.assign",
      "subproject.intent.listPermissions",
      "subproject.intent.grantPermission",
      "subproject.intent.revokePermission"
    ].map((intent: Intent) =>
      axios.post("/subproject.intent.grantPermission", {
        projectId,
        subprojectId,
        intent,
        userId
      })
    )
  );
};
export const provisionSubprojects = async (axios, projectId) => {
  const response = await axios.get(`/subproject.list?projectId=${projectId}`);
  const subprojects = response.data.data.items;
  const existingSubproject = subprojects.find(
    subproject =>
      subproject.displayName === futureSubproject.displayName &&
      subproject.amount === futureSubproject.amount
  );
  if (existingSubproject !== undefined) {
    console.log(`~> Subproject ${futureSubproject.displayName} already exists`);
    return existingSubproject.id;
  }

  const resp = await axios.post("/project.createSubproject", {
    projectId,
    subproject: futureSubproject
  });
  const subprojectListResult = await axios.get(`/subproject.list?projectId=${projectId}`);
  console.log(`~> Subproject ${futureSubproject.displayName} created`);
  const createdSubproject = subprojectListResult.data.data.items.find(
    subproject =>
      subproject.displayName === futureSubproject.displayName &&
      subproject.amount === futureSubproject.amount
  );
  if (createdSubproject === undefined)
    throw Error(
      `Subproject creation failed. subproject.list result: ${JSON.stringify(
        subprojectListResult.data
      )}`
    );
  await grantPermissionsToUser(axios, projectId, createdSubproject.id, "mstein");
  console.log("~> Subproject permissions granted for mstein");
  await grantPermissionsToUser(axios, projectId, createdSubproject.id, "jxavier");
  console.log("~> Subproject permissions granted for jxavier");
  return createdSubproject.id;
};
