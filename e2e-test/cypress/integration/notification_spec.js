describe("open notifications", function() {
  let projectId;
  const assignee = "jxavier";
  before(() => {
    cy.login("mstein").then(() =>
      cy
        .createProject("notification.test", "notifications test", [])
        .then(created => (projectId = created.id))
        .then(() => cy.updateProjectAssignee(projectId, assignee))
        .then(() => cy.grantProjectPermission(projectId, "project.viewSummary", assignee))
        .then(() => cy.grantProjectPermission(projectId, "project.viewDetails", assignee))
        .then(() => cy.grantProjectPermission(projectId, "project.close", assignee))
        .then(() => cy.closeProject(projectId, "project.close", assignee))
        .then(() => cy.login("jxavier"))
        .then(() => cy.visit("/notifications"))
        .then(() => cy.get("[data-test=notification-unread-0]").should("be.visible"))
    );
  });

  it("First unread notification should contain close event", function() {
    cy.get("[data-test=notification-unread]")
      .first()
      .should("contain", "was closed");
  });

  it("The user is notified when he/she is assigned to a project", function() {
    cy.get("[data-test=notification-unread-1]").should("contain", "was assigned to you");
  });

  it("When 'Read All' button is clicked, all notifications on the page are marked as read", function() {
    cy.get("[data-test=read-multiple-notifications").click();
    cy.get("[data-test=notification-unread]").should("have.length", 0);
  });
});
