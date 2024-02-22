describe("Attachment icon", function () {
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
  });

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("If documents array is empty, the attachedFile icon badge is not displayed", function () {
    // Create a workflow item
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test", {
      amountType: "N/A",
      documents: [],
    }).then(({ id }) => {
      let workflowitemId = id;
      // Check if attach file icon badge is NOT displayed
      cy.get(`[data-test^='attachment-file-badge-show-${workflowitemId}']`).should("not.exist");
    });
  });

  it("If documents array is not empty, the attachedFile icon badge is displayed", function () {
    // Create a workflow item
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test", {
      amountType: "N/A",
      documents: [
        {
          id: "classroom-contract",
          base64: "dGVzdCBiYXNlNjRTdHJpbmc=",
          fileName: "test-document",
        },
      ],
    }).then(({ id }) => {
      let workflowitemId = id;
      cy.reload();
      // Check if attach file icon badge is NOT displayed
      cy.get(`[data-test^='attachment-file-badge-show-${workflowitemId}']`).should("be.visible");
    });
  });
});
