describe("Users/Groups Dashboard", function() {
  before(() => {
    cy.login();
    cy.visit("/users");
  });

  it("Show user dashboard", function() {
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");
  });

  it("Create new user", function() {
    cy.get("[data-test=create]").click();
    cy.get("#fullname")
      .type("Test User")
      .should("have.value", "Test User");
    cy.get("#username")
      .type("testuser")
      .should("have.value", "testuser");
    cy.get("#password")
      .type("test")
      .should("have.value", "test");
    cy.get("[aria-label=submit]").click();
  });

  it("Created user should be visible", function() {
    cy.get("#user-testuser")
      .find("th")
      .then($th => {
        expect($th).to.have.length(1);
        expect($th.first()).to.have.text("testuser");
      });
  });
});
