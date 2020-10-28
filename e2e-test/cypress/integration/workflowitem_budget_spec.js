describe("Workflowitem budget test", function() {
  let projectId, subprojectId, baseUrl, apiRoute;
  const exchangeRate = "0.5";
  const newExchangeRate = "0.8";
  before(() => {
    cy.login();
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(function() {
    cy.login();
    cy.server();
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetailsSubroject");
    cy.route("POST", apiRoute + "/workflowitem.update").as("updateWorkflowitem");
  });

  it("Edit workflowitem dialog: The exchange rate is set to 1 if the subproject and worklfowitem currency are the same", function() {
    cy.createProject("workflowitem create test project", "workflowitem create test", []).then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem create test", "EUR").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem budget test", {
          amountType: "allocated",
          amount: "1000",
          currency: "EUR"
        }).then(() => {
          cy.visit(`/projects/${projectId}/${subprojectId}`);
          cy.get("[data-test=edit-workflowitem]")
            .first()
            .click();
          cy.wait("@viewDetailsSubroject");

          cy.get("[data-test=dropdown-currencies]").contains("EUR");
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", "1");
          cy.get("[data-test=rateinput] input").should("be.disabled");
          cy.get("[data-test=amountinput] input")
            .invoke("val")
            .should("contain", "1,000");
          cy.get("[data-test=calculated-result]").should("contain", "1,000");
        });
      });
    });
  });

  it("Edit workflowitem dialog: Not applicable budget", function() {
    cy.createProject("workflowitem create test project", "workflowitem create test", []).then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem create test", "EUR").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem budget test").then(() => {
          cy.visit(`/projects/${projectId}/${subprojectId}`);
          cy.get("[data-test=edit-workflowitem]")
            .first()
            .click();
          cy.wait("@viewDetailsSubroject");
          // Check amount type "not applicable"
          cy.get("[data-test=amount-type-na]")
            .should("be.visible")
            .click();
          cy.get("[data-test=dropdown-currencies]").should("not.be.visible");
          cy.get("[data-test=amountinput]").should("not.be.visible");
          cy.get("[data-test=rateinput]").should("not.be.visible");
          cy.get("[data-test=calculated-result]").should("not.be.visible");
        });
      });
    });
  });

  it("Edit workflowitem dialog: Allocated budget", function() {
    cy.createProject("workflowitem create test project", "workflowitem create test", []).then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem create test", "EUR").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem budget test", {
          amountType: "allocated",
          amount: "1000",
          currency: "USD",
          exchangeRate
        }).then(() => {
          cy.visit(`/projects/${projectId}/${subprojectId}`);
          cy.get("[data-test=edit-workflowitem]")
            .first()
            .click();
          cy.wait("@viewDetailsSubroject");
          // Exchange rate can be edited (because the workflowitem and subproject have different currencies)
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", exchangeRate);
          // Check calculation
          cy.get("[data-test=calculated-result]").should("contain", "500");
          cy.get("[data-test=rateinput] input")
            .clear()
            .type(newExchangeRate);
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", newExchangeRate);
          // Check calculation
          cy.get("[data-test=calculated-result]").should("contain", "800");
          cy.get("[data-test=next]").click();
          cy.get("[data-test=submit]").click();
          cy.wait("@updateWorkflowitem");
          // Check if changes are set
          cy.get("[data-test=edit-workflowitem]")
            .first()
            .click();
          cy.wait("@viewDetailsSubroject");
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", newExchangeRate);
        });
      });
    });
  });

  it("Edit workflowitem dialog: Disbursed budget", function() {
    cy.createProject("workflowitem create test project", "workflowitem create test", []).then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem create test", "EUR").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem budget test", {
          amountType: "disbursed",
          amount: "1000",
          currency: "USD",
          exchangeRate
        }).then(() => {
          cy.visit(`/projects/${projectId}/${subprojectId}`);
          cy.get("[data-test=edit-workflowitem]")
            .first()
            .click();
          cy.wait("@viewDetailsSubroject");
          // Exchange rate can be edited (because the workflowitem and subproject have different currencies)
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", exchangeRate);
          // Check calculation
          cy.get("[data-test=calculated-result]").should("contain", "500");
          cy.get("[data-test=rateinput] input")
            .clear()
            .type(newExchangeRate);
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", newExchangeRate);
          // Check calculation
          cy.get("[data-test=calculated-result]").should("contain", "800");
          cy.get("[data-test=next]").click();
          cy.get("[data-test=submit]").click();
          cy.wait("@updateWorkflowitem");
          // Check if changes are set
          cy.get("[data-test=edit-workflowitem]")
            .first()
            .click();
          cy.wait("@viewDetailsSubroject");
          cy.get("[data-test=rateinput] input")
            .invoke("val")
            .should("eq", newExchangeRate);
        });
      });
    });
  });
});
