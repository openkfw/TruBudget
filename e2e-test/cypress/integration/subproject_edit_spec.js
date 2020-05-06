describe("Subproject Edit", function() {
  let projectId;
  let subprojectId;
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
    cy.get("[data-test=subproject-edit-button-0]").click();
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then(title => {
        cy.get("[data-test=nameinput] input").type("-changed");
        cy.get("[data-test=submit]").click();
        cy.get("[data-test=highlighted-displayname]").should("be.visible");
        cy.get("[data-test=subproject-title-0]")
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
});
