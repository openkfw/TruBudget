import { languages } from "../support/helper";
import { currencies } from "../support/helper";
import { toAmountString } from "../support/helper";

describe("Describe Currencies", function() {
  let baseUrl, apiRoute;
  const currenciesArray = Object.keys(currencies);
  const standardBudget = [
    {
      organization: "Test",
      value: "12345",
      currencyCode: "EUR"
    }
  ];

  before(function() {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(function() {
    cy.login();
    cy.server();
    cy.route("GET", apiRoute + "/project.list*").as("listProjects");
    cy.visit(`/projects`);
  });

  it("Shows all the currencies dropdown when creating a project", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");

    // Type in organization name to activate currency dropdown
    cy.get("[data-test=organization-input").type("Test");

    cy.get("[data-test=dropdown-currencies]").should("be.visible");
    cy.get("[data-test=dropdown-currencies-click]").click();
    currenciesArray.forEach(currency => {
      cy.get(`[data-value=${currency}]`).should("be.visible");
    });
    cy.get(`[data-value=${currenciesArray[0]}]`).click();
    cy.get("[data-test=cancel]").click();
  });

  it("Selects every currency successively", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");

    // Type in organization name to activate currency dropdown
    cy.get("[data-test=organization-input").type("Test");

    cy.get("[data-test=dropdown-currencies]").should("be.visible");
    cy.get("[data-test=dropdown-currencies-click]").click();
    currenciesArray.forEach(currency => {
      cy.get(`[data-value=${currency}]`).click();
      cy.get("[data-test=dropdown-currencies-click]").contains(`${currency}`);
      cy.get("[data-test=dropdown-currencies-click]").click();
    });
    cy.get(`[data-value=${currenciesArray[0]}]`).click();
    cy.get("[data-test=cancel]").click();
  });

  it("Sets the currency of a new project to EUR and checks if the Euro sign is displayed", function() {
    cy.createProject("project budget test project", "project budget test", standardBudget);
    cy.visit("/projects").wait("@listProjects");
    cy.get("[data-test*=project-card]")
      .last()
      .find("[data-test=project-budget]")
      .should("contain", currencies.EUR.symbol);
  });

  it("Checking format for Value and currency Symbol of all languages", function() {
    cy.createProject("project budget test project", "project budget test", standardBudget);
    cy.visit("/projects").wait("@listProjects");
    languages.forEach(languageElement => {
      cy.login("mstein", "test", { language: languageElement });
      cy.visit(`/projects`);
      cy.get("[data-test*=project-card]")
        .last()
        .find("[data-test=project-budget]")
        .get("span")
        .should("be.visible")
        .should("contain", toAmountString(standardBudget.currencyCode, standardBudget.value, languageElement));
    });
  });
});
