describe("Workflowitem's history", function() {
  let projectId;
  let subprojectId;
  let baseUrl = undefined;
  let apiRoute = undefined;
  const timeoutOption = { timeout: 60000 };

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

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
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchProjectPermissions");
    cy.route("GET", apiRoute + `/subproject.intent.listPermissions**`).as("fetchSubprojectPermissions");
    cy.route("GET", apiRoute + `/workflowitem.intent.listPermissions**`).as("fetchWorkflowitemPermissions");
    // Change assignee to create new history event
    cy.get("[data-test=workflowitem-assignee]")
      .first()
      .click();
    cy.wait(["@fetchProjectPermissions", "@fetchSubprojectPermissions", "@fetchWorkflowitemPermissions"]).then(() => {
      cy.get("[role=listbox]")
        .find("[value=jdoe]")
        // Set short timeout to be sure the animation is done
        .click(timeoutOption);
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      cy.get("[role=listbox]")
        .find("[data-test=search-assignee-field]")
        .click()
        .type("{esc}");

      cy.get(".workflowitem-info-button").click();

      // opens info dialog window..

      // TODO: when granting permission the dialog shouldn't be closed.
      // wait for grantPermission
      cy.wait(1500);
      cy.get("[data-test=workflowitem-history-tab]").click();

      // Count history items => should be three
      cy.get("[data-test=history-list] li.history-item")
        .first()
        .should("be.visible");
      cy.get("[data-test=history-list]")
        .find("li.history-item")
        .should("have.length", 3);

      // Make sure the oldest entry is the create event
      cy.get("[data-test=history-list]")
        .find("li.history-item")
        .last()
        .should("contain", "created workflowitem");

      // Make sure the newest entry is the grant event
      cy.get("[data-test=history-list]")
        .find("li.history-item")
        .first()
        .should("contain", "granted permission");
    });
  });

  it("When changing the tab, the history is fetched correctly", function() {
    cy.get(".workflowitem-info-button").click();

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
