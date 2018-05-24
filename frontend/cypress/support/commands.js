// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("login", () => {
  cy
    .request({
      url: "/user.authenticate", // assuming you've exposed a seeds route
      method: "POST",
      body: { apiVersion: "1.0", data: { user: { id: "mstein", password: "test" } } }
    })
    .its("body")
    .then(body => {
      const state = {
        login: {
          jwt: body.data.user.token,
          environment: "Test",
          productionActive: false,
          language: "en-gb",
          id: body.data.user.id,
          displayName: body.data.user.displayName,
          organization: body.data.user.organization,
          allowedIntents: body.data.user.allowedIntents
        }
      };
      localStorage.setItem("state", JSON.stringify(state));
    });
});
