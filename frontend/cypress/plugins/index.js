// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const axios = require("axios");

const pingBackend = path =>
  axios.post(path, {
    apiVersion: "1.0",
    data: { user: { id: "mstein", password: "test" } }
  });

module.exports = (on, config) => {
  on("task", {
    waitForBackend: path => {
      return pingBackend(path)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false));
    }
  });
};
