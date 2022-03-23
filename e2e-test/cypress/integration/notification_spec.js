describe("open notifications", function() {
  let projectId;
  const apiRoute = "/api";
  const assignee = "jxavier";

  before(() => {
    cy.login("mstein");
    cy.createProject("notification.test", "notifications test", []).then(({ id }) => {
      projectId = id;
      cy.updateProjectAssignee(projectId, assignee);
      cy.updateProject(projectId, { description: "modified" });
    });
  });

  beforeEach(() => {
    cy.intercept(apiRoute + "/notification.count*").as("countNotification");
    cy.intercept(apiRoute + "/notification.list*").as("listNotifications");
    cy.login(assignee);
    cy.visit("/notifications")
      .wait("@countNotification")
      .wait("@listNotifications");
  });

  it("The user is notified when he/she is assigned to a project", function() {
    cy.get("[data-test=notification-unread-1]").should("contain", "was assigned to you");
  });

  it("The assignee is notified when the project has been modified", function() {
    cy.get("[data-test=notification-unread-0]").should("contain", "was updated");
  });

  it("When 'Read All' button is clicked, all notifications on the page are marked as read", function() {
    cy.get("[data-test=read-multiple-notifications").click();
    cy.get("[data-test=notification-unread]").should("have.length", 0);
  });
});
