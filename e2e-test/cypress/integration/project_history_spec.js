import dayjs from "dayjs";

describe("Project's history", function () {
  let projectId;

  const yesterday = dayjs().add(-1, "day").format("DD/MM/YYYY");
  const tomorrow = dayjs().add(1, "day").format("DD/MM/YYYY");
  const afterTomorrow = dayjs().add(2, "day").format("DD/MM/YYYY");

  function setProjectsPerPage(n) {
    cy.visit("/projects");
    cy.get("[data-test=card-pagination-north]").within(() => {
      cy.get(".MuiSelect-select").click();
    });
    cy.get(`li[data-value="${n}"]`).should("be.visible").click();
  }

  before(() => {
    cy.login();
    cy.createProject("p-history", "project history test").then(({ id }) => {
      projectId = id;
    });
  });

  beforeEach(function () {
    cy.login();
    setProjectsPerPage(100);
    cy.visit(`/projects/${projectId}`);
  });

  it("The history contains only the project creation event.", function () {
    cy.get("[data-test=project-history-button]").click();

    // Count history items => should be one
    cy.get("[data-test=history-list] li.history-item").first().should("be.visible");
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 1);

    // Make sure it's a creation event
    cy.get("[data-test=history-list]").find("li.history-item").first().should("contain", "created project");
  });

  it("The history is sorted from new to old", function () {
    // Update project to create new history event
    cy.visit(`/projects`);
    cy.get(`[data-test=project-card-${projectId}]`)
      // select all buttons which has an attribute data-test which value begins with pe-button
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
    cy.get("[data-test=history-list]").find("li.history-item").first().should("contain", "changed project");
  });

  it("Check if history exists", function () {
    //Go to project history
    cy.get("[data-test=project-history-button]").click();
    cy.get("[data-test=search-history]").click();
    // The oldest entry is the create event
    cy.get("[data-test=history-list]")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created project");
    // The newest entry is the update event
    cy.get("[data-test=history-list]").find("li.history-item").first().should("contain", "changed project");
  });

  it("Fetch history with different filters", function () {
    // Filter by timeframe that does include both history items
    cy.get("[data-test=project-history-button]").click();
    cy.get("[data-test=search-history]").click();
    cy.get("[data-test=datepicker-filter-startat]").type(yesterday);
    cy.get("[data-test=datepicker-filter-endat]").type(tomorrow);
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 2);
    cy.get("[data-test=reset]").click();
    // Filter by timeframe that does not include both history items
    cy.get("[data-test=datepicker-filter-startat]").type(tomorrow);
    cy.get("[data-test=datepicker-filter-endat]").type(afterTomorrow);
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 0);
    cy.get("[data-test=reset]").click();
    // Filter by event type
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=project_created]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 1);
    cy.get("[data-test=reset]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=project_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 0);
    cy.get("[data-test=reset]").click();
    // Filter by publisher (user id)
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 2);
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=jdoe]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 0);
    cy.get("[data-test=reset]").click();
  });

  it("Search with multiple values and reset search panel after closing history panel", function () {
    // Search panel is collapsed and search values are reseted after closing it
    cy.get("[data-test=project-history-button]").click();
    cy.get("[data-test=search-history]").click();
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=project_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 0);
    // Re-open history
    cy.visit(`/projects/${projectId}/`);
    cy.get("[data-test=project-history-button]").click();
    cy.get("[data-test=search-history]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 2);
  });

  it("Search with multiple values and reset search panel after clicking reset", function () {
    // Set multiple values including project-closed eventtype which should not exist
    cy.get("[data-test=project-history-button]").click();
    cy.get("[data-test=search-history]").click();
    cy.get("[data-test=dropdown-filter-publisher-click]").click();
    cy.get("[data-value=mstein]").click();
    cy.get("[data-test=dropdown-filter-eventtype-click]").click();
    cy.get("[data-value=project_closed]").click();
    cy.get("[data-test=search]").click();
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 0);
    // Reset filter
    cy.get("[data-test=reset]").click();
    // All history items should be shown again
    // project_create event and project_changed (previous test)
    cy.get("input[id=filter-publisher]").should("be.empty");
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 2);
  });
});
