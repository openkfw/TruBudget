let projects = undefined;

// describe("Open Notifications", function() {
//   before(() => {
//     cy.login("mstein")
//       .then(() =>
//         cy.createProject("notification.test", "e2e-test for notifications", [
//           {
//             organization: "Test",
//             value: "50",
//             currencyCode: "EUR"
//           }
//         ])
//       )
//       .then(created => expect(created).to.be.true)
//       .then(() => cy.fetchProjects().then(p => (projects = p)))
//       .then(() => {
//         const projectId = projects[projects.length - 1].data.id;
//         const assignee = "jxavier";
//         cy.updateProjectAssignee(projectId, assignee);
//         cy.updateProjectPermissions(projectId, "project.viewSummary", assignee);
//         cy.updateProjectPermissions(projectId, "project.viewDetails", assignee);
//       })
//       .then(() => cy.login("jxavier"))
//       .then(() => cy.visit("/notifications"));
//   });

//   it("Show first unread notification", function() {
//     cy.location("pathname").should("eq", `/notifications`);
//     cy.get("[data-test=notification-unread-0-message]")
//       .should("be.visible")
//       .should("have.text", "Project  notification.test  was assigned to you ");
//   });

//   it("Read all notifications on page", function() {
//     cy.get("[data-test=read-multiple-notifications]").click();
//   });

//   it("Expect that all notifications on the page are read", function() {
//     cy.get("[data-test=notification-unread-0").not("be.visible");
//   });
// });
