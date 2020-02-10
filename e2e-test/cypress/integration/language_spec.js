import { languages } from "../support/helper";

const standardBudget = [
  {
    organization: "Test",
    value: "12345",
    currencyCode: "EUR"
  }
];

describe("Language", function() {
  before(function() {
    cy.login("mstein", "test");
    cy.visit(`/projects`);
    cy.createProject("p-language-check", "project language test", standardBudget);
  });

  beforeEach(function() {
    cy.visit(`/`);
  });

  it("Check if language is still selected after logout", function() {
    languages.forEach(languageElement => {
      cy.login("mstein", "test", { language: languageElement });
      cy.visit(`/projects`);
      cy.get("[data-test=navbar-logout-button]")
        .should("be.visible")
        .click();

      // Check if last selected language is now preselected
      cy.get("[data-test=loginpage]").should("be.visible");
      cy.get("[data-test=dropdown-language_selection]").should("be.visible");
      cy.get("[data-test=dropdown-language_selection]")
        .click()
        .focused()
        .click();
      cy.get("[data-test=dropdown_selectList]").should("be.visible");
      // Old language should have been preselected already ([tabindex=0] means preselected)
      cy.get("[data-test=dropdown_selectList]")
        .find("[tabindex*=0]")
        .first()
        .invoke("attr", "data-value")
        .should("eq", languageElement);
    });
  });

  it("Check some georgian words", function() {
    cy.login("mstein", "test", { language: "ka" });
    cy.visit(`/projects`);
    cy.get("[data-test=project-header]")
      .last()
      .should("be.visible")
      .should("contain", "სტატუსი: Open");
    cy.get("[data-test=project-creation-date]")
      .last()
      .should("be.visible")
      .should("contain", "შექმნილია");
  });

  it("Check some german words", function() {
    cy.login("mstein", "test", { language: "de" });
    cy.visit(`/projects`);
    cy.get("[data-test=project-header]")
      .last()
      .should("be.visible")
      .should("contain", "Status: Open");
    cy.get("[data-test=project-creation-date]")
      .last()
      .should("be.visible")
      .should("contain", "Created");
  });

  it("Check some english words", function() {
    cy.login("mstein", "test", { language: "en-gb" });
    cy.visit(`/projects`);
    cy.get("[data-test=project-header]")
      .last()
      .should("be.visible")
      .should("contain", "Status: Open");
    cy.get("[data-test=project-creation-date]")
      .last()
      .should("be.visible")
      .should("contain", "Created");
  });

  it("Check some french words", function() {
    cy.login("mstein", "test", { language: "fr" });
    cy.visit(`/projects`);
    cy.get("[data-test=project-header]")
      .last()
      .should("be.visible")
      .should("contain", "Statut: Ouvert");
    cy.get("[data-test=project-creation-date]")
      .last()
      .should("be.visible")
      .should("contain", "Créé");
  });

  it("Check some portugese words", function() {
    cy.login("mstein", "test", { language: "pt" });
    cy.visit(`/projects`);
    cy.get("[data-test=project-header]")
      .last()
      .should("be.visible")
      .should("contain", "Status: Aberto");
    cy.get("[data-test=project-creation-date]")
      .last()
      .should("be.visible")
      .should("contain", "Data de criação");
  });
});
