const veryLongDisplayName = "Thisisaverylongdisplaynamethatcausesthetextboxtooverflowandwillbeusedfortestingthedisplay";
describe("Subproject display name", function() {
  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("If the subproject name is very long, the table is still displayed correctly", function() {
    // Create subproject with very long display name
    cy.get("[data-test=project-view-button-0]").click();
    cy.get("[data-test=subproject-create-button]").click();
    cy.get("[data-test=nameinput] input").type(veryLongDisplayName);
    cy.get("[data-test=dropdown-sp-dialog-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=submit]").click();

    // Check if projected budget, status and action buttons are still visible
    cy.get("[data-test*=subproject-edit-button]")
      .last()
      .should("be.visible");
    cy.get("[data-test*=spp-button]")
      .last()
      .should("be.visible");
    cy.get("[data-test*=subproject-view-details]")
      .last()
      .should("be.visible");
  });
});
