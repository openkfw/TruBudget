let projects = undefined;
let subprojects = undefined;

describe("Workflowitem permissions", function() {
  before(() => {
    cy.login();
    cy.fetchProjects()
      .then(p => (projects = p))
      .then(p => cy.fetchSubprojects(p[0].data.id))
      .then(sp => (subprojects = sp));
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}/${subprojects[0].data.id}/`);
  });

  it("Show project details page", function() {
    cy.location("pathname").should("eq", `/projects/${projects[0].data.id}/${subprojects[0].data.id}/`);
  });

  it("Show workflowitem permissions correctly", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Grant and revoke permissions", function() {
    // cy.fixture("testdata.json").as("data");
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test='permission-select-workflowitem.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(1);
      })
      .then($list => {
        const firstUnchecked = $list.find("input:not(:checked)").first();
        // Use timeout to wait for animation to finish
        const options = { timeout: 60000, force: true };
        cy.wrap(firstUnchecked, options)
          .click(options)
          .should("be.checked");
        cy.wrap(firstUnchecked, options)
          .click(options)
          .should("not.be.checked");
      })
      .then(() => cy.get("[data-test=permission-list]").type("{esc}"))
      .then(() => cy.get("[data-test=permission-submit]").click())
      .then(() =>
        cy
          .get("[data-test=show-workflowitem-permissions]")
          .first()
          .click()
      )
      .then(() => {
        cy.get("[data-test='permission-select-workflowitem.intent.grantPermission']").click();
        cy.get("[data-test='permission-list']").should("be.visible");
      })
      // Restore status to make test re-runnable
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(2);
        const lastChecked = $list.find("input:checked").last();
        // Use timeout to wait for animation to finish
        const options = { force: true, timeout: 60000 };
        cy.wrap(lastChecked, options)
          .click(options)
          .should("not.be.checked");
        cy.get("[data-test=permission-search] input").type("{esc}");
      })
      .then(() => cy.get("[data-test=permission-container]").should("be.visible"))
      .then(() => cy.get("[data-test=permission-submit]").click());
  });
});
