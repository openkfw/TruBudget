describe("Project Assignee", function() {
  let projects = undefined;
  let baseUrl = undefined;
  let apiRoute = undefined;

  before(() => {
    cy.login();
    cy.fetchProjects().then(p => (projects = p));
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}`);
  });

  it("After selecting a new assignee, a confirmation dialog opens", function() {
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchPermissions");
    cy.get("[data-test=assignee-selection]").click();
    cy.wait("@fetchPermissions").then(() => {
      cy.get("[data-test=assignee-list]")
        .should("be.visible")
        .then($list => {
          const firstUnchecked = $list.find("input:not(:checked)").first();
          // Is only able to click if project permissions are fetched
          cy.get(firstUnchecked).click();
          cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
        });
    });
  });
  it("Confirming the confirmation dialog assigns the selected user and grants view Permissions", function() {
    let permissionsBeforeTesting = {};
    cy.listProjectPermissions(projects[0].data.id).then(permissions => {
      permissionsBeforeTesting = permissions;
    });
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchPermissions");
    cy.get("[data-test=assignee-selection]").click();
    cy.wait("@fetchPermissions").then(() => {
      cy.get("[data-test=assignee-list]")
        .should("be.visible")
        .then($list => {
          const firstUnchecked = $list.find("input:not(:checked)").first();
          // Is only able to click if project permissions are fetched
          cy.get(firstUnchecked)
            .should("not.be.checked")
            .check();
          cy.get("[data-test=confirmation-dialog-confirm]")
            .should("be.visible")
            .click();
          cy.get(firstUnchecked).should("be.checked");
        });
      //check view permissions
      cy.listProjectPermissions(projects[0].data.id).then(permissions => {
        assert.equal(
          permissions["project.viewSummary"].length,
          permissionsBeforeTesting["project.viewSummary"].length + 1
        );
        assert.equal(
          permissions["project.viewDetails"].length,
          permissionsBeforeTesting["project.viewDetails"].length + 1
        );
        const identity = permissions["project.viewDetails"].filter(i => i.valueOf() !== "mstein".valueOf())[0];
        // revoke view permissions
        cy.revokeProjectPermission(projects[0].data.id, "project.viewSummary", identity);
        cy.revokeProjectPermission(projects[0].data.id, "project.viewDetails", identity);
      });
    });
  });
  it("Canceling the confirmation dialog doesn't assign nor grant view permissions", function() {
    let permissionsBeforeTesting = {};
    cy.listProjectPermissions(projects[0].data.id).then(permissions => {
      permissionsBeforeTesting = permissions;
    });
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchPermissions");
    cy.get("[data-test=assignee-selection]").click();
    cy.wait("@fetchPermissions").then(() => {
      cy.get("[data-test=assignee-list]")
        .should("be.visible")
        .then($list => {
          const firstUnchecked = $list.find("input:not(:checked)").first();
          // Is only able to click if project permissions are fetched
          cy.get(firstUnchecked)
            .should("not.be.checked")
            .check();
          cy.get("[data-test=confirmation-dialog-cancel]")
            .should("be.visible")
            .click();
          cy.get(firstUnchecked).should("not.be.checked");
        });
      //check view permissions
      cy.listProjectPermissions(projects[0].data.id).then(permissions => {
        assert.equal(
          permissions["project.intent.listPermissions"].length,
          permissionsBeforeTesting["project.intent.listPermissions"].length
        );
      });
    });
  });
  it("Assigning without permission to grant view permissions is not possible", function() {
    cy.revokeProjectPermission(projects[0].data.id, "project.intent.grantPermission", "mstein");

    // Try to assign user
    cy.visit(`/projects/${projects[0].data.id}`);
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchPermissions");
    cy.get("[data-test=assignee-selection]").click();
    cy.wait("@fetchPermissions").then(() => {
      cy.get("[data-test=assignee-list]")
        .should("be.visible")
        .then($list => {
          const firstUnchecked = $list.find("input:not(:checked)").first();
          // Is only able to click if project permissions are fetched
          cy.get(firstUnchecked)
            .should("not.be.checked")
            .check();
          cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
        });

      cy.login("root", "root-secret").then(() => {});
      cy.grantProjectPermission(projects[0].data.id, "project.intent.grantPermission", "mstein");
    });
  });
  it("Assigning without view permissions leads to an error", function() {
    cy.revokeProjectPermission(projects[0].data.id, "project.intent.listPermissions", "mstein");
    // Try to assign user
    cy.visit(`/projects/${projects[0].data.id}`);
    cy.server();
    cy.route("GET", apiRoute + `/project.intent.listPermissions**`).as("fetchPermissions");
    cy.get("[data-test=assignee-selection]").click();
    cy.wait("@fetchPermissions").then(xhr => {
      assert.equal(xhr.response.body.error.code, 403);
    });

    cy.login("root", "root-secret").then(() => {});
    cy.grantProjectPermission(projects[0].data.id, "project.intent.listPermissions", "mstein");
  });
});
