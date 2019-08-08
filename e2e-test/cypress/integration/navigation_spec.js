describe("Navigation", function() {
  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("The hambuger menu opens the navigation menu", function() {
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]").should("be.visible");
  });

  it("The 'Projects' button redirects to the project overview", function() {
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]").should("be.visible");

    cy.get("[data-test=side-navigation-projects]").click();
    cy.location("pathname").should("eq", "/projects");
  });
  it("The 'Notifications' button redirects to the notifications page", function() {
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]").should("be.visible");

    cy.get("[data-test=side-navigation-notifications]").click();
    cy.location("pathname").should("eq", "/notifications");
  });
  it("The 'Users' button redirects to the user overview", function() {
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]").should("be.visible");

    cy.get("[data-test=side-navigation-users]").click();
    cy.location("pathname").should("eq", "/users");
  });
  it("The 'Nodes' button redirects to the nodes overview", function() {
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]").should("be.visible");

    cy.get("[data-test=side-navigation-nodes]").click();
    cy.location("pathname").should("eq", "/nodes");
  });

  it("Navigate via bredcrumbs", function() {
    let projectId;
    let subprojectId;
    // Caution: If name is too long, it will be shortened with ellipses
    let projectDisplayName = "Project";
    let subprojectDisplayName = "Subproject";
    cy.createProject(projectDisplayName, projectDisplayName, [])
      .then(({ id }) => {
        projectId = id;
        return cy.createSubproject(projectId, subprojectDisplayName);
      })
      .then(({ id }) => {
        subprojectId = id;
      })
      .then(() => {
        cy.visit(`/projects/${projectId}/${subprojectId}`);
        cy.get("[data-test*=breadcrumb]").should("have.length", 4);

        cy.get(`[data-test=breadcrumb-${subprojectDisplayName}]`).should("be.disabled");

        cy.get(`[data-test=breadcrumb-${projectDisplayName}]`).click();
        cy.location("pathname").should("eq", `/projects/${projectId}`);
        cy.get(`[data-test=breadcrumb-${projectDisplayName}]`).should("be.disabled");

        cy.get(`[data-test=breadcrumb-Projects]`).click();
        cy.location("pathname").should("eq", `/projects`);
        cy.get(`[data-test=breadcrumb-Projects]`).should("be.disabled");
      });
  });

  it("Filter projects by display name", function() {
    // Set a unique project name
    const projectDisplayName = Math.floor(Math.random() * 10000000000);

    // Create project which will then be displayed after filtering
    cy.createProject(projectDisplayName, projectDisplayName, [])
      .then(() => cy.visit(`/projects`))
      .then(() => {
        cy.get("[data-test=toggle-project-search]").click();
        cy.get("[data-test=project-search-field]").should("be.visible");
        cy.get("[data-test=project-search-field] input").type(projectDisplayName);
        // Since project name is unique, there can only be one match
        cy.get("[data-test*=project-card]").then(res => assert.equal(res.length, 1));

        // Check the functionality of the clear button
        cy.get("[data-test=clear-project-search]").click();
        cy.get("[data-test=project-search-field]").should("not.be.visible");
      });
  });

  it("Search bar is closed and reset when viewing project details", function() {
    // Set a unique project name
    const projectDisplayName = Math.floor(Math.random() * 10000000000);

    // Create project which will then be displayed after filtering
    cy.createProject(projectDisplayName, projectDisplayName, [])
      .then(() => cy.visit(`/projects`))
      .then(() => {
        cy.get("[data-test=toggle-project-search]").click();
        cy.get("[data-test=project-search-field]").should("be.visible");
        cy.get("[data-test=project-search-field] input").type(projectDisplayName);
        // Since project name is unique, there can only be one match
        cy.get("[data-test*=project-card]").then(res => assert.equal(res.length, 1));

        // Go to project
        cy.get("[data-test*=project-view-button]")
          .first()
          .click();

        cy.get("[data-test=project-search-field]").should("not.be.visible");
        cy.get("[data-test=toggle-project-search]").should("be.disabled");

        cy.visit("/projects");
        // Search field should be empty
        cy.get("[data-test=toggle-project-search]").click();
        cy.get("[data-test=project-search-field] input").should("have.value", "");
      });
  });

  it("Search bar is closed and reset when clicking on 'Main' breadcrumb", function() {
    // Set a unique project name
    const projectDisplayName = Math.floor(Math.random() * 10000000000);

    // Create project which will then be displayed after filtering
    cy.createProject(projectDisplayName, projectDisplayName, [])
      .then(() => cy.visit(`/projects`))
      .then(() => {
        cy.get("[data-test=toggle-project-search]").click();
        cy.get("[data-test=project-search-field]").should("be.visible");
        cy.get("[data-test=project-search-field] input").type(projectDisplayName);
        // Since project name is unique, there can only be one match
        cy.get("[data-test*=project-card]").then(res => assert.equal(res.length, 1));

        // Go to project
        cy.get("[data-test=breadcrumb-Main]").click();

        cy.get("[data-test=project-search-field]").should("not.be.visible");
        cy.get("[data-test=toggle-project-search]").should("be.enabled");
        // TODO: Test what happens when you click on a project
      });
  });

  it("The notification button redirects to the notification page", function() {
    cy.get("[data-test=navbar-notification-button]").should("be.visible");
    cy.get("[data-test=navbar-notification-button]").click();
    cy.location("pathname").should("eq", "/notifications");

    cy.visit("/projects");
  });

  it("Logs out the user", function() {
    cy.get("[data-test=navbar-logout-button]").should("be.visible");
    cy.get("[data-test=navbar-logout-button]").click();
    cy.location("pathname").should("eq", "/login");

    cy.get("[data-test=loginpage]").should("be.visible");

    cy.login();
    cy.visit("/projects");
  });
});
