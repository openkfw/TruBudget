export const provisionProjects = async axios => {
  const response = await axios.post("/project.create", {
    displayName: "my test project",
    description: "and it's description",
    amount: "1234",
    currency: "EUR"
  });
};
