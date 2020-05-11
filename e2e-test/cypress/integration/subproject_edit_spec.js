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
    cy.get("[data-test=subproject-edit-button-0]").click();
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then(title => {
        cy.get("[data-test=nameinput] input").type("-changed");
        cy.get("[data-test=submit]").click();
        cy.get("[data-test=highlighted-displayname]").should("be.visible");
        cy.wait("@update")
          .get("[data-test=subproject-title-0]")
          .invoke("text")
          .should("not.eq", title);
      });
  });

  it("Editing without a change isn't possible", function() {
    cy.get("[data-test=subproject-edit-button-0]").click();
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
    cy.get("[data-test=subproject-edit-button-0]").should("be.enabled");
    cy.login("root", "root-secret");
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.update", "mstein");
    cy.login();
    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=subproject-edit-button-0]")
      .should("have.css", "opacity", "0")
      .should("be.disabled");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.update", "mstein");
  });

  it("When closing the project, a dialog pops up", function() {
    cy.get("[data-test=pc-button]").should("be.disabled");
    cy.get("[data-test=ssp-table]")
      .find("[data-test=subproject-view-details-0]")
      .click();

    // Close subproject
    cy.get("[data-test=spc-button]").click();
    cy.get("[data-test=confirmation-dialog]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
    cy.get("[data-test=spc-button]").should("not.be.visible");

    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=pc-button]").should("be.enabled");

    // Cancel closing the project
    cy.get("[data-test=pc-button]").click();
    cy.get("[data-test=confirmation-dialog]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

    // Close project
    cy.get("[data-test=pc-button]").click();
    cy.get("[data-test=confirmation-dialog]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
    cy.get("[data-test=pc-button]").should("not.be.visible");
  });
});
