/* eslint-disable no-unused-vars */
describe("Workflowitem batch test", function() {
  let projectId,
    subprojectId,
    workflowitem1,
    workflowitem2,
    workflowitem3,
    workflowitem4,
    workflowitem5,
    apiRoute,
    baseUrl;

  before(() => {
    cy.login();
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
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
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("Swapping workflowitems", function() {
    cy.server();
    cy.route("POST", apiRoute + "/user.authenticate").as("login");
    cy.get("[data-test=enable-workflowitem-sort]").click();
    movePiece(`[data-test=workflowitem-${workflowitem1}`, `[data-test=workflowitem-${workflowitem2}`);
    cy.get("[data-test=submit-workflowitem-sort]").click();

    // WF1 and WF2 swapped:
    cy.get(`[data-test^=workflowitem-container`).then(sortedElements => {
      expect(sortedElements[0]).to.contain("workflowitem batch test 2");
      expect(sortedElements[1]).to.contain("workflowitem batch test 1");
      expect(sortedElements[2]).to.contain("workflowitem batch test 3");
      expect(sortedElements[3]).to.contain("workflowitem batch test 4");
      expect(sortedElements[4]).to.contain("workflowitem batch test 5");
    });
  });
});

function movePiece(draggable, dropzone) {
  cy.get(draggable)
    .trigger("mousedown", { button: 0 }, { force: true })
    .trigger("mousemove", 200, -200, { force: true });
  cy.get(dropzone)
    .click()
    .trigger("mouseup", { force: true });
}
