import { toAmountString } from "../support/helper";

describe("Project Analytics", function() {
  const executingUser = "mstein";
  let project = {
    id: "",
    displayName: "p-analytics",
    description: "project analytics test",
    projectedBudgets: [
      {
        organization: "Test",
        value: "200000",
        currencyCode: "EUR"
      }
    ]
  };

  let subproject = {
    id: "",
    displayName: "sp-analytics",
    description: "project analytics test",
    currency: "EUR",
    projectedBudgets: [
      {
        organization: "Test",
        value: "100000",
        currencyCode: "EUR"
      }
    ]
  };

  let allocatedWorkflowitem = {
    id: "",
    displayName: "w-analytics",
    description: "project analytics test",
    amountType: "allocated",
    currency: "EUR",
    amount: "50000",
    exchangeRate: "1"
  };

  let disbursedWorkflowitem = {
    id: "",
    displayName: "w2-analytics",
    description: "project analytics test",
    amountType: "disbursed",
    currency: "EUR",
    amount: "10000",
    exchangeRate: "1"
  };

  before(() => {
    cy.login();
    cy.createProject(project.displayName, project.description, project.projectedBudgets).then(({ id }) => {
      project.id = id;
      cy.createSubproject(project.id, subproject.displayName, subproject.currency, {
        projectedBudgets: subproject.projectedBudgets
      }).then(({ id }) => {
        subproject.id = id;
        cy.createWorkflowitem(project.id, subproject.id, allocatedWorkflowitem.displayName, {
          ...allocatedWorkflowitem
        }).then(({ id }) => {
          allocatedWorkflowitem.id = id;
          cy.createWorkflowitem(project.id, subproject.id, disbursedWorkflowitem.displayName, {
            ...disbursedWorkflowitem
          }).then(({ id }) => {
            disbursedWorkflowitem.id = id;
            // Create the workflowitem with status "closed" instead (currently bugged)
            cy.closeWorkflowitem(
              project.id,
              subproject.id,
              allocatedWorkflowitem.id,
              allocatedWorkflowitem.exchangeRate
            );
            cy.closeWorkflowitem(
              project.id,
              subproject.id,
              disbursedWorkflowitem.id,
              disbursedWorkflowitem.exchangeRate
            );
          });
        });
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${project.id}`);
  });

  function calcProjectedBudgetRatio(totalBudget, projectedBudget) {
    return (projectedBudget / totalBudget) * 100;
  }

  it("The analytics-screen can be opened and closed", function() {
    // Open dialog
    cy.get("[data-test=details-analytics-button]")
      .should("be.visible")
      .click();
    cy.get("[data-test=close-analytics-button]").should("be.visible");
  });

  it("The analytics-charts are calculated correctly", function() {
    // Open dialog
    cy.get("[data-test=details-analytics-button]")
      .should("be.visible")
      .click();
    // Total Budget
    cy.get("[data-test=number-chart-total-budget]").should(
      "have.text",
      toAmountString(project.projectedBudgets[0].value, subproject.currency)
    );
    // Projected Budget
    cy.get("[data-test=number-chart-projected-budget]").should(
      "have.text",
      toAmountString(subproject.projectedBudgets[0].value, subproject.currency)
    );
    cy.get("[data-test=ratio-chart-projected-budget]").should(
      "have.text",
      calcProjectedBudgetRatio(project.projectedBudgets[0].value, subproject.projectedBudgets[0].value).toFixed(2) + "%"
    );
    // Assigned Budget
    cy.get("[data-test=number-chart-assigned-budget]").should(
      "have.text",
      toAmountString(allocatedWorkflowitem.amount, allocatedWorkflowitem.currency)
    );
    cy.get("[data-test=ratio-chart-assigned-budget]").should(
      "have.text",
      calcProjectedBudgetRatio(subproject.projectedBudgets[0].value, allocatedWorkflowitem.amount).toFixed(2) + "%"
    );
    // Disbursed Budget
    cy.get("[data-test=number-chart-disbursed-budget]").should(
      "have.text",
      toAmountString(disbursedWorkflowitem.amount, disbursedWorkflowitem.currency)
    );
    cy.get("[data-test=ratio-chart-disbursed-budget]").should(
      "have.text",
      calcProjectedBudgetRatio(allocatedWorkflowitem.amount, disbursedWorkflowitem.amount).toFixed(2) + "%"
    );
  });

  it("Without view permission of every workflowitem of all subprojects the user can see the analytics-charts are not visible", function() {
    // Setup permissions
    cy.revokeWorkflowitemPermission(
      project.id,
      subproject.id,
      allocatedWorkflowitem.id,
      "workflowitem.view",
      executingUser
    );

    // Open dialog
    cy.get("[data-test=details-analytics-button]")
      .should("be.visible")
      .click();

    cy.get("[data-test=number-chart-total-budget]").should("not.be.visible");
    cy.get("[data-test=projected-budget-table]").should("be.visible");
    cy.get("[data-test=redacted-warning]").should("be.visible");

    // Reset permissions
    cy.login("root", "root-secret");
    cy.grantWorkflowitemPermission(
      project.id,
      subproject.id,
      allocatedWorkflowitem.id,
      "workflowitem.view",
      executingUser
    );
  });

  it("Without view permission of every subproject the analytics calculate all budgets using all subprojects seen", function() {
    let notListedSubprojectId;
    // Create subproject
    cy.createSubproject(project.id, "test", "EUR", {
      projectedBudgets: [
        {
          organization: "Test",
          value: "50000",
          currencyCode: "EUR"
        }
      ]
    }).then(({ id }) => {
      notListedSubprojectId = id;
      // Revoke subproject view permissions
      cy.revokeSubprojectPermission(project.id, notListedSubprojectId, "subproject.viewSummary", executingUser);
      cy.revokeSubprojectPermission(project.id, notListedSubprojectId, "subproject.viewDetails", executingUser);

      // Open dialog
      cy.get("[data-test=details-analytics-button]")
        .should("be.visible")
        .click();

      // Projected Budget must be unchanged
      cy.get("[data-test=number-chart-projected-budget]").should(
        "have.text",
        toAmountString(subproject.projectedBudgets[0].value, subproject.currency)
      );
      cy.get("[data-test=ratio-chart-projected-budget]").should(
        "have.text",
        calcProjectedBudgetRatio(project.projectedBudgets[0].value, subproject.projectedBudgets[0].value).toFixed(2) +
          "%"
      );
    });
  });

  it("Changing the currency converts all calculated amounts into the new currency", function() {
    // Open dialog
    cy.get("[data-test=details-analytics-button]")
      .should("be.visible")
      .click({ force: true });
    cy.get("[data-test=select-currencies]")
      .should("be.visible")
      .click();
    cy.get("[data-test=currency-menuitem-USD]")
      .should("be.visible")
      .click();
    cy.get("[data-test=number-chart-projected-budget]").contains("$");
    cy.get("[data-test=table-total-budget]").contains("$");
  });
});
