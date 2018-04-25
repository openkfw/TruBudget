const { sleep } = require("./lib");

const futureProject = {
  displayName: "Amazonas Fund",
  description: "My awesome project",
  amount: "32000000",
  currency: "BRL"
};

const grantPermissionsToUser = async (axios, projectId, user) => {
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
        user
      })
    )
  );
};
export const provisionProjects = async axios => {
  const response = await axios.get("/project.list");
  const projects = response.data.data.items;
  const alreadyExists = projects.find(
    project =>
      project.displayName === futureProject.displayName && project.amount === futureProject.amount
  );
  if (!alreadyExists) {
    const resp = await axios.post("/project.create", futureProject);
    const existingProjects = await axios.get("/project.list");
    console.log(`~> Project ${futureProject.displayName} created`);
    const createdProject = existingProjects.data.data.items.find(
      project =>
        project.displayName === futureProject.displayName && project.amount === futureProject.amount
    );
    if (createdProject) {
      await grantPermissionsToUser(axios, createdProject.id, "mstein");
      console.log("~> Project permissions granted for mstein");
      await grantPermissionsToUser(axios, createdProject.id, "jxavier");
      console.log("~> Project permissions granted for jxavier");
    }
  } else {
    console.log(`~> Project ${futureProject.displayName} already exists`);
  }
};
