describe("User Dashboard", function() {
  before(() => {
    cy.login();
    cy.visit("/users");
  });
  it("Show user dashboard", function() {
    cy.location("pathname").should("eq", "/users");
    cy.get("#userdashboard").should("be.visible");
  });
  it("Create new user", function() {
    cy
      .get("#fullname")
      .type("Test User")
      .should("have.value", "Test User");
    cy
      .get("#username")
      .type("testuser")
      .should("have.value", "testuser");
    cy
      .get("#password")
      .type("test")
      .should("have.value", "test");
    cy.get("#createuser").click();
  });

  it("Created user should be visible", function() {
    cy
      .get("#user-testuser")
      .find("td")
      .then($td => {
        expect($td).to.have.length(2);
        expect($td.first()).to.have.text("testuser");
      });
  });
});
