let exportBaseUrl, exportUrl;
let file = "cypress/fixtures/TruBudget_Export.xlsx";

before(() => {
  if (Cypress.env("EXPORT_SERVICE_BASE_URL")) {
    exportBaseUrl = Cypress.env("EXPORT_SERVICE_BASE_URL");
    exportUrl = exportBaseUrl;
  } else {
    exportBaseUrl = `${Cypress.config("baseUrl")}/test`;
    exportUrl = exportBaseUrl + "/api/export/xlsx";
  }

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
});

describe("Excel Export feature", function() {
  it("Tests the export of an excel file in english", function() {
    cy.server();
    cy.route("GET", exportUrl + "/download?lang=en*").as("export");

    //login
    cy.visit("/");
    loginUi();

    //create export
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");
    cy.get("[data-test=side-navigation-export]")
      .should("be.visible")
      .click();

    // test exported file
    cy.wait("@export").should(xhr => {
      expect(xhr.status).to.eq(200);
      expect(xhr.responseBody.type).to.include("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      //wait for file to be available
      cy.task("checkFileExists", { file, timeout: 500 });

      //test that sheet names are in the correct language
      cy.task("readExcelSheet", { index: 0, file }).then(title => {
        expect(title).to.eq("Projects");
      });
      cy.task("readExcelSheet", { index: 1, file }).then(title => {
        expect(title).to.eq("Subprojects");
      });
      cy.task("readExcelSheet", { index: 3, file }).then(title => {
        expect(title).to.eq("Project Projected Budgets");
      });
      cy.task("readExcelSheet", { index: 5, file }).then(title => {
        expect(title).to.eq("Documents");
      });
    });
  });

  it("Tests the export of an excel file in french", function() {
    cy.server();
    cy.route("GET", exportUrl + "/download?lang=fr*").as("export");

    //login
    cy.visit("/");
    loginUi("mstein", "test", "fr");

    //export excel
    cy.visit("/projects");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]");
    cy.get("[data-test=side-navigation-export]")
      .should("be.visible")
      .click();

    //test the exported file
    cy.wait("@export").should(xhr => {
      expect(xhr.status).to.eq(200);
      expect(xhr.responseBody.type).to.include("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      //wait for file to be available
      cy.task("checkFileExists", { file, timeout: 500 });

      //test that sheet names are in the correct language
      cy.task("readExcelSheet", { index: 0, file }).then(title => {
        expect(title).to.eq("Projets");
      });
      cy.task("readExcelSheet", { index: 1, file }).then(title => {
        expect(title).to.eq("Composantes");
      });
      cy.task("readExcelSheet", { index: 3, file }).then(title => {
        expect(title).to.eq("Coût prévu du projet");
      });
      cy.task("readExcelSheet", { index: 5, file }).then(title => {
        expect(title).to.eq("Documents");
      });
    });
  });
});

afterEach(() => {
  cy.task("deleteFile", file).then(success => {
    expect(success).to.eq(true);
  });
});

function loginUi(name = "mstein", password = "test", language = "en-gb") {
  if (language !== "en-gb") {
    cy.get("[data-test=dropdown-language_selection-click]").click();
    cy.get(`[data-value=${language}]`).click();
  }
  cy.get("#loginpage")
    .should("be.visible")
    .get("#username")
    .type(name)
    .should("have.value", "mstein")
    .get("#password")
    .type(password)
    .should("have.value", "test")
    .get("#loginbutton")
    .click();
  // Check if logged in correctly
  cy.get("#logoutbutton").should("be.visible");
}
