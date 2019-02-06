const currencies = {
  EUR: { symbol: "€", format: "%v %s" },
  USD: { symbol: "$", format: "%s %v" },
  BRL: { symbol: "R$", format: "%s %v" },
  XOF: { symbol: "CFA", format: "%s %v" }
};

function clickEditProject(projectName) {
  cy.get("[aria-label=project]")
    .contains(projectName)
    .parents()
    .filter("[aria-label=project]")
    .find("[data-test^='pe-button']")
    .click();
}

let projects = undefined;
const currenciesArray = Object.keys(currencies);

describe("Overview Page", function() {
  beforeEach(function() {
    cy.fixture("testdata.json").as("data");
    cy.login();
    cy.visit(`/projects`);
    return cy.fetchProjects().then(p => {
      projects = p;
    });
  });

  it("Shows all the currencies dropdown when editing a project", function() {
    // Create project just to have at least one
    const projectName = "First Project";
    cy.createProject(projectName, "12345", "EUR", projectName);

    cy.get("[data-test=pe-button-0]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");
    cy.get("[data-test=dropdown-currencies]").should("be.visible");
    cy.get("[data-test=dropdown-currencies-click]").click();
    currenciesArray.forEach(currency => {
      cy.get(`[data-value=${currency}]`).should("be.visible");
    });
    //To close the dropdown we need to click on one of the elements
    cy.get(`[data-value=${currenciesArray[0]}]`).click();
    cy.get("[data-test=cancel]").click();
  });

  it("Shows all the currencies dropdown when creating a project", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");
    cy.get("[data-test=dropdown-currencies]").should("be.visible");
    cy.get("[data-test=dropdown-currencies-click]").click();
    currenciesArray.forEach(currency => {
      cy.get(`[data-value=${currency}]`).should("be.visible");
    });
    cy.get(`[data-value=${currenciesArray[0]}]`).click();
    cy.get("[data-test=cancel]").click();
  });

  it("Selects every currency successively", function() {
    cy.get("[data-test=pe-button-0]").click();
    cy.get("[data-test=creation-dialog]").should("be.visible");
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
    cy.createProject("Test", "12345", "EUR", "Test");

    //Fetch projects to get newest one
    cy.reload();

    cy.get("[aria-label=project]")
      .contains("Test")
      .parents()
      .filter("[aria-label=project]")
      .find("[data-test=projectbudget]")
      .should("contain", currencies.EUR.symbol);
  });
});
