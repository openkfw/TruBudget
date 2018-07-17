let projects = undefined;

describe("Project Assignee", function() {
  before(() => {
    cy.login();
    cy.fetchProjects().then(p => (projects = p));
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}`);
  });

  it("Show project details page", function() {
    cy.location("pathname").should("eq", `/projects/${projects[0].data.id}`);
  });

  // it("Select different assignee", function() {
  //   cy.get("[data-test=assignee-container]").should("be.visible");
  //   cy.get("[data-test=assignee-selection]").click();
  //   cy.get("[data-test=assignee-list]", { timeout: 20000 })
  //     .should("be.visible")
  //     .then($list => {
  //       const firstUnchecked = $list.find("input:not(:checked)").first();
  //       // Use timeout to wait for animation to finish
  //       const options = { timeout: 10000 };
  //       cy.wrap(firstUnchecked, options)
  //         .click(options)
  //         .should("be.checked");
  //     });
  // });
});
