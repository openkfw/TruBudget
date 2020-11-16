describe("Workflowitem edit", function() {
  let projectId;
  let subprojectId;
  let workflowitemId;
  let baseUrl, apiRoute;

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();

    cy.createProject("workflowitem edit test project", "workflowitem edit test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem edit test", "EUR").then(({ id }) => {
        subprojectId = id;
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it(
    "When editing a workflow item with a different currency than the subproject currency, " +
      "the selected currency is displayed",
    function() {
      cy.server();
      cy.route("POST", apiRoute + "/subproject.createWorkflowitem*").as("create");
      cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
      // Create a workflow item and select a different currency
      cy.get("[data-test=createWorkflowitem]").click();
      cy.get("[data-test=nameinput]").type("Test");
      cy.get("[data-test=commentinput]").type("Test");
      cy.get("[data-test=amount-type-allocated]").click();
      cy.get("[data-test=dropdown-currencies-click]").click();
      cy.get("[data-value=USD]").click();
      cy.get("[data-test=amountinput] input").type("1234");
      cy.get("[data-test=rateinput] input").should("be.enabled");
      cy.get("[data-test=rateinput] input").type("1.5");
      cy.get("[data-test=next]").click();
      cy.get("[data-test=submit]").click();
      // Verify the selected values
      cy.wait("@create")
        .wait("@viewDetails")
        .get("[data-test=workflowitem-amount]")
        .last()
        .should("contain", "€");
      cy.get("[data-test=amount-explanation]")
        .last()
        .should("have.attr", "title")
        .should("contain", "$");
      // Open edit workflow item dialog
      cy.get("[data-test=edit-workflowitem]")
        .last()
        .click({ force: true });
      // Verify the pre-selected currency is the one selected before
      cy.get("[data-test=dropdown-currencies-click]").should("contain", "USD");
    }
  );

  it("When the due-date is not exceeded, the info icon badge is not displayed ", function() {
    // Create a workflowitem
    const tomorrow = getTomorrowsIsoDate();
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem edit test", {
      dueDate: tomorrow
    }).then(({ id }) => {
      workflowitemId = id;
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      // Check if info icon badge is displayed
      cy.get("[data-test=workflowitem-" + workflowitemId + "]").should("be.visible");
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test^='info-warning-badge-disabled-']").should(
        "be.visible"
      );
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test^='info-warning-badge-enabled-']").should(
        "not.be.visible"
      );
    });
  });

  it("When the due-date is exceeded, the info icon badge is displayed ", function() {
    // Create a workflowitem
    const yesterday = getYesterdaysIsoDate();
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem edit test", {
      dueDate: yesterday
    }).then(({ id }) => {
      workflowitemId = id;
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      // Check if info icon badge is displayed
      cy.get("[data-test=workflowitem-" + workflowitemId + "]").should("be.visible");
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test^='info-warning-badge-disabled-']").should(
        "not.be.visible"
      );
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test^='info-warning-badge-enabled-']").should(
        "be.visible"
      );
    });
  });

  it("When the due-date is set, the due-date field is pre-filled", function() {
    // Create a workflowitem
    const dueDate = new Date().toISOString();
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem edit test", {
      dueDate: dueDate
    }).then(({ id }) => {
      workflowitemId = id;
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      // Open edit workflow item dialog
      cy.get("[data-test=workflowitem-" + workflowitemId + "]").should("be.visible");
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test=edit-workflowitem]").click();
      // Check if date is set by default
      cy.get("[data-test=datepicker-due-date] input")
        .invoke("val")
        .then(date => {
          expect(dueDate.slice(0, 10)).to.equal(date);
        });
    });
  });

  it("When the due-date is set, the due-date can be deleted by pressing the clear-button", function() {
    // Create a workflowitem
    const dueDate = new Date().toISOString();
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem edit test", {
      dueDate: dueDate
    }).then(({ id }) => {
      workflowitemId = id;
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      // Edit workflow item
      cy.get("[data-test=workflowitem-" + workflowitemId + "]").should("be.visible");
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test=edit-workflowitem]").click();
      // Clear the date-picker
      cy.get("[data-test=clear-datepicker-due-date]")
        .should("be.visible")
        .click();
      // Check if date-picker is cleared
      cy.get("[data-test=datepicker-due-date] input")
        .invoke("val")
        .then(date => {
          expect("").to.equal(date);
        });
    });
  });

  it("The due-date can be removed from a workflowitem", function() {
    cy.server();
    cy.route("POST", apiRoute + "/workflowitem.update*").as("update");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    // Create a workflowitem
    const dueDate = new Date().toISOString();
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem edit test", {
      dueDate: dueDate
    }).then(({ id }) => {
      workflowitemId = id;
      cy.visit(`/projects/${projectId}/${subprojectId}`);
      // Edit workflow item
      cy.get("[data-test=workflowitem-" + workflowitemId + "]").should("be.visible");
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test=edit-workflowitem]").click();
      // Remove the due date
      cy.get("[data-test=clear-datepicker-due-date]")
        .should("be.visible")
        .click();
      cy.get("[data-test=next]").click();
      cy.get("[data-test=submit]")
        .should("be.visible")
        .click();
      // Check if due-date is removed successfully
      cy.wait("@update")
        .wait("@viewDetails")
        .get("[data-test=workflowitem-" + workflowitemId + "]")
        .should("be.visible");
      cy.get("[data-test=workflowitem-" + workflowitemId + "] [data-test*=workflowitem-info-button]").click();
      cy.get("[data-test=due-date]").should("not.be.visible");
    });
  });
});

function getTomorrowsIsoDate() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.toISOString();
}

function getYesterdaysIsoDate() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return yesterday.toISOString();
}
