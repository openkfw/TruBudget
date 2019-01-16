describe("Component Versions", function() {
  beforeEach(() => {
    cy.login();
  });
  it("Shows frontend version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=frontendVersion]")
      .should("be.visible")
      .invoke("text")
      .then(text => {
        console.log(text);
        expect(text.trim()).to.match(/[a-z]*\:\s[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });
  it("Shows api version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=apiVersion]")
      .should("be.visible")
      .invoke("text")
      .then(text => {
        expect(text.trim()).to.match(/[a-z]*\:\s[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });
  it("Shows blockchain version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=blockchainVersion]")
      .should("be.visible")
      .invoke("text")
      .then(text => {
        expect(text.trim()).to.match(/[a-z]*\:\s[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });
  it("Shows multichain version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=multichainVersion]")
      .should("be.visible")
      .invoke("text")
      .then(text => {
        expect(text.trim()).to.match(/[a-z]*\:\s[0-9]+\.[0-9]+.*/);
      });
  });
});
