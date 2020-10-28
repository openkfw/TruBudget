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
  it("The 'Service-Status' button redirects to the service status overview", function() {
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation]").should("be.visible");

    cy.get("[data-test=side-navigation-service-status]").click();
    cy.location("pathname").should("eq", "/status");
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
