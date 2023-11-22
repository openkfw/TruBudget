const apiRoute = "/api";
const baseUrl = Cypress.env("API_BASE_URL") || Cypress.config("baseUrl");
let fileName = "backup.gz";

let pathToFile = `cypress/fixtures/${fileName}`;

describe("Backup Feature", function () {
  before(() => {
    //download directly to fixture folder, without pop-ups
    if (Cypress.browser.name !== "firefox") {
      cy.wrap(
        Cypress.automation("remote:debugger:protocol", {
          command: "Page.setDownloadBehavior",
          params: { behavior: "allow", downloadPath: "cypress/fixtures" },
        }),
        { log: false },
      );
    }
  });

  after(() => {
    //restore the backup to the original state
    cy.task("checkFileExists", { file: pathToFile, timeout: 500 });
    cy.task("awaitApiReady", baseUrl);

    cy.intercept(apiRoute + "/system.restoreBackup").as("restore");

    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");
    //Upload file
    cy.fixture(fileName, { encoding: null }).then((contents) => {
      cy.get("#uploadBackup").selectFile(
        {
          contents,
          fileName: fileName,
          mimeType: "application/gzip",
        },
        { action: "select" },
      );
      cy.task("deleteFile", pathToFile).then((success) => {
        expect(success).to.eq(true);
      });
      cy.wait("@restore").then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        cy.task("awaitApiReady", baseUrl).then(() => {
          cy.url().should("include", "/login");
        });
      });
    });
  });

  it("Tests the download of a backup.gz file", function () {
    cy.intercept(apiRoute + "/system.createBackup").as("create");
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=download-backup]").click();
    cy.task("awaitApiReady", baseUrl);
    cy.wait("@create").then((interception) => {
      expect(interception.response.headers).to.include({
        "content-type": "application/gzip",
        "content-disposition": 'attachment; filename="backup.gz"',
      });
    });
  });

  it("Tests the restore of an invalid backup", function () {
    const invalidBackupFile = "backup_invalidHash.gz";

    cy.task("modifyHash", { pathToFile, newHash: "wrongHash", newBackup: invalidBackupFile }).then((success) => {
      expect(success).to.eq(true);
    });

    cy.intercept(apiRoute + "/system.restoreBackup").as("restore");

    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");

    //Upload file
    cy.fixture(invalidBackupFile, { encoding: null }).then((contents) => {
      cy.get("#uploadBackup").selectFile(
        {
          contents,
          fileName: invalidBackupFile,
          mimeType: "application/gzip",
        },
        { action: "select" },
      );
      cy.wait("@restore")
        .should((interception) => {
          expect(interception.response.statusCode).to.eq(500);
        })
        .then(() => {
          cy.task("deleteFile", `cypress/fixtures/${invalidBackupFile}`).then((success) => {
            expect(success).to.eq(true);
          });
          cy.get("[data-test=client-snackbar]")
            .contains("failed to restore backup: Backup with these configurations is not permitted")
            .should("be.visible");
        });
    });
  });

  it("Tests the restore of a backup with the wrong organisation", function () {
    const wrongOrgaFile = "backup_orga_test.gz";

    cy.intercept(apiRoute + "/system.restoreBackup").as("restore");
    //Open side navigation
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");

    //Upload file
    cy.fixture(wrongOrgaFile, { encoding: null }).then((contents) => {
      cy.get("#uploadBackup").selectFile(
        {
          contents,
          fileName: wrongOrgaFile,
          mimeType: "application/gzip",
        },
        { action: "select" },
      );
      cy.wait("@restore")
        .should((interception) => {
          expect(interception.response.statusCode).to.eq(500);
        })
        .then(() => {
          cy.get("[data-test=client-snackbar]")
            .contains("Backup with these configurations is not permitted")
            .should("be.visible");
        });
    });
  });
});
