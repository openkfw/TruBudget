const { sleep } = require("./lib");

const futureProject = {
  displayName: "Amazonas Fund",
  description: "My awesome project",
  amount: "32000000",
  currency: "BRL"
};

const grantPermissionsToUser = async (axios, projectId, userId) => {
  await axios.post("/project.intent.grantPermission", {
    id: projectId,
    permissions: {
      "project.viewDetails": [userId],
      "project.viewSummary": [userId],
      "project.assign": [userId],
      "project.intent.list": [userId],
      "project.intent.grantPermission": [userId],
      "project.intent.revokePermission": [userId]
    }
  });
};
export const provisionProjects = async axios => {
  try {
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
          project.displayName === futureProject.displayName &&
          project.amount === futureProject.amount
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
  } catch (err) {
    console.log("Blockchain or API not up yet, sleeping for 10 seconds");
    console.log(err);
    await sleep(10000);
    await provisionProjects(axios);
  }
};
