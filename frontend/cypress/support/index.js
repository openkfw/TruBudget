// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')
const baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;

const waitForBackend = (loginCount = 0) => {
  cy.task("waitForBackend", `${baseUrl}/api/user.authenticate`).then(success => {
    if (!success) {
      if (loginCount < 10) {
        cy.wait(5000).then(() => waitForBackend(loginCount + 1));
      } else {
        throw new Error(`Could not start test, it seems backend was not ready!`);
      }
    } else {
      return;
    }
  });
};

before(() => waitForBackend());
