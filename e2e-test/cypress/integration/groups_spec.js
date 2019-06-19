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
    cy.get("#id")
      .type("TestGroup")
      .should("have.value", "TestGroup");
    cy.get("#name")
      .type("testgroup")
      .should("have.value", "testgroup");
    cy.get("#autoComplete-input")
      .type("mstein")
      .should("have.value", "mstein");
    cy.get("#autoComplete-item-0")
      .should("be.visible")
      .should("have.text", "mstein")
      .click();
    cy.get("#autoComplete-input")
      .type("thouse")
      .should("have.value", "thouse");
    cy.get("#autoComplete-item-0")
      .should("be.visible")
      .should("have.text", "thouse")
      .click();
    cy.get("[aria-label=submit]").click();
  });

  it("Created group should be visible", function() {
    cy.get("#group-TestGroup")
      .find("th")
      .then($th => {
        expect($th).to.have.length(1);
        expect($th.first()).to.have.text("TestGroup");
      });
  });
});
