describe("Project's history", function() {
  let projectId;
  let baseUrl = undefined;
  let apiRoute = undefined;
  const timeoutOption = { timeout: 60000 };

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

    cy.login();
    cy.createProject("project history test project", "project history test", []).then(({ id }) => {
      projectId = id;
      return cy.createSubproject(projectId, "project history test");
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}`);
  });

  it("The history contains only the project creation event.", function() {
    cy.get("[data-test=project-history-button]").click();

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
      .should("contain", "created project");
  });

  it("The history is sorted from new to old", function() {
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchProjectPermissions");
    // Change assignee to create new history event
    cy.get("[data-test=assignee-selection] [role=button]")
      .first()
      .click();
    cy.wait("@fetchProjectPermissions").then(() => {
      cy.get("[role=listbox]")
        .find("[value=jdoe]")
        // Set short timeout to be sure the animation is done
        .click(timeoutOption);
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      cy.get("[role=listbox]")
        .find("[data-test=search-assignee-field]")
        .click()
        .type("{esc}");

      // TODO: when granting permission the dialog shouldn't be closed.
      // wait for grantPermission
      cy.wait(1500);
      cy.get("[data-test=project-history-button]").click();

      // Count history items => should be four
      cy.get("[data-test=history-list] li.history-item")
        .first()
        .should("be.visible");
      cy.get("[data-test=history-list]")
        .find("li.history-item")
        .should("have.length", 4);

      // Make sure the oldest entry is the create event
      cy.get("[data-test=history-list]")
        .find("li.history-item")
        .last()
        .should("contain", "created project");

      // Make sure the newest entry is the grant permission event
      cy.get("[data-test=history-list]")
        .find("li.history-item")
        .first()
        .should("contain", "granted permission");
    });
  });
});
