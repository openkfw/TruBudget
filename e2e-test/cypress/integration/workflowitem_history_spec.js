describe("Workflowitem's history", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;

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
    cy.createProject("p-subp-assign", "workflowitem assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem assign test").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
          workflowitemId = id;
        });
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("The history contains only the workflowitem creation event.", function() {
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();
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
    // Update workflowitem to create new history event
    cy.get(`[data-test=workflowitem-table]`)
      .find("[data-test=edit-workflowitem]")
      .last()
      .click();
    cy.get("[data-test=nameinput] input").type("-changed");
    cy.get("[data-test=next]").click();
    cy.get("[data-test=submit]").click();

    cy.get("[data-test=workflowitem-table]")
      .find("button[data-test^='workflowitem-info-button-']")
      .click();
    // opens info dialog window..
    cy.get("[data-test=workflowitem-history-tab]").click();

    // The oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created workflowitem");

    // The newest entry is the update event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "changed workflowitem");
  });

  it("When changing the tab, the history is fetched correctly", function() {
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();

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

  it("Check if history exists", function() {
    cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
    cy.get("[data-test=workflowitem-history-tab]").click();
    cy.get("[data-test=search-history]").click();
    // The oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created workflowitem");
    // The newest entry is the update event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .first()
      .should("contain", "changed workflowitem");
  });

  it("Fetch history with different filters", function() {
    cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
    cy.get("[data-test=workflowitem-history-tab]").click();
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
    cy.get("[data-value=workflowitem_created]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 1);
    cy.get("[data-test=reset]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=workflowitem_closed]").click();
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
    cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
    cy.get("[data-test=workflowitem-history-tab]").click();
    cy.get("[data-test=search-history]").click();
    // Search panel is collapsed and search values are reseted after closing it
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=workflowitem_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
    cy.get("[data-test=workflowdetails-close]").click();
    cy.get(`[data-test^=workflowitem-info-button-${workflowitemId}]`).click();
    cy.get("[data-test=workflowitem-history-tab]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2);
  });

  it("Search with multiple values and reset search panel after clicking reset", function() {
    cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
    cy.get("[data-test=workflowitem-history-tab]").click();
    cy.get("[data-test=search-history]").click();
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=workflowitem_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 0);
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
