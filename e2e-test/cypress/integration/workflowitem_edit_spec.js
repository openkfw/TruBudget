describe("Workflowitem edit", function() {
  let projectId;
  let subprojectId;
  let baseUrl, apiRoute;

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
});
