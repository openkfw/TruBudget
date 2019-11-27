describe("Subproject's history", function() {
  let projectId;
  let subprojectId;

  before(() => {
    cy.login();
    cy.createProject("p-subp-assign", "subproject assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "subproject assign test").then(({ id }) => {
        subprojectId = id;
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("The history contains the subproject creation event.", function() {
    cy.get("#subproject-history-button").click();

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
      .should("contain", "created subproject");
  });

  it("The history is sorted from new to old", function() {
    // Update subproject to create new history event
    cy.visit(`/projects/${projectId}`);
    cy.get(`[data-test=ssp-table]`)
      // select all buttons which has an attribute data-test which value begins with pp-button
      .find("button[data-test^='subproject-edit-button-']")
      .click();
    cy.get("[data-test=nameinput] input").type("-changed");
    cy.get("[data-test=submit]").click();

    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=subproject-history-button]").click();

    // The oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created subproject");

    // The newest entry is the update event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "changed subproject");
  });
});
