describe("Workflowitem's history", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;

  before(() => {
    cy.login();
    cy.createProject("p-subp-assign", "workflowitem assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem assign test").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
          workflowitemId = id;
        });
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("The history contains only the workflowitem creation event.", function() {
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();
    // opens info dialog window..
    cy.get("[data-test=workflowitem-history-tab]").click();

    // Count history items => should be one
    cy.get("[data-test=history-list] li.history-item")
      .first()
      .should("be.visible");
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 1);

    // Make sure it's a creation event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "created workflowitem");
  });

  it("The history is sorted from new to old", function() {
    // Update workflowitem to create new history event
    cy.get(`[data-test=workflowitem-table]`)
      .find("button[data-test^='edit-workflowitem']")
      .click();
    cy.get("[data-test=nameinput] input").type("-changed");
    cy.get("[data-test=next]").click();
    cy.get("[data-test=submit]").click();

    cy.get("[data-test=workflowitem-table]")
      .find("button[data-test^='workflowitem-info-button-']")
      .click();
    // opens info dialog window..
    cy.get("[data-test=workflowitem-history-tab]").click();

    // The oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created workflowitem");

    // The newest entry is the update event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "changed workflowitem");
  });

  it("When changing the tab, the history is fetched correctly", function() {
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();

    // opens info dialog window..

    cy.get("[data-test=workflowitem-history-tab]").click();

    // Count history items => should be one
    cy.get("[data-test=history-list] li.history-item")
      .first()
      .should("be.visible");

    cy.get("[data-test=workflowitem-documents-tab]").click();
    cy.get("[data-test=workflowitem-history-tab]").click();

    // Items should be visible and user should not be logged out
    cy.get("[data-test=history-list] li.history-item")
      .first()
      .should("be.visible");
  });
});
