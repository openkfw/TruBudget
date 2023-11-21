const { defineConfig } = require("cypress");
const setupNodeEvents = require("./cypress/plugins/index.js");
require("dotenv").config();

module.exports = defineConfig({
  video: false,
  defaultCommandTimeout: 20000,
  requestTimeout: 20000,
  numTestsKeptInMemory: 0,
  projectId: "r4dcjk",
  retries: 2,
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true,
    reportPageTitle: "Trubduget E2E Tests Report",
    embeddedScreenshots: true,
    inlineAssets: true
  },
  e2e: {
    setupNodeEvents,
    supportFile: "cypress/support/index.js",
    specPattern: "cypress/integration/*_spec.{js,jsx,ts,tsx}",
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000"
  }
});
