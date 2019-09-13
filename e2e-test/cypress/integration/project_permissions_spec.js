describe("Project Permissions", function() {
  let projects = undefined;

  before(() => {
    cy.login();
    cy.fetchProjects().then(p => (projects = p));
  });
  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("Show project page", function() {
    cy.location("pathname").should("eq", `/projects`);
  });

  it("Show project permission dialog correctly", function() {
    cy.get("[data-test=pp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Grant list permissions", function() {
    let permissionsBeforeTesting = {};
    cy.listProjectPermissions(projects[0].data.id).then(permissions => {
      permissionsBeforeTesting = permissions;
    });

    // Grant permission
    cy.get("[data-test=pp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test='permission-select-project.intent.listPermissions']").click();
    cy.get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(permissionsBeforeTesting["project.intent.listPermissions"].length);
        const firstUnchecked = $list.find("input:not(:checked)").first();
        // Use timeout to wait for animation to finish
        cy.get(firstUnchecked)
          .check()
          .should("be.checked");
        cy.get("[data-test=permission-search] input").type("{esc}");
      })
      .then(() => cy.get("[data-test=permission-submit]").click())
      .then(() => cy.get("[data-test=pp-button-0]").click());
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test='permission-select-project.intent.listPermissions']").click();
    cy.get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(permissionsBeforeTesting["project.intent.listPermissions"].length + 1);
      });
  });
  it("Revoke list permissions", function() {
    let permissionsBeforeTesting = {};
    const intentToRevoke = "project.intent.listPermissions";
    cy.listProjectPermissions(projects[0].data.id).then(permissions => {
      permissionsBeforeTesting = permissions;
    });

    // Revoke permission
    cy.get("[data-test=pp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get(`[data-test='permission-select-${intentToRevoke}']`).click();
    cy.get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(permissionsBeforeTesting[intentToRevoke].length);
        const firstChecked = $list.find("input:checked").first();
        // Use timeout to wait for animation to finish
        cy.get(firstChecked)
          .should("be.checked")
          .uncheck()
          .should("not.be.checked");
        cy.get("[data-test=permission-search] input")
          .click()
          .type("{esc}");
      })
      .then(() => cy.get("[data-test=permission-submit]").click())
      .then(() => cy.get("[data-test=pp-button-0]").click());
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get(`[data-test='permission-select-${intentToRevoke}']`).click();
    cy.get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(permissionsBeforeTesting[intentToRevoke].length - 1);
      });
  });
});
