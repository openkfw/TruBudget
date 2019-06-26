describe("User/Groups Dashboard", function() {
  before(() => {
    cy.login();
    cy.visit("/users");
  });

  it("Show group table", function() {
    cy.location("pathname").should("eq", "/users");
    cy.get("[aria-label=groupsTab]").click();
    cy.get("[data-test=userdashboard]").should("be.visible");
  });

  it("Create new group", function() {
    cy.get("[data-test=create]").click();
    cy.get("[data-test=groupid] input")
      .type("TestGroup")
      .should("have.value", "TestGroup");
    cy.get("[data-test=groupname] input")
      .type("testgroup")
      .should("have.value", "testgroup");
    cy.get("[data-test=autocomplete] input")
      .type("mstein")
      .should("have.value", "mstein");
    cy.get("[data-test=autocomplete-item-0]")
      .should("be.visible")
      .should("have.text", "mstein")
      .click();
    cy.get("[data-test=autocomplete] input")
      .type("thouse")
      .should("have.value", "thouse");
    cy.get("[data-test=autocomplete-item-0]")
      .should("be.visible")
      .should("have.text", "thouse")
      .click();
    cy.get("[data-test=submit]").click();
  });

  it("Created group should be visible", function() {
    cy.get("[data-test=group-TestGroup]")
      .find("th")
      .then($th => {
        expect($th).to.have.length(1);
        expect($th.first()).to.have.text("TestGroup");
      });
  });
});
