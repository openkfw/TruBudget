describe("Subproject Edit", function() {
  let projectId;
  let subprojectId;
  let baseUrl, apiRoute;

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

    cy.login();
    cy.createProject("p-subp-edit", "subproject edit test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "subproject edit test").then(({ id }) => {
        subprojectId = id;
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}`);
  });

  it("Editing the title is possible", function() {
    cy.server();
    cy.route("POST", apiRoute + "/subproject.update*").as("update");
    cy.route("GET", apiRoute + "/project.viewDetails*").as("viewDetails");

    // Open edit dialog
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=subproject-edit-button]").click();
    // Update title
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then(title => {
        cy.get("[data-test=nameinput] input").type("-changed");
        cy.get("[data-test=submit]").click();
        // Check if title changed
        cy.wait("@update")
          .wait("@viewDetails")
          .get("[data-test=subproject-" + subprojectId + "] [data-test*=subproject-title]")
          .invoke("text")
          .should("not.eq", title);
      });
  });

  it("Editing without a change isn't possible", function() {
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=subproject-edit-button]").click();
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then(title => {
        cy.get("[data-test=nameinput] input").type("-");
        cy.get("[data-test=submit]").should("be.enabled");
        cy.get("[data-test=nameinput] input")
          .clear()
          .type(title);
        cy.get("[data-test=submit]").should("be.disabled");
      });
  });

  it("The edit button isn't visible without edit permissions", function() {
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=subproject-edit-button]").click();
    cy.login("root", "root-secret");
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.update", "mstein");
    cy.login();
    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=subproject-edit-button]")
      .should("have.css", "opacity", "0")
      .should("be.disabled");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.update", "mstein");
  });
});
