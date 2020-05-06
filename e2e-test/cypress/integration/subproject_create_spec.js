describe("Subproject creation", function() {
  let projectId;

  it("Root cannot add a subproject", function() {
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

  it("Check warnings that permissions are not assigned", function() {
    cy.login();
    cy.visit(`/projects/${projectId}`);

    //Create a subproject
    cy.get("[data-test=subproject-create-button]").click();
    cy.get("[data-test=nameinput] input").type("Test");
    cy.get("[data-test=dropdown-sp-dialog-currencies-click]")
      .click()
      .then(() => cy.get("[data-value=EUR]").click());
    cy.get("[data-test=submit]").click();

    //Check snackbar warning visible
    cy.get("[data-test=client-snackbar]")
      .should("be.visible")
      .should("contain", "permissions");

    //Check warning badge
    cy.get("[data-test=warning-badge]").should("be.visible");
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=warning-badge]").should("not.be.checked");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=warning-badge]").should("not.be.checked");
  });
});
