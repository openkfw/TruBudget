describe("Workflowitem types", function() {
  let projectId;
  let subprojectId;
  let baseUrl, apiRoute;

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
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
    const assignee = { name: "Tom House", id: "thouse" };
    cy.server();
    cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
    cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
    cy.route("GET", apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
    cy.route("POST", apiRoute + "/workflowitem.assign*").as("assign");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitemTypeTest", {
      workflowitemType: "restricted",
      assignee: "mstein"
    }).then(({ id }) => {
      let workflowitemId = id;
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      cy.get(`[data-test=workflowitem-${workflowitemId}]`).within(() => {
        cy.get("[data-test=show-workflowitem-permissions]").should("be.visible");
        cy.get("[data-test=single-select-disabled]").should("not.exist");
        cy.get("[data-test=single-select]").should("be.visible");
        cy.get("[data-test=edit-workflowitem]").should("be.visible");
        // set thouse to assignee
        cy.get("[data-test=single-select-container]").click();
      });

      cy.get("[data-test=single-select-list]").should("be.visible");
      cy.get(`[data-test=single-select-name-${assignee.id}]`).click();
      cy.get("[data-test=confirmation-dialog-confirm]").click();

      cy.wait("@listProjectPermissions", { timeout: 30000 });
      cy.wait("@listSubprojectPermissions", { timeout: 30000 });
      cy.wait("@listWorkflowitemPermissions", { timeout: 30000 });
      cy.wait("@assign", { timeout: 30000 });

      cy.get(`[data-test=workflowitem-${workflowitemId}]`)
        .should("be.visible")
        .within(() => {
          // api revokes permissions for mstein, mstein has only view permissions
          cy.get("[data-test=single-select-disabled]").should("exist");
          cy.get("[data-test=edit-workflowitem]").should("be.disabled");
        });

      // thouse has all permissions
      cy.login(assignee.id);
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      cy.get(`[data-test=workflowitem-${workflowitemId}]`).within(() => {
        cy.get("[data-test=single-select-disabled]").should("not.exist");
        cy.get("[data-test=single-select]").should("be.visible");
        cy.get("[data-test=edit-workflowitem]").should("be.visible");
        cy.get("[data-test=show-workflowitem-permissions]").should("be.visible");
      });
    });
  });
});
