describe("Workflowitem edit", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;
  let baseUrl, apiRoute;

  const testUser = { id: "jdoe", password: "test" };

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();

    cy.createProject("workflowitem edit test project", "workflowitem edit test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
      cy.createSubproject(projectId, "workflowitem edit test", "EUR").then(({ id }) => {
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
    cy.server();
    cy.route("POST", apiRoute + `/workflowitem.close`).as("workflowitemClose");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");

    // testUser may not close the workflowitem
    cy.login(testUser.id, testUser.password);
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=close-workflowitem]").should("not.be.visible");

    // the assignee my close the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
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
      .should("contain", "Closed");
  });
});
