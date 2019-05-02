import "cypress-file-upload";

let projectId;
let subprojectId;

describe("Attaching a document to a workflowitem.", function() {
  before(() => {
    cy.login();

    cy.createProject("workflowitem history test project", "workflowitem history test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem history test");
      })
      .then(({ id }) => {
        subprojectId = id;
        return cy.createWorkflowitem(projectId, subprojectId, "workflowitem history test", { amountType: "N/A" });
      });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  it("After creating the attachment, the document can be verified.", function() {
    // open edit dialog:
    cy.get("div[title=Edit] > button").click();

    // click "next" button:
    cy.get("[data-test=next]").click();

    // enter the file name:
    const fileDisplayName = "my test file";
    cy.get("#documentnameinput").type(fileDisplayName);

    // "upload" the file:
    const fileName = "example.json";
    cy.fixture(fileName).then(fileContent => {
      cy.get("#docupload").upload(
        { fileContent: JSON.stringify(fileContent), fileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });
    cy.get("[data-test=workflowitemDocumentId]").should("contain", fileDisplayName);

    // submit and close the dialog:
    cy.get("[data-test=submit]").click();

    // open the info dialog window:
    cy.get(".workflowitem-info-button").click();

    // go to the documents tab:
    cy.get("#workflowitem-documents-tab").click();

    // upload the same file, for validation:
    cy.fixture(fileName).then(fileContent => {
      cy.get("#docvalidation").upload(
        { fileContent: JSON.stringify(fileContent), fileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });

    // make sure the validation was successful:
    cy.get(`button[label="Validated!"] > span`).should("contain", "OK");

    // make sure the validation fails with the wrong document
    const wrongFileName = "testdata.json";
    cy.fixture(wrongFileName).then(fileContent => {
      cy.get("#docvalidation").upload(
        { fileContent: JSON.stringify(fileContent), fileName: wrongFileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });

    cy.get(`button[label="Changed!"] > span`).should("contain", "Not OK");
  });
});
