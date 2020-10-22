import "cypress-file-upload";
let baseUrl, apiRoute;
baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

describe("Backup Feature", function() {
  beforeEach(() => {
    //the user must be logged out before each test
    cy.url().then(url => {
      if (url.includes("/projects")) {
        cy.get("[data-test=navbar-logout-button]").should("be.visible");
        cy.get("[data-test=navbar-logout-button]").click({ force: true });
        cy.location("pathname").should("eq", "/login");
      }
    });
  });

  after(() => {
    //restore the backup to a provisioned state
    const fileName = "provisioned_chain_backup.gz";

    cy.server();
    cy.route("POST", apiRoute + "/system.restoreBackup*").as("restore");

    cy.login("root", "root-secret");
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");
    cy.fixture(fileName, "binary")
      .then(fileContent => Cypress.Blob.binaryStringToBlob(fileContent))
      .then(fileContent => {
        cy.get("#uploadBackup").upload(
          { fileContent: fileContent, fileName, mimeType: "application/gzip", encoding: "utf-8" },
          { subjectType: "input" }
        );
        cy.wait("@restore");
      });
  });

  it("Tests the download of a backup.gz file", function() {
    cy.login("root", "root-secret");
    cy.createBackup().then(headers => {
      expect(headers).to.include({
        "content-type": "application/gzip",
        "content-disposition": 'attachment; filename="backup.gz"'
      });
    });
  });

  it("Tests the restore of an invalid backup", function() {
    const fileName = "invalid_backup.gz";

    cy.server();
    cy.route("POST", apiRoute + "/system.restoreBackup*").as("restore");

    cy.login("root", "root-secret");
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");

    //Upload file
    cy.fixture(fileName, "binary")
      .then(fileContent => Cypress.Blob.binaryStringToBlob(fileContent))
      .then(fileContent => {
        cy.get("#uploadBackup").upload(
          { fileContent: fileContent, fileName, mimeType: "application/gzip", encoding: "utf-8" },
          { subjectType: "input" }
        );
        cy.wait("@restore")
          .should(xhr => {
            expect(xhr.status).to.eq(500);
          })
          .then(() => {
            cy.url()
              .should("include", "/projects")
              .then(() => {
                cy.get("[data-test=project-title] span")
                  .invoke("text")
                  .should("not.include", "Backup Successful");
              });
          });
      });
  });

  it("Tests the restore of a backup with the wrong organisation", function() {
    const fileName = "backup_orga_test.gz";

    cy.server();
    cy.route("POST", apiRoute + "/system.restoreBackup*").as("restore");
    //Open side navigation
    cy.login("root", "root-secret");
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");

    //Upload file
    cy.fixture(fileName, "binary")
      .then(fileContent => Cypress.Blob.binaryStringToBlob(fileContent))
      .then(fileContent => {
        cy.get("#uploadBackup").upload(
          { fileContent: fileContent, fileName, mimeType: "application/gzip", encoding: "utf-8" },
          { subjectType: "input" }
        );
        cy.wait("@restore")
          .should(xhr => {
            expect(xhr.status).to.eq(500);
          })
          .then(() => {
            cy.url()
              .should("include", "/projects")
              .then(() => {
                cy.get("[data-test=project-title] span")
                  .invoke("text")
                  .should("not.include", "Backup Successful");
              });
          });
      });
  });

  it("Tests the restore of a valid backup", function() {
    const fileName = "valid_backup.gz";

    cy.server();
    cy.route("POST", apiRoute + "/system.restoreBackup*").as("restore");

    cy.login("root", "root-secret");
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");
    //Upload file
    cy.fixture(fileName, "binary")
      .then(fileContent => Cypress.Blob.binaryStringToBlob(fileContent))
      .then(fileContent => {
        cy.get("#uploadBackup").upload(
          { fileContent: fileContent, fileName, mimeType: "application/gzip", encoding: "utf-8" },
          { subjectType: "input" }
        );
      });
    cy.wait("@restore")
      .should(xhr => {
        expect(xhr.status).to.eq(200);
      })
      .then(() => {
        cy.task("awaitApiReady", baseUrl).then(() => {
          cy.url()
            .should("include", "/login")
            .then(() => {
              cy.login("root", "root-secret");
              cy.visit("/projects");
              cy.get("[data-test=project-title] span")
                .invoke("text")
                .should("include", "Backup Successful");
            });
        });
      });
  });
});
