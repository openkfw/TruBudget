describe("Workflowitem close", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;
  const apiRoute = "/api";
  const testUser = { id: "jdoe", password: "test" };

  before(() => { 
    cy.login();
    cy.createProject("workflowitem close test project", "workflowitem close test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
      cy.createSubproject(projectId, "workflowitem close test", "EUR").then(({ id }) => {
        subprojectId = id;
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id);
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testUser.id);
    });
  });

  it("The workflowitem can be closed by the assignee only", function() {
    cy.intercept(apiRoute + `/workflowitem.close`).as("workflowitemClose");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");

    // testUser may not close the workflowitem
    cy.login(testUser.id, testUser.password);
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=close-workflowitem]").should("not.exist");

    // the assignee my close the workflowitem
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
