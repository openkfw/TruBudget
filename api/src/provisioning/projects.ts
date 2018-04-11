const { sleep } = require('./index');

const futureProject = {
  displayName: "Amazonas Fund",
  description: "My awesome project",
  amount: "32000000",
  currency: "BRL"
}

export const provisionProjects = async axios => {
  try {
    const response = await axios.get("/project.list");
    const projects = response.data.data.items;
    const alreadyExists = projects.find(project => project.displayName === futureProject.displayName && project.amount === futureProject.amount);
    if (!alreadyExists) {
      const resp = await axios.post("/project.create", futureProject);
      console.log(`~> Project ${futureProject.displayName} created`);
    } else {
      console.log(`~> Project ${futureProject.displayName} already exists`);
    }
  } catch (err) {
    console.log('Blockchain or API not up yet, sleeping for 5 seconds')
    await sleep(5000);
    await provisionProjects(axios);
  }
};
