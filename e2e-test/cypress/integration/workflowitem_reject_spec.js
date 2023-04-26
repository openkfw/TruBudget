import { toAmountString } from "../support/helper";

describe("Workflowitem reject", function () {
  let projectId;
  let subprojectId;
  let workflowitemId;
  const apiRoute = "/api";

  const testUser = { id: "jdoe", password: "test" };
  const rejectReason = "Reject reason";
  const projectedBudgets = [
    {
      organization: "Test",
      value: "100000",
      currencyCode: "EUR"
    }
  ];

  before(() => {
    cy.login();

    cy.createProject("workflowitem reject test project", "workflowitem reject test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
      cy.createSubproject(projectId, "workflowitem reject test", "EUR", {
        projectedBudgets: projectedBudgets
      }).then(({ id }) => {
        subprojectId = id;
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id);
      });
    });
  });

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("When rejecting a workflow item, a reason must be provided", function () {
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    });

    // testUser may not reject the workflowitem
    cy.login(testUser.id, testUser.password);
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]").should("not.exist");

    // the assignee may reject the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
  });

  it("The workflowitem can be rejected by the assignee only", function () {
    cy.intercept(apiRoute + `/workflowitem.close`).as("workflowitemClose");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    });

    // the assignee may reject the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=reject-workflowitem-reject-reason]").type(rejectReason);
    cy.get("[data-test=confirmation-dialog-confirm]").should("not.be.disabled");
    cy.get("[data-test=confirmation-dialog-confirm]").click({ force: true });
    cy.wait("@workflowitemClose");

    cy.get("[data-test=closed-workflowitem-reject-reason]")
      .first()
      .click();
    cy.get("[data-test=infromation-dialog-content]").should("contain", rejectReason);
    cy.get("[data-test=infromation-dialog-close]").click();
  });

  it("Rejected workflowitem's allocated amount should not be added to assigned budget", function () {
    cy.intercept(apiRoute + `/workflowitem.close`).as("workflowitemClose");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test", {
      amountType: "allocated",
      amount: "1000",
      currency: "EUR"
    }).then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    });

    // the assignee may reject the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=reject-workflowitem-reject-reason]").type(rejectReason);
    cy.get("[data-test=confirmation-dialog-confirm]").should("not.be.disabled");
    cy.get("[data-test=confirmation-dialog-confirm]").click({ force: true });
    cy.wait("@workflowitemClose");

    cy.get("[data-test=details-analytics-button]")
      .should("be.visible")
      .click();

    cy.get("[data-test=number-chart-assigned-budget]").should(
      "have.text",
      toAmountString(0, "EUR")
    );
  });

  it("Rejected workflowitem's disbursed amount should not be added to paid budget", function () {
    cy.intercept(apiRoute + `/workflowitem.close`).as("workflowitemClose");

    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test", {
      amountType: "disbursed",
      amount: "1000",
      currency: "EUR"
    }).then(({ id }) => {
      workflowitemId = id;
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    });

    // the assignee may reject the workflowitem
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    cy.get("[data-test=reject-workflowitem]")
      .last()
      .click({ force: true });
    cy.get("[data-test=reject-workflowitem-reject-reason]").type(rejectReason);
    cy.get("[data-test=confirmation-dialog-confirm]").should("not.be.disabled");
    cy.get("[data-test=confirmation-dialog-confirm]").click({ force: true });
    cy.wait("@workflowitemClose");

    cy.get("[data-test=details-analytics-button]")
      .should("be.visible")
      .click();

    cy.get("[data-test=number-chart-disbursed-budget]").should(
      "have.text",
      toAmountString(0, "EUR")
    );
  });
});
