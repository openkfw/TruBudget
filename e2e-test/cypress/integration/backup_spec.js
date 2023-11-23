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

  beforeEach(() => {
    cy.task("awaitApiReady", baseUrl, 12);
  });

  after(() => {
    //restore the backup to the original state
    cy.task("checkFileExists", { file: pathToFile, timeout: 500 });

    cy.intercept(apiRoute + "/system.restoreBackup").as("restore");

    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
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
      cy.wait("@restore")
        .its("response.statusCode")
        .should("eq", 200)
        .then(() => {
          cy.url().should("include", "/login");
        });
    });
  });

  it("Tests the download of a backup.gz file", function () {
    cy.intercept(apiRoute + "/system.createBackup").as("create");
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=download-backup]").click();
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
        .its("response.statusCode")
        .should("eq", 500)
        .then(() => {
          cy.task("deleteFile", `cypress/fixtures/${invalidBackupFile}`).then((success) => {
            expect(success).to.eq(true);
          });
          cy.get("[data-test=client-snackbar]")
            .contains("failed to restore backup: Backup with these configurations is not permitted")
            .should("be.visible");
          // Check if the user is still logged in
          cy.url()
            .should("include", "/projects")
            .then(() => {
              cy.get("[id^=project-title-]").first().invoke("text").should("not.include", "Backup Successful");
            });
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
        .its("response.statusCode")
        .should("eq", 500)
        .then(() => {
          cy.get("[data-test=client-snackbar]")
            .contains("Backup with these configurations is not permitted")
            .should("be.visible");
          // Check if the user is still logged in
          cy.url()
            .should("include", "/projects")
            .then(() => {
              cy.get("[id^=project-title-]").first().invoke("text").should("not.include", "Backup Successful");
            });
        });
    });
  });
});
