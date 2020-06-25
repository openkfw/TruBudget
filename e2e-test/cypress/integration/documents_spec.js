import "cypress-file-upload";

let projectId;
let subprojectId;
let workflowitemId;
// Actual file in fixture folder
const fileName = "documents_test.json";

describe("Attaching a document to a workflowitem.", function() {
  before(() => {
    cy.login();

    cy.createProject("documents test project", "workflowitem documents test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem documents test");
      })
      .then(({ id }) => {
        subprojectId = id;
        return cy
          .createWorkflowitem(projectId, subprojectId, "workflowitem documents test", { amountType: "N/A" })
          .then(({ id }) => {
            workflowitemId = id;
          });
      });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  const uploadDocument = (fileDisplayName, fileName) => {
    // open edit dialog:
    cy.get("div[title=Edit] > button").click();

    // click "next" button:
    cy.get("[data-test=next]").click();

    // enter the file name:
    cy.get("#documentnameinput").type(fileDisplayName);

    // "upload" the file:
    cy.fixture(fileName).then(fileContent => {
      cy.get("#docupload").upload(
        { fileContent: JSON.stringify(fileContent), fileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });
    return cy.get("[data-test=workflowitemDocumentId]").should("contain", fileDisplayName);
  };

  it("A document can be validated.", function() {
    const fileDisplayName = "Validation_Test";
    uploadDocument(fileDisplayName, fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").click();

    // open the info dialog window:
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").click();

    // upload the same file, for validation:
    cy.fixture(fileName).then(fileContent => {
      cy.get("#docvalidation").upload(
        { fileContent: JSON.stringify(fileContent), fileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });

    // make sure the validation was successful:
    cy.get("[data-test=workflowitem-documents-tab]").click();
    cy.get(`button[label="Validated!"] > span`).should("contain", "OK");
  });

  it("Validation of wrong document fails.", function() {
    const fileDisplayName = "Wrong_Document_Test";
    uploadDocument(fileDisplayName, fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").click();

    // open the info dialog window:
    cy.get(`[data-test^='workflowitem-info-button-${workflowitemId}']`).click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").click();

    // make sure the validation fails with the wrong document
    const wrongFileName = "testdata.json";
    cy.fixture(wrongFileName).then(fileContent => {
      cy.get("#docvalidation").upload(
        { fileContent: JSON.stringify(fileContent), fileName: wrongFileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });

    // make sure the validation was not successful:
    cy.get("[data-test=workflowitem-documents-tab]").click();
    cy.get(`button[label="Changed!"] > span`).should("contain", "Not OK");
  });
});
