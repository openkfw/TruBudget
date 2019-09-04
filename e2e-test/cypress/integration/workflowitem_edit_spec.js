describe("Workflowitem edit", function() {
  let projectId;
  let subprojectId;

  before(() => {
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

  it("After creating an allocated workflowitem, the currency is equal to the subproject's currency", function() {
    // Create a workflow item
    cy.get("[data-test=createWorkflowitem]").click();
    cy.get("[data-test=nameinput] input").type("Test");
    cy.get("[data-test=commentinput] textarea")
      .last()
      .type("Test");
    cy.get("[data-test=amount-type-allocated]").click();
    cy.get("[data-test=dropdown-currencies-click]").should("contain", "EUR");

    // When the currency is equal to the currency of the subproject
    // the exchange rate field is disabled
    cy.get("[data-test=rateinput] input").should("be.disabled");
  });

  it("After selecting another currency, the exchange rate can be entered and is saved correctly", function() {
    // Create a workflow item
    cy.get("[data-test=createWorkflowitem]").click();
    cy.get("[data-test=nameinput] input").type("Test");
    cy.get("[data-test=commentinput] textarea")
      .last()
      .type("Test");
    cy.get("[data-test=amount-type-allocated]").click();

    // Select a different currency than the subproject currency
    cy.get("[data-test=dropdown-currencies-click]").click();
    cy.get("[data-value=USD]").click();

    // Enter amount
    cy.get("[data-test=amountinput] input").type("1234");

    // The exchange rate field should be enabled because
    // we selected a different currency
    cy.get("[data-test=rateinput] input").should("be.enabled");
    cy.get("[data-test=rateinput] input").type("1.5");
    cy.get("[data-test=next]").click();
    cy.get("[data-test=submit]").click();

    // The workflow item amount should be displayed in the
    // subproject's currency
    cy.get("[data-test=workflowitem-amount]")
      .first()
      .should("contain", "€");

    // The information on the workflow item amount
    // and exchange rate is displayed in a tooltip
    cy.get("[data-test=amount-explanation]")
      .first()
      .should("have.attr", "title")
      .should("contain", "$");
  });

  it(
    "When editing a workflow item with a different currency than the subproject currency, " +
      "the selected currency is displayed",
    function() {
      // Create a workflow item and select a different currency
      cy.get("[data-test=createWorkflowitem]").click();
      cy.get("[data-test=nameinput] input").type("Test");
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
      cy.get("[data-test=submit]").click();

      // Verify the selected values
      cy.get("[data-test=workflowitem-amount]")
        .first()
        .should("contain", "€");
      cy.get("[data-test=amount-explanation]")
        .first()
        .should("have.attr", "title")
        .should("contain", "$");

      // Edit the workflow item and verify that the
      // pre-selected currency is the one we selected
      // when the workflow item was created
      cy.get("[data-test=edit-workflowitem]")
        .last()
        .click();
      cy.get("[data-test=dropdown-currencies-click]").should("contain", "USD");

      // Close the dialog
      cy.get("[data-test=cancel]").click();
    }
  );
});

describe("Workflowitem create", function() {
  let projectId;
  let subprojectId;

  before(() => {
    cy.login();

    cy.createProject("workflowitem create test project", "workflowitem create test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem create test", "EUR");
      })
      .then(({ id }) => {
        subprojectId = id;
      });
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("Root can not create a Workflowitem", function() {
    cy.login("root", "root-secret");
    cy.visit(`/projects/${projectId}/${subprojectId}`);

    // When root is logged in the create workflow item button
    // is disabled
    cy.get("[data-test=createWorkflowitem]").should("be.visible");
    cy.get("[data-test=createWorkflowitem]").should("be.disabled");
  });
});
