let projects = undefined;

describe("Project Permissions", function() {
  before(() => {
    cy.login();
    cy.fetchProjects().then(p => (projects = p));
  });
  beforeEach(function() {
    cy.fixture("testdata.json").as("data");
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}`);
  });

  it("Show project details page", function() {
    cy.location("pathname").should("eq", `/projects/${projects[0].data.id}`);
  });

  it("Show and  project permissions correctly", function() {
    cy.get("[data-test=pp-button]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Grant and revoke permissions", function() {
    cy.get("[data-test=pp-button]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test='permission-select-project.intent.listPermissions']").click();
    cy
      .get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(this.data.permissions["project.intent.grantPermission"].length);
      })
      .then($list => {
        const firstUnchecked = $list.find("input:not(:checked)").first();
        // Use timeout to wait for animation to finish
        const options = { timeout: 60000 };
        cy
          .wrap(firstUnchecked, options)
          .click(options)
          .should("be.checked");
        cy
          .wrap(firstUnchecked, options)
          .click(options)
          .should("not.be.checked");
      });
  });
});
