import "cypress-file-upload";
let baseUrl, apiRoute;
baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
let fileName = "backup.gz";

let pathToFile = `cypress/fixtures/${fileName}`;

// npm run e2etest -- --spec **/backup_spec.js

describe("Backup Feature", function() {
  before(() => {
    //download directly to fixture folder, without pop-ups
    if (Cypress.browser.name !== "firefox") {
      cy.wrap(
        Cypress.automation("remote:debugger:protocol", {
          command: "Page.setDownloadBehavior",
          params: { behavior: "allow", downloadPath: "cypress/fixtures" }
        }),
        { log: false }
      );
    }

    // a backup will be downloaded
    cy.intercept(apiRoute + "/system.createBackup*").as("create");
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=download-backup]").click();
    cy.task("awaitApiReady", baseUrl);
  });

  beforeEach(() => {
    //the user must be logged out before each test
    cy.url().then(url => {
      if (!url.includes("/login")) {
        cy.get("[data-test=navbar-logout-button]").should("be.visible");
        cy.get("[data-test=navbar-logout-button]").click({ force: true });
        cy.location("pathname").should("eq", "/login");
      }
    });
  });

  after(() => {
    //restore the backup to the original state
    cy.task("checkFileExists", { file: pathToFile, timeout: 500 });

    cy.intercept(apiRoute + "/system.restoreBackup*").as("restore");

    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");
    //Upload file
    cy.fixture(fileName, "binary").then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent);
      cy.get("#uploadBackup").attachFile(
        { fileContent: blob, fileName, mimeType: "application/gzip", encoding: "utf-8" },
        { subjectType: "input" }
      );
    });
    cy.task("deleteFile", pathToFile).then(success => {
      expect(success).to.eq(true);
    });
    cy.wait("@restore").should(interception => {
      expect(interception.response.statusCode).to.eq(200);
      cy.task("awaitApiReady", baseUrl).then(() => {
        cy.url().should("include", "/login");
      });
    });
  });

  it("Tests the download of a backup.gz file", function() {
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.createBackup().then(headers => {
      expect(headers).to.include({
        "content-type": "application/gzip",
        "content-disposition": 'attachment; filename="backup.gz"'
      });
    });
  });

  it("Tests the restore of an invalid backup", function() {
    const invalidBackupFile = "backup_invalidHash.gz";

    cy.task("modifyHash", { pathToFile, newHash: "wrongHash", newBackup: invalidBackupFile }).then(success => {
      expect(success).to.eq(true);
    });

    cy.intercept(apiRoute + "/system.restoreBackup*").as("restore");

    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");

    //Upload file
    cy.fixture(invalidBackupFile, "binary").then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent);
      cy.get("#uploadBackup").attachFile(
        { fileContent: blob, fileName: invalidBackupFile, mimeType: "application/gzip", encoding: "utf-8" },
        { subjectType: "input" }
      );
      cy.wait("@restore")
        .should(interception => {
          expect(interception.response.statusCode).to.eq(500);
        })
        .then(() => {
          cy.task("deleteFile", `cypress/fixtures/${invalidBackupFile}`).then(success => {
            expect(success).to.eq(true);
          });
          cy.get("[data-test=client-snackbar]")
            .contains("Not a valid TruBudget backup")
            .should("be.visible");
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
    const wrongOrgaFile = "backup_orga_test.gz";

    cy.intercept(apiRoute + "/system.restoreBackup*").as("restore");
    //Open side navigation
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");

    //Upload file
    cy.fixture(wrongOrgaFile, "binary").then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent);
      cy.get("#uploadBackup").attachFile(
        { fileContent: blob, fileName: wrongOrgaFile, mimeType: "application/gzip", encoding: "utf-8" },
        { subjectType: "input" }
      );
      cy.wait("@restore")
        .should(interception => {
          expect(interception.response.statusCode).to.eq(500);
        })
        .then(() => {
          cy.get("[data-test=client-snackbar]")
            .contains("Backup with these configurations is not permitted")
            .should("be.visible");
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
});
