describe("Subproject's history", function() {
  let projectId;
  let subprojectId;

  const yesterday = Cypress.moment()
    .add(-1, "days")
    .format("YYYY-MM-DD");
  const tomorrow = Cypress.moment()
    .add(1, "days")
    .format("YYYY-MM-DD");
  const afterTomorrow = Cypress.moment()
    .add(2, "days")
    .format("YYYY-MM-DD");

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
      // select all buttons which has an attribute data-test which value begins with subproject-edit-button-
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

  it("Check if history exists", function() {
    cy.get("[data-test=subproject-history-button]").click();
    cy.get("[data-test=search-history]").click();
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

  it("Fetch history with different filters", function() {
    cy.get("[data-test=subproject-history-button]").click();
    cy.get("[data-test=search-history]").click();
    // Filter by timeframe that does include both history items
    cy.get("[data-test=datepicker-filter-startat]").type(yesterday);
    cy.get("[data-test=datepicker-filter-endat]").type(tomorrow);
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2);
    cy.get("[data-test=reset]").click();
    // Filter by timeframe that does not include both history items
    cy.get("[data-test=datepicker-filter-startat]").type(tomorrow);
    cy.get("[data-test=datepicker-filter-endat]").type(afterTomorrow);
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
    cy.get("[data-test=reset]").click();
    // Filter by event type
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=subproject_created]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 1);
    cy.get("[data-test=reset]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=subproject_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
    cy.get("[data-test=reset]").click();
    // Filter by publisher (user id)
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2);
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=jdoe]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
    cy.get("[data-test=reset]").click();
  });

  it("Search with multiple values and reset search panel after closing history panel", function() {
    cy.get("[data-test=subproject-history-button]").click();
    cy.get("[data-test=search-history]").click();
    // Search panel is collapsed and search values are reseted after closing it
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=subproject_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
    // Re-open history
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=subproject-history-button]").click();
    cy.get("[data-test=search-history]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2);
  });

  it("Search with multiple values and reset search panel after clicking reset", function() {
    cy.get("[data-test=subproject-history-button]").click();
    cy.get("[data-test=search-history]").click();
    // Search panel is collapsed and search values are reseted after closing it
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=subproject_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
    // Reset
    cy.get("[data-test=reset]").click();
    // value in dropdown should not exist
    cy.get("[data-test=dropdown-filter-publisher-click]")
      .find("input")
      .should("not.have.attr", "data-value");
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2);
  });
});
