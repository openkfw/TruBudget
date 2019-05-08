let projects = undefined;

// describe("open notifications", function() {
//   before(() => {
//     cy.login("mstein")
//       .then(() =>
//         cy.createproject("notification.test", "e2e-test for notifications", [
//           {
//             organization: "test",
//             value: "50",
//             currencycode: "eur"
//           }
//         ])
//       )
//       .then(created => expect(created).to.be.true)
//       .then(() => cy.fetchprojects().then(p => (projects = p)))
//       .then(() => {
//         const projectid = projects[projects.length - 1].data.id;
//         const assignee = "jxavier";
//         cy.updateprojectassignee(projectid, assignee);
//         cy.updateprojectpermissions(projectid, "project.viewsummary", assignee);
//         cy.updateprojectpermissions(projectid, "project.viewdetails", assignee);
//       })
//       .then(() => cy.login("jxavier"))
//       .then(() => cy.visit("/notifications"));
//   });

//   it("show first unread notification", function() {
//     cy.location("pathname").should("eq", `/notifications`);
//     cy.get("[data-test=notification-unread-0-message]")
//       .should("be.visible")
//       .should("have.text", "project  notification.test  was assigned to you ");
//   });

//   it("read all notifications on page", function() {
//     cy.get("[data-test=read-multiple-notifications]").click();
//   });

//   it("expect that all notifications on the page are read", function() {
//     cy.get("[data-test=notification-unread-0").not("be.visible");
//   });
// });
