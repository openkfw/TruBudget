describe("Workflowitem's history", function() {
  let projectId;
  let subprojectId;

  before(() => {
    cy.login();

    cy.createProject("workflowitem history test project", "workflowitem history test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem history test");
      })
      .then(({ id }) => {
        subprojectId = id;
        return cy.createWorkflowitem(projectId, subprojectId, "workflowitem history test", { amountType: "N/A" });
      });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("The history contains only the workflowitem creation event.", function() {
    cy.get(".workflowitem-info-button").click();

    // opens info dialog window..

    cy.get("#workflowitem-history-tab").click();

    // Count history items => should be one
    cy.get("#history-list li.history-item")
      .first()
      .should("be.visible");
    cy.get("#history-list")
      .find("li.history-item")
      .should("have.length", 1);

    // Make sure it's a creation event
    cy.get("#history-list")
      .find("li.history-item")
      .first()
      .should("contain", "created workflowitem");
  });

  it("The history is sorted from new to old", function() {
    // Change assignee to create new history event
    cy.get("[data-test=workflowitem-assignee]").click();
    cy.get("[role=listbox]")
      .find("[value=jdoe]")
      .click()
      .type("{esc}");

    cy.get(".workflowitem-info-button").click();

    // opens info dialog window..

    cy.get("#workflowitem-history-tab").click();

    // Count history items => should be two
    cy.get("#history-list li.history-item")
      .first()
      .should("be.visible");
    cy.get("#history-list")
      .find("li.history-item")
      .should("have.length", 2);

    // Make sure the oldest entry is the create event
    cy.get("#history-list")
      .find("li.history-item")
      .last()
      .should("contain", "created workflowitem");

    // Make sure the newest entry is the assign event
    cy.get("#history-list")
      .find("li.history-item")
      .first()
      .should("contain", "assigned workflowitem");
  });
});
