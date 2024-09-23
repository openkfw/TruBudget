describe("Workflow unordered mode", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;
  const apiRoute = "/api";
  const testUser = { id: "jdoe", password: "test" };

  before(() => {
    cy.login();
    cy.createProject("workflowitem unordered test project", "workflowitem unordered test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
      cy.createSubproject(projectId, "workflowitem unordered test subproject", "EUR", { workflowMode: "unordered"}).then(({ id }) => {
        subprojectId = id;
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id);
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem unordered step 1").then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    });
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem unordered step 2").then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    });
  });

  it("In unordered workflow mode, items can be closed in any order", function() {
    cy.intercept(apiRoute + `/workflowitem.close`).as("workflowitemClose");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");

    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=close-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=confirmation-dialog-confirm]").click({ force: true });
    cy.wait("@workflowitemClose")
      .wait("@viewDetails")
      .get("[data-test^=workflowitem-]")
      .get(`[data-test=workflowitem-info-button-${workflowitemId}]`)
      .click({ force: true })
      .get("[data-test=workflowitem-status]")
      .should("contain", "Closed");
  });
});
