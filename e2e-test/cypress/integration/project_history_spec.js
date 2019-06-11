describe("Project's history", function() {
  let projectId;

  before(() => {
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
    cy.get("#project-history-button").click();

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
    // Change assignee to create new history event
    cy.get("[data-test=assignee-selection] [role=button]").click();
    cy.get("[role=listbox]")
      .find("[value=jdoe]")
      .click()
      .type("{esc}");

    cy.get("#project-history-button").click();

    // Count history items => should be two
    cy.get("[data-test=history-list] li.history-item")
      .first()
      .should("be.visible");
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2);

    // Make sure the oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .last()
      .should("contain", "created project");

    // Make sure the newest entry is the assign event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "assigned project");
  });
});
