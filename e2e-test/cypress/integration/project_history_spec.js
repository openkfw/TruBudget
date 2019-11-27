describe("Project's history", function() {
  let projectId;

  before(() => {
    cy.login();
    cy.createProject("p-history", "project history test").then(({ id }) => {
      projectId = id;
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
    // Update project to create new history event
    cy.visit(`/projects`);
    cy.get(`[data-test=project-card-${projectId}]`)
      // select all buttons which has an attribute data-test which value begins with pp-button
      .find("button[data-test^='pe-button']")
      .click();
    cy.get("[data-test=nameinput] input").type("-changed");
    cy.get("[data-test=submit]").click();
    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=project-history-button]").click();

    // The oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created project");

    // The newest entry is the update event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "changed project");
  });
});
