describe("Scroll Back To Top", { testIsolation: false }, () => {
  before(function () {
    cy.login("mstein", "test");
    cy.visit(`/projects`);
  });

  it("When page load initially, the button back to top should not be visible ", () => {
    cy.get("[data-test=backToTop-button]").should("not.be.visible");
  });

  it("On scroll, the button back to top should be visible ", () => {
    cy.scrollTo(0, 520, { duration: 500 });
    cy.get("[data-test=backToTop-button]").should("be.visible");
  });

  it("On button click, scroll back to top ", () => {
    cy.get("[data-test=backToTop-button]").click();
    cy.focused().click();
    cy.get("[data-test=backToTop-button]").should("not.be.visible");
  });
});
