describe("Workflowitem types", function() {
  let projectId;
  let subprojectId;

  before(() => {
    cy.login();
    cy.createProject("workflowitem type test project", "workflowitem type test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem type test", "EUR");
      })
      .then(({ id }) => {
        subprojectId = id;
      });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("Creating restricted workflowitem is possible", function() {
    cy.get("[data-test=createWorkflowitem]").click();
    cy.get("[data-test=nameinput] input").type("restricted");

    // Select workflowitem type
    cy.get("[data-test=dropdown-types-click]")
      .should("be.visible")
      .click();
    cy.get("[data-value=restricted]").click();
    cy.get("[data-test=next]").click();
    cy.get("[data-test=submit]").click();

    // Check workflowitem details
    cy.get("[data-test*=workflowitem-info]")
      .first()
      .click();
    cy.get("[data-test=workflowitemInfoType]").should("contain", "restricted");
  });

  it("A workflowitem of type restricted grants and revokes permissions when it's assigned", function() {
    // Assign another user
    cy.get("[data-test=workflowitem-table]")
      .get("[data-test=assignee-container]")
      .last()
      .click();
    cy.get("[data-test=assignee-name]")
      .first()
      .click();
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();

    // The assignee received all permissions
    cy.login("thouse", "test");
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=edit-workflowitem]")
      .last()
      .should("be.visible");
  });
});
