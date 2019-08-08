const currencies = {
  EUR: { symbol: "€", format: "%v %s" },
  USD: { symbol: "$", format: "%s %v" },
  BRL: { symbol: "R$", format: "%s %v" },
  XOF: { symbol: "CFA", format: "%s %v" }
};

const currenciesArray = Object.keys(currencies);
const standardBudget = [
  {
    organization: "Test",
    value: "12345",
    currencyCode: "EUR"
  }
];

describe("Overview Page", function() {
  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("Shows all the currencies dropdown when creating a project", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");

    // Type in organization name to activate currency dropdown
    cy.get("[data-test=organizationinput").type("Test");

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
    cy.get("[data-test=organizationinput").type("Test");

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
    cy.createProject("Test", "Test", standardBudget);

    //Fetch projects to get newest one
    cy.reload();

    cy.get("[data-test*=project-card]")
      .last()
      .find("[data-test=project-budget]")
      .should("contain", currencies.EUR.symbol);
  });
});
