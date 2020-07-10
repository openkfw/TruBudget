describe("Project Close", function() {
  let projectId;
  let subprojectId;

  before(() => {
    cy.login();
    cy.createProject("p-close", "project close test").then(({ id }) => {
      projectId = id;
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit("/projects/" + projectId);
  });

  it("When closing the project, a dialog pops up", function() {
    cy.get("[data-test=pc-button]").should("be.visible");

    // // Close subproject
    // cy.get("[data-test=spc-button]").click();
    // cy.get("[data-test=confirmation-dialog]").should("be.visible");
    // cy.get("[data-test=confirmation-dialog-confirm]").click();
    // cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
    // cy.get("[data-test=spc-button]").should("not.be.visible");

    // cy.visit(`/projects/${projectId}`);
    // cy.get("[data-test=pc-button]").should("be.enabled");

    // Cancel closing the project
    cy.get("[data-test=pc-button]").click();
    cy.get("[data-test=confirmation-dialog]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

    // // Close project
    // cy.get("[data-test=pc-button]").click();
    // cy.get("[data-test=confirmation-dialog]").should("be.visible");
    // cy.get("[data-test=confirmation-dialog-confirm]").click();
    // cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
    // cy.get("[data-test=pc-button]").should("not.be.visible");
  });

  it("Closing a project with open subprojects is not possible", function() {
    cy.createSubproject(projectId, "subproject assign test").then(() => {
      cy.visit("/projects/" + projectId);
      cy.get("[data-test=pc-button]").should("be.disabled");
    });
  });

  it("Closing a project including closed subprojects is possible", function() {
    cy.createProject("p-close", "project close test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(id, "subproject assign test").then(({ id }) => {
        subprojectId = id;
        cy.visit("/projects/" + projectId);
        cy.get("[data-test=pc-button]").should("be.disabled");
        cy.visit("/projects/" + projectId + "/" + subprojectId);

        // Close subproject
        cy.get("[data-test=spc-button]").click();
        cy.get("[data-test=confirmation-dialog]").should("be.visible");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
        cy.get("[data-test=spc-button]").should("not.be.visible");

        cy.visit(`/projects/${projectId}`);
        cy.get("[data-test=pc-button]").should("be.enabled");

        // Cancel closing the project
        cy.get("[data-test=pc-button]").click();
        cy.get("[data-test=confirmation-dialog]").should("be.visible");
        cy.get("[data-test=confirmation-dialog-cancel]").click();
        cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

        // Close project
        cy.get("[data-test=pc-button]").click();
        cy.get("[data-test=confirmation-dialog]").should("be.visible");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
        cy.get("[data-test=pc-button]").should("not.be.visible");
      });
    });
  });
});
