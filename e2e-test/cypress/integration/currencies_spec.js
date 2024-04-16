import { languages } from "../support/helper";
import { currencies } from "../support/helper";
import { toAmountString } from "../support/helper";

describe("Describe Currencies", function () {
  const apiRoute = "/api";
  const currenciesArray = Object.keys(currencies);
  const standardBudget = [
    {
      organization: "Test",
      value: "12345",
      currencyCode: "EUR",
    },
  ];

  beforeEach(function () {
    cy.login();
    cy.intercept({ method: "GET", url: "api/v2/project.list*" }).as("listProjects");
    cy.visit(`/projects`);
    cy.get("[data-test=card-pagination-north]").within(() => {
      cy.get(".MuiSelect-select").click();
    });
    cy.get(`li[data-value="100"]`).should("be.visible").click();
  });

  it("Shows all the currencies dropdown when creating a project", function () {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");

    // Type in organization name to activate currency dropdown
    cy.get("[data-test=organization-input").type("Test");

    cy.get("[data-test=dropdown-currencies]").should("be.visible");
    cy.get("[data-test=dropdown-currencies-click]").click();
    currenciesArray.forEach((currency) => {
      cy.get(`[data-value=${currency}]`).scrollIntoView().should("be.visible");
    });
    cy.get(`[data-value=${currenciesArray[0]}]`).click();
    cy.get("[data-test=cancel]").click();
  });

  it("Sets the currency of a new project to EUR and checks if the Euro sign is displayed", function () {
    cy.intercept(apiRoute + "project.list*").as("listProjects");
    cy.createProject("project budget test project", "project budget test", standardBudget);
    cy.visit("/projects").wait("@listProjects");
    cy.get("[data-test*=project-card]")
      .last()
      .find("[data-test=project-budget]")
      .should("contain", currencies.EUR.symbol);
  });

  it("Checking format for Value and currency Symbol of all languages", function () {
    cy.intercept(apiRoute + "/project.list*").as("listProjects");
    cy.createProject("project budget test project", "project budget test", standardBudget);
    cy.visit("/projects").wait("@listProjects");
    languages.forEach((languageElement) => {
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
