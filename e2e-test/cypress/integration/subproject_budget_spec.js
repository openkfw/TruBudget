describe("Subproject edit", function() {
  before(() => {
    cy.login();
  });

  beforeEach(function() {
    // cy.login();
  });

  it("When creating a subproject, only the organizations from the parent project can be selected", function() {
    let projectId;
    const organization = "ACME Corp";
    const projectProjectedBudget = {
      organization,
      currencyCode: "EUR",
      value: "10000"
    };

    cy.login()
      .then(() =>
        cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget])
      )
      .then(({ id }) => {
        projectId = id;
      })
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=subproject-create-button]").should("be.visible"))
      .then(() => cy.get("[data-test=subproject-create-button]").click())
      .then(() => cy.get("[data-test=nameinput] input").type("Subproject budget test"))
      .then(() =>
        cy
          .get("[data-test=commentinput] textarea")
          .last()
          .type("Subproject budget test")
      )
      .then(() => cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click())
      .then(() => cy.get("[data-value=EUR]").click())
      .then(() => cy.get("[data-test=dropdown-organizations-click]").click())
      .then(() => cy.get("#menu-organizations ul").should("have.length", 1))
      .then(() =>
        cy
          .get("#menu-organizations ul li")
          .first()
          .should("contain", organization)
      )
      .then(() => cy.get(`[data-value="${organization}"]`).click())
      .then(() => cy.get(`[data-test=cancel]`).click());
  });

  it("The projected budget of the subproject can be edited", function() {
    let projectId;
    const organization = "ACME Corp";
    const projectProjectedBudget = {
      organization,
      currencyCode: "EUR",
      value: "10000"
    };
    const amount = "1234";

    cy.login()
      .then(() =>
        cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget])
      )
      .then(({ id }) => {
        projectId = id;
      })
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=subproject-create-button]").should("be.visible"))
      .then(() => cy.get("[data-test=subproject-create-button]").click())
      .then(() => cy.get("[data-test=nameinput] input").type("Subproject budget test"))
      .then(() =>
        cy
          .get("[data-test=commentinput] textarea")
          .last()
          .type("Subproject budget test")
      )
      .then(() => cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click())
      .then(() => cy.get("[data-value=EUR]").click())
      .then(() => cy.get("[data-test=dropdown-organizations-click]").click())
      .then(() => cy.get("#menu-organizations ul").should("have.length", 1))
      .then(() =>
        cy
          .get("#menu-organizations ul li")
          .first()
          .should("contain", organization)
      )
      .then(() => cy.get(`[data-value="${organization}"]`).click())
      .then(() => cy.get("[data-test=dropdown-currencies-click]").click())
      .then(() => cy.get("[data-value=EUR]").click())
      .then(() => cy.get("[data-test=projected-budget] input").type(amount))
      .then(() => cy.get("[data-test=add-projected-budget]").click())
      .then(() => cy.get("[data-test=projected-budget-list] tr").should("have.length", 2))
      .then(() =>
        cy
          .get("[data-test=edit-projected-budget]")
          .first()
          .click()
      )
      .then(() =>
        cy
          .get("[data-test=edit-projected-budget-amount] input")
          .first()
          .type("1")
      )
      .then(() =>
        cy
          .get("[data-test=edit-projected-budget-amount-done]")
          .first()
          .click()
      )
      .then(() =>
        cy
          .get("[data-test=saved-projected-budget-amount]")
          .first()
          .contains("12,341")
      )
      .then(() => cy.get(`[data-test=submit]`).click());
  });

  it("The projected budget of the subproject can be removed", function() {
    let projectId;
    const organization = "ACME Corp";
    const projectProjectedBudget = {
      organization,
      currencyCode: "EUR",
      value: "10000"
    };
    const amount = "1234";

    cy.login()
      .then(() =>
        cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget])
      )
      .then(({ id }) => {
        projectId = id;
      })
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=subproject-create-button]").should("be.visible"))
      .then(() => cy.get("[data-test=subproject-create-button]").click())
      .then(() => cy.get("[data-test=nameinput] input").type("Subproject budget test"))
      .then(() =>
        cy
          .get("[data-test=commentinput] textarea")
          .last()
          .type("Subproject budget test")
      )
      .then(() => cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click())
      .then(() => cy.get("[data-value=EUR]").click())
      .then(() => cy.get("[data-test=dropdown-organizations-click]").click())
      .then(() => cy.get("#menu-organizations ul").should("have.length", 1))
      .then(() =>
        cy
          .get("#menu-organizations ul li")
          .first()
          .should("contain", organization)
      )
      .then(() => cy.get(`[data-value="${organization}"]`).click())
      .then(() => cy.get("[data-test=dropdown-currencies-click]").click())
      .then(() => cy.get("[data-value=EUR]").click())
      .then(() => cy.get("[data-test=projected-budget] input").type(amount))
      .then(() => cy.get("[data-test=add-projected-budget]").click())
      .then(() => cy.get("[data-test=projected-budget-list] tr").should("have.length", 2))
      .then(() =>
        cy
          .get("[data-test=delete-projected-budget]")
          .first()
          .click()
      )
      .then(() => cy.get("[data-test=projected-budget-list] tr").should("have.length", 1))
      .then(() => cy.get(`[data-test=submit]`).click());
  });

  it("If the parent project has no projected budget, the input for the projected budget is disabled for the subproject", function() {
    let projectId;

    cy.login()
      .then(() => cy.createProject("subproject budget test project", "subproject budget test", []))
      .then(({ id }) => {
        projectId = id;
      })
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=subproject-create-button]").should("be.visible"))
      .then(() => cy.get("[data-test=subproject-create-button]").click())
      .then(() => cy.get("[data-test=nameinput] input").type("Subproject budget test"))
      .then(() =>
        cy
          .get("[data-test=commentinput] textarea")
          .last()
          .type("Subproject budget test")
      )
      .then(() => cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click())
      .then(() => cy.get("[data-value=EUR]").click())
      .then(() => cy.get("[data-test=dropdown-organizations-click]").should("have.attr", "data-disabled", "true"))
      .then(() => cy.get("[data-test=dropdown-currencies-click]").should("have.attr", "data-disabled", "true"))
      .then(() => cy.get("[data-test=projected-budget] input").should("be.disabled"))
      .then(() => cy.get(`[data-test=cancel]`).click());
  });
});
