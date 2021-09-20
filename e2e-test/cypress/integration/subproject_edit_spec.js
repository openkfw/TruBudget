describe("Subproject Edit", function() {
  let projectId;
  let subprojectId;
  const apiRoute = "/api";

  before(() => {
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
    cy.intercept(apiRoute + "/subproject.update*").as("update");
    cy.intercept(apiRoute + "/project.viewDetails*").as("viewDetails");

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
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.update", "mstein");
    cy.login();
    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=subproject-edit-button]")
      .should("have.css", "opacity", "0")
      .should("be.disabled");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.update", "mstein");
  });
});
