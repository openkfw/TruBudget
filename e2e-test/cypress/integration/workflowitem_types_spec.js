describe("Workflowitem types", function() {
  let projectId;
  let subprojectId;

  before(() => {
    cy.login();
    cy.createProject("workflowitemTypeTest", "workflowitem type test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitemTypeTest").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitemTypeTest");
      });
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

    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();

    // Check workflowitem details
    cy.get(`[data-test*=workflowitem-info-button]`)
      .last()
      .click();
    cy.get("[data-test=workflowitemInfoType]").should("contain", "restricted");
  });

  it("A workflowitem of type restricted grants and revokes permissions when it's assigned", function() {
    // Assign another user
    cy.get("[data-test=workflowitem-table]")
      .get("[data-test=single-select-container]")
      .last()
      .click();
    cy.get("[data-test^=single-select-name]")
      .first()
      .click();
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();

    cy.get("[data-test=edit-workflowitem]")
      .last()
      .should("be.visible");

    // The assignee received all permissions
    cy.login("thouse", "test");
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=edit-workflowitem]")
      .last()
      .should("be.visible");
  });
});
