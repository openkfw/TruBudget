describe("Component Versions", function() {
  let exportBaseUrl, exportRoute, baseUrl, apiRoute;
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    if (Cypress.env("EXPORT_SERVICE_BASE_URL")) {
      exportBaseUrl = Cypress.env("EXPORT_SERVICE_BASE_URL");
      exportRoute = "";
    } else {
      exportBaseUrl = `${Cypress.config("baseUrl")}/test`;
      exportRoute = exportBaseUrl.toLowerCase().includes("test") ? "/test/api/export/xlsx" : "/api/export/xlsx";
      cy.log("exportBaseUrl");
      cy.log(exportBaseUrl);
      cy.log("exportRoute");
      cy.log(exportRoute);
    }
  });

  it("Shows status list", function() {
    cy.login();
    cy.visit(`/status`);
    cy.get("[data-test=status-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 4);
  });

  it("Shows connection of export-service", function() {
    cy.server();
    cy.route("GET", exportBaseUrl + exportRoute + "/readiness*").as("isExportReady");
    cy.visit("/");
    loginUi();
    cy.wait("@isExportReady").visit(`/status`);
    cy.get("[data-test=status-table-body] ")
      .contains("td", "exportService")
      .should("be.visible");
  });

  it("Shows versions of basic services (frontend,api,blockchain,multichain) correctly", function() {
    cy.server();
    cy.route("GET", apiRoute + "/version").as("fetchVersions");
    cy.login();
    cy.visit(`/status`);
    cy.get("[data-test=status-table-body]")
      .should("be.visible")
      .wait("@fetchVersions")
      .get("[data-test*=release-version-]")
      .each(releaseTableCells => {
        const text = releaseTableCells.text();
        expect(text.trim()).to.match(/[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });
});

function loginUi(name = "mstein", password = "test") {
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
