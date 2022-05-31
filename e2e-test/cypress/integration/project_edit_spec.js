describe("Project Edit", function () {
  let projectId;
  const executingUser = "mstein";
  const otherUser = "jxavier";

  before(() => {
    cy.login(executingUser, "test");
    cy.createProject("p-subp-edit", "subproject edit test").then(({id}) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.list", otherUser);
      cy.grantProjectPermission(projectId, "project.viewDetails", otherUser);
      cy.grantProjectPermission(projectId, "project.intent.revokePermission", otherUser);
    });
  });

  beforeEach(function () {
    cy.login(executingUser, "test");
    cy.visit(`/projects`);
  });

  it("Editing the title is possible", function () {
    cy.get(`[data-test=project-card-${projectId}]`).within(() => {
      cy.get(`[data-test=pe-button]`).click();
    });
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then(title => {
        // Modify title
        cy.get("[data-test=nameinput] input").type("-changed");
        cy.get("[data-test=submit]").click();
        // Check if title has changed
        cy.get(`[data-test=project-card-${projectId}]`).within(() => {
          cy.get(`[data-test^='project-title-${title}']`)
            .invoke("text")
            .should("not.eq", title);
          // Change title back to original
          cy.get("[data-test=pe-button]").click();
        });
        cy.get("[data-test=nameinput] input")
          .clear()
          .type(title);
        cy.get("[data-test=submit]").click();
        cy.get(`[data-test=project-card-${projectId}]`).within(() => {
          cy.get(`[data-test^='project-title-${title}']`)
            .invoke("text")
            .should("eq", title);
        });
      });
  });

  it("Editing without a change isn't possible", function () {
    cy.get(`[data-test=project-card-${projectId}]`).within(() => {
      cy.get(`[data-test=pe-button]`).click();
    });
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then(title => {
        cy.get("[data-test=nameinput] input").type("-");
        cy.get("[data-test=submit]").should("be.enabled");
        cy.get("[data-test=nameinput] input")
          .clear()
          .type(title);
        cy.get("[data-test=submit]").should("be.disabled");
      });
  });

  it("The edit button isn't visible without edit permissions", function () {
    cy.login(otherUser, "test");
    cy.visit(`/projects`);
    cy.revokeProjectPermission(projectId, "project.update", executingUser);
    cy.login(executingUser, "test");
    cy.visit(`/projects`);
    cy.get(`[data-test=project-card-${projectId}]`).within(() => {
      cy.get("[data-test=pe-button]")
        .should("have.css", "opacity", "0")
        .should("be.disabled");
    });
    cy.grantProjectPermission(projectId, "project.update", executingUser);
  });
});
