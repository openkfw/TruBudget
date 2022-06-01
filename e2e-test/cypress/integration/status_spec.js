describe("Component Versions", function() {
  let exportUrl, apiBaseUrl, apiUrl;
  before(() => {
    apiBaseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiUrl = apiBaseUrl + "/api";
    exportUrl = Cypress.env("EXPORT_SERVICE_BASE_URL") || `${Cypress.config("baseUrl")}/test/api/export/xlsx`;
  });

  it("Shows status list", function() {
    cy.login();
    cy.visit("/");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation-service-status]").click();
    cy.get("[data-test=status-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5);
  });

  it("Shows connection of export-service", function() {
    cy.intercept(exportUrl + "/readiness*").as("isExportReady");
    cy.visit("/");
    cy.wait("@isExportReady").then(() => loginUi());
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation-service-status]").click();
    cy.get("[data-test=status-table-body] ")
      .contains("td", "exportService")
      .should("be.visible");
  });

  it("Shows versions of basic services (frontend,api,blockchain,multichain) correctly", function() {
    cy.intercept(apiUrl + "/version").as("fetchVersions");
    cy.login();
    cy.visit("/");
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation-service-status]").click();
    cy.get("[data-test=status-table-body]")
      .should("be.visible")
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
