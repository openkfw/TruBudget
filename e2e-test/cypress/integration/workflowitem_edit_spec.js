describe("Workflowitem edit", function() {
  let projectId;
  let subprojectId;
  let baseUrl, apiRoute;

  const dueDateExceeded = "2000-01-01";

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();

    cy.createProject("workflowitem edit test project", "workflowitem edit test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem edit test", "EUR");
      })
      .then(({ id }) => {
        subprojectId = id;
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
      // Create a workflow item and select a different currency
      cy.get("[data-test=createWorkflowitem]").click();
      cy.get("[data-test=nameinput] input").type("Test");
      cy.get("[data-test=datepicker-due-date]").type(dueDateExceeded);
      cy.get("[data-test=commentinput] textarea")
        .last()
        .type("Test");
      cy.get("[data-test=amount-type-allocated]").click();
      cy.get("[data-test=dropdown-currencies-click]").click();
      cy.get("[data-value=USD]").click();
      cy.get("[data-test=amountinput] input").type("1234");
      cy.get("[data-test=rateinput] input").should("be.enabled");
      cy.get("[data-test=rateinput] input").type("1.5");
      cy.get("[data-test=next]").click();
      cy.server();
      cy.route("POST", apiRoute + "/subproject.createWorkflowitem*").as("create");
      cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
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

      // Edit the workflow item and verify that the
      // pre-selected currency is the one we selected
      // when the workflow item was created
      cy.get("[data-test=edit-workflowitem]")
        .last()
        .click({ force: true });
      cy.get("[data-test=dropdown-currencies-click]").should("contain", "USD");

      // Close the dialog
      cy.get("[data-test=cancel]").click();
    }
  );
  it("When the due-date is not exceeded, the info icon badge is not displayed ", function() {
    // Edit a workflow item
    cy.get("[data-test=edit-workflowitem]").click();
    cy.get("[data-test=nameinput] input")
      .clear()
      .type("Test_changed");
    cy.get("[data-test=datepicker-due-date]").type("2050-01-01");
    cy.get("[data-test=commentinput] textarea")
      .last()
      .clear()
      .type("Test_changed");
    cy.get("[data-test=next]").click();
    cy.server();
    cy.route("POST", apiRoute + "/subproject.createWorkflowitem*").as("create");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.get("[data-test=submit]").click();
    // Check if info icon badge is not displayed
    cy.get(`[data-test^='info-warning-badge-disabled-']`).should("be.visible");
    cy.get(`[data-test^='info-warning-badge-enabled-']`).should("not.be.visible");
  });

  it("When the due-date is exceeded, the info icon badge is displayed ", function() {
    // Edit a workflow item
    cy.get("[data-test=edit-workflowitem]").click();
    cy.get("[data-test=nameinput] input")
      .clear()
      .type("Test_changed");
    cy.get("[data-test=datepicker-due-date]").type(dueDateExceeded);
    cy.get("[data-test=commentinput] textarea")
      .last()
      .clear()
      .type("Test_changed");
    cy.get("[data-test=next]").click();
    cy.server();
    cy.route("POST", apiRoute + "/subproject.createWorkflowitem*").as("create");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.get("[data-test=submit]").click();
    // Check if info icon badge is displayed
    cy.get(`[data-test^='info-warning-badge-enabled-']`).should("be.visible");
    cy.get(`[data-test^='info-warning-badge-disabled-']`).should("not.be.visible");
  });

  it("When the due-date is set, the due-date field is pre-filled", function() {
    // Edit last workflow item
    cy.get("[data-test=edit-workflowitem]")
      .last()
      .click();
    // Check if date is set by default
    cy.get("[data-test=datepicker-due-date] input")
      .invoke("val")
      .then(date => {
        expect(dueDateExceeded).to.equal(date);
      });
  });

  it("When the due-date is set, the due-date can be deleted by pressing the clear-button", function() {
    // Edit last workflow item
    cy.get("[data-test=edit-workflowitem]")
      .last()
      .click();
    // Check if date is set by default
    cy.get("[data-test=datepicker-due-date] input")
      .invoke("val")
      .then(date => {
        expect(dueDateExceeded).to.equal(date);
      });
    // Clear the date-picker
    cy.get("[data-test=clear-datepicker-due-date]").click();
    // Check if date-picker is cleared
    cy.get("[data-test=datepicker-due-date] input")
      .invoke("val")
      .then(date => {
        expect("").to.equal(date);
      });
    // Send to API to remove the due-date
    cy.get("[data-test=next]").click();
    cy.get("[data-test=submit]").click();
    cy.server();
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.wait("@viewDetails")
      .get("[data-test=edit-workflowitem]")
      .last()
      .click();
    // Check if due-date is removed successfully
    cy.get("[data-test=datepicker-due-date] input")
      .invoke("val")
      .then(date => {
        expect("").to.equal(date);
      });
  });

  // it("When closing a workflow item, a dialog pops up", function() {
  //   // Cancel closing the workflow item
  //   cy.get("[data-test=close-workflowitem]")
  //     .first()
  //     .click();
  //   cy.get("[data-test=confirmation-dialog]").should("be.visible");
  //   cy.get("[data-test=confirmation-dialog-cancel]").click();
  //   cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

  //   // Close the workflow item
  //   cy.get("[data-test=close-workflowitem]")
  //     .first()
  //     .click();
  //   cy.get("[data-test=confirmation-dialog]").should("be.visible");
  //   cy.get("[data-test=confirmation-dialog-confirm]").click();
  //   cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
  //   cy.get("[data-test=close-workflowitem]")
  //     .first()
  //     .should("be.disabled");
  // });

  // it("When closing the subproject, a dialog pops up", function() {
  //   // Cancel closing the subproject
  //   cy.get("[data-test=spc-button]").click();
  //   cy.get("[data-test=confirmation-dialog]").should("be.visible");
  //   cy.get("[data-test=confirmation-dialog-cancel]").click();
  //   cy.get("[data-test=confirmation-dialog]").should("not.be.visible");

  //   // Close the subproject
  //   cy.get("[data-test=spc-button]").click();
  //   cy.get("[data-test=confirmation-dialog]").should("be.visible");
  //   cy.get("[data-test=confirmation-dialog-confirm]").click();
  //   cy.get("[data-test=confirmation-dialog]").should("not.be.visible");
  //   cy.get("[data-test=spc-button]").should("not.be.visible");
  // });
});
