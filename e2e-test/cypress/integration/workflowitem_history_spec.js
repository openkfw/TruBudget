import dayjs from "dayjs";

describe("Workflowitem's history", function () {
  let projectId;
  let subprojectId;
  let workflowitemId;
  const apiRoute = "/api";

  const yesterday = dayjs().add(-1, "day").format("DD/MM/YYYY");
  const tomorrow = dayjs().add(1, "day").format("DD/MM/YYYY");
  const afterTomorrow = dayjs().add(2, "day").format("DD/MM/YYYY");

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

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("The history contains only the creation event after creation.", function () {
    cy.intercept(apiRoute + "/workflowitem.viewHistory*").as("viewHistory");

    cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();
    // opens info dialog window..
    cy.get("[data-test=workflowitem-history-tab]").scrollIntoView().should("be.visible").click();

    // Count history items => should be one
    cy.wait("@viewHistory")
      .get("[data-test=history-list] li.history-item")
      .first()
      .scrollIntoView()
      .should("be.visible");
    cy.get("[data-test=history-list]").find("li.history-item").should("have.length", 1);

    // Make sure it's a creation event
    cy.get("[data-test=history-list]").find("li.history-item").first().should("contain", "created");
  });

  it("The history is sorted from new to old", function () {
    cy.intercept(apiRoute + "/workflowitem.viewHistory*").as("viewHistory");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");

    // Update workflowitem to create new history event
    cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
    cy.get(`[data-test=workflowitem-${workflowitemId}] [data-test=edit-workflowitem]`).click();
    cy.get(`[data-test=creation-dialog]`).scrollIntoView().should("be.visible");
    cy.get("[data-test=nameinput] input").type("-changed");
    cy.get("[data-test=next]").scrollIntoView().click();
    cy.get("[data-test=submit]").scrollIntoView().should("be.visible").click();
    // Open info dialog
    cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
    cy.wait("@viewDetails").get(`[data-test*='workflowitem-info-button-${workflowitemId}']`).scrollIntoView().click();
    cy.get("[data-test=workflowitem-history-tab]").scrollIntoView().click();
    // The oldest entry is the create event
    cy.wait("@viewHistory")
      .get("[data-test=history-list]")
      .scrollIntoView()
      .should("be.visible")
      .find("li.history-item")
      .should("have.length", 2)
      .last()
      .should("contain", "created");
    // The newest entry is the update event
    cy.get("[data-test=history-list]").find("li.history-item").first().should("contain", "changed");
  });

  it("When changing the tab, the history is fetched correctly", function () {
    cy.intercept(apiRoute + "/workflowitem.viewHistory*").as("viewHistory");

    // Open info dialog
    cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();
    cy.get("[data-test=workflowitem-history-tab]").click();

    // Count history items => should be one
    cy.wait("@viewHistory")
      .get("[data-test=history-list] li.history-item")
      .first()
      .scrollIntoView()
      .should("be.visible");

    cy.get("[data-test=workflowitem-documents-tab]").click();
    cy.get("[data-test=workflowitem-history-tab]").click();

    // Items should be visible
    cy.wait("@viewHistory")
      .get("[data-test=history-list] li.history-item")
      .first()
      .scrollIntoView()
      .should("be.visible");
  });

  it("All different types of history events are shown", function () {
    cy.intercept(apiRoute + "/workflowitem.viewHistory*").as("viewHistory");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
      workflowitemId = id;
      // Create 5 additional history events
      cy.updateWorkflowitem(projectId, subprojectId, workflowitemId, { displayName: "updated Name" });
      cy.updateWorkflowitem(projectId, subprojectId, workflowitemId, { description: "updated Description" });
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "jxavier");
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "jxavier");
      // List all workflowitems to get all wfitem-ids
      cy.listWorkflowitems(projectId, subprojectId).then(({ workflowitems }) => {
        const ordering = workflowitems.reduce((workflowitemIds, workflowitem) => {
          if (workflowitem.data.id !== workflowitemId) {
            workflowitemIds.push(workflowitem.data.id);
          }
          return workflowitemIds;
        }, []);
        // Move the current workflowitem to the first position so the item can be closed
        ordering.unshift(workflowitemId);
        cy.reorderWorkflowitems(projectId, subprojectId, ordering);
        cy.closeWorkflowitem(projectId, subprojectId, workflowitemId);
        cy.visit(`/projects/${projectId}/${subprojectId}`);

        cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
        cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
        cy.get("[data-test=workflowitem-history-tab]").scrollIntoView().should("be.visible").click();
        cy.wait("@viewHistory").get("[data-test=search-history]").scrollIntoView().should("be.visible").click();
        // All additional history events should be shown
        cy.get("[data-test=history-list] li.history-item").should("have.length", 6);
      });
    });
  });

  it("All history search filter are working correctly", function () {
    cy.intercept(apiRoute + "/workflowitem.viewHistory*").as("viewHistory");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
      workflowitemId = id;
      // Create 5 additional history events
      cy.updateWorkflowitem(projectId, subprojectId, workflowitemId, { displayName: "updated Name" });
      cy.updateWorkflowitem(projectId, subprojectId, workflowitemId, { description: "updated Description" });
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "jxavier");
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "jxavier");
      // List all workflowitems to get all wfitem-ids
      cy.listWorkflowitems(projectId, subprojectId).then(({ workflowitems }) => {
        const ordering = workflowitems.reduce((workflowitemIds, workflowitem) => {
          if (workflowitem.data.id !== workflowitemId) {
            workflowitemIds.push(workflowitem.data.id);
          }
          return workflowitemIds;
        }, []);
        // Move the current workflowitem to the first position so the item can be closed
        ordering.unshift(workflowitemId);
        cy.reorderWorkflowitems(projectId, subprojectId, ordering);
        cy.closeWorkflowitem(projectId, subprojectId, workflowitemId);
        cy.visit(`/projects/${projectId}/${subprojectId}`);

        cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
        cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
        cy.get("[data-test=workflowitem-history-tab]").scrollIntoView().should("be.visible").click();
        // wait for the 1st viewHistory call so cypress can increment the viewHistory calls correctly
        cy.wait("@viewHistory").get("[data-test=search-history]").scrollIntoView().should("be.visible").click();
        // Filter by timeframe that does include all history items
        cy.get("[data-test=datepicker-filter-startat]").type(yesterday);
        cy.get("[data-test=datepicker-filter-endat]").type(tomorrow);
        cy.get("[data-test=search]").click();
        cy.wait("@viewHistory").get("[data-test=history-list] li.history-item").should("have.length", 6);
        cy.get("[data-test=reset]").click();
        // Filter by timeframe that does not include any history items
        cy.get("[data-test=datepicker-filter-startat]").type(tomorrow);
        cy.get("[data-test=datepicker-filter-endat]").type(afterTomorrow);
        cy.get("[data-test=search]").click();
        cy.wait("@viewHistory").get("[data-test=history-list] li.history-item").should("have.length", 0);
        cy.get("[data-test=reset]").click();
        // Filter by event type workflowitem_created
        cy.get("[data-test=dropdown-filter-eventtype-click]").click();
        cy.get("[data-value=workflowitem_created]").scrollIntoView().should("be.visible").click();
        cy.get("[data-test=search]").click();
        cy.wait("@viewHistory").get("[data-test=history-list] li.history-item").should("have.length", 1);
        // Filter by event type workflowitem_closed
        cy.get("[data-test=reset]").click();
        cy.get("[data-test=dropdown-filter-eventtype-click]").click();
        cy.get("[data-value=workflowitem_closed]").scrollIntoView().should("be.visible").click();
        cy.wait("@viewHistory").get("[data-test=search]").click();
        cy.get("[data-test=history-list] li.history-item").should("have.length", 1);
        cy.get("[data-test=reset]").click();
        // Filter by publisher mstein
        cy.get("[data-test=dropdown-filter-publisher-click]").click();
        cy.get("[data-value=mstein]").scrollIntoView().should("be.visible").click();
        cy.get("[data-test=search]").click();
        cy.wait("@viewHistory").get("[data-test=history-list] li.history-item").should("have.length", 6);
        // Filter by publisher jdoe
        cy.get("[data-test=dropdown-filter-publisher-click]").click();
        cy.get("[data-value=jdoe]").scrollIntoView().should("be.visible").click();
        cy.get("[data-test=search]").click();
        cy.wait("@viewHistory").get("[data-test=history-list] li.history-item").should("have.length", 0);
        cy.get("[data-test=reset]").click();
      });
    });
  });

  it("Search with multiple values and reset search panel after closing history panel", function () {
    cy.intercept(apiRoute + "/workflowitem.viewHistory*").as("viewHistory");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
      workflowitemId = id;
      // Create 5 additional history events
      cy.updateWorkflowitem(projectId, subprojectId, workflowitemId, { displayName: "updated Name" });
      cy.updateWorkflowitem(projectId, subprojectId, workflowitemId, { description: "updated Description" });
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "jxavier");
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "jxavier");
      // List all workflowitems to get all wfitem-ids
      cy.listWorkflowitems(projectId, subprojectId).then(({ workflowitems }) => {
        const ordering = workflowitems.reduce((workflowitemIds, workflowitem) => {
          if (workflowitem.data.id !== workflowitemId) {
            workflowitemIds.push(workflowitem.data.id);
          }
          return workflowitemIds;
        }, []);
        // Move the current workflowitem to the first position so the item can be closed
        ordering.unshift(workflowitemId);
        cy.reorderWorkflowitems(projectId, subprojectId, ordering);
        cy.closeWorkflowitem(projectId, subprojectId, workflowitemId);
        cy.visit(`/projects/${projectId}/${subprojectId}`);

        cy.get(`[data-test=workflowitem-${workflowitemId}]`).scrollIntoView().should("be.visible");
        cy.get(`[data-test=workflowitem-info-button-${workflowitemId}]`).click();
        cy.get("[data-test=workflowitem-history-tab]").scrollIntoView().should("be.visible").click();
        // wait for the 1st viewHistory call so cypress can increment the viewHistory calls correctly
        cy.wait("@viewHistory").get("[data-test=search-history]").scrollIntoView().should("be.visible").click();
        // Set publisher mstein
        cy.get("[data-test=dropdown-filter-publisher-click]").click();
        cy.get("[data-value=mstein]").scrollIntoView().should("be.visible").click();
        // Set event type workflowitem_closed
        cy.get("[data-test=dropdown-filter-eventtype-click]").click();
        cy.get("[data-value=workflowitem_closed]").scrollIntoView().should("be.visible").click();
        // Set timeframe yesterday until tomorrow
        cy.get("[data-test=datepicker-filter-startat]").type(yesterday);
        cy.get("[data-test=datepicker-filter-endat]").type(tomorrow);
        cy.get("[data-test=search]").click();
        cy.wait("@viewHistory").get("[data-test=history-list]").find("li.history-item").should("have.length", 1);
      });
    });
  });
});
