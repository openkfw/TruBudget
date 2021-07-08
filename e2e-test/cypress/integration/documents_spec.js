import "cypress-file-upload";

let projectId;
let subprojectId;
let workflowitemId;
let baseUrl, apiRoute;
let isExternalStorageEnabled = false;


// Actual file in fixture folder
const fileName = "documents_test.json";

describe("Attaching a document to a workflowitem.", function() {
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();
    cy.getVersion().then(data => {
      if (data.storage && data.storage.release) {
        isExternalStorageEnabled = true;
      }
    });
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

  const uploadDocument = (fileName) => {
    // open edit dialog:
    cy.get("div[title=Edit] > button")
      .should("be.visible")
      .click();

    // click "next" button:
    cy.get("[data-test=next]")
      .should("be.visible")
      .click();


    // "upload" the file:
    cy.fixture(fileName).then(fileContent => {
      cy.get("#docupload").attachFile(
        { fileContent: JSON.stringify(fileContent), fileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });
    return cy.get("[data-test=workflowitemDocumentId]").should("contain", fileName)
  };

  it("A document can be validated.", function () {
    cy.server();
    cy.route("POST", apiRoute + "/workflowitem.update*").as("update");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.route("POST", apiRoute + "/workflowitem.validate*").as("validate");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]")
      .should("be.visible")
      .click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]")
      .should("be.visible")
      .click();

    // upload the same file, for validation:
    cy.fixture(fileName).then(fileContent => {
      cy.get("#docvalidation").attachFile(
        { fileContent: JSON.stringify(fileContent), fileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });

    // make sure the validation was successful:
    cy.wait("@validate")
      .get(`button[label="Validated!"] > span`)
      .should("contain", "Identical");
  });

  it("Validation of wrong document fails.", function () {
    cy.server();
    cy.route("POST", apiRoute + "/workflowitem.update*").as("update");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.route("POST", apiRoute + "/workflowitem.validate*").as("validate");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]")
      .should("be.visible")
      .click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]")
      .should("be.visible")
      .click();

    // upload wrong document
    const wrongFileName = "testdata.json";
    cy.fixture(wrongFileName).then(fileContent => {
      cy.get("#docvalidation").attachFile(
        { fileContent: JSON.stringify(fileContent), fileName: wrongFileName, mimeType: "application/json" },
        { subjectType: "input" }
      );
    });

    // make sure the validation was not successful:
    cy.wait("@validate")
      .get(`button[label="Changed!"] > span`)
      .should("contain", "Different");
  });

  it("The filename and document name are shown correctly", function () {
    cy.server();
    cy.route("POST", apiRoute + "/workflowitem.update*").as("update");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.route("POST", apiRoute + "/workflowitem.validate*").as("validate");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]")
      .should("be.visible")
      .click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]")
      .should("be.visible")
      .click();

    // Check document name
    cy.get("[data-test=workflowitemDocumentId]")
      .should("be.visible")
      .contains(fileName);

    // Check filename if saved on external storage (minio)
    if (isExternalStorageEnabled) {
      cy.get("[data-test=workflowitemDocumentId]")
        .should("be.visible")
        .contains(`(${fileName})`);
    }
  });
});
