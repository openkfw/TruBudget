describe("Subproject Close", function() {
  let projectId;
  let subprojectId;
  let baseUrl, apiRoute;

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();
    cy.createProject("sp-close", "Project for test of suproject closing")
      .then(({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "Subproject no. 1").then(({ id }) => {
          subprojectId = id;
        });
      });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("When closing the subproject, a dialog pops up", function() {
    cy.get("[data-test=spc-button]").should("be.visible");

    // Cancel closing the subproject
    cy.get("[data-test=spc-button]").click();
    cy.get("[data-test=confirmation-dialog]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

    // Close subproject
    cy.get("[data-test=spc-button]").click();
    cy.get("[data-test=confirmation-dialog]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
    cy.get("[data-test=spc-button]").should("not.be.visible");

    // Go to superior project
    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=pc-button]").should("be.enabled");
  });

  it("Closing a subproject including closed workflow items is possible", function() {
    cy.createSubproject(projectId, "Subproject no. 2").then(({ id }) => {
      subprojectId = id;
      cy.createWorkflowitem(projectId, subprojectId, "Contract with Ministry of foreign affairs").then(({ id }) => {
        let workflowitemId = id;

        cy.server();
        cy.route("POST", apiRoute + `/workflowitem.close`).as("workflowitemClose");
        cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");

        cy.visit(`/projects/${projectId}`);
        cy.get("[data-test=pc-button]").should("be.disabled");
        cy.visit(`/projects/${projectId}/${subprojectId}`);

        // Closing a subproject with open workflow item is not possible
        cy.get("[data-test=spc-button]").should("be.disabled");

        // Close workflow item
        cy.get("[data-test=close-workflowitem]")
          .last()
          .click({ force: true });
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        cy.wait("@workflowitemClose")
          .wait("@viewDetails")
          .get("[data-test^=workflowitem-]")
          .get(`[data-test=workflowitem-info-button-${workflowitemId}]`)
          .click()
          .get("[data-test=workflowitem-status]")
          .should("contain", "Closed")
          .get("[data-test=workflowdetails-close]")
          .click();

        // Cancel closing the subproject
        cy.get("[data-test=spc-button]").scrollIntoView().click();
        cy.get("[data-test=confirmation-dialog]").should("be.visible");
        cy.get("[data-test=confirmation-dialog-cancel]").click();
        cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

        // Close subproject
        cy.get("[data-test=spc-button]").click();
        cy.get("[data-test=confirmation-dialog]").should("be.visible");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
        cy.get("[data-test=spc-button]").should("not.be.visible");
      });
    });
  });
});
