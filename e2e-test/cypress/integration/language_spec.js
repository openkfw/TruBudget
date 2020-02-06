import { languages } from "../support/helper";

describe("Language", function() {
  beforeEach(function() {
    cy.visit(`/`);
  });

  it(`Check if language is still selected after logout`, function() {
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
});
