let projects = undefined;

describe("Open Nofitications", function() {
  before(() => {
    cy.login("jxavier");
    cy.visit(`/notifications`);
  });

  it("Show notification page", function() {
    cy.location("pathname").should("eq", `/notifications`);
  });

  it("Validate first notification", function() {
    cy.get("[data-test-read=false]", { timeout: 20000 }).should("be.visible");
    cy.get("[data-test=read-multiple-notifications]").click();
    cy.get("[data-test-read=false]").not("be.visible");
  });
});
