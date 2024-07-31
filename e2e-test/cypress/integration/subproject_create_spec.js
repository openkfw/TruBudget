describe("Subproject creation", function() {
  let projectId;
  const apiRoute = "/api";

  before(() => {
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
      });
  });

  it("Root cannot add a subproject", function() {
    //Log in as root since root can not create subprojects
    cy.login("root", Cypress.env("ROOT_SECRET"));
    cy.visit(`/projects/${projectId}`);
    cy.get("[data-test=subproject-create-button]").should("be.visible");
    cy.get("[data-test=subproject-create-button]").should("be.disabled");
  });

  it("Check confirmation dialog without a selected fixed assignee", function() {
    cy.login();
    cy.visit(`/projects/${projectId}`);
    cy.intercept(apiRoute + "/project.viewDetails*").as("loadPage");
    //Create a subproject
    cy.wait("@loadPage")
      .get("[data-test=subproject-create-button]")
      .click();
    cy.get("[data-test=nameinput] input").type("Test");
    cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=submit]").click();
    // 1 original action
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
    cy.get("[data-test=additional-actions]").should("not.exist");
    cy.get("[data-test=post-actions]").should("not.exist");
    // actions counter displays correct amount of actions
    cy.get("[data-test=actions-counter]")
      .scrollIntoView()
      .contains("0 from 1 actions done");
  });

  it("Check additional, original and post actions when creating a subproject with validator", function() {
    cy.login();
    cy.visit(`/projects/${projectId}`);
    cy.intercept(apiRoute + "/project.viewDetails*").as("loadPage");
    //Create a subproject
    cy.wait("@loadPage")
      .get("[data-test=subproject-create-button]")
      .click();
    cy.get("[data-test=nameinput] input").type("Test");
    cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click();
    cy.get("[data-value=EUR]").click();
    // set default assignee
    cy.get("[data-test=subproject-dialog-content]").within(() => {
      cy.get("[data-test=single-select]").click();
    });
    cy.get("[data-test=single-select-name-thouse]").click();
    cy.get("[data-test=close-select]").click();
    cy.get("[data-test=submit]").click();

    // 3 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 3);
    });
    // 1 original action
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
    // 3 post action
    cy.get("[data-test=post-actions]")
      .scrollIntoView()
      .within(() => {
        cy.get("[data-test=actions-table-body]")
          .should("be.visible")
          .children()
          .should("have.length", 3);
      });
    // actions counter displays correct amount of actions
    cy.get("[data-test=actions-counter]")
      .scrollIntoView()
      .contains("0 from 7 actions done");
  });
});
