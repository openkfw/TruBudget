import { sha256 } from "js-sha256";

let projectId;
let subprojectId;
let workflowitemId;
const apiRoute = "/api";

// Actual file in fixture folder
const fileName = "documents_test.json";

describe("Attaching a document to a workflowitem.", function () {
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

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`, {
      // Mock crypto.subtle.digest, because it is not supported in headless mode
      onBeforeLoad: (win) => {
        const originalCrypto = win.crypto;
        delete win.crypto; // delete if running in browser, so it can be mocked
        win.crypto = {
          getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto), // copy the existing getRandomValues method
          subtle: {
            digest: async (algorithm, data) => {
              if (algorithm === "SHA-256") {
                const message = new TextDecoder().decode(data);
                const hash = sha256(message);
                const hashArray = Array.from(new Uint8Array(hash.length / 2));
                for (let i = 0; i < hash.length; i += 2) {
                  hashArray[i / 2] = parseInt(hash.substring(i, i + 2), 16);
                }
                return new Uint8Array(hashArray);
              }
              throw new Error(`Unsupported algorithm: ${algorithm}`);
            },
          },
        };
      },
    });
  });

  const uploadDocument = (fileName) => {
    // open edit dialog:
    cy.get("[data-test=edit-workflowitem]").should("be.visible").click();

    // click "next" button:
    cy.get("[data-test=next]").should("be.visible").click();

    // "upload" the file:
    cy.fixture(fileName, { encoding: null }).then((contents) => {
      cy.get("#docupload").selectFile(
        {
          contents,
          fileName: fileName,
          mimeType: "application/json",
        },
        { action: "select" },
      );
    });
    return cy.get("[data-test=workflowitemDocumentFileName]").should("contain", fileName);
  };

  it("A document can be validated.", function () {
    cy.intercept(apiRoute + "/workflowitem.update*").as("update");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.intercept(apiRoute + "/workflowitem.validate*").as("validate");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").should("be.visible").click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").should("be.visible").click();

    // upload the same file, for validation:
    cy.fixture(fileName, { encoding: null }).then((contents) => {
      cy.get("#docvalidation").selectFile(
        {
          contents,
          fileName: fileName,
          mimeType: "application/json",
        },
        { action: "select" },
      );
    });

    // make sure the validation was successful:
    cy.wait(200).get(`[data-test=validation-button]`).should("contain", "Identical");
  });

  it("Validation of wrong document fails.", function () {
    cy.intercept(apiRoute + "/workflowitem.update*").as("update");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.intercept(apiRoute + "/workflowitem.validate*").as("validate");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").should("be.visible").click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").should("be.visible").click();

    // upload wrong document
    const wrongFileName = "testdata.json";
    cy.fixture(wrongFileName, { encoding: null }).then((contents) => {
      cy.get("#docvalidation").selectFile(
        {
          contents,
          fileName: wrongFileName,
          mimeType: "application/json",
        },
        { action: "select" },
      );
    });

    // make sure the validation was not successful:
    cy.wait(200).get(`[data-test=validation-button]`).should("contain", "Different");
  });

  it("The filename and document name are shown correctly", function () {
    cy.intercept(apiRoute + "/workflowitem.update*").as("update");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.intercept(apiRoute + "/workflowitem.validate*").as("validate");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").should("be.visible").click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").should("be.visible").click();

    // Check document name
    cy.get("[data-test=workflowitemDocumentFileName]").should("be.visible").first().contains(fileName);
  });
});

describe("Deleting a document from a workflowitem.", function () {
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

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  const uploadDocument = (fileName) => {
    // open edit dialog:
    cy.get("[data-test=edit-workflowitem]").should("be.visible").click();

    // click "next" button:
    cy.get("[data-test=next]").should("be.visible").click();

    // "upload" the file:
    cy.fixture(fileName, { encoding: null }).then((contents) => {
      cy.get("#docupload").selectFile(
        {
          contents,
          fileName: fileName,
          mimeType: "application/json",
        },
        { action: "select" },
      );
    });
    return cy.get("[data-test=workflowitemDocumentFileName]").should("contain", fileName);
  };

  it("A document can be deleted.", function () {
    cy.intercept(apiRoute + "/workflowitem.update*").as("update");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.intercept(apiRoute + "/workflowitem.deleteDocument*").as("deleteDocument");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").should("be.visible").click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").should("be.visible").click();

    // delete the document
    cy.get("[data-test=delete-document]").should("be.visible").click();
  });
});

describe("Deleting a document from a closed workflowitem.", function () {
  let projectId;
  let subprojectId;
  let workflowitemId;

  before(() => {
    cy.login();
    cy.createProject("documents test project", "workflowitem documents test", [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, "workflowitem documents test");
      })
      .then(({ id }) => {
        subprojectId = id;
      });
  });

  beforeEach(function () {
    cy.createWorkflowitem(projectId, subprojectId, "workflowitem documents test", { amountType: "N/A" }).then(
      ({ id }) => {
        workflowitemId = id;
      },
    );

    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
  });

  const uploadDocument = (fileName) => {
    // open edit dialog:
    cy.get("[data-test=edit-workflowitem]").last().should("be.visible").click();

    // click "next" button:
    cy.get("[data-test=next]").should("be.visible").click();

    // "upload" the file:
    cy.fixture(fileName, { encoding: null }).then((contents) => {
      cy.get("#docupload").selectFile(
        {
          contents,
          fileName: fileName,
          mimeType: "application/json",
        },
        { action: "select" },
      );
    });
    return cy.get("[data-test=workflowitemDocumentFileName]").should("contain", fileName);
  };

  it("A document cannot be deleted from a closed workflowitem.", function () {
    cy.intercept(apiRoute + "/workflowitem.update*").as("update");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("viewDetails");
    cy.intercept(apiRoute + "/workflowitem.deleteDocument*").as("deleteDocument");

    uploadDocument(fileName);
    // submit and close the dialog:
    cy.get("[data-test=submit]").should("be.visible").click();

    // close workflowitem
    cy.get("[data-test=close-workflowitem]").should("be.visible").click();
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.visible").click();

    // open the info dialog window:
    cy.wait("@update")
      .wait("@viewDetails")
      .get(`[data-test^='workflowitem-info-button-${workflowitemId}']`)
      .should("be.visible")
      .click();

    // go to the documents tab:
    cy.get("[data-test=workflowitem-documents-tab]").should("be.visible").click();

    // try deleting the document
    cy.get("[data-test=delete-document]").should("have.class", "Mui-disabled");
  });
});
