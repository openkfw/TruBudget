describe("Workflowitem reject", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;
  let baseUrl, apiRoute;

  const testUser = { id: "jdoe", password: "test" };
  const rejectReason = "Reject reason";

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();

    cy.createProject("workflowitem reject test project", "workflowitem reject test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
      cy.createSubproject(projectId, "workflowitem reject test", "EUR").then(({ id }) => {
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

  it("When rejecting a workflow item, a reason must be provided", function() {
    // testUser may not reject the workflowitem
    cy.server();
    cy.login(testUser.id, testUser.password);
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]").should("not.be.visible");

    // the assignee may reject the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
  });

  it("The workflowitem can be rejected by the assignee only", function() {
    cy.server();

    cy.route("POST", apiRoute + `/workflowitem.close`).as("workflowitemClose");

    // the assignee may reject the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=reject-workflowitem-reject-reason]").type(rejectReason);
    cy.get("[data-test=confirmation-dialog-confirm]").should("not.be.disabled");
    cy.get("[data-test=confirmation-dialog-confirm]").click({ force: true });
    cy.wait("@workflowitemClose");

    cy.get("[data-test=closed-workflowitem-reject-reason]")
      .first()
      .click();
    cy.get("[data-test=infromation-dialog-content]").should("contain", rejectReason);
    cy.get("[data-test=infromation-dialog-close]").click();
  });
});
