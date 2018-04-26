const { sleep } = require("./lib");

const futureProject = {
  displayName: "Amazonas Fund",
  description: "My awesome project",
  amount: "32000000",
  currency: "BRL"
};

const grantPermissionsToUser = async (axios, projectId, userId) => {
  return Promise.all(
    [
      "project.viewDetails",
      "project.viewSummary",
      "project.assign",
      "project.intent.listPermissions",
      "project.intent.grantPermission",
      "project.intent.revokePermission"
    ].map(intent =>
      axios.post("/project.intent.grantPermission", {
        projectId,
        intent,
        userId
      })
    )
  );
};
export const provisionProjects = async axios => {
  const response = await axios.get("/project.list");
  const projects = response.data.data.items;
  const existingProject = projects.find(
    project =>
      project.displayName === futureProject.displayName && project.amount === futureProject.amount
  );
  if (existingProject !== undefined) {
    console.log(`~> Project ${futureProject.displayName} already exists`);
    return existingProject.id;
  }

  const resp = await axios.post("/global.createProject", { project: futureProject });
  console.log(`~> Project ${futureProject.displayName} created`);
  const projectListResult = await axios.get("/project.list");
  const createdProject = projectListResult.data.data.items.find(
    project =>
      project.displayName === futureProject.displayName && project.amount === futureProject.amount
  );
  if (createdProject === undefined)
    throw Error(
      `Project creation failed. project.list result: ${JSON.stringify(projectListResult.data)}`
    );
  await grantPermissionsToUser(axios, createdProject.id, "mstein");
  console.log("~> Project permissions granted for mstein");
  await grantPermissionsToUser(axios, createdProject.id, "jxavier");
  console.log("~> Project permissions granted for jxavier");
  return createdProject.id;
};
