describe("Workflowitem create", function() {
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

  it("Check warnings that permissions are not assigned", function() {
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

    //Check snackbar warning visible
    cy.get("[data-test=client-snackbar]")
      .should("be.visible")
      .should("contain", "permissions");

    //Check warning badge
    cy.get("[data-test=warning-badge]")
      .first()
      .should("be.visible");
    cy.get("[data-test=workflowitem-table]")
      .find("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test=warning-badge]")
      .first()
      .should("not.be.checked");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=warning-badge]")
      .first()
      .should("not.be.checked");
  });

  it("Check if after selecting another currency, the exchange rate was entered and saved correctly", function() {
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

  it("Root can not create a Workflowitem", function() {
    cy.login("root", "root-secret");
    cy.visit(`/projects/${projectId}/${subprojectId}`);

    // When root is logged in the create workflow item button
    // is disabled
    cy.get("[data-test=createWorkflowitem]").should("be.visible");
    cy.get("[data-test=createWorkflowitem]").should("be.disabled");
  });
});
