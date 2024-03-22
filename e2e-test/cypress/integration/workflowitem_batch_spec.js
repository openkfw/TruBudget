/* eslint-disable no-unused-vars */

describe("Workflowitem batch test", function () {
  let projectId,
    subprojectId,
    workflowitem1,
    workflowitem2,
    workflowitem3,
    workflowitem4,
    workflowitem5,
    subprojectIdClosed,
    workflowitem1Closed,
    workflowitem2Closed,
    workflowitem3Closed,
    workflowitem4Closed,
    workflowitem5Closed;
  const apiRoute = "/api";

  before(() => {
    cy.login();
    cy.createProject("p-subp-batch", "workflowitem batch test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem batch test").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem batch test 1").then(({ id }) => {
          workflowitem1 = id;
        });
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem batch test 2").then(({ id }) => {
          workflowitem2 = id;
        });
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem batch test 3").then(({ id }) => {
          workflowitem3 = id;
        });
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem batch test 4").then(({ id }) => {
          workflowitem4 = id;
        });
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem batch test 5").then(({ id }) => {
          workflowitem5 = id;
        });
      });
      cy.createSubproject(projectId, "workflowitem closed batch test").then(({ id }) => {
        subprojectIdClosed = id;
        cy.createWorkflowitem(projectId, subprojectIdClosed, "workflowitem closed batch test 1").then(({ id }) => {
          workflowitem1Closed = id;
          cy.closeWorkflowitem(projectId, subprojectIdClosed, workflowitem1Closed);
        });
        cy.createWorkflowitem(projectId, subprojectIdClosed, "workflowitem closed batch test 2").then(({ id }) => {
          workflowitem2Closed = id;
          cy.closeWorkflowitem(projectId, subprojectIdClosed, workflowitem2Closed);
        });
        cy.createWorkflowitem(projectId, subprojectIdClosed, "workflowitem closed batch test 3").then(({ id }) => {
          workflowitem3Closed = id;
          cy.closeWorkflowitem(projectId, subprojectIdClosed, workflowitem3Closed);
        });
        cy.createWorkflowitem(projectId, subprojectIdClosed, "workflowitem closed batch test 4").then(({ id }) => {
          workflowitem4Closed = id;
          cy.closeWorkflowitem(projectId, subprojectIdClosed, workflowitem4Closed);
        });
        cy.createWorkflowitem(projectId, subprojectIdClosed, "workflowitem closed batch test 5").then(({ id }) => {
          workflowitem5Closed = id;
          cy.closeWorkflowitem(projectId, subprojectIdClosed, workflowitem5Closed);
        });
        cy.closeSubproject(projectId, subprojectIdClosed);
      });
    });
  });

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("Swapping workflowitems", function () {
    cy.get("[data-test=enable-workflowitem-sort]").click();
    movePiece(`[data-test=workflowitem-${workflowitem1}`, `[data-test=workflowitem-${workflowitem2}`);
    cy.get("[data-test=submit-workflowitem-sort]").click();

    // WF1 and WF2 swapped:
    cy.reload();
    cy.get(`[data-test^=workflowitem-container`).then((sortedElements) => {
      expect(sortedElements[0]).to.contain("workflowitem batch test 2");
      expect(sortedElements[1]).to.contain("workflowitem batch test 1");
      expect(sortedElements[2]).to.contain("workflowitem batch test 3");
      expect(sortedElements[3]).to.contain("workflowitem batch test 4");
      expect(sortedElements[4]).to.contain("workflowitem batch test 5");
    });
  });

  it("Reordering button is disabled if ther subproject is closed", function () {
    cy.visit(`/projects/${projectId}/${subprojectIdClosed}`);
    cy.get("[data-test=enable-workflowitem-sort]").should("be.disabled");
  });

  it("When selecting a Checkbox, and click permissions button, the preview dialog opens", function () {
    cy.get("[data-test=enable-workflowitem-sort]").click();
    cy.get("[data-test=check-workflowitem]").first().click();
    cy.wait(100);
    cy.get("[data-test=open-batch-workflow-items-permission-table]").click();
    cy.get("[data-test=permission-table]").should("be.visible");
    cy.get("[data-test=cancel-batch-side-panel]").click();
  });

  it("When selecting a Checkbox, and click permissions button, the preview dialog opens", function () {
    cy.get("[data-test=enable-workflowitem-sort]").click();
    cy.get("[data-test=check-workflowitem]").first().click();
    cy.wait(100);
    cy.get("[data-test=open-batch-workflow-items-copy-table]").click();
    cy.get("[data-test=copy-table]").should("be.visible");
    cy.get("[data-test=cancel-batch-side-panel]").click();
  });
});

const SPACE = 32;
const DOWN = 40;

function movePiece(draggable, dropzone) {
  cy.get(draggable)
    .trigger("keydown", { keyCode: SPACE })
    .trigger("keydown", { keyCode: DOWN, force: true })
    .wait(200)
    .trigger("keydown", { keyCode: SPACE, force: true });
}
