describe("Subproject creation", function() {
  it("Root cannot add a subproject", function() {
    let projectId;
    const organization = "ACME Corp";
    const projectProjectedBudget = {
      organization,
      currencyCode: "EUR",
      value: "10000"
    };

    //Create a project
    cy.login()
      .then(() =>
        cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget])
      )
      .then(({ id }) => {
        projectId = id;
      })
      //Log in as root since root can not create projects
      .then(() => cy.login("root", "root-secret"))
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=subproject-create-button]").should("be.visible"))
      .then(() => cy.get("[data-test=subproject-create-button]").should("be.disabled"));
  });
});
