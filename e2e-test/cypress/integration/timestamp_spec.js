const standardBudget = [
  {
    organization: "Test",
    value: "12345",
    currencyCode: "EUR"
  }
];

describe("Timestamps", function() {
  before(function() {
    cy.login("mstein", "test");
    cy.createProject("p-timestamp", "project timestamp test", standardBudget);
  });

  beforeEach(function() {
    cy.login("mstein", "test");
    cy.visit(`/projects`);
  });

  it("Check timestamp in notifications", function() {
    cy.get("[data-test*=project-view-button]")
      .last()
      .click();
    cy.get("[data-test=assignee-selection]").click();
    cy.get("[data-test=assignee-selection]")
      .should("be.visible")
      .get("[data-test=assignee-list]")
      .find("[value=thouse]")
      .click()
      .get("[data-test=confirmation-dialog-confirm]")
      .click();
    cy.login("thouse", "test");
    cy.visit("/notifications");
    cy.get("[data-test=notification-list]")
      .last()
      .should("be.visible");
    cy.get("[data-test=dateOfNotification-0]").then(element => {
      const text = element.text();
      expect(text).to.match(/[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9]/);
    });
  });

  it("Check timestamp in history", function() {
    cy.get("[data-test*=project-view-button]")
      .last()
      .click();
    cy.get("[data-test=project-history-button]").click();
    cy.get("[data-test=history-item-0]").then(element => {
      const text = element.text();
      expect(text).to.match(/[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9]/);
    });
  });
});
