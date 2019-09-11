describe("Project Permissions", function() {
  let projects = undefined;
  const forceoption = { force: true };

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

  it.only("Grant and revoke permissions", function() {
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
        cy.get(firstUnchecked)
          .click(forceoption)
          .should("be.checked");
      })
      .then(() =>
        cy
          .get("[data-test=permission-search]")
          .find("input")
          .click()
          .type("{esc}")
      )
      .then(() => cy.get("[data-test=permission-submit]").click())
      .then(() => cy.get("[data-test=pp-button-0]").click())
      .then(() => {
        cy.get("[data-test='permission-select-project.intent.listPermissions']").click();
        cy.get("[data-test='permission-list']")
          .should("be.visible")
          .then($list => {
            const checkedItems = $list.find("input:checked");
            expect(checkedItems).to.have.lengthOf(
              permissionsBeforeTesting["project.intent.listPermissions"].length + 1
            );
            // Revoke permission
            cy.get("[data-test='permission-list']")
              .then($list => {
                const lastChecked = $list.find("input:checked").first();
                // Use timeout to wait for animation to finish
                cy.get(lastChecked)
                  .click(forceoption)
                  .should("not.be.checked");
              })
              .then(() =>
                cy
                  .get("[data-test=permission-search]")
                  .find("input")
                  .click()
                  .type("{esc}")
              )
              .then(() => cy.get("[data-test=permission-container]").should("be.visible"))
              .then(() => cy.get("[data-test=permission-submit]").click())
              .then(() => cy.get("[data-test=pp-button-0]").click())
              .then(() => {
                cy.get("[data-test='permission-select-project.intent.listPermissions']").click();
                cy.get("[data-test='permission-list']")
                  .should("be.visible")
                  .then($list => {
                    const checkedItems = $list.find("input:checked");
                    expect(checkedItems).to.have.lengthOf(
                      permissionsBeforeTesting["project.intent.listPermissions"].length
                    );
                  });
              });
          });
      });
  });
});
