describe("open notifications", function() {
  let projectId, baseUrl, apiRoute;
  const assignee = "jxavier";

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

    cy.login("mstein");
    cy.createProject("notification.test", "notifications test", []).then(({ id }) => {
      projectId = id;
      cy.updateProjectAssignee(projectId, assignee);
      cy.grantProjectPermission(projectId, "project.viewSummary", assignee);
      cy.grantProjectPermission(projectId, "project.viewDetails", assignee);
      cy.grantProjectPermission(projectId, "project.close", assignee);
      cy.closeProject(projectId, "project.close", assignee);
    });
  });

  beforeEach(() => {
    cy.server();
    cy.route("GET", apiRoute + "/notification.count*").as("countNotification");
    cy.route("GET", apiRoute + "/notification.list*").as("listNotifications");
    cy.login(assignee);
    cy.visit("/notifications")
      .wait("@countNotification")
      .wait("@listNotifications");
  });

  it("First unread notification should contain close event", function() {
    cy.get("[data-test=notification-unread-0]").should("contain", "was closed");
  });

  it("The user is notified when he/she is assigned to a project", function() {
    cy.get("[data-test=notification-unread-1]").should("contain", "was assigned to you");
  });

  it("When 'Read All' button is clicked, all notifications on the page are marked as read", function() {
    cy.get("[data-test=read-multiple-notifications").click();
    cy.get("[data-test=notification-unread]").should("have.length", 0);
  });
});
